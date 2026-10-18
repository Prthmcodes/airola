// Post-build prerender: snapshots public routes to static HTML so search engines and AI crawlers
// get real content without running JavaScript. The SPA still loads and takes over in the browser.
//
// Runs after `vite build` (see "build" in package.json). Uses Puppeteer (devDependency), which
// downloads its own Chromium on `npm install`.
//
// On Vercel, the build image (Amazon Linux 2023) lacks some libraries Chrome needs. If the first launch
// fails there, the script installs them with dnf and retries once.
//
// Fails the build (exit 1) if Puppeteer or Chrome is unavailable, or if any route doesn't render properly
// (H1 present, no error page, valid JSON-LD, its own <title> and canonical). Nothing is written unless every
// route passes, so a broken build never ships the bare SPA shell in place of real pages.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Public, indexable routes only. Never add /dashboard, /admin, /login, /add-property, /quote/review, /offer or /thanks10.
const ROUTES = [
  '/', '/pricing', '/quote', '/about-us', '/contact', '/giveaway', '/legal', '/testimonials',
  '/blog',
  '/blog/airbnb-turnover-cleaning-cost-london',
  '/blog/airbnb-turnover-cleaning-checklist',
  '/blog/how-long-does-an-airbnb-turnover-clean-take',
  '/blog/same-day-airbnb-turnover-preparation',
  '/blog/photo-proof-after-cleaning-airbnb',
];

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

const headTag = (html, re) => html.match(re)?.[1]?.trim() || null;
const titleOf = html => headTag(html, /<title>([^<]*)<\/title>/i);
const canonicalOf = html => headTag(html, /<link rel="canonical" href="([^"]*)"/i);

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
const validate = (html, route) => {
  if (!/<h1[\s>]/i.test(html)) return 'no <h1> in snapshot';
  if (!titleOf(html)) return 'no <title>';
  const canonical = canonicalOf(html);
  if (!canonical) return 'no canonical link';
  if (new URL(canonical).pathname !== route) return `canonical is ${canonical}, expected path ${route}`;
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
    throw new Error('puppeteer is not installed (npm install puppeteer --save-dev).', { cause: err });
  }

  const shell = await readFile(join(DIST, 'index.html'), 'utf8');
  const server = await startServer(shell);
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  const failures = [];

  try {
    browser = await launchBrowser(puppeteer);
    const snapshots = new Map();

    for (const route of ROUTES) {
      const page = await browser.newPage();
      // Uncaught app errors (e.g. a missing VITE_ env var) explain why a route rendered no <h1>.
      const pageErrors = [];
      page.on('pageerror', err => pageErrors.push(String(err?.message || err)));
      try {
        // Static headline instead of the typing animation. Third-party calls are blocked, except reads of
        // approved reviews (GET on the public view), so snapshots show the reviews published at build time.
        // The read is cross-origin with auth headers, so Chrome sends a CORS preflight (OPTIONS) first; it must pass too.
        await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
        await page.setRequestInterception(true);
        page.on('request', req => {
          const isReviewsRead = ['GET', 'OPTIONS'].includes(req.method()) && req.url().includes('/rest/v1/testimonials_public');
          const allowed = req.url().startsWith(origin) || isReviewsRead;
          return allowed ? req.continue() : req.abort();
        });

        await page.goto(origin + route, { waitUntil: 'networkidle0', timeout: TIMEOUT_MS });
        await page.waitForSelector('main h1', { timeout: TIMEOUT_MS });
        // Reviews load after first paint; wait for them to settle so validate() sees the final state.
        if (route === '/testimonials') {
          await page.waitForFunction(() => !document.querySelector('main')?.textContent.includes('Loading reviews'), { timeout: TIMEOUT_MS }).catch(() => {});
        }

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
        const problem = validate(html, route);
        if (problem) failures.push({ route, reason: problem, pageErrors });
        else snapshots.set(route, html);
      } catch (err) {
        failures.push({ route, reason: String(err?.message || err), pageErrors });
      } finally {
        await page.close();
      }
    }

    if (failures.length) {
      const lines = failures.map(f =>
        `  ${f.route}: ${f.reason}${f.pageErrors.length ? `\n    page errors: ${[...new Set(f.pageErrors)].join(' | ')}` : ''}`);
      throw new Error(`${failures.length} of ${ROUTES.length} routes failed to prerender:\n${lines.join('\n')}`);
    }

    const titles = ROUTES.map(r => titleOf(snapshots.get(r)));
    const dupes = [...new Set(titles.filter((t, i) => titles.indexOf(t) !== i))];
    if (dupes.length) throw new Error(`duplicate <title> across routes: ${dupes.join(', ')}`);

    // Home last: dist/index.html is the shell every other route was rendered from.
    for (const route of [...ROUTES.filter(r => r !== '/'), '/']) {
      const out = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
      await mkdir(dirname(out), { recursive: true });
      await writeFile(out, snapshots.get(route));
    }

    console.log(`[prerender] Wrote static HTML for all ${ROUTES.length} routes:`);
    for (const route of ROUTES) {
      const html = snapshots.get(route);
      console.log(`[prerender]   ${route.padEnd(14)} ${titleOf(html)}  ->  ${canonicalOf(html)}`);
    }
  } finally {
    await browser?.close().catch(() => {});
    server.close();
  }
};

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(`\n[prerender] BUILD FAILED: ${err.stack || err}\n`);
    process.exit(1);
  });
