import { test, expect } from '@playwright/test';
import { createSingleplayer } from './utils.js';

test.describe('Singleplayer lobby', () => {
	test.beforeEach(async ({ page }) => {
		await createSingleplayer(page);
	});

	test('player name is alice', async ({ page }) => {
		await expect(page.getByText('alice')).toBeVisible();
	});

	test('enemy name is computer', async ({ page }) => {
		await expect(page.getByText('computer')).toBeVisible();
	});

	test('has random button', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Random' })).toBeVisible();
	});

	test('has clear button', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
	});

	test('has no start button when ships are are not placed', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Start' })).not.toBeVisible();
	});

	test('has board navigation info', async ({ page }) => {
		await expect(page.getByText(/Navigate board/)).toBeVisible();
		await expect(page.getByText(/Change ship axis/)).toBeVisible();
		await expect(page.getByText(/Place ship/)).toBeVisible();
	});
});
