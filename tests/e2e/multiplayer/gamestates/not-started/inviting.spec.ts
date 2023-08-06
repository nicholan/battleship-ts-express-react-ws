import { test, expect } from '../../../../fixtures/extend.js';
import { createMultiplayer } from '../../../../utilities/database.js';

const [p1name, p2name, p3name] = ['alice', 'bobby', 'karen'];

test.skip('BROKEN: Player two receives invitation using public name', async ({ playerOne, playerTwo }) => {
	const { gameCode, p1 } = await createMultiplayer(1);
	await playerTwo.page.goto('/', { waitUntil: 'load' });
	await playerOne.gotoPremadeLobby(gameCode, p1);

	await playerTwo.page.getByRole('textbox', { name: 'Player name' }).fill(p2name);

	const regExp = new RegExp(`^${p2name}\\d{3}$`);
	const p2Public = await playerTwo.page.getByRole('paragraph').filter({ hasText: regExp }).textContent();

	await playerOne.page.getByRole('button', { name: 'Invite' }).click({ delay: 1 });
	const inviteInput = playerOne.page.getByRole('textbox', { name: 'Player name' });
	await inviteInput.fill(p2Public!);
	await playerOne.page.getByRole('button', { name: 'Send game invitation' }).click({ delay: 1 });

	await expect(playerOne.page.getByRole('alert').filter({ hasText: `Invite sent to ${p2Public}` })).toBeVisible();

	// await expect(playerTwo.page.locator('[id="\\31 "]')).toBeVisible();
	// await expect(playerTwo.page.getByText(`${p1name}`)).toBeVisible();
	// await expect(playerTwo.page.getByRole('alert').filter({ hasText: p1name })).toBeVisible();
});
