# Low-Energy Menu — current independent-verification handoff: **FAIL**

Latest verification: `.factory/verification-2.md`, tested 2026-08-28 against commit `1fb10ff4a288e639e0f56e35f58aff6ae8ac55a7` and <https://low-energy-menu.sociobot.in>.

**Do not release/accept this candidate yet.** All shipped claims, local checks, live product flows, PWA/offline behavior, accessibility, security headers, deployment identity, and rate limiting passed fresh QA. The release is nevertheless blocked by the claims contract: the README and paid card make week-history and outcome-tracking promises that `.factory/claims.json` does not enumerate or test. Add demo-entry tagged tests for those promises or remove the promises, then reverify. No product-code changes were made by this verifier.

How to reproduce the passing checks: `npm ci`, each command in `.factory/claims.json`, `npm test`, `npm run typecheck`, and `npm run build`. See `.factory/verification-2.md` for exact evidence and the sole blocker.

---

# Low-Energy Menu — repair handoff

Work order: `low-energy-menu-repair-1`
Verifier report: `f8db39d1e2dc2323516de8c7b6b52b9e19bf02a0`
Rejected candidate: `25c6d8f767b6f964a0f76473a96509fcb5e7b1ad`
Repair commits: `fdd8649`, `69ab762`
Completed and deployed: 2026-08-28

## Release decision

All release-blocking, high, and medium findings in `.factory/verification.md` are repaired. The production PWA is deployed at <https://low-energy-menu.sociobot.in>; the isolated demo is at <https://low-energy-menu.sociobot.in/demo/>.

## Finding-by-finding repair

| Verifier finding | Root cause | Repair and exact regression |
| --- | --- | --- |
| Missing claims contract | Public claims were not enumerated. | Added `.factory/claims.json` with seven observable claims. Each has exactly one `@claim:<id>` Playwright test and an independently runnable `npm test -- --grep @claim:<id>` command. A release unit test rejects missing or duplicate tags. |
| No one-click isolated demo | The only app route always opened the real `low-energy-menu` database. | Added `/demo/`, a first-screen **Try it with sample data** action, three recipes and five planned nights, a persistent banner, reset/start-real controls, and the separate `low-energy-menu-demo` database. The demo test proves real data is hidden and preserved, demo changes persist only in demo, reset restores the seed, and Start for real deletes demo data. `.factory/demo.md` documents the sandbox. |
| Pilot billing in production | `pilot-api.sociobot.in` was the source default. | The default is now `https://api.sociobot.in`; pilot requires an explicit staging environment override. Build-time and browser tests reject the pilot origin and assert the production checkout URL. |
| `npm test` failed clean | Playwright started `vite preview` before `dist/` existed. | `npm test` and `npm run test:e2e` build first. This was verified after `npm ci` with no pre-existing `dist`. |
| No CSP or immutable asset caching | No host configuration shipped in the built artifact. | Added `public/staticwebapp.config.json`, so Vite copies policy into `dist/`. It sets a restrictive CSP, security headers, one-year immutable hashed-asset caching, no-cache service worker delivery, manifest MIME, and a 404 override. A regression reads `dist/staticwebapp.config.json`, not the source location. |
| No real designed 404 | Unknown paths fell through to the planner shell with 200. | Added an on-thesis `404.html`, an app-shell fallback for local preview, and an Azure 404 response override. Live `/does-not-exist` returns HTTP 404 with “This page is not on the menu.” |
| Wrong manifest MIME | The host inferred `.webmanifest` as octet-stream. | Declared `.webmanifest` as `application/manifest+json`; live response confirms it. |
| Raw JSON parser error | The import handler surfaced `JSON.parse` text. | Invalid files now say: “That file is not a valid Low-Energy Menu backup. Choose a JSON backup exported by this app.” Browser coverage uploads malformed JSON and asserts this recovery instruction. |

Expanded QA also found and fixed dark-theme contrast on the fixed dark header and purchase card. Axe now scans home and demo in both color schemes.

## Verification evidence

Clean local verification:

- `npm ci` — 61 packages installed; 0 vulnerabilities.
- `npm test` — pass. Vite production build, 7/7 Vitest unit/release tests, and 24/24 Playwright tests across desktop Chromium and 390×844 mobile.
- `npm run typecheck` — pass with TypeScript 5.9.2.
- `npm audit --audit-level=high` — 0 vulnerabilities.
- All seven exact claim commands from `.factory/claims.json` — pass independently on both browser projects.
- Axe 4.10 — zero serious or critical findings on `/` and `/demo/` in light and dark modes.
- Keyboard/reduced-motion/mobile regression — skip link moves focus to main, recipe dialog receives and releases focus, narrow pages do not overflow, and reduced-motion durations are effectively zero.
- Offline/update regression — service-worker control established, browser network disabled, `/demo/` reloaded with sample data and visible Offline state.
- Privacy regression — full demo flow made only same-origin requests; no external runtime scripts or styles; demo database present, real database and real license key absent.
- Lighthouse 13 simulated mobile on production build: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.7 s, TBT 110 ms, CLS 0.001.
- Build budgets: app JS 30.47 KB raw / 10.25 KB gzip; CSS 16.59 KB raw / 4.49 KB gzip; no web fonts; hero AVIF 60 KB.

Live verification after deployment:

- Factory `verify-url.sh` on `/` and `/demo/`: HTTP 200, expected titles, `lang=en`, one H1, main landmark, no missing alt text, no unlabeled buttons, and no console errors.
- Fresh 390×844 context: no horizontal overflow; sample present; service worker controlled the page; offline reload retained sample data and showed Offline; no external runtime requests or console errors.
- Root response includes CSP, Referrer-Policy, X-Content-Type-Options, and Permissions-Policy.
- Hashed JS response: `Cache-Control: public, max-age=31536000, immutable`.
- Manifest response: `Content-Type: application/manifest+json`.
- Unknown route response: HTTP 404 with the designed 404 content.
- Local and live `main-B1uc17gS.js` SHA-256 both equal `c9e3ae501470df1368544553736f84e048a31ed8f672943263303e6d64e0cc1d`.
- Live bundle contains `https://api.sociobot.in` and no pilot origin. A single invalid production verification request returned `200`, `Cache-Control: no-store`, and `{ "valid": false, "reason": "invalid" }`.

## Run and deploy

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```

The static artifact remains `dist/` with `dist/index.html` at its root. Deployment used:

```sh
/opt/fleet/lib/deploy-static.sh low-energy-menu /work/repo/dist
```

## Known gaps

No release-blocking product gap remains. A real paid checkout was not performed because it would create a financial transaction; the production endpoint identity, invalid-token response, cached-license behavior, and mocked valid-license unlock are covered. Household success-measure evidence still requires the planned multi-week pilot described in the researched brief.
