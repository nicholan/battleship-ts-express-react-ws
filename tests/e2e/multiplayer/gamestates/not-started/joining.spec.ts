import { test, expect } from '../../../../fixtures/extend.js';
import playwrightConfig from '../../../../playwright.config.js';
import { createMultiplayer } from '../../../../utilities/database.js';

const baseUrl = playwrightConfig.use?.baseURL as string;
const [p1name, p2name, p3name] = ['alice', 'bobby', 'karen'];

test.describe('Multiplayer', () => {
	test('joining works with game code', async ({ playerOne, playerTwo }) => {
		const { gameCode, p1 } = await createMultiplayer(1);
		await playerOne.gotoPremadeLobby(gameCode, p1);

		const code = playerOne.getGameCode();
		await playerTwo.joinGame(p2name, code, true);

		const base = `${baseUrl}${gameCode}`;
		expect(await playerOne.url()).toEqual(`${base}/${p1name}`);
		expect(await playerTwo.url()).toEqual(`${base}/${p2name}`);
	});

	test('playerOne receives join toast when playerTwo joins the lobby', async ({ playerOne, playerTwo }) => {
		const { gameCode, p1 } = await createMultiplayer(1);
		await playerOne.gotoPremadeLobby(gameCode, p1);

		const code = playerOne.getGameCode();
		await playerTwo.joinGame(p2name, code, true);

		await expect(
			playerOne.page.getByRole('alert').filter({ hasText: `${p2name} has joined the game` })
		).toBeVisible();
	});
});
