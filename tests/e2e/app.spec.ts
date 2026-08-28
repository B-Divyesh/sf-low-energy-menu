import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Plan for the energy');
});

test('loads cleanly with core document landmarks and legal routes', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page).toHaveTitle(/Low-Energy Menu/);
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Terms');
  expect(errors).toEqual([]);
});

test('adds a recipe, plans a low-energy night, warns, and exports groceries', async ({ page }) => {
  await page.getByRole('button', { name: 'Add your first recipe' }).click();
  await page.getByLabel('Recipe name').fill('Tomato lentil pasta');
  await page.getByLabel('Effort').selectOption('3');
  await page.getByLabel('Extra dinners made').fill('1');
  await page.getByLabel('Tags / allergen notes').fill('vegetarian, pasta');
  await page.getByLabel('Grocery ingredients').fill('2 | cans | lentils\n1 | bunch | spinach');
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByRole('heading', { name: 'Tomato lentil pasta' })).toBeVisible();

  const monday = page.locator('.day-card').first();
  await monday.getByTitle('Low energy').click();
  await monday.getByLabel('School / canteen meal').fill('Tomato pasta');
  await monday.getByLabel('School / canteen meal').press('Tab');
  await monday.getByLabel('Dinner plan').selectOption({ label: 'Tomato lentil pasta · High' });
  await expect(monday.getByText('High-effort dinner on a low-energy day.')).toBeVisible();
  await expect(monday.getByText('Looks similar to the school or canteen meal.')).toBeVisible();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export grocery CSV' }).click();
  expect((await download).suggestedFilename()).toContain('grocery-');
});

test('has no serious or critical accessibility violations', async ({ page }) => {
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
});

test('survives refresh and works offline after service-worker install', async ({ page, context }) => {
  await page.getByRole('button', { name: 'Add your first recipe' }).click();
  await page.getByLabel('Recipe name').fill('Bean bowls');
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByRole('heading', { name: 'Bean bowls' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Bean bowls' })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Plan for the energy');
  await expect(page.getByText('Offline', { exact: true })).toBeVisible();
});
