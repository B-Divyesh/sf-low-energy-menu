# Independent verification 5 — PASS

Verified on 2026-09-06 against implementation commit `6c637628f362c18ed08c1482dd9f101d2a9533c9`, documentation commit `b2bc53953e69a46d13d716adb62589152bd045e0`, and <https://low-energy-menu.sociobot.in>.

## Release decision

**PASS — accept this candidate.** There are **zero findings** at every severity and **zero untested public claims**.

No product code was changed during this independent verification. No payment was submitted.

## First screen and sample sandbox

Fresh storage-free desktop (1366 × 900) and phone (390 × 844) contexts showed these items before scrolling:

- Job: **Plan dinners for the energy you have.**
- Audience: **For households balancing school meals, leftovers, and the cook’s changing energy.**
- First action: **Try it with sample data**, with **See a planned week right away.** beside it.

The action opened `/demo/` in one click. The settled sample contained three recipe cards—Lemon chickpea traybake, Tomato lentil pasta, and Black bean tacos—and five planned nights. Its grocery tool described **9 combined ingredient lines from planned recipe dinners this week**, and the downloaded CSV contained nine ingredient rows across all three planned recipe dinners.

The **Demo — sample data, nothing is saved** label survived reload. A demo-only recipe survived reload, disappeared after **Reset demo**, and never appeared in real data. **Start for real** discarded the demo database and restored a real recipe created before entering the demo. Only `low-energy-menu` remained after leaving; a separate fresh demo flow used only `low-energy-menu-demo` and had no license token.

## Mandatory claim gate

The working tree was clean before setup. `npm ci` installed 61 packages and reported zero vulnerabilities. Every exact command in `.factory/claims.json` passed independently in desktop Chromium and 390 × 844 mobile Chromium:

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

The formerly intermittent `week-history` exact command also passed five consecutive extra verifier runs in both browser projects. The complete public copy in the landing page, planner, legal pages, and README was checked against the manifest. Demo size and isolation, all four warning types, planned-ingredient CSV, complete JSON backup, local storage/privacy, offline reload, free and paid limits, week history, price, and outcome persistence all have observable coverage. Untested claim count: **0**.

## Functional and paid-path evidence

- A fresh live demo showed the repeat warning. Lowering Wednesday to low energy showed both the effort and school/canteen warnings. Removing Monday’s source dinner showed the unavailable-leftover warning.
- Marking Wednesday cooked and then changed updated the weekly counts and survived reload. Blank recipe submission remained invalid and visibly identified **Recipe name (required)**. Malformed JSON produced the plain recovery instruction.
- A real invalid license verdict kept the product locked and did not open the previous week.
- In a fresh context with the verifier unavailable, a first-time token showed **License verification is unavailable. Paid features stay locked.**, stored no verdict, and did not open previous-week history.
- A later valid mocked verdict unlocked history. After that verified verdict was made stale, a simulated outage preserved access with **Offline — using the last verified license.** Thus offline entitlement applies only to a previously verified matching token.
- The product checkout redirected to the hosted merchant page, which named Low-Energy Menu and showed `$12.00` as a one-time purchase. No purchase was attempted.

## Quality, accessibility, privacy, and PWA evidence

- `npm run typecheck`: PASS.
- `npm test`: PASS — 7/7 Vitest tests and 42/42 Playwright tests.
- `npm run build`: PASS; `dist/index.html` exists.
- `npm audit --audit-level=high`: PASS; zero vulnerabilities.
- Build size: main JavaScript 32,413 bytes raw / 10.70 KB gzip; CSS 18,829 bytes raw / 4.86 KB gzip; hero AVIF 60,218 bytes.
- Fresh live Lighthouse 13.0.1 mobile: Performance **99**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 1.0 s, LCP 1.3 s, TBT 100 ms, CLS 0.001.
- `/opt/fleet/lib/verify-url.sh` passed `/`, `/demo/`, `/privacy/`, and `/terms/`: HTTP 200, route titles, `lang=en`, one H1, main landmark, complete image alternatives, labelled buttons, and no console errors.
- Fresh live axe scans in light and dark schemes found zero serious or critical violations on `/`, `/demo/`, `/privacy/`, `/terms/`, and the deliberate 404 route.
- Keyboard verification passed: the skip link was first, visibly focused, moved focus to `main`, and the recipe dialog received and returned focus. Reduced-motion transition duration was `0.000001s`. At 200% root text size, the 390 px viewport had no horizontal overflow.
- Phone heights were 44 px for the home link, **Reset demo**, and **Start for real**.
- A fresh live service-worker context reloaded `/demo/` offline with its sample intact and a visible **Offline** state. Source inspection confirms update detection, the update toast, `SKIP_WAITING`, and `clients.claim()`.
- A full fresh demo flow made no cross-origin runtime requests, loaded no third-party runtime scripts or styles, persisted in its own IndexedDB namespace, and stored no license token.

## Routes, metadata, links, and deployment

- `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200. The expected `/does-not-exist` returned HTTP 404 with the plain H1 **Page not found.**
- Every page had `lang=en`, one H1, a main landmark, and its expected route title. Privacy and Terms each had six Open Graph tags, four Twitter tags, and an Apple touch icon.
- The landing page included the three-step **How it works**, **What this planner does not do**, exact price, limits, and privacy information. All internal fragment targets existed. The source link returned 200, mail links were explicit, and checkout redirected correctly.
- Live headers include CSP, HSTS, Referrer-Policy, `nosniff`, and Permissions-Policy. Hashed assets use one-year immutable caching, `sw.js` uses `no-cache`, and the manifest is `application/manifest+json`.
- This is a static local-first PWA. It has no product backend, tenant store, health endpoint, restart-persistence path, or product-owned rate limiter, so backend tenant/SQLite/health/429 checks do not apply. The external Sociobot billing service was not load-tested from this product worker.

## Candidate-to-live comparison

Only `.factory/handoff.md` changed between implementation commit `6c63762` and documentation commit `b2bc539`. The fresh local build and live site both reference `assets/main-wBsoeMGj.js`; both files have SHA-256:

```text
1a4fd615c3fd072c8a75fde3190e71616ea94c4d9eaa2b2425259c1b70c24893
```

The live runtime therefore matches the reviewed implementation candidate.

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Missing claims manifest and one-click isolated demo | Fixed; 12 exact claim commands pass and live isolation/reset/start-real passed. |
| Pilot billing origin, non-self-contained `npm test`, missing CSP, and short asset caching | Fixed; production origin, clean full test, headers, and immutable assets passed. |
| Unknown URL returned 200, wrong manifest MIME, and raw import error | Fixed; expected HTTP 404, correct MIME, and plain recovery copy passed. |
| Missing week-history and outcome claims | Fixed; each exact claim passes in both projects. |
| Untested repeat, unavailable-leftover, and sample-size claims | Fixed; each is separately declared and passed in both projects. |
| First-time license outage failed open | Fixed; no cached verdict was created, history stayed locked, and only a previously verified token retained outage access. |
| Grocery copy contradicted planned export | Fixed; both copy and the nine-row live CSV use planned recipe dinners. |
| Phone targets below 44 px | Fixed; all three reported controls measured 44 px. |
| Missing required landing sections | Fixed; the three-step explanation, limits/privacy, and paid section are present. |
| Metaphorical 404 heading | Fixed; the heading is **Page not found.** |
| Required recipe label and legal metadata missing | Fixed; required text, route titles, social tags, and touch icons are present. |
| Final 404 contrast issue | Fixed; light/dark axe scans have zero serious or critical violations. |
| Intermittent `week-history` claim proof | Fixed; service-worker-isolated test passed its declared run, the full suite, and five consecutive extra verifier runs. |

## Known limits

- No paid transaction was created. Checkout content and entitlement boundaries were verified without purchasing.
- The researched three-week household success measure requires a future household pilot and is not presented as a current product claim.

Evidence is stored under `/work/.evidence/low-energy-menu-verify-5/`.
