# Airola mobile fix: report

Branch `mobile-fix`, based on `design/typography` (open PR #1, which holds all current site work). Nothing merged, nothing deployed. Audit detail: `audit/mobile-audit.md`. Raw measurements: `audit/before/findings.json` and `audit/after/findings.json`. Screenshots (60 per run, every page at 360×800, 390×844, 430×932, 768×1024 and 1440×900): `audit/before/` and `audit/after/`. They're local only (gitignored, ~7 MB per run); regenerate with the commands at the end.

## Stack

- React 19 + TypeScript single-page app built with Vite 6. Routing is a `Page` enum in `App.tsx`, mapped to URLs in `config/routes.ts`. It isn't a CMS or site-builder export.
- Styling is Tailwind CSS v4 utility classes in the components, plus `index.css` (`@theme` font variables and a few unlayered base rules).
- `npm run build` runs `vite build`, then `scripts/prerender.mjs` snapshots the public routes to static HTML. Deploys are manual to Vercel.
- The viewport meta (`width=device-width, initial-scale=1.0`) was already present on every page, including the prerendered ones.

## Issues fixed

| # | Issue (before) | After | Commit |
|---|---|---|---|
| 1 | Floating WhatsApp and chat buttons covered the hero CTA, pricing text, quote options and About buttons on phones | Mobile-only sticky bottom bar (Get a Quote, WhatsApp, Call, Chat) with safe-area padding and a footer spacer; it hides while a text field is focused. Floating buttons only from 768px | `d2d3d71` |
| 2 | Hero headline was 48px on every phone and broke as "Check- / Out."; the CTA would have fallen behind a bottom bar at 360×800 | `clamp()` headline (34–48px) with "Every Check-Out." on one line; tighter hero spacing on phones; CTA now at 456–519px on all phones | `5dfce40` |
| 3 | "How Airola Works", services and values cards had one-word-wide text columns (nested `p-8`/`p-16` plus 64px icons) | Mobile-first padding, gaps and icon sizes | `f0b56df` |
| 4 | 52 body-copy elements at 12–14px on phones | `text-sm` is 16px below 1024px (shared theme variable); quote/pricing descriptions and footnotes 16px below 1024px. 1 left: an uppercase 12px label on /login | `a6652ca`, `5d6a73b`, `b80913c` |
| 5 | 159–182 tap targets under 44×44px (footer links 20–32px tall, show-password 28px, quote WhatsApp link 20px) | 0 at 360–768px | `8be7fe5`, `77fe14a`, `b80913c` |
| 6 | At 768–1023px the desktop navbar didn't fit: logo squashed to ~48px, back button 20px wide | Menu button used below 1024px; desktop unchanged | `77fe14a` |
| 7 | Recommended pricing card scaled to 105%, ending 8px from the screen edges | Scale and hover lift only from 768px; card stays inside the 16px gutters | `5d6a73b` |
| 8 | One-off/every-turnover toggles cramped around a 56×32px switch | Label, switch, label grid on phones; 68×44px tap area via an invisible `::before` | `5d6a73b`, `f151c2a` |
| 9 | Quote add-on titles and prices squeezed into one column; price panel ran label into price ("1 bath)£45") | Title and price wrap; gap between label and amount below 1024px | `5d6a73b`, `f151c2a` |
| 10 | Images: 134 KB PNG logo for a 110px slot, 115 KB hero JPG and 128–169 KB section JPGs for ~330px slots; no `srcset`, no WebP | Resized WebP copies (same artwork) through `<picture>` with `srcset`/`sizes`, originals as fallback. A phone loads a 20–34 KB hero and a 16–27 KB logo. The hero preload matches the chosen WebP | `f595003` |
| 11 | No `autocomplete` on the giveaway, login or quote contact fields | name, email, tel, street-address, current/new-password | `2e99aca` |
| 12 | "Still have questions?" text touched the screen edge | 16px side padding (0 edge-text findings after) | `f0b56df` |
| 13 | "Why Airola" check icons off-centre (stray `mr-5`) | Centred (also visible on desktop) | `f0b56df` |
| 14 | Values cards swayed sideways into the edge on phones | Sway animation only from 768px | `f0b56df` |
| 15 | `100vh`/`min-h-screen` heights, chat panel `100vh` | `svh` for page heights, `dvh` for the chat panel | `a6652ca` |
| 16 | Long words had no wrap rule | `overflow-wrap: break-word` on body | `a6652ca` |

Audit tooling: `619a0d7` (`scripts/mobile-audit.mjs`; excluded from Vercel uploads).

## Verification

- **No horizontal scroll** (`scrollWidth <= innerWidth`) at 320, 360, 390, 430 and 768px on all 12 audited pages, before and after.
- **Mobile menu:** opens, closes on Escape, and doesn't cover the page at 360–430px. Below 1024px it's now also used at tablet widths.
- **Desktop at 1440px:** pixel-diffed against before. 0.00% change on Pricing, Contact, Legal, Giveaway, Offer, Testimonials, area and 404 pages. Under 0.02% elsewhere (WebP recompression of photos, re-centred check icons, the darker password icon, add-on title/price baseline alignment). Page heights are identical.
- **Build:** passes. The only warning is the existing "chunks larger than 500 kB" one; the bundle is unchanged by this work.
- **Console:** no errors except the testimonials query, which fails until that migration is applied.

### Lighthouse (mobile, median of 3 runs, local production build with gzip)

| Page | Perf | A11y | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| Home before | 80 | 100 | 96 | 100 | 4.27s | 0.023 | 201ms |
| Home after | **91** | 100 | 96 | 100 | **3.31s** | **0.000** | **0ms** |
| Pricing before | 95 | 100 | 100 | 100 | 2.86s | 0.000 | 40ms |
| Pricing after | **96** | 100 | 100 | 100 | **2.63s** | 0.000 | **0ms** |
| Quote before | 95 | 100 | 100 | 100 | 2.80s | 0.000 | 49ms |
| Quote after | **97** | 100 | 100 | 100 | **2.50s** | 0.000 | **0ms** |

INP needs real-user data, so lab Lighthouse can't report it. Total Blocking Time (its lab proxy) is 0ms on all three pages. Home's Best Practices 96 is only "errors in console" from the testimonials query.

## Not fixed, and decisions for you

1. **Tablet (768–1023px):** the sticky bar is phones-only, so the floating WhatsApp and chat buttons still float over content at tablet widths, as before. Say if you want the bar up to 1024px.
2. **Testimonials migration not applied:** causes the console error, Best Practices 96 on home, and the "couldn't load reviews" state on /testimonials (also why that page isn't prerendered).
3. **Logo and photos:** the WebP files are resized copies of the existing logo and photos, not new artwork. The original PNG/JPG files are unchanged and stay as fallbacks.
4. **`overflow-wrap`:** used `break-word` on body rather than `anywhere`, because `anywhere` lets flex rows shrink text to single-character columns.
5. **One 12px line left:** "Encrypted authentication & UK-hosted data" on /login is an uppercase label, not body copy.
6. **Chunk-size build warning:** the existing large main bundle. Splitting out Supabase would mean changing `db.ts`.
7. **Base branch:** `mobile-fix` sits on top of PR #1 (`design/typography`). Merge PR #1 first, or merge `mobile-fix` and both arrive together.
8. **Screenshots** are not committed (about 14 MB per run). Regenerate them with the commands below.

## Commands

Preview locally:
```
git switch mobile-fix
npm install
npm run build
npm run preview          # http://localhost:4173 (Vite preview, SPA fallback)
# or the dev server:
npm run dev              # http://localhost:3000
```

Re-run the audit (writes screenshots and findings):
```
npm run build
node scripts/mobile-audit.mjs audit/after
```

Merge (PR #1 into main first, then this branch):
```
gh pr merge 1 --merge
git switch mobile-fix && git push -u origin mobile-fix
gh pr create --base main --head mobile-fix --title "Mobile-first fixes"
gh pr merge --merge
```
Or locally: `git switch main && git merge --no-ff mobile-fix && git push origin main`. Deploying stays a separate manual step (`npx vercel deploy --prod`).
