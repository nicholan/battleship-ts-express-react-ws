import { test, expect } from '@playwright/test';
import { getUrlParams } from '../../../../utilities/other.js';
import { createMultiplayer } from '../../../../utilities/database.js';

const [p1name, p2name] = ['alice', 'bobby'];

test.describe('invite modal', () => {
	test.beforeEach(async ({ page }) => {
		const { gameCode, p1 } = await createMultiplayer(1);
		await page.goto(`/${gameCode}/${p1}`);
		await page.getByRole('button', { name: 'Invite' }).click();
	});

	test('has correct content inside', async ({ page }) => {
		await expect(page.getByText('Invite with public name')).toBeVisible();
		await expect(page.getByText('Or share game code')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send game invitation' })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Copy game join code' })).toBeVisible();
	});

	test('close button closes modal', async ({ page }) => {
		await page.getByRole('button', { name: 'Close modal' }).click();
		await expect(page.getByText('Invite with public name')).not.toBeVisible();
	});

	test('game code matches code in url', async ({ page }) => {
		const url = page.url();
		const { gameCode } = getUrlParams(url);

		expect(gameCode).not.toBeNull();
		await expect(page.getByText(gameCode!, { exact: true })).toBeVisible();
	});

	test('sending invitation with valid name closes modal', async ({ page }) => {
		const nameInput = page.getByRole('textbox', { name: 'Player name' });
		await nameInput.fill(p2name);
		await nameInput.press('Enter');

		await expect(page.getByText('Invite with public name')).not.toBeVisible();
	});

	test('sending invitation with valid name shows toast', async ({ page }) => {
		const nameInput = page.getByRole('textbox', { name: 'Player name' });
		await nameInput.fill(p2name);
		await nameInput.press('Enter');

		await expect(page.getByText(`Invite sent to ${p2name}`)).toBeVisible();
	});

	test('invalid name does not send and close modal', async ({ page }) => {
		const nameInput = page.getByRole('textbox', { name: 'Player name' });
		await nameInput.fill('!');
		await nameInput.press('Enter');

		await expect(page.getByText(/sent to/)).not.toBeVisible();
		await expect(page.getByText('Invite with public name')).toBeVisible();
	});
});
