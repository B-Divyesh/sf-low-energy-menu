# Strict review 2 — PASS

Reviewed on 2026-09-06 against implementation commit `6c637628f362c18ed08c1482dd9f101d2a9533c9`, documentation baseline `df8d9a8159acb4acacc7dd1a087d4ed51ddbdef8`, and <https://low-energy-menu.sociobot.in>.

## Release decision

**PASS — accept this candidate.** There are **zero findings** at every severity and **zero untested public claims**.

No product code was changed. No deployment or payment was attempted. The referenced `factory-evidence/low-energy-menu-verify-5/qa-report.md` was not mounted in this worker; `.factory/verification-5.md` was read in full and all acceptance evidence below was regenerated independently.

## First screen and sample sandbox

Fresh storage-free desktop (1366 × 900) and phone (390 × 844) browsers showed these items before scrolling:

- Job: **Plan dinners for the energy you have.**
- Audience: **For households balancing school meals, leftovers, and the cook’s changing energy.**
- First action: **Try it with sample data**, followed by **See a planned week right away.**

The action opened `/demo/` in one click. The sample showed Lemon chickpea traybake, Tomato lentil pasta, and Black bean tacos, with five planned nights. The persistent **Demo — sample data, nothing is saved** label survived reload.

A demo-only recipe survived reload and disappeared after **Reset demo**. A real recipe was hidden in the demo and returned after **Start for real**. The demo database was removed while `low-energy-menu` remained. The full demo flow made no cross-origin request and did not read or store a license token.

## Mandatory claim gate

The checkout was clean before setup. `npm ci` installed 61 packages with zero vulnerabilities. Every exact command in `.factory/claims.json` passed independently in desktop Chromium and 390 × 844 mobile Chromium:

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

The formerly intermittent `week-history` command then passed five additional consecutive runs in both projects. Landing, planner, legal, demo-documentation, and README copy were checked against the manifest. Demo isolation and size, all four warning types, planned-ingredient CSV, complete JSON backup, local storage/privacy, offline reload, free and paid limits, week history, price, and outcome persistence have observable coverage. Untested claim count: **0**.

## Paid license, normal, boundary, and recovery paths

- A real invalid token produced a stored invalid verdict, kept **Household unlocked** absent, and did not open the previous week.
- With the verifier unavailable, a first-time pasted token showed **License verification is unavailable. Paid features stay locked.**, created no verdict, and did not open previous-week history.
- The checkout return path stored a mocked valid query token, removed it from the address bar, verified it, and unlocked paid history.
- The same checkout return path stayed locked and stored no verdict when its first verification was unavailable.
- A later valid mocked response recovered the previously failed pasted token and unlocked history. After that valid verdict was made stale, a simulated outage preserved access with **Offline — using the last verified license.** Offline entitlement therefore applies only to a previously verified matching token.
- The buy link reached the hosted merchant page. It named Low-Energy Menu, showed `$12.00`, and described a one-time license. No purchase was submitted.

## Functional evidence

- The live sample showed the repeat warning. Lowering Wednesday to low energy showed effort and school/canteen warnings. Removing Monday’s source dinner showed the unavailable-leftover warning.
- The grocery copy says **9 combined ingredient lines from planned recipe dinners this week**. The downloaded CSV had nine data rows and included all three planned recipe dinners.
- Cooked and changed outcome counts updated and persisted across reload.
- Blank recipe entry visibly identifies **Recipe name (required)**. Malformed backup input gives a plain recovery instruction.
- The landing page contains the required three-step **How it works**, **What this planner does not do**, and exact-price paid section.

## Quality, accessibility, privacy, and PWA

- `npm run typecheck`: PASS.
- `npm test`: PASS — 7/7 Vitest tests and 42/42 browser tests.
- `npm run build`: PASS; `dist/index.html` exists.
- `npm audit --audit-level=high`: PASS; zero vulnerabilities.
- Build size: main JavaScript 32,413 bytes raw / 10.70 KB gzip; CSS 18,829 bytes raw / 4.86 KB gzip; hero AVIF 60,218 bytes.
- Fresh live Lighthouse 13.0.1 mobile: Performance **100**, Accessibility **100**, Best Practices **100**, SEO **100**; FCP 0.9 s, LCP 1.2 s, TBT 0 ms, CLS 0.001.
- `/opt/fleet/lib/verify-url.sh` passed `/`, `/demo/`, `/privacy/`, and `/terms/`: HTTP 200, route titles, `lang=en`, one H1, main landmark, complete image alternatives, labelled buttons, and no console errors.
- Live axe scans in light and dark found zero serious or critical violations on `/`, `/demo/`, `/privacy/`, `/terms/`, and the deliberate 404 route.
- Keyboard verification passed: the skip link was first and visibly focused, moved focus to `main`, and the recipe dialog received and returned focus. Reduced-motion duration was `1e-06s`. At 200% root text size on a 390 px viewport there was no horizontal overflow.
- The phone home, **Reset demo**, and **Start for real** targets each measured 44 px high.
- A fresh service-worker context reloaded `/demo/` offline with its sample intact and a visible **Offline** state. The worker includes versioned shell caching, update detection, `SKIP_WAITING`, and `clients.claim()`.
- The demo flow loaded no third-party runtime resource. Planning data used its own IndexedDB namespace; the only expected cross-origin product request observed was explicit license verification in the real planner.

## Routes, metadata, links, and deployment

- `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200 with distinct titles, `lang=en`, one H1, and one main landmark.
- The deliberate `/does-not-exist` returned HTTP 404 with title `Page not found — Low-Energy Menu` and H1 **Page not found.**
- Privacy and Terms each had six Open Graph tags, four Twitter tags, and an Apple touch icon.
- All landing links and fragment targets resolved. The source link returned 200 and the checkout redirect reached its hosted page.
- Live headers include CSP, HSTS, Referrer-Policy, `nosniff`, and Permissions-Policy. Hashed assets use one-year immutable caching, `sw.js` uses `no-cache`, and the manifest is `application/manifest+json`.
- The manifest provides 192 px and 512 px/maskable icons, standalone display, palette colors, and a versioned start URL.

## Candidate-to-live comparison

Only documentation files changed between implementation commit `6c63762` and documentation baseline `df8d9a8`. The fresh local build and live site both reference `assets/main-wBsoeMGj.js`; both files have SHA-256:

```text
1a4fd615c3fd072c8a75fde3190e71616ea94c4d9eaa2b2425259c1b70c24893
```

The live runtime matches the reviewed implementation candidate.

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Missing claims manifest and one-click isolated demo | Fixed; 12 exact claim commands and the live isolation/reset/start-real flow passed. |
| Pilot billing origin, non-self-contained tests, missing CSP, and short caching | Fixed; production billing origin, clean full test, headers, and immutable asset caching passed. |
| Unknown URL returned 200, wrong manifest MIME, and raw import error | Fixed; expected HTTP 404, correct MIME, and plain recovery copy passed. |
| Missing week-history and outcome claims | Fixed; each exact command passes in both projects. |
| Three untested warning/sample claims | Fixed; each is separately declared and passed in both projects. |
| First-time license outage failed open | Fixed; pasted and checkout-return tokens stayed locked, stored no verdict, and could not open paid history. |
| Grocery copy contradicted planned export | Fixed; copy and the nine-row CSV both use planned recipe dinners. |
| Phone targets below 44 px | Fixed; all three reported controls measured 44 px. |
| Missing required landing sections | Fixed; the three-step explanation, limits/privacy, and paid section are present. |
| Metaphorical 404 heading | Fixed; the heading is **Page not found.** |
| Required recipe label and legal metadata missing | Fixed; required text, route titles, social tags, and touch icons are present. |
| 404 contrast issue | Fixed; light/dark live axe scans found no serious or critical violations. |
| Intermittent `week-history` proof | Fixed; it passed its declared run, the full suite, and five consecutive extra runs. |

## Scope and known limits

- This is a static local-first PWA. It has no product backend, tenant store, health endpoint, restart-persistence path, or product-owned rate limiter; those backend checks do not apply. Shared billing infrastructure was not load-tested from this product worker.
- No paid transaction was created. Checkout content, return handling, and entitlement boundaries were verified without purchasing.
- The researched three-week household success measure requires a future household pilot and is not presented as a current claim.

Fresh evidence is under `/work/.evidence/low-energy-menu-review-2/`.
