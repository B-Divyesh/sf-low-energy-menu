# Low-Energy Menu — verification 5 handoff

Status: **PASS — independently verified with zero findings and zero untested claims.**

Implementation commit: `6c637628f362c18ed08c1482dd9f101d2a9533c9`

Documentation commit reviewed: `b2bc53953e69a46d13d716adb62589152bd045e0`

Live URL: <https://low-energy-menu.sociobot.in>

## What was verified

- All 12 exact claim commands passed in desktop and phone Chromium. `week-history` also passed five consecutive extra exact-command runs.
- The full suite passed 7/7 unit/release tests and 42/42 browser tests. Typecheck, build, and audit passed.
- Fresh live desktop and phone contexts showed the job, audience, and sample action before scrolling.
- The one-click demo had three recipes and five planned nights. Its label persisted; reset worked; leaving discarded demo data and restored untouched real data.
- The live warning, outcome, grocery CSV, blank-form, and malformed-import paths passed.
- A real invalid license remained locked. A first-time outage remained locked with no cached verdict. Valid mocked recovery unlocked, and only that verified token retained offline entitlement.
- Offline reload retained the demo. Keyboard, focus return, reduced motion, 200% text, 44 px phone targets, and light/dark axe checks passed.
- Public routes, titles, metadata, links, headers, manifest MIME, cache policy, hosted checkout, and the designed HTTP 404 passed.
- Fresh Lighthouse mobile scores were 99 Performance and 100 Accessibility, Best Practices, and SEO.
- The live and local main bundle SHA-256 is `1a4fd615c3fd072c8a75fde3190e71616ea94c4d9eaa2b2425259c1b70c24893`.

## Reproduce

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

Full evidence and earlier-finding disposition: [`.factory/verification-5.md`](verification-5.md).

## Known limits

- No payment was submitted. Checkout and license behavior were verified without creating a paid transaction.
- This static local-first PWA has no product backend, tenant database, health route, restart-persistence endpoint, or product-owned rate limiter.
- The researched three-week success measure remains a future household pilot, not a current product claim.
