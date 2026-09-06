# Independent verification 4 — PASS

Verified 2026-09-06 against implementation commit `d3e96f1ba36ca2eee3697f96695362a0fb7e274d`, release-documentation commit `826b0bac909ca78c6751af281fd506eb4bebd6ac`, and [https://low-energy-menu.sociobot.in](https://low-energy-menu.sociobot.in).

## Release decision

**PASS — accept this candidate.** There are **zero findings** at every severity and **zero untested public claims**.

No product code was changed during this independent verification. A real payment was not submitted.

## First screen and realistic sample

Fresh storage-free desktop (1366 × 900) and phone (390 × 844) contexts both showed, before scrolling (`scrollY = 0`):

- Job: **Plan dinners for the energy you have.**
- Audience: **For households balancing school meals, leftovers, and the cook’s changing energy.**
- First action: **Try it with sample data** — **See a planned week right away.**

The action opened `/demo/` in one click. On both devices it showed three recipe cards and five planned nights, with the persistent **Demo — sample data, nothing is saved** label. Reload retained the label; **Reset demo** restored the three-card sample. In a separate live phone context, a real recipe was absent from demo and returned after **Start for real**, proving that demo actions did not change real data.

## Mandatory claim gate

After `npm ci` (61 packages; zero audit vulnerabilities), every exact command in `.factory/claims.json` passed independently. Each tagged test passed in both configured projects: desktop Chromium and 390 × 844 mobile Chromium.

| Claim ID | Result |
| --- | --- |
| `demo-sandbox` | PASS, 2/2 |
| `planning-checks` | PASS, 2/2 |
| `repeat-warning` | PASS, 2/2 |
| `leftover-warning` | PASS, 2/2 |
| `demo-sample-size` | PASS, 2/2 |
| `grocery-csv` | PASS, 2/2 |
| `backup-roundtrip` | PASS, 2/2 |
| `local-private` | PASS, 2/2 |
| `offline-reload` | PASS, 2/2 |
| `free-and-paid` | PASS, 2/2 |
| `week-history` | PASS, 2/2 |
| `outcome-tracking` | PASS, 2/2 |

The copy and README inventory were also reviewed against the manifest. The public offline, local-storage/privacy, demo isolation, warning, export/import, free-limit, paid-history, price, and outcome statements have corresponding observable claim coverage. Untested claim count: **0**.

## Functional, paid, and PWA checks

- `npm test` passed: production build, 7/7 Vitest tests, and 42/42 Playwright tests.
- `npm run typecheck`, `npm run build`, and `npm audit --audit-level=high` passed. `dist/index.html` exists. Main JavaScript is 32.41 KB raw / 10.70 KB gzip; CSS is 18.83 KB raw / 4.86 KB gzip; the 60 KB AVIF hero remains within budget.
- The normal planner flow adds a recipe, assigns daily energy and school context, produces effort/school/repeat/leftover checks, tracks cooked/changed results, and exports planned recipe ingredients as CSV. The grocery sentence correctly says that its rows are from planned recipe dinners.
- Blank recipe submission visibly identifies **Recipe name (required)** and remains blocked by native validation. Malformed backup import gives a plain recovery instruction.
- License behavior was exercised on the live application without a payment: a real invalid token stayed locked; a first-time token with an intercepted service outage stayed locked and could not open prior weeks; a subsequent valid mocked verifier response unlocked; a later outage retained access only for that previously verified cached token. This is the required normal, invalid, outage, and recovery policy.
- The checkout link returned its hosted merchant redirect. No checkout was completed and no payment was submitted.
- A fresh live `/demo/` context waited for service-worker control, was taken offline, reloaded, retained the sample plan, and showed **Offline**. Source/test coverage confirms the update toast, `SKIP_WAITING`, and `clients.claim()`; a newer deployment was not induced during read-only QA.

## Accessibility, routes, privacy, and deployment

- `/opt/fleet/lib/verify-url.sh` passed for `/`, `/demo/`, `/privacy/`, and `/terms/`: HTTP 200, route-specific title, `lang=en`, one H1, main landmark, image alt text, labelled buttons, and no browser console errors. Evidence is under `/work/.evidence/low-energy-menu-verify-4/`.
- Live axe scans in light and dark schemes reported zero serious or critical violations on `/`, `/demo/`, `/privacy/`, `/terms/`, and the deliberate unknown route.
- Keyboard smoke: the visible skip link moved focus to `#main`; Enter opened the recipe dialog with the name input focused; Escape returned focus to the opener. At 390 px, the demo controls and home link measured at least 44 px high; 200% text caused no horizontal overflow; reduced-motion transition duration was `1e-06s`.
- The landing page includes **How it works** with three steps, **What this planner does not do**, and the $12 one-time license section. Privacy and Terms each have their own titles, six Open Graph tags, four Twitter tags, and an Apple touch icon.
- `/does-not-exist` returned HTTP 404 and a designed page with the plain H1 **Page not found.** It is an expected 404, not a defect. The normal internal routes, legal routes, source link, and hosted checkout link resolved as intended.
- Full demo privacy flow used same-origin product resources only. The separate IndexedDB namespaces are `low-energy-menu-demo` and `low-energy-menu`; demo did not expose the real database or license storage.
- Live headers include CSP (allowing only self plus the required billing origin), HSTS, Referrer-Policy, `nosniff`, and Permissions-Policy. The manifest is served as `application/manifest+json`.
- Static products have no product backend, tenant database, or persistence-restart endpoint to inspect. The external product-license verifier accepted 30 simultaneous invalid requests and returned 429 to 10; every 429 included `Retry-After`.
- Live Lighthouse 13.4.1 mobile: **100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO**. FCP 0.9 s, LCP 1.2 s, TBT 0 ms, CLS 0.001.

## Candidate-to-live comparison

The local candidate and deployed `assets/main-wBsoeMGj.js` SHA-256 both equal:

```text
1a4fd615c3fd072c8a75fde3190e71616ea94c4d9eaa2b2425259c1b70c24893
```

Only release documentation followed the implementation candidate before this verification. The implementation under review is therefore `d3e96f1`; the then-current release documentation is `826b0ba`.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Missing claims manifest and one-click isolated demo | Fixed; 12 declared exact commands pass and live demo isolation/reset/start-real passed. |
| Pilot billing origin, clean test command, CSP/caching | Fixed; production billing origin, self-contained `npm test`, CSP, and immutable asset policy are present. |
| 200 unknown route, manifest MIME, raw import error | Fixed; unknown URL is HTTP 404, manifest MIME is correct, import recovery is plain language. |
| Missing history/outcome claim coverage | Fixed; `week-history` and `outcome-tracking` each pass in both browser projects. |
| Untested close-repeat, unavailable-leftover, and sample-count claims | Fixed; each is separately declared and passes 2/2. |
| First-time license outage failed open | Fixed; first outage remains locked; only a previously verified cached entitlement works offline. |
| Grocery sentence contradicted planned export | Fixed; copy and CSV behavior both describe planned recipe dinners. |
| Phone targets below 44 px | Fixed; live reset, start-real, and home targets meet the minimum. |
| Missing landing sections | Fixed; live landing includes three-step How it works and limits/privacy sections. |
| 404 menu pun | Fixed; heading is **Page not found.** |
| Required recipe label and legal metadata missing | Fixed; label says required and both legal routes include required social/touch metadata. |
| Minor final 404 contrast issue | Fixed; live all-route light/dark axe scan found no serious or critical violations. |

## Known limits

- A paid transaction was deliberately not created. Checkout routing, invalid verification, entitlement boundaries, and recovery were tested without purchasing.
- The researched three-week household success measure remains a future user pilot, not a product claim.
