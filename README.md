# Low-Energy Menu

Low-Energy Menu is a local-first weekly dinner planner for households balancing the cook’s energy, school meals, repeats, and leftovers.

Live product: <https://low-energy-menu.sociobot.in>

Try the isolated sample week: <https://low-energy-menu.sociobot.in/demo/>

## What it does

- Sets low, medium, or high cooking energy for each day.
- Stores only recipes the household enters, including effort, extra leftover dinners, tags, notes, and grocery ingredients.
- Places cooked recipes, available leftovers, or a flexible night on a seven-day plan.
- Flags effort mismatches, school-meal overlap, close repetition, and unavailable leftovers.
- Tracks cooked and changed dinners against the product’s success measure.
- Combines planned recipe ingredients into a downloadable grocery CSV.
- Exports and imports a complete JSON backup.
- Works offline after the first completed load and stores planning data in IndexedDB.

The sample-data demo starts with three real-looking recipes and five planned nights. Its separate `low-energy-menu-demo` IndexedDB database never reads or changes the household planner. Use **Reset demo** to restore the sample or **Start for real** to discard it.

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

Checkout and license verification use `https://api.sociobot.in` by default; no payment provider is embedded. A staging build may explicitly set `VITE_BILLING_BASE_URL=https://pilot-api.sociobot.in`. The product slug is `low-energy-menu`; there is no provider product ID in this repository.

## Data and privacy

Recipes and weekly plans stay in the browser’s IndexedDB. License tokens and their daily cached verdict use localStorage. There are no third-party runtime scripts, CDN fonts, ads, or behavioral analytics. See [`privacy/index.html`](privacy/index.html) and [`terms/index.html`](terms/index.html).

Every public product claim and its browser test are listed in [`.factory/claims.json`](.factory/claims.json). Demo isolation is documented in [`.factory/demo.md`](.factory/demo.md). The visual system, original generated-image prompt, and provenance are in [`.factory/design.md`](.factory/design.md).

## License

MIT. See [LICENSE](LICENSE).
