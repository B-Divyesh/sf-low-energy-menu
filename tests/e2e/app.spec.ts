import { readFileSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openHome(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Plan dinners for the energy');
}

async function addRecipe(page: Page, name: string, effort = '2', ingredients = ''): Promise<void> {
  await page.getByRole('button', { name: /Add (your first )?recipe/ }).first().click();
  await page.getByLabel('Recipe name').fill(name);
  await page.getByLabel('Effort', { exact: true }).selectOption(effort);
  if (ingredients) await page.getByLabel('Grocery ingredients').fill(ingredients);
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible();
}

test('loads cleanly with core document landmarks and legal routes', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await openHome(page);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page).toHaveTitle('Low-Energy Menu — plan dinners around your energy');
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Terms');
  expect(errors).toEqual([]);
});

test('@claim:demo-sandbox opens realistic sample data in isolated storage and resets it', async ({ page }) => {
  await openHome(page);
  await addRecipe(page, 'Private family soup');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lemon chickpea traybake' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Private family soup' })).toHaveCount(0);
  await addRecipe(page, 'Demo-only noodles');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Demo-only noodles' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('heading', { name: 'Lemon chickpea traybake' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Demo-only noodles' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { name: 'Private family soup' })).toBeVisible();
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name));
  expect(databases).toContain('low-energy-menu');
  expect(databases).not.toContain('low-energy-menu-demo');
});

test('@claim:planning-checks flags effort mismatch and a similar school meal', async ({ page }) => {
  await page.goto('/demo/');
  const wednesday = page.locator('.day-card').nth(2);
  await wednesday.getByTitle('Low energy').click();
  await expect(wednesday.getByText('Medium-effort dinner on a low-energy day.')).toBeVisible();
  await expect(wednesday.getByText('Looks similar to the school or canteen meal.')).toBeVisible();
});

test('@claim:grocery-csv exports every grocery row from the sample week', async ({ page }) => {
  await page.goto('/demo/');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export grocery CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('grocery-');
  const path = await download.path();
  expect(path).toBeTruthy();
  const csv = readFileSync(path!, 'utf8');
  expect(csv.split('\n')[0]).toBe('Ingredient,Quantity,Unit');
  expect(csv).toContain('"chickpeas","2","cans"');
  expect(csv).toContain('"pasta","500","g"');
  expect(csv).toContain('"tortillas","8",""');
});

test('@claim:backup-roundtrip exports and restores the complete plan', async ({ page }) => {
  await page.goto('/demo/');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const backupPath = await (await downloadPromise).path();
  expect(backupPath).toBeTruthy();
  const backup = JSON.parse(readFileSync(backupPath!, 'utf8'));
  expect(backup.recipes).toHaveLength(3);
  expect(Object.keys(backup.weeks)).toHaveLength(1);
  await addRecipe(page, 'Temporary demo recipe');
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('input[data-action="import"]').setInputFiles(backupPath!);
  await expect(page.getByText('Backup imported.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Temporary demo recipe' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Lemon chickpea traybake' })).toBeVisible();
});

test('@claim:local-private keeps the full demo flow same-origin and in demo IndexedDB', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/demo/');
  await page.locator('.day-card').first().getByLabel('School / canteen meal').fill('Vegetable soup');
  await page.locator('.day-card').first().getByLabel('School / canteen meal').press('Tab');
  await page.reload();
  await expect(page.locator('.day-card').first().getByLabel('School / canteen meal')).toHaveValue('Vegetable soup');
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((item) => item.name));
  expect(databases).toContain('low-energy-menu-demo');
  expect(databases).not.toContain('low-energy-menu');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:low-energy-menu'))).toBeNull();
  expect(requests.filter((url) => new URL(url).origin !== 'http://127.0.0.1:4173')).toEqual([]);
  expect(await page.locator('script[src^="http"], link[href^="http"]:not([rel="canonical"])').count()).toBe(0);
});

test('@claim:offline-reload reloads the sample plan without a network', async ({ page, context }) => {
  await page.goto('/demo/');
  await expect(page.getByRole('heading', { name: 'Lemon chickpea traybake' })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Plan dinners for the energy');
  await expect(page.getByRole('heading', { name: 'Lemon chickpea traybake' })).toBeVisible();
  await expect(page.getByText('Offline', { exact: true })).toBeVisible();
});

test('@claim:free-and-paid enforces eight free recipes and accepts a valid one-time license', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page.getByText('$12 USD')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buy household unlock' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/low-energy-menu/checkout');
  await page.getByRole('button', { name: 'Start for real' }).click();
  for (let index = 1; index <= 8; index += 1) await addRecipe(page, `Weeknight recipe ${index}`);
  await page.getByRole('button', { name: '+ Add recipe' }).click();
  await expect(page.getByText('The free plan holds 8 recipes.')).toBeVisible();
  await page.route('https://api.sociobot.in/**', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }),
  }));
  await page.getByLabel('Have a license? Paste it').fill('test-valid-license');
  await page.getByRole('button', { name: 'Restore' }).click();
  await expect(page.getByText('Household unlocked')).toBeVisible();
  await addRecipe(page, 'Ninth recipe');
});

test('adds a recipe, plans a low-energy night, warns, and exports groceries', async ({ page }) => {
  await openHome(page);
  await addRecipe(page, 'Tomato lentil pasta', '3', '2 | cans | lentils\n1 | bunch | spinach');
  const monday = page.locator('.day-card').first();
  await monday.getByTitle('Low energy').click();
  await monday.getByLabel('School / canteen meal').fill('Tomato pasta');
  await monday.getByLabel('School / canteen meal').press('Tab');
  await monday.getByLabel('Dinner plan').selectOption({ label: 'Tomato lentil pasta · High' });
  await expect(monday.getByText('High-effort dinner on a low-energy day.')).toBeVisible();
  await expect(monday.getByText('Looks similar to the school or canteen meal.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export grocery CSV' })).toBeEnabled();
});

test('shows a designed not-found route and plain import recovery', async ({ page }) => {
  await page.goto('/does-not-exist');
  await expect(page).toHaveTitle('Page not found — Low-Energy Menu');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page is not on the menu.');
  await openHome(page);
  await page.locator('input[data-action="import"]').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
  await expect(page.getByText('That file is not a valid Low-Energy Menu backup. Choose a JSON backup exported by this app.')).toBeVisible();
});

test('has no serious or critical accessibility violations on home and demo', async ({ page }) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const route of ['/', '/demo/']) {
      await page.goto(route);
      const results = await new AxeBuilder({ page: page as never }).analyze();
      expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
    }
  }
});

test('supports keyboard-only navigation, dialog focus, reduced motion, and narrow screens', async ({ page }) => {
  await openHome(page);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await expect(page.locator('.skip-link')).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const addButton = page.getByRole('button', { name: 'Add your first recipe' });
  await addButton.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Recipe name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#recipe-dialog')).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reducedDuration = await page.locator('.primary-button').first().evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(reducedDuration).toBeLessThan(0.001);
});
