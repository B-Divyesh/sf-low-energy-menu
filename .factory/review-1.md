# Strict review 1 — FAIL

Reviewed 2026-09-06 against implementation commit `d3e96f1ba36ca2eee3697f96695362a0fb7e274d`, documentation commit `43ca91ebf5be99b47b49e96f4486400b981d59ea`, and <https://low-energy-menu.sociobot.in>.

## Release decision

**FAIL — do not accept this candidate.** There is **1 finding** and **0 untested public claims**.

The live product behavior passed the fresh review, including the paid-license outage policy. The release still fails because one mandatory claim command is intermittent and failed twice under the documented clean setup. A later successful retry does not erase a failed required gate.

No product code was changed during this review. No payment was submitted.

## Finding

### 1. High — the `week-history` claim command is intermittent on mobile

From a fresh clone at documentation commit `43ca91e`, after `npm ci`, the exact declared command below failed on its first invocation:

```sh
npm test -- --grep @claim:week-history
```

Desktop Chromium passed, but mobile Chromium timed out waiting for **Household unlocked** after the test installed a valid mocked license-verification response. The captured network trace records the verification request ending in `net::ERR_FAILED`, and the page showed **License verification is unavailable. Paid features stay locked.**

The command passed on immediate retry and four more consecutive runs. A second reproduction series passed four times and failed on the fifth with the same mobile assertion and network failure. Across 11 invocations, the command passed 9 times and failed 2 times. The complete `npm test` happened to pass once with 42/42 browser tests, which confirms the intermittent character rather than resolving it.

This does not show that the public week-history behavior is false: the live boundary and valid-license flow passed independently. It does mean the required claim command cannot reliably prove that behavior in the documented sandbox. The claims contract makes any such command failure release-blocking.

Recommended repair: isolate mocked license tests from service-worker timing, for example by blocking service workers in a dedicated Playwright project or otherwise ensuring the verifier request is intercepted at the browser-context level. Then run the exact command repeatedly in both projects before requesting fresh review.

Evidence:

- `/work/.evidence/low-energy-menu-review-1/week-history-reproduced-failure-trace.zip`
- `/work/.evidence/low-energy-menu-review-1/week-history-reproduced-error-context.md`

## First screen and demo

Fresh storage-free desktop (1366 × 900) and phone (390 × 844) contexts both showed at `scrollY = 0`, before scrolling:

- Job: **Plan dinners for the energy you have.**
- Audience: **For households balancing school meals, leftovers, and the cook’s changing energy.**
- First action: **Try it with sample data**, followed by **See a planned week right away.**

The title is `Low-Energy Menu — plan dinners around your energy`. One click opened `/demo/` with three recipe cards, five planned nights, one cooked dinner, zero changed dinners, two checks, and nine grocery lines. The recipe names were Lemon chickpea traybake, Tomato lentil pasta, and Black bean tacos.

The label **Demo — sample data, nothing is saved** remained after reload. A demo-only recipe persisted across reload and disappeared after **Reset demo**. A real recipe was absent inside the demo and returned after **Start for real**; only the real `low-energy-menu` IndexedDB remained. The settled-state rerun proved that demo actions did not change real data.

## Claim inventory and commands

All 12 declared claims were exercised. Eleven exact commands passed on their first invocation. `week-history` was tested but is Finding 1.

| Claim ID | Fresh result |
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
| `week-history` | **FAIL intermittently**; 2 failures and 9 passes across 11 exact invocations |
| `outcome-tracking` | PASS, 2/2 |

The landing, planner, legal copy, and README were compared with `.factory/claims.json`. Offline use, local storage/privacy, demo isolation and size, all four warning types, CSV/JSON export, free limits, paid history, price, and outcome tracking have corresponding observable coverage. Untested public claim count: **0**.

## Live functional and paid checks

- The live demo showed repeat, effort-mismatch, and school/canteen warnings. Removing the source meal and the local claim test covered unavailable leftovers.
- Grocery copy says **9 combined ingredient lines from planned recipe dinners this week**. The downloaded CSV had nine rows and included ingredients from all three planned recipes, so copy and behavior agree.
- Cooked and changed counts updated and survived reload. Malformed backup input produced the documented plain recovery instruction.
- A real invalid license response returned HTTP 200 with an invalid verdict; paid features stayed locked and previous-week navigation did not move.
- With the billing request intercepted as unavailable, a first-time entered token stayed locked and could not open a previous week.
- Replacing the outage with a valid mocked response unlocked the product and previous-week navigation. Expiring that cached verdict and restoring the outage retained access with **Offline — using the last verified license.** Only a previously verified token received this offline behavior.
- The product checkout returned HTTP 303 to the hosted merchant. The hosted page named Low-Energy Menu, showed a $12.00 one-time purchase, and described instant license delivery. No payment was attempted.
- Forty concurrent invalid verification requests produced 30 HTTP 200 and 10 HTTP 429 responses. Every 429 included `Retry-After: 4`.

## Accessibility, privacy, routes, and PWA

- `/opt/fleet/lib/verify-url.sh` passed `/`, `/demo/`, `/privacy/`, and `/terms/`: HTTP 200, route-specific titles, `lang=en`, one H1, a main landmark, complete image alt text, labelled buttons, and no console errors.
- Fresh axe scans in light and dark found zero serious or critical violations on `/`, `/demo/`, `/privacy/`, `/terms/`, and the expected 404 route.
- Keyboard smoke passed: the skip link received focus and moved focus to `main`; Enter opened the recipe dialog with **Recipe name (required)** focused; Escape returned focus to the opener. Reduced-motion transition duration was `1e-06s`.
- At 390 px, the home link, **Reset demo**, and **Start for real** each measured 44 px high. The repository browser test for 200% text reflow passed in both configured projects.
- A fresh demo context became service-worker controlled, reloaded offline, retained the sample, and showed **Offline**. Source and suite coverage confirm the update toast, `SKIP_WAITING`, and `clients.claim()`; no new deployment was induced.
- The live demo functional flow made only same-origin product requests. Demo and real data used separate IndexedDB namespaces. License verification is the only disclosed billing request from the real planner.
- `/privacy/` and `/terms/` returned 200 with distinct titles, six Open Graph tags, four Twitter tags, and an Apple touch icon. The declared social image is a real 1200 × 630 product asset.
- The deliberate unknown URL returned HTTP 404 with title `Page not found — Low-Energy Menu` and H1 **Page not found.** This expected 404 is not a defect.
- All first-party links, the source link, manifest, icons, robots file, sitemap, and social image resolved. The checkout redirect resolved as described above.
- Live headers include CSP, HSTS, Referrer-Policy, `nosniff`, and Permissions-Policy. Hashed assets are immutable for one year, `sw.js` is no-cache, and the manifest MIME is `application/manifest+json`.

## Build, performance, and candidate match

- `npm ci`: PASS; 61 packages installed and zero vulnerabilities reported.
- `npm test`: PASS on the recorded full-suite run; 7/7 Vitest and 42/42 Playwright tests. Finding 1 records the independently reproduced claim-command instability.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; `dist/index.html` exists.
- `npm audit --audit-level=high`: PASS; zero vulnerabilities.
- Build output: main JavaScript 32.41 KB raw / 10.70 KB gzip, CSS 18.83 KB raw / 4.86 KB gzip, hero AVIF 60.22 KB.
- Fresh Lighthouse 13.0.1 mobile: 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; FCP 1.0 s, LCP 1.3 s, TBT 60 ms, CLS 0.001, interactive 1.3 s.

The local and live `assets/main-wBsoeMGj.js` SHA-256 values match:

```text
1a4fd615c3fd072c8a75fde3190e71616ea94c4d9eaa2b2425259c1b70c24893
```

Only documentation commits followed implementation `d3e96f1`; the deployed product therefore matches that implementation candidate. The review began from documentation commit `43ca91e`.

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Missing claims manifest and one-click isolated demo | Fixed; 12 claims exist and the live isolation/reset/start-real flow passed. |
| Pilot billing origin, broken clean test setup, CSP/caching | Fixed; production billing origin, self-contained tests, CSP, and immutable asset caching are present. |
| Unknown URL returned 200, wrong manifest MIME, raw import error | Fixed; live 404, MIME, and plain recovery copy passed. |
| Missing week-history and outcome coverage | Functionality and tagged tests exist; the week-history test is now Finding 1 because it is intermittent. |
| Three untested claims from verification 3 | Fixed; repeat, unavailable-leftover, and exact demo-count claims are declared and exercised. |
| First-time license outage failed open | Fixed; fresh live outage/recovery testing proved fail-closed behavior and valid-cache-only offline access. |
| Grocery copy contradicted export | Fixed; both describe planned recipe dinners and the live CSV matched. |
| Phone targets below 44 px | Fixed; fresh measurements were 44 px. |
| Missing required landing sections | Fixed; the three-step **How it works**, limits/privacy, and paid sections are present. |
| 404 metaphor | Fixed; the H1 is **Page not found.** |
| Required recipe label and legal metadata | Fixed; required text and legal metadata are present. |
| Final 404 contrast issue | Fixed; live light/dark axe scans found no serious or critical violations. |

## Scope notes

This is a static local-first PWA. It has no product backend, tenant database, shared PostgreSQL dependency, or restart-persistence endpoint. No AI feature is warranted: the brief calls for deterministic household planning from user-entered data, and the existing import/export path covers the obvious adjacent leverage without sending personal meal data to a model.

The researched three-week household success measure still requires a future user pilot and is not presented as a product claim.
