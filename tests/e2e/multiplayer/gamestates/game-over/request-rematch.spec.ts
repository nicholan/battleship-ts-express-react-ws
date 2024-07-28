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

test.describe("Rematching", () => {
	test.beforeEach(async ({ playerOne, playerTwo }) => {
		await playerOne.page.goto(`/${gameCode}/${p1}`, {
			waitUntil: "domcontentloaded",
		});
		await playerTwo.page.goto(`/${gameCode}/${p2 ?? p2name}`, {
			waitUntil: "domcontentloaded",
		});
	});

	test("After requesting rematch shows waiting for p2", async ({
		playerOne,
		playerTwo,
	}) => {
		await playerOne.page
			.getByRole("button", { name: "Request rematch" })
			.click();
		await expect(
			playerOne.page.getByText(`Waiting for ${p2name}`),
		).toBeVisible();
	});

	test("P1 requesting rematch closes rematch modal for p2", async ({
		playerOne,
		playerTwo,
	}) => {
		await playerOne.page
			.getByRole("button", { name: "Request rematch" })
			.click();
		await expect(playerTwo.page.getByText(`${p1name} wins`)).not.toBeVisible();
	});

	test("P1 requesting rematch shows rematch toast for p2", async ({
		playerOne,
		playerTwo,
	}) => {
		await playerOne.page
			.getByRole("button", { name: "Request rematch" })
			.click();

		await expect(
			playerTwo.page.getByText(`${p1name} has requested rematch`),
		).toBeVisible();
		await expect(
			playerTwo.page.getByRole("button", { name: "Accept" }),
		).toBeVisible();
		await expect(
			playerTwo.page.getByRole("button", { name: "Decline" }),
		).toBeVisible();
	});

	test("Accepting rematch resets game to not started state", async ({
		playerOne,
		playerTwo,
	}) => {
		await playerOne.page
			.getByRole("button", { name: "Request rematch" })
			.click();
		await playerTwo.page.getByRole("button", { name: "Accept" }).click();

		await expect(
			playerTwo.page.getByRole("button", { name: "Random" }),
		).toBeVisible();
		await expect(
			playerOne.page.getByRole("button", { name: "Random" }),
		).toBeVisible();

		await expect(
			playerOne.page.getByRole("button", { name: "Invite" }),
		).not.toBeVisible();
	});
});
