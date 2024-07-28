import { expect, test } from "@playwright/test";
import { createSingleplayer } from "../../../utilities/createSingleplayer.js";

test.describe("Ship", () => {
	test.beforeEach(async ({ page }) => {
		await createSingleplayer(page);
	});

	test("placing by clicking works", async ({ page }) => {
		const playerBoard = page.locator("canvas").first();

		// Place 7 ships along x-axis by clicking squares on the first board column.
		for (let i = 0; i < 7; i++) {
			await playerBoard.click({
				position: {
					x: 25,
					y: 25 + i * 50,
				},
				delay: 1,
			});
		}

		await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
	});

	test("placing by keyboard works", async ({ page }) => {
		const playerBoard = page.locator("canvas").first();
		await playerBoard.focus();

		// Place 7 ships along x-axis by clicking squares on the first board column.
		for (let i = 0; i < 7; i++) {
			await playerBoard.press("e", { delay: 0 });
			await playerBoard.press("s", { delay: 0 });
		}
		await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
	});

	test("axis toggling works", async ({ page }) => {
		const playerBoard = page.locator("canvas").first();
		await playerBoard.focus();

		// Toggle axis to y;
		await playerBoard.press("q", { delay: 0 });

		for (let i = 0; i < 7; i++) {
			await playerBoard.press("e", { delay: 0 });
			await playerBoard.press("d", { delay: 0 });
		}
		await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
	});

	test("placement validation works", async ({ page }) => {
		const playerBoard = page.locator("canvas").first();
		await playerBoard.focus();

		await playerBoard.press("q", { delay: 0 });
		await playerBoard.press("w", { delay: 0 });

		for (let i = 0; i < 7; i++) {
			await playerBoard.press("e", { delay: 0 });
			await playerBoard.press("d", { delay: 0 });
		}

		// Ships are overlapping, therefore Start button should not be visible.
		await expect(page.getByRole("button", { name: "Start" })).not.toBeVisible();
	});
});
