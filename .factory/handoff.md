# Low-Energy Menu — verification 3 handoff

Work order: `low-energy-menu-verify-3`

Release decision: **FAIL**

Implementation reviewed: `9f9959af6749ca21253cd04fafee410848829d62`

Documentation baseline: `383e006a34c9ab630e8095cac23511fac93243e4`
Live URL: <https://low-energy-menu.sociobot.in>

No product code was changed. The full independent report is in `.factory/verification-3.md`.

## Verification completed

- Ran `npm ci` in a fresh clone, then every exact command in `.factory/claims.json`.
- Ran `npm test`, `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high`.
- Exercised fresh desktop and 390×844 phone flows, sample isolation/reset/start-real, normal planning, invalid import and license handling, keyboard/focus, reduced motion, 200% text, axe, offline reload, links, legal routes, the deliberate 404, headers, checkout, and API rate limiting.
- Ran live Lighthouse 13.4.1 and compared the built candidate with live HTML, JS, CSS, service worker, and manifest.
- Proved the fixes requested by verification 1 and 2, including the new week-history and outcome-tracking claims.

## Results

All nine declared claim commands pass in both browser projects. The full suite passes 7/7 unit/release tests and 28/28 browser tests. Typecheck, build, audit, live offline reload, live axe, headers, links, and Lighthouse 100/100/100/100 also pass. The deployed artifact matches implementation `9f9959a`.

Acceptance still fails with 8 findings and 3 untested public claims:

1. Close-repetition warnings, unavailable-leftover warnings, and the exact three-recipe/five-night demo promise lack adequate claim tests.
2. A newly pasted arbitrary token unlocks paid features if its first verification request is unavailable.
3. The grocery panel says rows come from cooked dinners, but exports planned recipe dinners.
4. Demo controls are 40 px high and the mobile home link is 36 px high, below the 44 px contract.
5. The required three-step How it works and privacy/non-goals landing sections are absent.
6. The 404 H1 uses the menu metaphor prohibited by the plain-words contract.
7. The required recipe-name field is not visibly identified as required.
8. Privacy and Terms omit required Open Graph, Twitter, and Apple touch metadata.

## Reproduce the main blockers

```sh
npm ci
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
```

To reproduce the paid-boundary defect, open a fresh real-mode browser, block `https://api.sociobot.in/**`, paste any new token, and select **Restore**. The app reports offline fallback, displays **Household unlocked**, and opens previous-week navigation despite having no cached valid verdict.

## Next step

Repair the eight findings in `.factory/verification-3.md`, add the three missing claim assertions, deploy the changed implementation, and request another independent verification. A real payment was not submitted; checkout registration and redirects were verified without creating a transaction.
