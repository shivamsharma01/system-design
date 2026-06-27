import { expect, test } from '@playwright/test';

/**
 * Smoke E2E covering the core user journeys. This is a scaffold: install
 * Playwright (see playwright.config.ts) to run it.
 */
test.describe('System Design platform smoke', () => {
  test('home page lists designs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Design Netflix')).toBeVisible();
  });

  test('can open the Netflix design', async ({ page }) => {
    await page.goto('/designs/netflix');
    await expect(page.getByRole('heading', { name: 'Design Netflix' })).toBeVisible();
    await expect(page.getByText('Overview')).toBeVisible();
  });

  test('search finds a design', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Search system designs').fill('whatsapp');
    await expect(page.getByText('Design WhatsApp')).toBeVisible();
  });

  test('theme toggle works', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const before = await html.getAttribute('data-theme');
    await page.getByRole('button', { name: /theme/i }).first().click();
    await expect(html).not.toHaveAttribute('data-theme', before ?? '');
  });
});
