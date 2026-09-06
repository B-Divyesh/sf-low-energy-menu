# Low-Energy Menu — repair 4 handoff

Status: deployed and verified.

Implementation commit: `6c637628f362c18ed08c1482dd9f101d2a9533c9`

Verification documentation commit: `43e977c657cd2095484edd206639ca18ce407cb6`

Prior strict-review documentation commit: `d82ba7412229bd9421a3605fb813ebf1181e1280`

Live URL: <https://low-energy-menu.sociobot.in>

## What changed

The strict-review failure was a flaky browser proof for the `week-history` claim, not a paid-license policy failure. The claim mocked the external license verifier in a context that could be claimed by the PWA service worker. Playwright does not reliably route requests a service worker has claimed.

The mocked paid-license claim and recovery tests now run in test-only browser contexts with service workers blocked. The ordinary PWA tests continue to run with service workers enabled, including the offline reload check. This makes the mocked verifier deterministic while preserving real service-worker coverage.

No production planner, license, checkout, data, or PWA behavior was weakened or removed. The deployed main bundle remains byte-for-byte identical to the prior working product bundle because this repair changes test isolation only.

The catalog description remains verb-first and is copied to `/work/.evidence/catalog-description.txt`. Public paid-offer metadata is at `/work/.evidence/billing-offer.json` for the separate billing-registration operator.

## Finding disposition

| Finding | Current disposition |
| --- | --- |
| `week-history` claim intermittently failed on mobile Chromium | Fixed. Browser-level mocked verifier checks now block service workers; 12 consecutive exact command runs passed in desktop and phone Chromium. |
| First-time license outage failed open | Fixed and reconfirmed live with mocked responses. An unverified token stays locked. |
| Valid, invalid, outage, and recovery license policy | Confirmed. Invalid stays locked; a valid response unlocks; only a previously verified cached token works through a later outage. |
| Grocery copy referred to cooked dinners while export used planned dinners | Fixed. Live copy says planned recipe dinners and the CSV includes all three planned recipe dinners. |
| Phone targets below 44 px | Fixed. Live home, Reset demo, and Start for real measured 44 px. |
| Missing How it works and privacy/limits landing sections | Fixed and present. |
| Metaphorical 404 heading | Fixed. The HTTP 404 page uses `Page not found.` |
| Required recipe label and legal social/touch metadata | Fixed and live. |
| Claims/demo, production billing origin, clean test setup, CSP/cache, manifest MIME, real 404, plain import recovery, history/outcome coverage, contrast | Remain fixed and were rechecked through the current build and live site. |

## Verification

From a clean dependency install:

```sh
npm ci
npm test -- --grep @claim:demo-sandbox
npm test -- --grep @claim:planning-checks
npm test -- --grep @claim:repeat-warning
npm test -- --grep @claim:leftover-warning
npm test -- --grep @claim:demo-sample-size
npm test -- --grep @claim:grocery-csv
npm test -- --grep @claim:backup-roundtrip
npm test -- --grep @claim:local-private
npm test -- --grep @claim:offline-reload
npm test -- --grep @claim:free-and-paid
npm test -- --grep @claim:week-history
npm test -- --grep @claim:outcome-tracking
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
```

- All 12 exact declared claim commands passed in both configured projects: desktop Chromium and 390 × 844 mobile Chromium.
- `week-history` also passed 12 consecutive extra exact-command runs, with both projects passing each run.
- `npm test` passed: 7/7 unit/release tests and 42/42 browser tests. `typecheck`, build, and audit passed; audit reported zero vulnerabilities.
- Build output is present at `dist/index.html`. Main JS is 32,413 bytes raw / 10,700 bytes gzip; CSS is 18,829 bytes raw / 4,860 bytes gzip; the hero AVIF is 60,218 bytes.
- Static deployment completed successfully as deployment `b812b695-7b26-46b2-aa34-3040103b52bc`. The deployment reused the existing static product site and made no backend, database, billing, or infrastructure configuration change.
- The local and HTTPS-live main bundle are both `assets/main-wBsoeMGj.js`, SHA-256 `1a4fd615c3fd072c8a75fde3190e71616ea94c4d9eaa2b2425259c1b70c24893`.
- `/opt/fleet/lib/verify-url.sh` passed on `/`, `/demo/`, `/privacy/`, and `/terms/`: HTTP 200, route title, `lang=en`, one H1, a main landmark, complete alt text, labelled buttons, and no console errors.
- Fresh desktop and phone contexts both showed, before scrolling: job `Plan dinners for the energy you have.`, audience `For households balancing school meals, leftovers, and the cook’s changing energy.`, and first action `Try it with sample data` with `See a planned week right away.`
- A fresh live phone demo opened with three recipes and five planned nights. The persistent sample label survived reload; a demo-only recipe persisted in demo, Reset demo removed it, and Start for real restored an untouched real recipe.
- Fresh live checks confirmed invalid and first-time-outage licenses stay locked, recovery from a valid response unlocks, and only a previously verified cached verdict is usable offline.
- Fresh live axe scans found no serious or critical issues on `/`, `/demo/`, `/privacy/`, `/terms/`, and the expected `/does-not-exist` HTTP 404 in light and dark schemes. Keyboard focus, dialog focus return, reduced motion, and 44 px phone targets passed.
- A fresh live demo service-worker context reloaded offline with its sample intact and an `Offline` state. The demo network flow made only same-origin product requests and used only the demo IndexedDB namespace.
- Live headers retain CSP, HSTS, Referrer-Policy, `nosniff`, Permissions-Policy, immutable hashed-asset caching, and a web-manifest MIME type. The expected unknown route returns HTTP 404 with `Page not found.`

Evidence from the current worker is under `/work/.evidence/low-energy-menu-repair-4/`.

## Known limits

- No payment was submitted and no direct request was made to the shared billing service during this repair. The published $12 one-time checkout link and paid deliverables remain intact; mocked live-browser responses exercised the entitlement boundary.
- This static local-first PWA has no product backend, tenant database, health route, or restart-persistence endpoint. SQLite and rate-limit checks are not applicable.
- A new Lighthouse JSON run could not complete in this disposable worker because the supplied Chromium exited while initializing its font-data service (`No space left on device`), despite sufficient workspace disk reported by the host. This is a worker browser limitation, not a page-console or product failure. The prior independent verification recorded 100/100/100/100, and the deployed production asset hash is unchanged.
- The researched three-week cooking success measure requires a future household pilot. It is not presented as a current product claim.
