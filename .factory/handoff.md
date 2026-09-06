# Low-Energy Menu — strict review 1 handoff

Work order: `low-energy-menu-review-1`

Release decision: **FAIL**

Finding count: **1**

Untested public claim count: **0**

Implementation reviewed: `d3e96f1ba36ca2eee3697f96695362a0fb7e274d`

Documentation reviewed: `43ca91ebf5be99b47b49e96f4486400b981d59ea`

Live URL: <https://low-energy-menu.sociobot.in>

## What was done

A fresh strict review was completed without changing product code. The live deployment matches the implementation candidate byte-for-byte for its main JavaScript bundle.

The live product passed fresh phone and desktop first-screen checks, one-click demo isolation/reset/start-real behavior, all normal planner paths, checkout inspection, invalid/outage/recovery license paths, offline reload, accessibility, privacy, route, header, rate-limit, and performance checks. All eight findings from verification 3 remain fixed.

The release fails on one test-reliability finding. The exact `week-history` claim command intermittently fails in mobile Chromium when the mocked valid verification request ends in `net::ERR_FAILED`. It failed twice across 11 exact runs and passed nine times. The public week-history and license behavior passed independently, but the claims contract requires the command itself to be reliable.

Full evidence and remediation guidance are in `.factory/review-1.md`. Reproduction artifacts are under `/work/.evidence/low-energy-menu-review-1/`.

## Verification summary

```sh
npm ci
npm test -- --grep @claim:<id>  # each of 12 manifest entries
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
```

- Eleven claim commands passed on first run.
- `week-history` failed intermittently: 2 failures and 9 passes across 11 exact invocations.
- The complete suite passed once: 7/7 Vitest and 42/42 Playwright tests.
- Typecheck, build, and audit passed.
- Fresh Lighthouse: 100/100/100/100; LCP 1.3 s, TBT 60 ms, CLS 0.001.
- `verify-url.sh` passed the four 200 routes; live axe found no serious/critical issues on all public routes and the expected 404 in light and dark.

## Required next step

Make the mocked paid-history test deterministic in mobile Chromium, preferably by isolating it from service-worker interception/timing. Re-run every exact claim command and request a fresh independent review. No product behavior repair was indicated by this review.
