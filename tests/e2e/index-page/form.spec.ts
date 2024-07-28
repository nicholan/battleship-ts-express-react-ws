import { expect, test } from "@playwright/test";

test.describe("Form", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("has name field", async ({ page }) => {
		await expect(
			page.getByRole("textbox", { name: "Player name" }),
		).toBeVisible();
	});

	test("has game code field", async ({ page }) => {
		await expect(
			page.getByRole("textbox", { name: "Join existing game with a code" }),
		).toBeVisible();
	});

	test("has play against ai checkbox", async ({ page }) => {
		await expect(page.getByLabel("Play against AI")).toBeVisible();
	});

	test("has create button", async ({ page }) => {
		await expect(page.getByRole("button", { name: "Create" })).toBeVisible();
	});

	test("has no public name element when name field is empty", async ({
		page,
	}) => {
		await expect(page.getByText("Public name")).not.toBeVisible();
	});
});
