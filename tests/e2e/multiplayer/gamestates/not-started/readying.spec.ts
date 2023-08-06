import { test, expect } from '../../../../fixtures/extend.js';
import { createMultiplayer } from '../../../../utilities/database.js';

const [p2name] = ['bobby'];

test.describe('Multiplayer', () => {
	test('waiting for other player is correct', async ({ playerOne, playerTwo }) => {
		const { gameCode, p1, p2 } = await createMultiplayer(2);
		await playerOne.gotoPremadeLobby(gameCode, p1);
		await playerTwo.gotoPremadeLobby(gameCode, p2!);

		await playerOne.readyUp();

		await expect(playerOne.page.getByText(`Waiting for ${p2name}`)).toBeVisible();
		await expect(playerOne.page.getByRole('alert').filter({ hasText: `Game started` })).not.toBeVisible();
	});

	test('game started toast is visible when both players ready up', async ({ playerOne, playerTwo }) => {
		const { gameCode, p1, p2 } = await createMultiplayer(2);
		await playerOne.gotoPremadeLobby(gameCode, p1);
		await playerTwo.gotoPremadeLobby(gameCode, p2!);

		await playerOne.readyUp();
		await playerTwo.readyUp();

		await expect(playerOne.page.getByRole('alert').filter({ hasText: `Game started` })).toBeVisible();
		await expect(playerTwo.page.getByRole('alert').filter({ hasText: `Game started` })).toBeVisible();
	});
});
