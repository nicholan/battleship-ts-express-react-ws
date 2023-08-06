import { test, expect } from '@playwright/test';
import { createMultiplayer } from '../../../utilities/database.js';

test.describe('Multiplayer lobby', () => {
	test.beforeEach(async ({ page }) => {
		const { gameCode, p1 } = await createMultiplayer(1);
		await page.goto(`/${gameCode}/${p1}`);
	});

	test('player name is alice', async ({ page }) => {
		await expect(page.getByText('alice', { exact: true })).toBeVisible();
	});

	test('enemy name is player', async ({ page }) => {
		await expect(page.getByText('player')).toBeVisible();
	});

	test('has random button', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Random' })).toBeVisible();
	});

	test('has clear button', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
	});

	test('has invite button', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Invite' })).toBeVisible();
	});

	test('has no ready button when ships are are not placed', async ({ page }) => {
		await expect(page.getByRole('button', { name: 'Ready' })).not.toBeVisible();
	});

	test('has board navigation info', async ({ page }) => {
		await expect(page.getByText(/Navigate board/)).toBeVisible();
		await expect(page.getByText(/Change ship axis/)).toBeVisible();
		await expect(page.getByText(/Place ship/)).toBeVisible();
	});
});
