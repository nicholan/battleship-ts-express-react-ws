import { expect, test } from "../../../../fixtures/extend.js";
import { createMultiplayer } from "../../../../utilities/createMultiplayer.js";

const [p1name, p2name] = ["alice", "bobby"];

test.describe("Attacking", () => {
	test.beforeEach(async ({ playerOne, playerTwo }) => {
		const { gameCode, p1, p2 } = await createMultiplayer(2, {
			gameState: "STARTED",
			turn: 0,
			ready: true,
		});
		await playerOne.page.goto(`/${gameCode}/${p1}`, {
			waitUntil: "domcontentloaded",
		});
		await playerTwo.page.goto(`/${gameCode}/${p2 ?? p2name}`, {
			waitUntil: "domcontentloaded",
		});
	});

	test("works using keyboard", async ({ playerOne, playerTwo }) => {
		const p1Canvas = playerOne.page.locator("canvas").nth(1);
		await p1Canvas.focus();
		await p1Canvas.press("e", { delay: 1 });

		await expect(playerOne.page.getByText("Your turn")).not.toBeVisible();
		await expect(playerTwo.page.getByText("Your turn")).toBeVisible();
	});

	test("works by clicking", async ({ playerOne, playerTwo }) => {
		const p1Canvas = playerOne.page.locator("canvas").nth(1);
		await p1Canvas.focus();

		await p1Canvas.click({
			position: {
				x: 20,
				y: 20,
			},
			delay: 1,
		});

		await expect(playerOne.page.getByText("Your turn")).not.toBeVisible();
		await expect(playerTwo.page.getByText("Your turn")).toBeVisible();
	});

	test("each square works only once", async ({ playerOne, playerTwo }) => {
		const p1Canvas = playerOne.page.locator("canvas").nth(1);
		const p2Canvas = playerTwo.page.locator("canvas").nth(1);
		await p1Canvas.focus();

		await p1Canvas.click({
			position: {
				x: 20,
				y: 20,
			},
			delay: 1,
		});

		await expect(playerOne.page.getByText("Your turn")).not.toBeVisible();
		await expect(playerTwo.page.getByText("Your turn")).toBeVisible();

		await p2Canvas.click({
			position: {
				x: 20,
				y: 20,
			},
			delay: 1,
		});

		await expect(playerTwo.page.getByText("Your turn")).not.toBeVisible();
		await expect(playerOne.page.getByText("Your turn")).toBeVisible();

		await p1Canvas.click({
			position: {
				x: 20,
				y: 20,
			},
			delay: 1,
		});

		await expect(playerOne.page.getByText("Your turn")).toBeVisible();
	});
});
