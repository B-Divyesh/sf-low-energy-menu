# Independent verification — FAIL

Verified 2026-08-28 against candidate commit `25c6d8f767b6f964a0f76473a96509fcb5e7b1ad` and https://low-energy-menu.sociobot.in.

## Release decision

**FAIL. Do not release this candidate.** The mandatory claims contract is missing, and the required one-click, isolated sample-data demo does not exist. Either condition is independently release-blocking.

## Required claim gate (performed first)

From the clean candidate checkout, `git rev-parse HEAD` returned the candidate SHA and `git status --short` was empty. Before running product tests, the verifier checked for `.factory/claims.json`. It is absent. The only tracked `.factory` files are `brief.json`, `design.md`, and `handoff.md`.

Result: **FAIL — no claim tests can be enumerated or run.** This violates the claims contract regardless of the other test results. Public claims such as “Works offline after the first completed load”, “stores planning data in IndexedDB”, and “There are no third-party runtime scripts” in `README.md` therefore lack declared sandbox tests.

## First-read and demo gate (live, cold browser)

Cold URL: https://low-energy-menu.sociobot.in (new browser context, no stored data). The page is a household dinner-week planner: it lets a cook set daily energy, record school/canteen meals, place recipe dinners and leftovers, and export groceries. It is broadly clear that it is for a cook/household, though the first-screen sentence does not plainly name the intended household meal planner.

The first actionable controls are week navigation and daily energy controls. There is **no “Try it with sample data” action**, no sample data, no persistent `Demo — sample data, nothing is saved` banner, no reset/start-real controls, and no demo storage namespace. `/demo` returns the same empty planner shell, not a demo. There is also no `.factory/demo.md`. This fails the mandatory plain-words/demo-sandbox acceptance gate.

## Local clean-build verification

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | Installed 61 packages; audit reported 0 vulnerabilities. |
| Exact `npm test` from the clean checkout | FAIL | `vitest` passed 4/4, but Playwright's `vite preview` starts before `dist/` exists. Both first desktop and mobile tests failed waiting for the expected H1. The test command does not build first. |
| `npm run build` | PASS | Vite built `dist/`; app JS 26,672 B raw / 9,080 B gzip and CSS 15,204 B raw / 4,180 B gzip. |
| `npx tsc --noEmit` | PASS | No TypeScript errors. |
| Built-artifact browser suite | PASS | After the production build, all four Chromium and all four 390×844 mobile Playwright tests passed: normal recipe/plan/warning/CSV flow, persistence, offline reload, and axe. |
| Extra 390px smoke | PASS | No horizontal overflow; native required-name validation blocks blank saves; reduced-motion transition duration is effectively zero. |

The product flow itself works for the exercised normal case: add a recipe, assign low energy and a matching school meal, plan dinner, receive effort and school-repeat warnings, and download a grocery CSV. An invalid JSON import is rejected, but the displayed raw parser message (`Expected property name ...`) is technical and does not tell the household user what to do next.

## Live deployment verification

The deployed app matches the candidate build exactly:

| File | SHA-256 |
| --- | --- |
| `assets/app-Bm5hH_Pq.js` | `dddb9b5db47097da03f990bae3292525133eaf7042f851d1bed10d6dec49505e` |
| `assets/styles-CAIlK-9s.css` | `adb8a3df7b65096993f0b81c797cffd07d6c903d23b4ee6d841dbf2b16ec1857` |
| `sw.js` | `06ee17c7417bdac74a15b07798c7feecf4abf22719185b4e2b6190cc3e44faa4` |

Fresh desktop and 390px live loads had no console or page errors. The page has `lang=en`, one H1, one main landmark, title, alt text, a keyboard-visible 3px focus ring, and a working skip link. The built suite's full axe scan found zero serious/critical violations. In a fresh live context, service-worker control completed, a recipe was saved, network was disabled, and reload still showed the planner, saved recipe, and `Offline` state. Initial cold-load resource requests were all same-origin (JS, CSS, and hero AVIF).

## API/rate-limit and privacy checks

The deployed bundle contains `https://pilot-api.sociobot.in`, not the required release billing origin `https://api.sociobot.in`. The paid checkout and restore flow would therefore use the pilot service in production.

Rate-limit probe: 30 rapid invalid-token GET requests to `https://pilot-api.sociobot.in/api/v1/products/low-energy-menu/verify?...` returned 200; the immediately following request returned **429** with `Retry-After: 0` (and `X-RateLimit-After: 0`). Observed threshold: 31 requests in this burst. This endpoint does rate limit, though it is the wrong pilot endpoint for the live product.

## Defects

### Blocker

1. `.factory/claims.json` is missing. Mandatory claim tests were not runnable; several visitor-facing privacy/offline claims are unlisted and unproven.
2. No one-click sample-data demo or isolated demo sandbox exists. The first screen has no required demo action, and `/demo` is merely the empty app.

### High

1. The live, candidate-matching production bundle is built against `pilot-api.sociobot.in` instead of `api.sociobot.in`, contrary to the paid unlock contract.
2. The documented exact test command is not self-contained: `npm test` fails from the clean checkout because it invokes `vite preview` without first producing `dist/`.
3. The deployment sends no Content-Security-Policy and caches hashed assets for only `max-age=30`, rather than immutable long-lived asset caching. There is no `staticwebapp.config.json` in the candidate to declare the expected security/caching policy.

### Medium

1. Unknown paths (for example `/does-not-exist`) return the app shell with HTTP 200; there is no designed, real 404 route.
2. `/manifest.webmanifest` is served as `application/octet-stream`, not a web manifest MIME type.
3. Invalid backup import exposes a raw JSON parser error rather than a plain-language recovery instruction.

## Required remediation and re-verification

Add a complete claims manifest and tagged demo-entry claim tests; add the first-screen sample-data sandbox and documentation; build with the production billing origin; make the clean `npm test` command build or otherwise serve the artifact it tests; then correct headers/caching and rerun independent QA.
