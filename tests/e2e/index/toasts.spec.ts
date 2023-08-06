import { test, expect } from '../../fixtures/extend.js';
import { createMultiplayer } from '../../utilities/database.js';

const [p1name, p2name, p3name] = ['alice', 'bobby', 'karen'];

test.describe('Index page toasts', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('game not found if game is not found with given code', async ({ page }) => {
		const name = page.getByRole('textbox', { name: 'Player name' });
		await name.fill(p1name);

		const code = page.getByRole('textbox', { name: 'Join existing game with a code' });
		await code.fill('fakecode');
		await code.press('Enter');

		await expect(page.getByText('Game not found.')).toBeVisible();
	});

	test('toasts if game already has two people joined', async ({ playerOne, playerTwo }) => {
		const { gameCode, p1, p2 } = await createMultiplayer(2);
		await playerOne.gotoPremadeLobby(gameCode, p1);
		await playerTwo.gotoPremadeLobby(gameCode, p2!);

		await playerTwo.page.goto('/');
		await playerTwo.joinGame(p3name, gameCode, false);

		await expect(playerTwo.page.getByRole('alert').filter({ hasText: `Game is full` })).toBeVisible();
	});

	test('toasts if player name is already in use', async ({ playerOne, playerTwo }) => {
		const { gameCode, p1 } = await createMultiplayer(1);

		await playerTwo.joinGame(p1, gameCode, false);
		await expect(playerTwo.page.getByRole('alert').filter({ hasText: `Name already in use` })).toBeVisible();
	});
});
