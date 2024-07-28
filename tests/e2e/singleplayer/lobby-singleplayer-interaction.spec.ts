import { expect, test } from "@playwright/test";
import { createSingleplayer } from "../../utilities/createSingleplayer.js";

test.describe("Singleplayer lobby", () => {
	test.describe("clicking", () => {
		test.beforeEach(async ({ page }) => {
			await createSingleplayer(page);
		});

		test("random button makes start button visible", async ({ page }) => {
			const randomBtn = page.getByRole("button", { name: "Random" });
			await randomBtn.click();
			await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
		});

		test("clear button makes start button disappear", async ({ page }) => {
			const randomBtn = page.getByRole("button", { name: "Random" });
			await randomBtn.click();
			await page.getByRole("button", { name: "Clear" }).click();
			await expect(
				page.getByRole("button", { name: "Start" }),
			).not.toBeVisible();
		});

		test("start button starts the game", async ({ page }) => {
			const randomBtn = page.getByRole("button", { name: "Random" });
			await randomBtn.click();
			await page.getByRole("button", { name: "Start" }).click();
			await expect(page.getByText(/Game started/)).toBeVisible();
		});
	});
});
