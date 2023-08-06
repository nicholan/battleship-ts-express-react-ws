import { test as base } from '@playwright/test';
import { Player } from '../fixtures/Player.js';

// Declare the types of your fixtures.
type MyFixtures = {
	playerOne: Player;
	playerTwo: Player;
};

export const test = base.extend<MyFixtures>({
	playerOne: async ({ context }, use) => {
		const page1 = await context.newPage();
		await page1.goto('/', { waitUntil: 'domcontentloaded' });

		const playerPage = new Player(page1);
		await use(playerPage);
	},

	playerTwo: async ({ context }, use) => {
		const page2 = await context.newPage();
		await page2.goto('/', { waitUntil: 'domcontentloaded' });

		const playerPage = new Player(page2);
		await use(playerPage);
	},
});

export { expect } from '@playwright/test';
