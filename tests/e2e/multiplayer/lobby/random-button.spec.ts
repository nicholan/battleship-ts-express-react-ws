import { expect, test } from "@playwright/test";
import { createMultiplayer } from "../../../utilities/createMultiplayer.js";

const { gameCode, p1 } = await createMultiplayer(1);

test.describe("Clicking", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(`/${gameCode}/${p1}`);
		await page.getByRole("button", { name: "Random" }).click();
	});

	test("random button makes ready button visible", async ({ page }) => {
		await expect(page.getByRole("button", { name: "Ready" })).toBeVisible();
	});

	test("clear button makes ready button disappear", async ({ page }) => {
		await page.getByRole("button", { name: "Clear" }).click();
		await expect(page.getByRole("button", { name: "Ready" })).not.toBeVisible();
	});
});
