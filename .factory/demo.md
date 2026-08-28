# Demo sandbox

## Entry point

- Production: `https://low-energy-menu.sociobot.in/demo/`
- Local preview: `http://127.0.0.1:4173/demo/`
- `/?demo=1` also enters demo mode and immediately uses the demo namespace.

The landing page links to the demo with **Try it with sample data**. No account or setup is needed.

## Sample data

The demo seeds three household recipes: Lemon chickpea traybake, Tomato lentil pasta, and Black bean tacos. The current week has five planned nights, one cooked outcome, school or canteen context, leftovers, a flexible night, and grocery ingredients.

## Isolation and reset

Real plans use IndexedDB database `low-energy-menu`. Demo plans use the separate `low-energy-menu-demo` database. Demo startup never opens the real database or reads the real license token. Restoring a license is disabled in demo mode.

**Reset demo** deletes only `low-energy-menu-demo` and recreates the original sample. **Start for real** deletes the demo database, opens `/`, and leaves `low-energy-menu` untouched.

The offline claim is tested from `/demo/`; the sample data remains available after service-worker installation and a browser-level offline reload.
