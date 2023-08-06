import { test, expect } from '@playwright/test';

test.describe('Index page shows error', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('if name has special characters', async ({ page }) => {
		const nameInput = page.getByRole('textbox', { name: 'Player name' });
		await nameInput.fill('!');
		await nameInput.press('Enter');
		await expect(page.getByText('Name may contain only letters and numbers.')).toBeVisible();
	});

	test('if name is more than 20 characters', async ({ page }) => {
		const nameInput = page.getByRole('textbox', { name: 'Player name' });
		await nameInput.fill('0123456789a0123456789');
		await nameInput.press('Enter');
		await expect(page.getByText('Name must be less than 20 characters.')).toBeVisible();
	});

	test('if code has special characters', async ({ page }) => {
		const nameInput = page.getByRole('textbox', { name: 'Player name' });
		await nameInput.fill('testname');

		const codeInput = page.getByRole('textbox', { name: 'Join existing game with a code' });
		await codeInput.fill('!');
		await codeInput.press('Enter');
		await expect(page.getByText('Invalid game code.')).toBeVisible();
	});

	test('if code is less than 4 characters', async ({ page }) => {
		const nameInput = page.getByRole('textbox', { name: 'Player name' });
		await nameInput.fill('testname');

		const codeInput = page.getByRole('textbox', { name: 'Join existing game with a code' });
		await codeInput.fill('abc');
		await codeInput.press('Enter');
		await expect(page.getByText('Invalid game code.')).toBeVisible();
	});
});
