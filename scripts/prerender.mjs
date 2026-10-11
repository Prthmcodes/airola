// Post-build prerender: snapshots public routes to static HTML so search engines and AI crawlers
// get real content without running JavaScript. The SPA still loads and takes over in the browser.
//
// Runs after `vite build` (see "build" in package.json). Uses Puppeteer (devDependency), which
// downloads its own Chromium on `npm install`.
//
// On Vercel, the build image (Amazon Linux 2023) lacks some libraries Chrome needs. If the first launch
// fails there, the script installs them with dnf and retries once.
//
// Failsafe: any failure prints a warning and exits 0, so the plain SPA build in dist/ still deploys.
// A route is only written if its snapshot rendered properly (H1 present, no error page, valid JSON-LD).

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Public, indexable routes only. Never add /dashboard, /admin, /login, /add-property, /quote/review, /offer or /thanks10.
const ROUTES = ['/', '/pricing', '/quote', '/about-us', '/contact', '/giveaway', '/legal', '/testimonials'];

const DIST = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const TIMEOUT_MS = 30000;

// Shared libraries headless Chrome needs that Vercel's build image doesn't ship.
const CHROME_DEPS = [
  'nss', 'nspr', 'atk', 'at-spi2-atk', 'cups-libs', 'libdrm', 'libxkbcommon', 'libXcomposite',
  'libXdamage', 'libXext', 'libXfixes', 'libXrandr', 'mesa-libgbm', 'pango', 'cairo', 'alsa-lib', 'libxshmfence',
];
const LAUNCH_OPTIONS = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] };

// Launches Chrome, fixing the two known build-environment problems on the way:
// a missing browser download (cached installs skip Puppeteer's postinstall), and on Vercel, missing system libraries.
const launchBrowser = async puppeteer => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await puppeteer.launch(LAUNCH_OPTIONS);
    } catch (err) {
      const msg = String(err?.message || err);
      if (attempt >= 3) throw err;
      if (msg.includes('Could not find Chrome')) {
        console.log('[prerender] Chrome is not downloaded yet; installing it.');
        const res = spawnSync('npx', ['puppeteer', 'browsers', 'install', 'chrome'], { stdio: 'inherit', shell: true, timeout: 180000 });
        if (res.status !== 0) throw new Error(`Chrome download failed (exit ${res.status ?? res.error})`, { cause: err });
      } else if (process.env.VERCEL && msg.includes('shared libraries')) {
        console.log('[prerender] Chrome is missing system libraries on Vercel; installing them with dnf.');
        const res = spawnSync('dnf', ['install', '-y', '--setopt=install_weak_deps=False', ...CHROME_DEPS], { stdio: 'inherit', timeout: 180000 });
        if (res.status !== 0) throw new Error(`dnf install failed (exit ${res.status ?? res.error})`, { cause: err });
      } else {
        throw err;
      }
    }
  }
};

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml', '.ico': 'image/x-icon',
};

// Whole-run failures fall back to the SPA build; a single skipped route just serves the SPA shell.
const warn = (msg, err, scope = 'Continuing with the plain SPA build.') =>
  console.warn(`\n[prerender] WARNING: ${msg}${err ? `\n  ${err.stack || err}` : ''}\n[prerender] ${scope}\n`);
const ROUTE_FALLBACK = 'This route will be served by the SPA shell instead.';

// Serves dist/ like Vercel: real files first, everything else falls back to the original SPA shell.
const startServer = shell =>
  new Promise(resolve => {
    const server = createServer(async (req, res) => {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const file = join(DIST, pathname);
      try {
        if (file.startsWith(DIST) && (await stat(file)).isFile()) {
          res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
          res.end(await readFile(file));
          return;
        }
      } catch {
        // Not a file: fall through to the SPA shell
      }
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(shell);
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });

// Checks a snapshot is safe to publish.
const validate = html => {
  if (!/<h1[\s>]/i.test(html)) return 'no <h1> in snapshot';
  if (html.includes('Something went wrong on our side') || html.includes("This page didn't load")) return 'error page rendered';
  if (html.includes('Loading reviews') || html.includes("couldn't load reviews")) return 'reviews did not load';
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json); } catch { return 'invalid JSON-LD'; }
  }
  return null;
};

const main = async () => {
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch (err) {
    warn('puppeteer is not installed (npm install puppeteer --save-dev).', err);
    return;
  }

  const shell = await readFile(join(DIST, 'index.html'), 'utf8');
  const server = await startServer(shell);
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  const written = [];

  try {
    browser = await launchBrowser(puppeteer);
    const snapshots = new Map();

    for (const route of ROUTES) {
      const page = await browser.newPage();
      try {
        // Static headline instead of the typing animation. Third-party calls are blocked, except reads of
        // approved reviews (GET on the public view), so snapshots show the reviews published at build time.
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
        await page.setRequestInterception(true);
        page.on('request', req => {
          const allowed = req.url().startsWith(origin) || (req.method() === 'GET' && req.url().includes('/rest/v1/testimonials_public'));
          return allowed ? req.continue() : req.abort();
        });

        await page.goto(origin + route, { waitUntil: 'networkidle0', timeout: TIMEOUT_MS });
        await page.waitForSelector('main h1', { timeout: TIMEOUT_MS });

        if (route === '/') {
          await page.evaluate(() => {
            // Preload the hero image so it starts downloading before the JS bundle runs.
            // If the hero sits in a <picture> with WebP sizes, preload those (what the browser will pick).
            const hero = document.querySelector('img[fetchpriority="high"]');
            if (hero) {
              const link = Object.assign(document.createElement('link'), { rel: 'preload', as: 'image' });
              const webp = hero.closest('picture')?.querySelector('source[type="image/webp"]');
              if (webp) {
                link.setAttribute('imagesrcset', webp.getAttribute('srcset'));
                link.setAttribute('imagesizes', webp.getAttribute('sizes') || '100vw');
                link.setAttribute('type', 'image/webp');
              } else {
                link.href = hero.getAttribute('src');
              }
              link.setAttribute('fetchpriority', 'high');
              document.head.appendChild(link);
            }
            // dist/index.html is also the fallback for every non-prerendered route (/login, /offer, unknown URLs).
            // Clear the home content there before first paint, so those routes never flash the home page.
            const guard = document.createElement('script');
            guard.textContent = "if(location.pathname!=='/'){var r=document.getElementById('root');if(r)r.innerHTML=''}";
            document.getElementById('root').insertAdjacentElement('afterend', guard);
          });
        }

        const html = '<!DOCTYPE html>\n' + (await page.evaluate(() => document.documentElement.outerHTML));
        const problem = validate(html);
        if (problem) warn(`skipping ${route}: ${problem}`, null, ROUTE_FALLBACK);
        else snapshots.set(route, html);
      } catch (err) {
        warn(`could not render ${route}`, err, ROUTE_FALLBACK);
      } finally {
        await page.close();
      }
    }

    // Home last: dist/index.html is only replaced once its own snapshot succeeded.
    for (const route of [...ROUTES.filter(r => r !== '/'), '/']) {
      const html = snapshots.get(route);
      if (!html) continue;
      const out = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, html);
      written.push(route);
    }
    console.log(`[prerender] Wrote static HTML for: ${written.join(', ') || '(none)'}`);
  } finally {
    await browser?.close().catch(() => {});
    server.close();
  }
};

main()
  .catch(err => warn('prerender failed.', err))
  .finally(() => process.exit(0));
