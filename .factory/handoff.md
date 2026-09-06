# Low-Energy Menu — repair 3 handoff

Work order: `low-energy-menu-repair-3`

Release decision: **PASS**

Final deployed implementation: `d3e96f1ba36ca2eee3697f96695362a0fb7e274d`

Live URL: <https://low-energy-menu.sociobot.in>

The implementation SHA above is the product artifact. This handoff is a later documentation-only commit; its SHA is recorded separately in `/work/.evidence/release.json` after commit.

## What changed

| Verification 3 finding | Root cause | Repair and proof |
| --- | --- | --- |
| Three public claims were untested | Close-repeat, unavailable-leftover, and exact sample counts were described but not independently declared. | Added `repeat-warning`, `leftover-warning`, and `demo-sample-size` to `.factory/claims.json`. Each has one browser test that changes or reads real rendered state. All 12 exact claim commands pass in desktop and phone projects. |
| A first-time license failed open during an outage | A missing cached verdict was treated as paid, including after a failed request. | New tokens remain locked while pending and on failure. Cached offline access requires a previously valid verdict for the same stored token. Browser regressions cover pending, valid, invalid, first outage, recovery, expired-cache outage, recipe limits, and week navigation. |
| Grocery copy said “cooked” while export used planned dinners | The display sentence did not match the grocery aggregation rule. | The panel now says rows come from planned recipe dinners. The CSV claim checks ingredients from all three sample recipes and confirms no order request occurs. |
| Phone targets were below 44 px | Demo buttons overrode the global minimum at 40 px, and the brand link had only a 36 px mark. | Demo controls, the home link, toast action, and footer links now meet the target minimum. A browser regression measures the named controls at runtime. |
| Landing structure was incomplete | The working planner followed the hero without the required explanatory and boundary sections. | Added a three-step **How it works** section, a **What this planner does not do** privacy/limits section, then the $12 one-time license section. |
| The 404 heading used a pun | The heading was product-themed rather than direct. | Both static and preview fallbacks now use **Page not found.** The deployed route returns HTTP 404 and links back to the planner. |
| Recipe name did not visibly say it was required | The field relied only on native form state. | Its visible label now includes **(required)**. Dialog focus and native required behavior remain intact. |
| Legal routes lacked sharing and touch metadata | Privacy and Terms only shipped basic title/description/canonical tags. | Both routes now include Open Graph title/description/image, Twitter card metadata, and the Apple touch icon; browser tests inspect the rendered documents. |

The final live audit also found the small 404 label inherited a low-contrast light-page color. Commit `d3e96f1` corrects it and expands axe coverage to all public routes in both color schemes.

## Clean local verification

From the documented setup:

```sh
npm ci
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
```

Results:

- Every exact command in `.factory/claims.json` passed independently: 12/12 claims, each in desktop Chromium and 390×844 Chromium.
- `npm test` passed: 7/7 Vitest unit/release tests and 42/42 Playwright tests.
- TypeScript passed with no errors. The audit found zero vulnerabilities.
- `npm run build` produced `dist/index.html` and all public route documents.
- Initial app JavaScript is 32.41 KB raw / 10.70 KB gzip. CSS is 18.83 KB raw / 4.86 KB gzip. The hero AVIF remains about 60 KB.
- Browser coverage includes the real planning job, all four warning classes, exact demo counts, CSV and JSON export/import, persistence, demo isolation/reset, first-screen visibility, valid/invalid/outage/recovery license states, paid boundaries, keyboard/dialog focus, 44 px controls, reduced motion, 200% text reflow, offline reload, metadata, and malformed-import recovery.
- Axe reports zero serious or critical issues on `/`, `/demo/`, `/privacy/`, `/terms/`, and the deliberate 404 in light and dark schemes.

## Deployment and live verification

The final `dist/` artifact was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh low-energy-menu /work/repo/dist
```

- Local and live `assets/main-wBsoeMGj.js` SHA-256 both equal `1a4fd615c3fd072c8a75fde3190e71616ea94c4d9eaa2b2425259c1b70c24893`.
- `verify-url.sh` passed on `/`, `/demo/`, `/privacy/`, and `/terms/`: expected titles, `lang=en`, one H1, a main landmark, alt text, labelled buttons, and no console errors.
- Fresh desktop and 390×844 phone contexts showed the job, household audience, sample action, and its result before scrolling.
- One click opened three recipes and five planned nights. The demo label persisted after reload; reset removed a demo-only recipe; Start for real restored untouched real data.
- The deployed license flow kept a new token locked during an aborted verification request, recovered after a valid response, kept an invalid response locked, and retained only a previously verified valid token during a later outage.
- A fresh phone context reloaded `/demo/` offline with its sample data and visible Offline status.
- Live axe found zero serious or critical findings on all five public routes in both themes.
- Live Lighthouse 13.4.1 mobile scored 100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO. FCP was 0.9 s, LCP 1.4 s, TBT 10 ms, and CLS 0.001.
- The unknown route returns HTTP 404 with **Page not found.** Privacy and Terms each expose six Open Graph tags, four Twitter tags, and an Apple touch icon.
- CSP, HSTS, Referrer-Policy, `nosniff`, and Permissions-Policy are present. The final service-worker cache is version 4.
- The production checkout endpoint returns a hosted merchant redirect. One real invalid-token verification returned `valid: false` with reason `invalid`. No purchase was submitted.

Evidence includes `/work/.evidence/lighthouse.json`, live desktop/phone screenshots, per-route `verify-url.sh` output, `billing-offer.json`, and the copied catalog description.

## Earlier verification disposition

All findings in `.factory/verification.md`, `.factory/verification-2.md`, and `.factory/verification-3.md` are repaired and covered. The production billing origin, isolated demo, self-contained test command, host policy, manifest MIME, HTTP 404, import recovery, week-history claim, and outcome-tracking claim remain intact. The third verification’s eight findings are addressed in the table above.

## Known external follow-up

- A real paid purchase was not submitted because that would create a financial transaction. Checkout registration, invalid service behavior, and client entitlement transitions are verified; a paid transaction remains the billing operator’s task.
- The researched success measure still requires a three-week household pilot. The app records cooked and changed outcomes locally but does not claim pilot results.
- This is a static local-first PWA. It has no product backend, tenant database, or shared PostgreSQL dependency.
