// Mobile audit: screenshots every page at phone/tablet/desktop sizes and logs mobile problems.
// Usage: npm run build && node scripts/mobile-audit.mjs audit/before
// Serves dist/ like Vercel (file, then dir/index.html, then the SPA shell), so it tests the real build.
// Dev tool only: not part of the build, and excluded from Vercel uploads by .vercelignore.

import { createServer } from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, process.argv[2] || 'audit/before');

const PAGES = ['/', '/pricing', '/quote', '/about-us', '/contact', '/giveaway', '/legal', '/testimonials', '/offer', '/login', '/areas/stratford', '/page-that-does-not-exist'];
const SIZES = [
  { w: 360, h: 800 }, { w: 390, h: 844 }, { w: 430, h: 932 }, { w: 768, h: 1024 }, { w: 1440, h: 900 },
];
const OVERFLOW_ONLY = [{ w: 320, h: 640 }];

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.xml': 'application/xml' };
const isFile = async p => { try { return (await stat(p)).isFile(); } catch { return false; } };

const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = null;
  for (const c of [join(DIST, pathname), join(DIST, pathname, 'index.html')]) if (await isFile(c)) { file = c; break; }
  if (!file) file = /\.[a-z0-9]+$/i.test(pathname) ? null : join(DIST, 'index.html');
  if (!file) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

// Runs inside the page: everything we can measure about mobile usability.
// dpr 1 keeps full-page captures under Chrome's 16384px texture limit on long pages.
const inspect = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const visible = el => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0 && !el.closest('[aria-hidden="true"], .sr-only, noscript');
  };
  const label = el => {
    const id = el.id ? `#${el.id}` : '';
    const cls = typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
    const text = (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${el.tagName.toLowerCase()}${id}${cls} "${text}"`;
  };
  // An element only causes page overflow if no ancestor clips it.
  const clipped = el => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p);
      if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) return true;
      if (o.position === 'fixed') return true;
    }
    return false;
  };
  const all = [...document.body.querySelectorAll('*')];
  const textEls = all.filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1) && visible(el));

  const overflow = all
    .filter(el => visible(el) && getComputedStyle(el).position !== 'fixed')
    .filter(el => { const r = el.getBoundingClientRect(); return (r.right > vw + 1 || r.left < -1) && !clipped(el); })
    .map(el => `${label(el)} [${Math.round(el.getBoundingClientRect().left)}→${Math.round(el.getBoundingClientRect().right)}]`);

  // Body copy under 16px: paragraphs, list items and similar running text (labels/badges are 12px+ by design).
  const smallBody = textEls
    .filter(el => el.matches('p, li, dd, blockquote, td, figcaption, span:not([class*="uppercase"])') && !el.closest('nav, footer, button, a, label, [role="status"]'))
    .filter(el => parseFloat(getComputedStyle(el).fontSize) < 16 && el.textContent.trim().length > 25)
    .map(el => `${label(el)} ${getComputedStyle(el).fontSize}`);
  const tinyText = textEls.filter(el => parseFloat(getComputedStyle(el).fontSize) < 12).map(el => `${label(el)} ${getComputedStyle(el).fontSize}`);

  // Tap targets (WCAG 2.5.5 size, inline links in sentences excluded).
  const targets = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, [role="radio"], summary')]
    .filter(el => visible(el) && !el.closest('p, li > p') && !(el.tagName === 'INPUT' && el.closest('label')));
  const smallTargets = targets.filter(el => {
    const r = el.getBoundingClientRect();
    // Checkboxes/radios count their wrapping label as the tap area
    const hit = el.tagName === 'INPUT' && /checkbox|radio/.test(el.type) && el.labels?.[0] ? el.labels[0].getBoundingClientRect() : r;
    return hit.width < 44 || hit.height < 44;
  }).map(el => { const r = el.getBoundingClientRect(); return `${label(el)} ${Math.round(r.width)}×${Math.round(r.height)}`; });

  // Text closer than 16px to the screen edge.
  const edgeText = textEls
    .filter(el => getComputedStyle(el).position !== 'fixed' && !el.closest('[class*="absolute"]'))
    .filter(el => { const r = el.getBoundingClientRect(); return r.left < 15.5 || r.right > vw - 15.5; })
    .filter(el => !clipped(el))
    .map(el => label(el));

  const fixedEls = all.filter(el => visible(el) && /(fixed|sticky)/.test(getComputedStyle(el).position))
    .map(el => { const r = el.getBoundingClientRect(); return `${label(el)} ${getComputedStyle(el).position} ${Math.round(r.width)}×${Math.round(r.height)} @(${Math.round(r.left)},${Math.round(r.top)})`; });

  const dpr = window.devicePixelRatio || 1;
  const images = [...document.images].filter(visible).map(img => {
    const r = img.getBoundingClientRect();
    const issues = [];
    if (!img.getAttribute('width') || !img.getAttribute('height')) issues.push('no width/height');
    if (!img.srcset) issues.push('no srcset');
    if (img.naturalWidth > r.width * Math.max(dpr, 2) * 1.5) issues.push(`oversized ${img.naturalWidth}px for ${Math.round(r.width)}px slot`);
    const belowFold = r.top + window.scrollY > vh;
    if (belowFold && img.loading !== 'lazy') issues.push('below fold, not lazy');
    if (!/\.(webp|avif)/i.test(img.currentSrc)) issues.push('not WebP/AVIF');
    return issues.length ? `${img.getAttribute('src')} → ${issues.join(', ')}` : null;
  }).filter(Boolean);

  const fields = [...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select')].filter(visible).map(el => {
    const issues = [];
    if (parseFloat(getComputedStyle(el).fontSize) < 16) issues.push(`font ${getComputedStyle(el).fontSize} (iOS zoom)`);
    if (!el.labels?.length && !el.getAttribute('aria-label')) issues.push('no label');
    if (/name|mail|phone|tel/i.test(el.id) && !el.getAttribute('autocomplete')) issues.push('no autocomplete');
    if (/phone|mobile|(^|-)tel/i.test(el.id) && el.type !== 'tel') issues.push('not type=tel');
    if (/email/i.test(el.id) && el.type !== 'email') issues.push('not type=email');
    return issues.length ? `${label(el)} → ${issues.join(', ')}` : null;
  }).filter(Boolean);

  // Hero: is the main CTA on screen without scrolling?
  const cta = [...document.querySelectorAll('main a, main button')].find(e => /Get My Price/.test(e.textContent));
  const ctaRect = cta?.getBoundingClientRect();
  return {
    scrollWidth: document.documentElement.scrollWidth, innerWidth: vw,
    overflow: [...new Set(overflow)].slice(0, 10),
    smallBody: { count: smallBody.length, examples: [...new Set(smallBody)].slice(0, 6) },
    tinyText: [...new Set(tinyText)].slice(0, 6),
    smallTargets: { count: smallTargets.length, examples: [...new Set(smallTargets)].slice(0, 12) },
    edgeText: [...new Set(edgeText)].slice(0, 8),
    fixed: fixedEls,
    images, fields,
    heroCta: ctaRect ? { top: Math.round(ctaRect.top), bottom: Math.round(ctaRect.bottom), visible: ctaRect.bottom <= vh } : null,
    h1: (() => { const h = document.querySelector('main h1'); if (!h) return null; const r = h.getBoundingClientRect(); return { fontSize: getComputedStyle(h).fontSize, height: Math.round(r.height) }; })(),
  };
};

const browser = await puppeteer.launch({ headless: true });
const report = {};
try {
  await mkdir(OUT, { recursive: true });
  for (const size of [...SIZES, ...OVERFLOW_ONLY]) {
    const page = await browser.newPage();
    await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1, isMobile: size.w < 768, hasTouch: size.w < 1024 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/supabase|Failed to load resource|testimonials|\[object Object\]/i.test(m.text())) errors.push(m.text()); });
    for (const path of PAGES) {
      await page.goto(origin + path, { waitUntil: 'networkidle0', timeout: 45000 });
      await page.evaluate(() => document.fonts.ready);
      const key = `${path}@${size.w}`;
      report[key] = await page.evaluate(inspect);
      if (path === '/' && size.w < 768) {
        // Mobile menu: opens, closes on Escape, returns focus
        const btn = await page.$('button[aria-controls="mobile-menu"]');
        if (btn) {
          await btn.click();
          const opened = await page.evaluate(() => { const m = document.getElementById('mobile-menu'); return m ? { open: true, height: Math.round(m.getBoundingClientRect().height), coversViewport: m.getBoundingClientRect().bottom > innerHeight } : { open: false }; });
          await page.keyboard.press('Escape');
          const closed = await page.evaluate(() => !document.getElementById('mobile-menu'));
          report[key].mobileMenu = { ...opened, closesOnEscape: closed };
        }
      }
      if (OVERFLOW_ONLY.includes(size)) { report[key] = { scrollWidth: report[key].scrollWidth, innerWidth: report[key].innerWidth, overflow: report[key].overflow }; continue; }
      // Scroll through so lazy images load, then capture the full page
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await new Promise(r => setTimeout(r, 400));
      const name = (path === '/' ? 'home' : path.slice(1).replace(/\//g, '_')) + `_${size.w}x${size.h}.jpg`;
      await page.screenshot({ path: join(OUT, name), fullPage: true, type: 'jpeg', quality: 60 });
    }
    if (errors.length) report[`console@${size.w}`] = [...new Set(errors)].slice(0, 10);
    await page.close();
  }
  await writeFile(join(OUT, 'findings.json'), JSON.stringify(report, null, 2));
  console.log(`Wrote ${Object.keys(report).length} results and screenshots to ${OUT}`);
} finally {
  await browser.close();
  server.close();
}
