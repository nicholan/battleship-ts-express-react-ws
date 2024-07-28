import { expect, test } from "@playwright/test";
import { createMultiplayer } from "../../../utilities/createMultiplayer.js";

test.describe("Clicking ready button", () => {
	test.beforeEach(async ({ page }) => {
		const { gameCode, p1 } = await createMultiplayer(1);
		await page.goto(`/${gameCode}/${p1}`, { waitUntil: "domcontentloaded" });
		await page.getByRole("button", { name: "Random" }).click();
		await page.getByRole("button", { name: "Ready" }).click();
	});

	test("sets player ready", async ({ page }) => {
		await expect(page.getByText(/Waiting for/)).toBeVisible();
	});

	test("removes ready button", async ({ page }) => {
		await expect(page.getByRole("button", { name: "Ready" })).not.toBeVisible();
	});

	test("removes random button", async ({ page }) => {
		await expect(
			page.getByRole("button", { name: "Random" }),
		).not.toBeVisible();
	});

	test("removes clear button", async ({ page }) => {
		await expect(page.getByRole("button", { name: "Clear" })).not.toBeVisible();
	});

	test("does not remove invite button", async ({ page }) => {
		await expect(page.getByRole("button", { name: "Invite" })).toBeVisible();
	});
});
