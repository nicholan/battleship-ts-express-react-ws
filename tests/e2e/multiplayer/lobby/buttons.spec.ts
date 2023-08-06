import { test, expect } from '@playwright/test';
import { createMultiplayer } from '../../../utilities/database.js';

test.describe('Clicking random', () => {
	test.beforeEach(async ({ page }) => {
		const { gameCode, p1 } = await createMultiplayer(1);
		await page.goto(`/${gameCode}/${p1}`);
		await page.getByRole('button', { name: 'Random' }).click();
	});

	test('makes ready button visible', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Ready' })).toBeVisible();
	});

	test('and then clear button makes ready button disappear', async ({ page }) => {
		await page.getByRole('button', { name: 'Clear' }).click();
		await expect(page.getByRole('button', { name: 'Ready' })).not.toBeVisible();
	});
});

test.describe('Clicking ready button', () => {
	test.beforeEach(async ({ page }) => {
		const { gameCode, p1 } = await createMultiplayer(1);
		await page.goto(`/${gameCode}/${p1}`);

		await page.getByRole('button', { name: 'Random' }).click();
		await page.getByRole('button', { name: 'Ready' }).click();
	});

	test('sets player ready', async ({ page }) => {
		await expect(page.getByText(/Waiting for/)).toBeVisible();
	});

	test('removes ready button', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Ready' })).not.toBeVisible();
	});

	test('removes random button', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Random' })).not.toBeVisible();
	});

	test('removes clear button', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Clear' })).not.toBeVisible();
	});

	test('does not remove invite button', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Invite' })).toBeVisible();
	});
});
