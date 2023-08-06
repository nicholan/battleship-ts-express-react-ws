import { test, expect } from '../../../../fixtures/extend.js';
import { createMultiplayer } from '../../../../utilities/database.js';

const [p1name, p2name] = ['alice', 'bobby'];

test('Rematch modal shows correct info for winner (p1) and loser (p2)', async ({ playerOne, playerTwo }) => {
	const { gameCode, p1, p2 } = await createMultiplayer(2, {
		gameState: 'GAME_OVER',
		turn: 2,
		ready: true,
		winner: p1name,
	});
	await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

	await expect(playerOne.page.getByText(`You win`)).toBeVisible();
	await expect(playerTwo.page.getByText(`${p1name} wins`)).toBeVisible();
});

test('Rematch modal has button to go home', async ({ playerOne, playerTwo }) => {
	const { gameCode, p1, p2 } = await createMultiplayer(2, {
		gameState: 'GAME_OVER',
		turn: 2,
		ready: true,
		winner: p1name,
	});
	await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

	await expect(playerOne.page.getByRole('button', { name: 'Home' })).toBeVisible();
	await expect(playerTwo.page.getByRole('button', { name: 'Home' })).toBeVisible();
});

test('Rematch modal has rematch request button', async ({ playerOne, playerTwo }) => {
	const { gameCode, p1, p2 } = await createMultiplayer(2, {
		gameState: 'GAME_OVER',
		turn: 2,
		ready: true,
		winner: p1name,
	});
	await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

	await expect(playerOne.page.getByRole('button', { name: 'Request rematch' })).toBeVisible();
	await expect(playerTwo.page.getByRole('button', { name: 'Request rematch' })).toBeVisible();
});

test('Rematch modal has close modal button', async ({ playerOne, playerTwo }) => {
	const { gameCode, p1, p2 } = await createMultiplayer(2, {
		gameState: 'GAME_OVER',
		turn: 2,
		ready: true,
		winner: p1name,
	});
	await Promise.all([playerOne.gotoPremadeLobby(gameCode, p1), playerTwo.gotoPremadeLobby(gameCode, p2!)]);

	await expect(playerOne.page.getByRole('button', { name: 'Close modal' })).toBeVisible();
	await expect(playerTwo.page.getByRole('button', { name: 'Close modal' })).toBeVisible();
});
