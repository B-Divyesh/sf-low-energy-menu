# Independent verification 2 — FAIL

Verified on 2026-08-28 against candidate commit `1fb10ff4a288e639e0f56e35f58aff6ae8ac55a7` and the deployed URL <https://low-energy-menu.sociobot.in>.

## Release decision

**FAIL — do not accept this candidate yet.** The product and deployment work well in the exercised paths, but the claims contract requires every visitor-facing claim to be enumerated and observable in a demo-entry test. Two copy claims are not covered by `.factory/claims.json`; this is explicitly release-blocking under the supplied acceptance contract.

## First-read and demo gate

Fresh, storage-free live browser result: this is a weekly dinner planner for households balancing school meals, leftovers, and the cook's changing energy. The first action is **Try it with sample data**, which says it will show a planned week right away. The landing screen therefore plainly answers what it does, for whom, and what to click first.

One click opened `/demo/` with three realistic recipes and five planned nights. The persistent banner says **Demo — sample data, nothing is saved**, provides **Reset demo** and **Start for real**, and demo data was separately stored from a real recipe created in the same fresh browser context.

## Mandatory claim gate — performed first

`git rev-parse HEAD` was `1fb10ff4a288e639e0f56e35f58aff6ae8ac55a7`; the checkout was initially clean. `.factory/claims.json` exists and contains seven entries. After `npm ci` (61 packages, 0 audit vulnerabilities), every exact command passed, each against the shipped demo route and in both configured Chromium projects:

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS, 2/2 browser tests |
| `planning-checks` | `npm test -- --grep @claim:planning-checks` | PASS, 2/2 |
| `grocery-csv` | `npm test -- --grep @claim:grocery-csv` | PASS, 2/2 |
| `backup-roundtrip` | `npm test -- --grep @claim:backup-roundtrip` | PASS, 2/2 |
| `local-private` | `npm test -- --grep @claim:local-private` | PASS, 2/2 |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, 2/2 |
| `free-and-paid` | `npm test -- --grep @claim:free-and-paid` | PASS, 2/2 |

The complete `npm test` then passed: Vite production build, 7/7 Vitest tests, and 24/24 Playwright tests across desktop and 390 x 844 mobile. `npm run typecheck` and the exact `npm run build` also passed. Build output: main JS 30.47 KB raw / 10.25 KB gzip; CSS 16.59 KB raw / 4.49 KB gzip; hero AVIF 60.2 KB. All are within the static-PWA budgets.

## End-to-end, accessibility, privacy, and PWA evidence

- Live normal flow: added a real recipe, chose low energy and a similar school meal, received both effort and school-meal warnings, and downloaded the grocery CSV.
- Demo isolation: real recipe `QA private soup` was absent in demo, sample data reset correctly, and Start for real restored the real namespace.
- Invalid recovery: malformed `broken.json` produced the plain recovery message directing the user to an exported JSON backup.
- Keyboard: skip link received focus and moved focus to `main`; Enter opened the recipe dialog and focused its recipe-name input; Escape closed it. Focus is visibly styled.
- 390 px mobile: zero horizontal overflow. Reduced-motion primary-button transition was `1e-06s`.
- Live axe (after an offline-reload demo flow): 0 serious/critical violations. The repository's axe coverage also passed on home/demo in light and dark themes.
- Live console/page errors: none on desktop or mobile. Full-flow live requests were same-origin only (`https://low-energy-menu.sociobot.in`).
- Privacy persistence: demo used `low-energy-menu-demo` IndexedDB and did not expose the real recipe or real license storage. The full-flow privacy claim test passed.
- PWA: service-worker control completed; after `context.setOffline(true)`, `/demo/` reloaded with the sample and a visible Offline status. Source inspection confirms update handling with `updatefound`, an update toast, and `SKIP_WAITING`/`clientsClaim`; a real newer deployment could not be induced during this read-only QA run.
- `/opt/fleet/lib/verify-url.sh` passed for `/` and `/demo/`: HTTP 200, expected titles, `lang=en`, one H1, main landmark, no missing image alt text, no unlabeled buttons, no console errors. Evidence directories in this QA container: `/tmp/tmp.2bPAtYsfWw` and `/tmp/tmp.ZyuwUHgb00`.
- Lighthouse 13.4.1 live mobile: Performance 97, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.4 s, TBT 200 ms, CLS 0.001, interactive 1.4 s.

## Deployment, policies, and endpoint checks

Deployment matches the candidate: local and live `assets/main-B1uc17gS.js` SHA-256 are both `c9e3ae501470df1368544553736f84e048a31ed8f672943263303e6d64e0cc1d`.

- `/`, `/demo/`, `/privacy/`, `/terms/`, manifest, service worker, icons, and hero asset returned 200. Unknown route returned a designed HTTP 404.
- Root CSP restricts runtime resources to self plus the required `https://api.sociobot.in` billing origin. Root also sends HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and a restrictive Permissions-Policy.
- Hashed JS sends `Cache-Control: public, max-age=31536000, immutable`; `sw.js` sends `no-cache`; manifest is `application/manifest+json`.
- The bundle uses the required production billing origin, not the pilot origin. No sign-in is present, so Entra tenant verification is not applicable.
- Billing API rate-limit probe: 60 simultaneous invalid-license requests to `https://api.sociobot.in/api/v1/products/low-energy-menu/verify` returned 30 x 200 and 30 x 429. Every observed 429 included `Retry-After: 4`; approximately 30 requests were accepted before/beside the limiter in this burst.

## Defects

### Blocker

1. **Unlisted/unproven public claims.** The app purchase card promises “Full previous and future week history,” while README says the free planner permits “the current and next week” and the paid license adds “full week history.” `.factory/claims.json` only claims and tests the eight-recipe limit and removal of that limit; its tagged test never asserts week navigation/history for either state. README also claims that the product “Tracks cooked and changed dinners against the product's success measure,” with no corresponding claims entry or tagged observable test. Under the supplied claims rule, any claim-like sentence without an entry is a release failure.

### High / medium / low

No additional defects found in the tested scope.

## Required remediation

Either remove the unproven week-history and outcome-tracking promises from the app/README, or add narrowly worded claims to `.factory/claims.json` with exactly one tagged demo-entry browser test per claim. For history, exercise free previous/future lock behavior and valid-license navigation; for outcomes, assert that cooked/changed actions update the visible tracking result. Re-run the claim commands and independent verification after that change.
