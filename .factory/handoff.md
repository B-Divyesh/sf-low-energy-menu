# Low-Energy Menu — repair handoff

Work order: `low-energy-menu-repair-2`

Release decision: **PASS**
Implementation commit: `9f9959af6749ca21253cd04fafee410848829d62` (`fix: prove history and outcome claims`)

The HTTPS PWA at <https://low-energy-menu.sociobot.in> now includes the repaired implementation. The code commit above is the deployed product image; this handoff is committed afterward as documentation only.

## What changed

The independent verifier’s sole blocker was correct: week-history and outcome-tracking promises were public, but absent from `.factory/claims.json` and from their own demo-entry outcome tests.

| Finding | Cause | Repair and regression evidence |
| --- | --- | --- |
| Week-history promise unlisted and untested | The existing free/current-next and licensed/all-week navigation rules had no claim contract. | Added `week-history`. Its browser flow starts at `/demo/`, proves the free previous and beyond-next controls do not change the displayed week, then starts for real, mocks a valid product-license verdict, and moves before and after the current week. |
| Outcome-tracking promise unlisted and incomplete in the visible summary | Outcome state persisted, but the summary exposed only cooked dinners. | Added a visible weekly **changed** count beside **cooked**. Added `outcome-tracking`, which marks a sample dinner cooked, reloads, marks it changed, and proves both counts and button states persist. |
| Plain-words minor copy issues | Some labels used mood or metaphor wording. | Replaced them with task names such as “Weekly dinner planner”, “Plan this week’s dinners”, “Your recipes”, and “Add more recipes and weeks”. Updated the copy audit. |

`.factory/claims.json` now has nine claims. The release test still rejects any claim without exactly one `@claim:<id>` browser test. `.factory/catalog-description.txt` is verb-first, 83 characters, and is copied unchanged to `/work/.evidence/catalog-description.txt`.

## Earlier verification findings and current disposition

All findings from `.factory/verification.md` and `.factory/verification-2.md` are addressed or still covered:

- Claims contract and isolated one-click demo: present; demo uses only `low-energy-menu-demo` IndexedDB, has its persistent label/reset/start-real controls, and preserves the real namespace.
- Production billing origin, clean `npm test`, host CSP/caching, manifest MIME, real HTTP 404, and plain invalid-import recovery: unchanged and covered by the existing release/browser tests.
- Dark theme, keyboard, reduced motion, phone layout, privacy, offline reload, and legal routes: unchanged and passed the full suite and live checks below.
- This repair closes the only blocker recorded in `verification-2.md`; no new product defect was found.

## Clean local verification

From the documented clean setup:

```sh
npm ci
```

installed 61 packages with `npm audit --audit-level=high` reporting zero vulnerabilities. Every exact claim command then passed in both Chromium projects:

```sh
npm test -- --grep @claim:demo-sandbox
npm test -- --grep @claim:planning-checks
npm test -- --grep @claim:grocery-csv
npm test -- --grep @claim:backup-roundtrip
npm test -- --grep @claim:local-private
npm test -- --grep @claim:offline-reload
npm test -- --grep @claim:free-and-paid
npm test -- --grep @claim:week-history
npm test -- --grep @claim:outcome-tracking
```

- `npm test` — pass: 7/7 Vitest unit/release tests and 28/28 Playwright tests (desktop Chromium plus 390×844 mobile).
- `npm run typecheck` — pass.
- `npm run build` — pass; output is `dist/` with root `index.html`.
- Build budget: main JS 30.61 KB raw / 10.24 KB gzip; CSS 16.59 KB raw / 4.49 KB gzip; hero AVIF remains about 60 KB. No external font or runtime script is shipped.
- Local Playwright coverage includes normal, invalid-import recovery, free/paid boundaries, demo isolation/reset, keyboard and dialog focus, reduced motion, mobile overflow, offline reload, and axe scans in both light and dark schemes.

## Deployment and live verification

Deployed the production artifact with:

```sh
/opt/fleet/lib/deploy-static.sh low-energy-menu /work/repo/dist
```

The wrapper completed successfully. Local and live `assets/main-C-L6EanZ.js` SHA-256 both equal:

```text
c64ff4134b57fdb6f127b97e2da99f7be2aa44a7eb705a00eb02bed7f05690d6
```

- `verify-url.sh` passed for `/` and `/demo/`: 200 responses, expected route titles, `lang=en`, one H1, a main landmark, alt text, labelled buttons, and no console errors.
- New storage-free desktop and 390×844 phone browser contexts both showed the job (“Plan dinners for the energy you have”), its household audience, and **Try it with sample data** before scrolling. Desktop then created a real recipe, entered the sample, confirmed the persistent sample label and sample plan, reset it, and returned to the untouched real recipe. Phone had no horizontal overflow.
- A separate fresh mobile context waited for service-worker control, went offline, reloaded `/demo/`, and retained the sample plan with the visible **Offline** state.
- Live axe scans found zero serious or critical violations on `/` and `/demo/` in light and dark color schemes.
- Lighthouse 13.4.1 live mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, TBT 20 ms, CLS 0.001.
- Live responses include CSP, HSTS, `Referrer-Policy`, `X-Content-Type-Options`, and Permissions Policy. The hashed JS is immutable for one year, `sw.js` is no-cache, the manifest is `application/manifest+json`, and an unknown route is a designed HTTP 404.
- The demo flow made no third-party runtime requests or console errors. The public invalid-license verifier accepted 30 simultaneous requests and returned 429 with `Retry-After: 4` for the next 10, confirming the live allowance and limiter.
- The advertised checkout endpoint is registered and redirects to the hosted merchant checkout. No purchase was submitted.

## Known gaps and next steps

- A real paid purchase and live entitlement were not exercised because that would create a financial transaction. The checkout registration, production origin, invalid-token response, and mocked valid-license behavior are verified; real payment remains the billing operator’s responsibility.
- The researched success measure still needs the intended three-week household pilot. The product now records both outcomes locally but does not claim pilot results.
- No backend, tenant, or shared database exists in this static local-first product. Household planning data remains in browser IndexedDB; the only production API used is optional license checkout/verification.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run build
npm run preview
```
