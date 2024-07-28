import { expect, test } from "../../../../fixtures/extend.js";
import { createMultiplayer } from "../../../../utilities/createMultiplayer.js";

const [p1name, p2name] = ["alice", "bobby"];

// Create a single new multiplayer instance that is shared across tests.
const { gameCode, p1, p2 } = await createMultiplayer(2, {
	gameState: "GAME_OVER",
	turn: 2,
	ready: true,
	winner: p1name,
});

test.describe("Rematch modal ", () => {
	test.beforeEach(async ({ playerOne, playerTwo }) => {
		await playerOne.page.goto(`/${gameCode}/${p1}`, {
			waitUntil: "domcontentloaded",
		});
		await playerTwo.page.goto(`/${gameCode}/${p2 ?? p2name}`, {
			waitUntil: "domcontentloaded",
		});
	});

	test("shows correct info for winner (p1) and loser (p2)", async ({
		playerOne,
		playerTwo,
	}) => {
		await expect(playerOne.page.getByText("You win")).toBeVisible();
		await expect(playerTwo.page.getByText(`${p1name} wins`)).toBeVisible();
	});

	test("has button to go home", async ({ playerOne, playerTwo }) => {
		await expect(
			playerOne.page.getByRole("button", { name: "Home" }),
		).toBeVisible();
		await expect(
			playerTwo.page.getByRole("button", { name: "Home" }),
		).toBeVisible();
	});

	test("has rematch request button", async ({ playerOne, playerTwo }) => {
		await expect(
			playerOne.page.getByRole("button", { name: "Request rematch" }),
		).toBeVisible();
		await expect(
			playerTwo.page.getByRole("button", { name: "Request rematch" }),
		).toBeVisible();
	});

	test("has close modal button", async ({ playerOne, playerTwo }) => {
		await expect(
			playerOne.page.getByRole("button", { name: "Close modal" }),
		).toBeVisible();
		await expect(
			playerTwo.page.getByRole("button", { name: "Close modal" }),
		).toBeVisible();
	});
});
