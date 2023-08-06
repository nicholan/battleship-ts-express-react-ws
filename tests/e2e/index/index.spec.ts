import { test, expect } from '@playwright/test';

test.describe('Index page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('has title', async ({ page }) => {
		await expect(page).toHaveTitle(/Battleship/);
	});

	test('has correct header', async ({ page }) => {
		await expect(page.locator('header').filter({ hasText: /Battleship/ })).toBeVisible();
	});

	test('header text links to index', async ({ page }) => {
		await expect(page.getByRole('link', { name: 'Go to index page' })).toBeVisible();
	});

	test('has name in footer', async ({ page }) => {
		await expect(page.locator('footer').filter({ hasText: /Nicholas Anttila 2023/ })).toBeVisible();
	});

	test('has switch to dark theme button when in light theme', async ({ page }) => {
		await expect(page.getByRole('button', { name: /dark mode/ })).toBeVisible();
	});

	test('has switch to light theme button when in dark theme', async ({ page }) => {
		await page.getByRole('button', { name: 'Switch to dark mode' }).click();
		await expect(page.getByRole('button', { name: /light mode/ })).toBeVisible();
	});

	test('has github link', async ({ page }) => {
		await expect(page.getByRole('link', { name: /Github/ })).toBeVisible();
	});

	test('has linkedin link', async ({ page }) => {
		await expect(page.getByRole('link', { name: /Linkedin/ })).toBeVisible();
	});
});
