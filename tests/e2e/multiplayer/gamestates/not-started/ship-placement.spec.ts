import { test, expect } from '@playwright/test';
import { createMultiplayer } from '../../../../utilities/database.js';

test('Placing all ships by clicking enables ready button', async ({ page }) => {
	const { gameCode, p1 } = await createMultiplayer(1);
	await page.goto(`/${gameCode}/${p1}`);

	await expect(page.getByRole('button', { name: 'Ready' })).not.toBeVisible();
	const playerBoard = page.locator('canvas').first();

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

	await expect(page.getByRole('button', { name: 'Ready' })).toBeVisible();
});

test('Placing all ships using keyboard enables ready button', async ({ page }) => {
	const { gameCode, p1 } = await createMultiplayer(1);
	await page.goto(`/${gameCode}/${p1}`);

	const playerBoard = page.locator('canvas').first();
	await playerBoard.focus();

	// Place 7 ships along x-axis by clicking squares on the first board column.
	for (let i = 0; i < 7; i++) {
		await playerBoard.press('e', { delay: 1 });
		await playerBoard.press('s', { delay: 1 });
	}
	await expect(page.getByRole('button', { name: 'Ready' })).toBeVisible();
});

test('Toggling ship axis works', async ({ page }) => {
	const { gameCode, p1 } = await createMultiplayer(1);
	await page.goto(`/${gameCode}/${p1}`);

	const playerBoard = page.locator('canvas').first();
	await playerBoard.focus();

	// Toggle axis to y;
	await playerBoard.press('q', { delay: 1 });

	for (let i = 0; i < 7; i++) {
		await playerBoard.press('e', { delay: 1 });
		await playerBoard.press('d', { delay: 1 });
	}
	await expect(page.getByRole('button', { name: 'Ready' })).toBeVisible();
});

test('Ship placement validation works; invalid placements do not enable ready button', async ({ page }) => {
	const { gameCode, p1 } = await createMultiplayer(1);
	await page.goto(`/${gameCode}/${p1}`);

	const playerBoard = page.locator('canvas').first();
	await playerBoard.focus();

	await playerBoard.press('q', { delay: 1 });
	await playerBoard.press('w', { delay: 1 });

	for (let i = 0; i < 7; i++) {
		await playerBoard.press('e', { delay: 1 });
		await playerBoard.press('d', { delay: 1 });
	}
	await expect(page.getByRole('button', { name: 'Ready' })).not.toBeVisible();
});
