import type { GameEvent } from "@packages/zod-data-types";
import { ai } from "./AiController";

describe("aiController", () => {
	const data: Omit<GameEvent, "coordinates"> = {
		playerId: "000",
		result: "SHIP_HIT",
		shipId: "testShip1",
	};

	beforeEach(() => {
		ai.reset();
	});

	describe("getAiMove", () => {
		test("returns unique coordinate when no GameEvent array is provided", () => {
			const coordinatesSet = new Set();
			for (let i = 0; i < 100; i++) {
				const coordinates = ai.getAiMove();
				const key = JSON.stringify(coordinates);

				// Check if the coordinates have already been generated
				expect(coordinatesSet.has(key)).toBeFalsy();

				// Add the coordinates to the set
				coordinatesSet.add(key);
			}
			expect(coordinatesSet.size).toEqual(100);
		});

		test("returns null if all coordinates have been hit", () => {
			let shouldBeNull: unknown;
			for (let i = 0; i < 101; i++) {
				if (i === 100) {
					shouldBeNull = ai.getAiMove();
					break;
				}
				ai.getAiMove();
			}
			expect(shouldBeNull).toBeNull();
		});
	});

	describe("getAiMove and calculateMoveSet", () => {
		test("getAiMove does not return coordinates that are passed into calculateMoveSet", () => {
			const coordinate1 = { x: 0, y: 0 };
			const coordinate2 = { x: 1, y: 0 };
			const events: GameEvent[] = [
				{ coordinates: coordinate1, ...data },
				{ coordinates: coordinate2, ...data },
			];

			ai.calculateMoveSet(events);

			const coordinatesSet = new Set();

			for (let i = 0; i < 100; i++) {
				const coordinates = ai.getAiMove();
				if (!coordinates) continue;

				const key = JSON.stringify(coordinates);
				coordinatesSet.add(key);
			}

			expect(coordinatesSet.has(JSON.stringify(coordinate1))).toEqual(false);
			expect(coordinatesSet.has(JSON.stringify(coordinate2))).toEqual(false);
			expect(coordinatesSet.size).toEqual(98);
		});

		test("returns correctly calculated coordinate on the x-axis based on GameEvents", () => {
			const events: GameEvent[] = [
				{ coordinates: { x: 0, y: 0 }, ...data },
				{ coordinates: { x: 1, y: 0 }, ...data },
			];

			ai.calculateMoveSet(events);
			const expected = { x: 2, y: 0 };
			const coordinates = ai.getAiMove();

			expect(coordinates).toEqual(expected);
		});

		test("returns correctly calculated coordinate on the y-axis based on GameEvents", () => {
			const events: GameEvent[] = [
				{ coordinates: { x: 0, y: 0 }, ...data },
				{ coordinates: { x: 0, y: 1 }, ...data },
			];

			ai.calculateMoveSet(events);
			const expected = { x: 0, y: 2 };
			const coordinates = ai.getAiMove();

			expect(coordinates).toEqual(expected);
		});
	});
});
