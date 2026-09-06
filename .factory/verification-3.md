# Independent verification 3 — FAIL

Verified on 2026-09-06 against implementation commit `9f9959af6749ca21253cd04fafee410848829d62`, documentation commit `383e006a34c9ab630e8095cac23511fac93243e4`, and <https://low-energy-menu.sociobot.in>.

## Release decision

**FAIL — do not accept this candidate.** There are 8 findings, including 3 untested public claims. The two claims added after verification 2 pass, but the full claim inventory is still incomplete and the live paid-license recovery path fails open.

## First screen and demo

Before scrolling in fresh desktop and 390×844 phone contexts:

- Job: **Plan dinners for the energy you have.**
- Audience: households balancing school meals, leftovers, and the cook’s changing energy.
- First action: **Try it with sample data**, with the explanation **See a planned week right away.**

All three were visible at `scrollY = 0` in both contexts. The title is `Low-Energy Menu — plan dinners around your energy`.

One click opened `/demo/`. The populated result showed Lemon chickpea traybake, Tomato lentil pasta, Black bean tacos, five planned nights, one cooked dinner, zero changed dinners, two checks, and nine grocery lines. The label **Demo — sample data, nothing is saved** remained after reload. After adding a demo-only recipe, **Reset demo** removed it and restored the sample. **Start for real** removed the demo database and restored a real recipe created before entering the demo; the sample never appeared in real data.

## Mandatory claim commands

A new clone at documentation commit `383e006a34c9ab630e8095cac23511fac93243e4` was clean before setup. `npm ci` installed 61 packages and reported zero vulnerabilities. Every exact command declared in `.factory/claims.json` passed in both desktop Chromium and the 390×844 mobile project:

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | PASS, 2/2 |
| `planning-checks` | `npm test -- --grep @claim:planning-checks` | PASS, 2/2 |
| `grocery-csv` | `npm test -- --grep @claim:grocery-csv` | PASS, 2/2 |
| `backup-roundtrip` | `npm test -- --grep @claim:backup-roundtrip` | PASS, 2/2 |
| `local-private` | `npm test -- --grep @claim:local-private` | PASS, 2/2 |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS, 2/2 |
| `free-and-paid` | `npm test -- --grep @claim:free-and-paid` | PASS, 2/2 |
| `week-history` | `npm test -- --grep @claim:week-history` | PASS, 2/2 |
| `outcome-tracking` | `npm test -- --grep @claim:outcome-tracking` | PASS, 2/2 |

The declared set is not complete. Finding 1 lists three public claims that do not have adequate claim tests.

## Findings

### 1. Blocker — three public claims remain untested

`README.md` promises close-repetition warnings and unavailable-leftover warnings. The `planning-checks` claim and its tagged browser test assert only effort mismatch and school/canteen similarity. Neither additional warning has a claim entry or observable browser assertion.

The README also makes the quantitative promise that the demo starts with three recipes and five planned nights. The `demo-sandbox` test checks one named recipe, isolation, mutation, reset, and return to real data, but never asserts either advertised count. The claims contract requires quantitative claims to assert their numbers.

Untested public claim count: **3**.

### 2. High — license verification fails open on a first-time outage

In a fresh live context, the verifier aborted only requests to `https://api.sociobot.in`, pasted `not-a-license`, and selected **Restore**. The app displayed both **Offline — using the last license state** and **Household unlocked**. Previous-week navigation then moved from Aug 31–Sep 6 to Aug 24–30.

There was no cached valid verdict. A network failure for a newly entered token must stay locked; optimistic offline access is only safe when a valid cached verdict exists. The current recovery path allows any string to bypass the paid boundary during an API outage.

### 3. Medium — grocery copy contradicts the exported data

The live demo says **9 combined ingredient lines from dinners cooked this week**. Only Monday is marked cooked. The exported CSV also contains ingredients from Wednesday’s Tomato lentil pasta and Friday’s Black bean tacos, both still marked planned. The implementation correctly exports planned recipe dinners, matching the declared claim, but the visible sentence makes a false claim about the rows.

### 4. Medium — key phone targets are smaller than 44 px

At 390 px, computed live target heights were 40 px for **Reset demo** and **Start for real**, and 36 px for the Low-Energy Menu home link. The attached accessibility and design contracts require touch targets of at least 44×44 CSS px.

### 5. Medium — the mandatory landing-page structure is incomplete

The live landing page moves from the first screen directly into the planner, recipes, and data/purchase tools. It has no **How it works** section with three steps and no dedicated **What it does not do / privacy** section. Both are required by the supplied site-structure contract.

### 6. Low — the 404 heading uses a metaphor

The deliberate unknown route correctly returns HTTP 404 and a designed page; that status is not a defect. Its H1 is **This page is not on the menu.**, however, which is a menu pun rather than the required plain description. The attached plain-words contract prohibits metaphor and puns in headings.

### 7. Low — the required recipe field is not visibly explained

Submitting an empty recipe form is blocked by native validation and the input has `required`, but the visible label is only **Recipe name**. There is no required marker or instruction. The supplied accessibility contract requires required fields to be explained.

### 8. Low — legal routes omit required sharing and touch metadata

`/privacy/` and `/terms/` have distinct titles, descriptions, canonicals, and favicons, but each has zero Open Graph tags, zero Twitter card tags, and no Apple touch icon. The supplied site-structure metadata contract requires these route-level basics.

## Passing evidence

- `npm test`: PASS — 7/7 Vitest tests and 28/28 Playwright tests.
- `npm run typecheck`: PASS.
- `npm run build`: PASS; `dist/index.html` exists.
- `npm audit --audit-level=high`: PASS; zero vulnerabilities.
- Build budget: main JS 30.61 KB raw / 10.24 KB gzip, CSS 16.59 KB raw / 4.49 KB gzip, hero AVIF 60.22 KB.
- Live Lighthouse 13.4.1 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 0 ms, CLS 0.001.
- `verify-url.sh`: PASS on `/`, `/demo/`, `/privacy/`, and `/terms/`; no console errors, one H1, `lang=en`, main landmark, labelled buttons, and image alt text. Evidence directories: `/tmp/lem-v3-url-0.xPpVhl`, `/tmp/lem-v3-url-1.ed6aI7`, `/tmp/lem-v3-url-2.LuSl1h`, `/tmp/lem-v3-url-3.JmMa8b`.
- Live axe scans in light and dark schemes: zero serious or critical violations.
- Keyboard: skip link focused first and moved focus to main; Enter opened the recipe dialog; its name field received focus; Escape closed it and returned focus to the opener. The focus ring was visible.
- Reduced motion: primary-action transition duration was `0.000001s`. At 200% text size, the 390 px page did not overflow horizontally.
- Normal and invalid paths: a high-effort recipe on a low-energy day produced effort and school-meal warnings; grocery CSV downloaded; blank required name was blocked; malformed JSON showed the plain recovery instruction.
- Live invalid license: the real API returned an invalid verdict and the app remained locked. The separate outage recovery path is Finding 2.
- Offline: a fresh mobile context waited for service-worker control, went offline, reloaded `/demo/`, retained the sample, and showed **Offline**. Update detection, the reload toast, `SKIP_WAITING`, and `clients.claim()` are present; no new deployment was induced during read-only verification.
- Privacy: the full live flow produced only same-origin product requests. Demo storage was isolated in `low-energy-menu-demo`; after leaving demo only `low-energy-menu` remained.
- Routes and links: `/`, `/demo/`, `/privacy/`, and `/terms/` returned 200; all internal fragments resolved; mail links were explicit; the source link returned 200; checkout returned 303 to the hosted merchant page. The deliberate unknown route returned 404.
- Headers: live CSP, HSTS, Referrer-Policy, `nosniff`, and Permissions-Policy are present. Hashed assets are immutable for one year, `sw.js` is no-cache, and the manifest MIME is correct.
- Rate limit: 40 simultaneous invalid license requests produced 30 HTTP 200 and 10 HTTP 429 responses. All observed 429 responses included `Retry-After` of 3 or 4 seconds.
- No product backend, tenant database, or restart-persistence check applies. The product is a static local-first PWA; the billing API is external to this repository.
- No AI feature is warranted by the brief; there is no missed AI leverage finding.

## Candidate-to-live comparison

Only `.factory/handoff.md` changed between implementation `9f9959a` and documentation `383e006`. Fresh local build and live responses matched byte-for-byte for `/`, `/demo/`, `/privacy/`, `/terms/`, `manifest.webmanifest`, `sw.js`, the main JS, and the main CSS. The local and live main-JS SHA-256 is:

```text
c64ff4134b57fdb6f127b97e2da99f7be2aa44a7eb705a00eb02bed7f05690d6
```

## Earlier findings disposition

| Earlier finding | Current disposition |
| --- | --- |
| Missing claims manifest | Fixed; nine entries exist and all exact commands pass. Finding 1 records remaining inventory gaps. |
| Missing one-click isolated demo | Fixed; fresh live isolation/reset/start-real flow passed. |
| Production bundle used pilot billing API | Fixed; build and live bundle use `api.sociobot.in`. |
| Clean `npm test` failed | Fixed; clean documented setup passed 7 unit/release and 28 browser tests. |
| Missing CSP and immutable caching | Fixed in live headers. |
| Unknown paths returned 200 | Fixed; live unknown path returns designed HTTP 404. |
| Wrong manifest MIME | Fixed; live response is `application/manifest+json`. |
| Raw JSON parser error | Fixed; live invalid import gives a plain recovery instruction. |
| Week-history claim absent | Fixed; declared claim passes in both projects. |
| Outcome-tracking claim and changed count absent | Fixed; changed count is visible and the persistence claim passes in both projects. |
| Mood-copy labels from verification 2 | Mostly fixed; the remaining 404 metaphor is Finding 6. |

## Required remediation

Keep a new token locked when verification has never succeeded; add and run claim tests for all advertised warning types and exact demo counts; correct the grocery sentence; raise key touch targets to 44 px; complete the required landing structure and route metadata; replace the 404 pun; and visibly identify the required recipe name. Then rerun independent verification.
