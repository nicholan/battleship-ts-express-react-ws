import { test, expect } from '../../../../fixtures/extend.js';
import { createMultiplayer } from '../../../../utilities/database.js';

const [p1name, p2name] = ['alice', 'bobby'];

test('Attacking works using keyboard', async ({ playerOne, playerTwo }) => {
	const { gameCode, p1, p2 } = await createMultiplayer(2, { gameState: 'STARTED', turn: 0, ready: true });
	await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

	const p1Canvas = playerOne.page.locator('canvas').nth(1);
	await p1Canvas.focus();

	await expect(playerOne.page.getByText(`Your turn`)).toBeVisible();
	await p1Canvas.press('e', { delay: 1 });

	await expect(playerOne.page.getByText(`Your turn`)).not.toBeVisible();
	await expect(playerTwo.page.getByText(`Your turn`)).toBeVisible();
});

test('Attacking works by clicking', async ({ playerOne, playerTwo }) => {
	const { gameCode, p1, p2 } = await createMultiplayer(2, { gameState: 'STARTED', turn: 0, ready: true });
	await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

	const p1Canvas = playerOne.page.locator('canvas').nth(1);
	await p1Canvas.focus();

	await expect(playerOne.page.getByText(`Your turn`)).toBeVisible();
	await p1Canvas.click({
		position: {
			x: 20,
			y: 20,
		},
		delay: 1,
	});

	await expect(playerOne.page.getByText(`Your turn`)).not.toBeVisible();
	await expect(playerTwo.page.getByText(`Your turn`)).toBeVisible();
});

test('Each square can only be attacked once', async ({ playerOne, playerTwo }) => {
	const { gameCode, p1, p2 } = await createMultiplayer(2, { gameState: 'STARTED', turn: 0, ready: true });
	await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

	const p1Canvas = playerOne.page.locator('canvas').nth(1);
	const p2Canvas = playerTwo.page.locator('canvas').nth(1);

	await expect(playerOne.page.getByText(`Your turn`)).toBeVisible();
	await p1Canvas.click({
		position: {
			x: 20,
			y: 20,
		},
		delay: 1,
	});

	await expect(playerOne.page.getByText(`Your turn`)).not.toBeVisible();
	await expect(playerTwo.page.getByText(`Your turn`)).toBeVisible();

	await p2Canvas.click({
		position: {
			x: 20,
			y: 20,
		},
		delay: 1,
	});

	await expect(playerTwo.page.getByText(`Your turn`)).not.toBeVisible();
	await expect(playerOne.page.getByText(`Your turn`)).toBeVisible();

	await p1Canvas.click({
		position: {
			x: 20,
			y: 20,
		},
		delay: 1,
	});

	await expect(playerOne.page.getByText(`Your turn`)).toBeVisible();
});
