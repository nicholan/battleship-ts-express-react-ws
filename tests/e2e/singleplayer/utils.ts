import type { Page } from '@playwright/test';

const [p1name, p2name] = ['alice', 'bobby'];

export async function createSingleplayer(page: Page) {
	await page.goto('/');
	await page.getByLabel('Play against AI').check();
	const name = page.getByRole('textbox', { name: 'Player name' });
	await name.fill(p1name);
	await name.press('Enter');
	await page.waitForURL(`**\/${p1name}`);
}
