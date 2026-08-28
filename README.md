# Low-Energy Menu

Low-Energy Menu is a local-first weekly dinner planner for households whose real constraint is the cook’s energy—not a shortage of recipe ideas. It turns familiar recipes, school or canteen meals, repeat fatigue, and leftovers into a week that is more likely to get cooked.

Live product: <https://low-energy-menu.sociobot.in>

## What it does

- Sets low, medium, or high cooking energy for each day.
- Stores only recipes the household enters, including effort, extra leftover dinners, tags, notes, and grocery ingredients.
- Places cooked recipes, available leftovers, or a flexible night on a seven-day plan.
- Flags effort mismatches, school-meal overlap, close repetition, and unavailable leftovers.
- Tracks cooked and changed dinners against the product’s success measure.
- Combines planned recipe ingredients into a downloadable grocery CSV.
- Exports and imports a complete JSON backup.
- Works offline after the first completed load and stores planning data in IndexedDB.

The free planner supports eight recipe cards plus the current and next week. A $12 USD one-time household unlock adds unlimited recipe cards and full week history. Grocery/data export, warnings, and accessibility are never gated.

## Develop and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

The factory build command is exactly:

```sh
npm run build
```

It creates the static deployment at `dist/`, with `dist/index.html` at its root. Run all unit, desktop/mobile browser, accessibility, persistence, and offline checks with:

```sh
npm test
```

To inspect the production build locally:

```sh
npm run preview
```

## Billing configuration

Checkout and license verification use the Sociobot billing API; no payment provider is embedded. Staging defaults to `https://pilot-api.sociobot.in`. At release, set `VITE_BILLING_BASE_URL=https://api.sociobot.in` in the factory build environment. The product slug is `low-energy-menu`; there is no provider product ID in this repository.

## Data and privacy

Recipes and weekly plans stay in the browser’s IndexedDB. License tokens and their daily cached verdict use localStorage. There are no third-party runtime scripts, CDN fonts, ads, or behavioral analytics. See [`privacy/index.html`](privacy/index.html) and [`terms/index.html`](terms/index.html).

The visual system, original generated-image prompt, and provenance are documented in [`.factory/design.md`](.factory/design.md). Scope and implementation verification are recorded in [`.factory/brief.json`](.factory/brief.json) and [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT. See [LICENSE](LICENSE).
