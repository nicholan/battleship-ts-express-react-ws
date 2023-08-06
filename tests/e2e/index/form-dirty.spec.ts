import { test, expect } from '@playwright/test';

test.describe('Dirty form', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('has public name element when name is input', async ({ page }) => {
		const nameInput = page.getByRole('textbox', { name: 'Player name' });
		await nameInput.fill('testname');
		await expect(page.getByText('Public name')).toBeVisible();
	});

	test('has join button when game code is input', async ({ page }) => {
		const codeInput = page.getByRole('textbox', { name: 'Join existing game with a code' });
		await codeInput.fill('testcode');
		await expect(page.getByRole('button', { name: 'Join' })).toBeVisible();
	});

	test('has no public name element when play against ai is checked', async ({ page }) => {
		const nameInput = page.getByRole('textbox', { name: 'Player name' });
		await nameInput.fill('testname');
		await page.getByLabel('Play against AI').click();
		expect(page).not.toContain(/Public name/);
	});

	test('has no game code element when play against ai is checked', async ({ page }) => {
		await page.getByLabel('Play against AI').check();
		await expect(page.getByRole('textbox', { name: 'Join existing game with a code' })).not.toBeVisible();
	});
});
