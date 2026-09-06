# Low-Energy Menu — verification 4 handoff

Work order: `low-energy-menu-verify-4`

Release decision: **PASS**

Implementation reviewed: `d3e96f1ba36ca2eee3697f96695362a0fb7e274d`
Release documentation reviewed: `826b0bac909ca78c6751af281fd506eb4bebd6ac`
Live URL: <https://low-energy-menu.sociobot.in>

## What was done

Independent QA was completed without changing product code. The live deployed JavaScript matches the reviewed implementation (`1a4fd615c3fd072c8a75fde3190e71616ea94c4d9eaa2b2425259c1b70c24893`). The report is `.factory/verification-4.md`.

Verification confirmed the repairs from verification 3: all twelve public claims are independently declared and passing; first-time license outages fail closed while an already verified cached license works offline; grocery wording matches planned-export behavior; phone targets meet 44 px; required landing sections, plain 404 heading, recipe required label, and legal metadata are present.

Fresh desktop and phone live checks confirmed the job, audience, and sample first action before scrolling; the realistic isolated demo; reset/start-real behavior; normal, invalid, outage, and recovery license behavior; offline reload; keyboard/dialog focus; reduced motion; 200% reflow; privacy isolation; legal and 404 routes; headers; rate limiting; and the hosted checkout route. No real payment was submitted.

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
```

All exact commands in `.factory/claims.json` were also run individually. Every claim passed in desktop and mobile Chromium (12 × 2). The complete test suite passed: 7 Vitest tests and 42 Playwright tests. Build output is `dist/` with `dist/index.html` at its root.

Live checks:

- `verify-url.sh` passed for `/`, `/demo/`, `/privacy/`, and `/terms/`.
- Axe found zero serious/critical issues on five public routes in both light and dark themes.
- Lighthouse 13.4.1 mobile: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO.

Evidence is in `/work/.evidence/low-energy-menu-verify-4/`; the factory-facing copies are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.

## Known limits and next steps

- Checkout was inspected but no paid transaction was submitted.
- The three-week household success measure needs a real household pilot; the app does not claim the outcome.
- This is a static local-first PWA. It has no product backend, tenant database, or shared PostgreSQL dependency.
