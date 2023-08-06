import { test, expect } from '../../../../fixtures/extend.js';
import { createMultiplayer } from '../../../../utilities/database.js';

const [p1name, p2name] = ['alice', 'bobby'];

test.describe('Turn indicators', () => {
	test('show correct when p1 starts', async ({ playerOne, playerTwo }) => {
		const { gameCode, p1, p2 } = await createMultiplayer(2, { gameState: 'STARTED', turn: 0, ready: true });
		await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

		await expect(playerOne.page.getByText(`Your turn`)).toBeVisible();
		await expect(playerTwo.page.getByText(`${p1name} turn`)).toBeVisible();
	});

	test('show correct when p2 starts', async ({ playerOne, playerTwo }) => {
		const { gameCode, p1, p2 } = await createMultiplayer(2, { gameState: 'STARTED', turn: 1, ready: true });
		await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

		await expect(playerOne.page.getByText(`${p2name} turn`)).toBeVisible();
		await expect(playerTwo.page.getByText(`Your turn`)).toBeVisible();
	});

	test('change when p1 attacks on their own turn', async ({ playerOne, playerTwo }) => {
		const { gameCode, p1, p2 } = await createMultiplayer(2, { gameState: 'STARTED', turn: 0, ready: true });
		await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

		const p1Canvas = playerOne.page.locator('canvas').nth(1);
		await p1Canvas.click({
			position: {
				x: 20,
				y: 20,
			},
			delay: 1,
		});

		await expect(playerTwo.page.getByText(`Your turn`)).toBeVisible();
		await expect(playerOne.page.getByText(`${p2name} turn`)).toBeVisible();
	});

	test('change when p2 attacks on their own turn', async ({ playerOne, playerTwo }) => {
		const { gameCode, p1, p2 } = await createMultiplayer(2, { gameState: 'STARTED', turn: 1, ready: true });
		await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

		const p2Canvas = playerTwo.page.locator('canvas').nth(1);
		await p2Canvas.click({
			position: {
				x: 20,
				y: 20,
			},
			delay: 1,
		});

		await expect(playerOne.page.getByText(`Your turn`)).toBeVisible();
		await expect(playerTwo.page.getByText(`${p1name} turn`)).toBeVisible();
	});
});
