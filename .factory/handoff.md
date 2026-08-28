# Low-Energy Menu — build handoff

Work order: `low-energy-menu-build-1`  
Completed: 2026-08-28

## What shipped

- A complete seven-day planner with a low/medium/high cook-energy budget per day, school/canteen meal context, recipe dinners, available-leftover dinners, flexible nights, and cooked/changed outcome tracking.
- User-authored recipe cards with effort, extra leftover dinners, free-form dietary/allergen tags, ingredient quantities, and practical notes. There is no scraped or generated recipe corpus.
- Plain-language checks for effort mismatch, overlap with school food, close meal repetition, and unavailable leftovers. The interface explicitly says these are planning prompts rather than nutrition, allergy, medical, or food-safety advice.
- Aggregated grocery CSV export plus full JSON backup/import and confirmed local erasure.
- IndexedDB persistence, a versioned service worker, dynamically precached hashed build assets, offline navigation fallback, install manifest, 192/512 maskable-capable icons, and an in-app update notice.
- A useful free tier (eight recipes, current and next week) and a $12 USD one-time household unlock (unlimited recipes and full week history). Checkout, query-string license capture, exact `sb_license:low-energy-menu` storage, optimistic cached unlock, at-most-daily verification, invalid-license handling, and paste-to-restore follow the Sociobot contract. Export, accessibility, and safety checks remain free.
- Responsive 390 px/mobile and desktop treatments, light/dark color schemes, keyboard paths, visible focus, reduced-motion handling, loading/empty/error/offline states, privacy and terms pages, and product documentation.
- Original generated week-rhythm artwork and hand-authored app icon. The image prompt, review, generation metadata, and license/provenance are recorded in `.factory/design.md` and `assets/src/`. Shipping formats are AVIF (60 KB), WebP (76 KB), and JPEG fallback (124 KB).

## How to run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

`npm run build` is the deployment command. It produces `dist/index.html`, `dist/privacy/index.html`, and `dist/terms/index.html` at the expected static root.

Verification completed against the production build:

- TypeScript: `npx tsc --noEmit` — pass.
- Dependency audit: `npm audit` — 0 vulnerabilities.
- Unit suite: 4/4 pass (warnings, leftovers, grocery aggregation, ingredient parsing).
- Playwright 1.58.2: 8/8 pass across desktop Chromium and a 390 × 844 Chromium mobile viewport. Covered clean console/landmarks/legal routes, recipe-to-plan-to-warning-to-grocery flow, full axe scan, refresh persistence, service-worker readiness, and a real `context.setOffline(true)` reload.
- Offline stress check: the persistence/offline test repeated three times per viewport (6/6 pass) after hardening cache matching for static hosts that emit `Vary: Origin`.
- Axe: 0 serious or critical violations; the full color-contrast rule was enabled.
- Lighthouse 13 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100. FCP 0.9 s, LCP 1.7 s, TBT 0 ms, CLS 0.001.
- Production bundle: initial app JavaScript 26.7 KB raw / 9.1 KB gzip; CSS 15.2 KB raw / 4.2 KB gzip; no web fonts; hero AVIF 60 KB. These are below the 200 KB JS, 50 KB CSS, 120 KB font, and 300 KB hero budgets.
- Manual visual review completed at 1440 × 1000 and 390 × 844. One `<h1>`, `<main>`, `lang="en"`, title, meaningful image alt, 44 px controls, clear focus states, dark treatment, and responsive stacking are present.

## Deployment notes

- Staging intentionally defaults to `https://pilot-api.sociobot.in`. Set `VITE_BILLING_BASE_URL=https://api.sociobot.in` for the production factory build after the product is registered. No billing-provider product ID is hardcoded.
- Serve the contents of `dist/` over HTTPS. Direct `/privacy/` and `/terms/` paths are real built documents and do not require an SPA rewrite.
- The service worker and license verification need the deployed origin allowed by the Sociobot billing API as specified by the factory contract.

## Known gaps and next steps

- Billing registration and an end-to-end paid checkout with the factory’s test product are external to this repository. Once registered, run one staging purchase with the documented `4242 4242 4242 4242` card and confirm the return URL.
- Success-measure evidence (four cooked nights for three weeks and fewer than one effort abandonment per week) requires a household pilot; the app records the necessary cooked/changed outcomes but does not transmit analytics.
- Data is deliberately device-local with manual backup rather than cloud sync. Browser/site-data clearing can remove it, which is disclosed in-product and in the privacy policy.
