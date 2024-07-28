import { expect, test } from "../../../../fixtures/extend.js";
import playwrightConfig from "../../../../playwright.config.js";
import { createMultiplayer } from "../../../../utilities/createMultiplayer.js";

const baseUrl = playwrightConfig.use?.baseURL as string;
const [p1name, p2name, p3name] = ["alice", "bobby", "karen"];

test.describe("Multiplayer", () => {
	test("joining works with game code", async ({ playerOne, playerTwo }) => {
		const { gameCode, p1 } = await createMultiplayer(1);
		await playerOne.page.goto(`/${gameCode}/${p1}`, {
			waitUntil: "domcontentloaded",
		});
		await playerTwo.joinGame(p2name, gameCode);

		const base = `${baseUrl}${gameCode}`;
		expect(await playerOne.url()).toEqual(`${base}/${p1name}`);
		expect(await playerTwo.url()).toEqual(`${base}/${p2name}`);
	});

	test("playerOne receives join toast when playerTwo joins the lobby", async ({
		playerOne,
		playerTwo,
	}) => {
		const { gameCode, p1 } = await createMultiplayer(1);
		await playerOne.page.goto(`/${gameCode}/${p1}`, {
			waitUntil: "domcontentloaded",
		});
		await playerTwo.joinGame(p2name, gameCode);

		await expect(
			playerOne.page
				.getByRole("alert")
				.filter({ hasText: `${p2name} has joined the game` }),
		).toBeVisible();
	});
});
