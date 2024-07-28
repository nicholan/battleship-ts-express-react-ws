import { expect, test } from "@playwright/test";
import { createMultiplayer } from "../../utilities/createMultiplayer.js";

const [p1name, p2name, p3name] = ["alice", "bobby", "karen"];

test.describe("Index page toasts", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("game not found if game is not found with given code", async ({
		page,
	}) => {
		await page.getByRole("textbox", { name: "Player name" }).fill(p1name);

		const code = page.getByRole("textbox", {
			name: "Join existing game with a code",
		});
		await code.fill("fakecode");
		await code.press("Enter");

		await expect(page.getByText("Game not found.")).toBeVisible();
	});

	test("toasts if game already has two people joined", async ({ page }) => {
		const { gameCode } = await createMultiplayer(2);

		await page.getByRole("textbox", { name: "Player name" }).fill(p3name);
		const code = page.getByRole("textbox", {
			name: "Join existing game with a code",
		});
		await code.fill(gameCode);
		await code.press("Enter");

		await expect(
			page.getByRole("alert").filter({ hasText: "Game is full" }),
		).toBeVisible();
	});

	test("toasts if player name is already in use", async ({ page }) => {
		const { gameCode, p1 } = await createMultiplayer(1);

		await page.getByRole("textbox", { name: "Player name" }).fill(p1);
		const code = page.getByRole("textbox", {
			name: "Join existing game with a code",
		});
		await code.fill(gameCode);
		await code.press("Enter");

		await expect(
			page.getByRole("alert").filter({ hasText: "Name already in use" }),
		).toBeVisible();
	});
});
