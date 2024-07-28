import { randomNum } from "@packages/utilities";
import type { Coordinates, GameEvent } from "@packages/zod-data-types";
import { Cell } from "../Cell/Cell.js";

export class AiController {
	#grid = this.#createGrid();
	#nodeStack: Cell[] = [];
	#hits = new Map<string, Coordinates>();
	#results: Coordinates[] = [];
	#preference: "x" | "y" | null = null;

	reset = () => {
		this.#grid = this.#createGrid();
		this.#nodeStack.length = 0;
		this.#hits.clear();
		this.#results.length = 0;
	};

	#createGrid() {
		const grid: Cell[][] = [];
		for (let x = 0; x < 10; x++) {
			grid.push([]);
			for (let y = 0; y < 10; y++) {
				grid[x][y] = new Cell({ x, y });
			}
		}
		return grid;
	}

	#getAdjacentCells = ({ x, y }: Coordinates) => {
		const adjacentX: Array<Cell | undefined> = [
			x + 1 > 9 ? undefined : this.#grid[x + 1][y],
			x - 1 < 0 ? undefined : this.#grid[x - 1][y],
		];

		const adjacentY: Array<Cell | undefined> = [
			y + 1 > 9 ? undefined : this.#grid[x][y + 1],
			y - 1 < 0 ? undefined : this.#grid[x][y - 1],
		];

		if (this.#preference === "x") return [...adjacentX];
		if (this.#preference === "y") return [...adjacentY];
		if (!this.#preference) return [...adjacentY, ...adjacentX];
	};

	#saveAdjacentCells = () => {
		this.#nodeStack.length = 0;

		if (this.#results.length < 1) return;

		const adjacent = this.#results.flatMap(this.#getAdjacentCells);

		for (const cell of adjacent) {
			if (cell !== undefined && cell.state === "EMPTY") {
				this.#nodeStack.push(cell);
			}
		}
	};

	#determineAxisPreference = () => {
		// Check what is the axis of the two most recent hits;
		// prefer attacking on that axis until ship has sunk
		if (this.#results.length < 2) {
			this.#preference = null;
			return;
		}

		if (this.#results[0].x === this.#results[1].x) this.#preference = "y";
		if (this.#results[0].y === this.#results[1].y) this.#preference = "x";
	};

	#filterResults = (arr: GameEvent[]) => {
		this.#results.length = 0;
		const events = [...arr].reverse();

		// Mark sunk ships first.
		const sunkShips = events.filter(({ result }) => result === "SHIP_SUNK");
		for (const ship of sunkShips) {
			for (const evt of events) {
				if (ship.shipId === evt.shipId) {
					evt.result = ship.result;
				}
			}
		}

		// Find ships that aren't sunk, save coordinates.
		for (const {
			coordinates: { x, y },
			result,
		} of events) {
			this.#grid[x][y].state = result;

			const key = JSON.stringify({ x, y });
			if (!this.#hits.has(key)) {
				this.#hits.set(key, { x, y });
			}

			if (result === "SHIP_HIT") {
				this.#results.push({ x, y });
			}
		}
	};

	calculateMoveSet = (arr: GameEvent[]) => {
		this.#filterResults(arr);
		this.#determineAxisPreference();
		this.#saveAdjacentCells();
	};

	getAiMove = () => {
		if (this.#hits.size === 100) return null;

		const node = this.#nodeStack.shift();
		if (node) {
			return node.coordinates;
		}

		// Random unshot coordinate.
		return this.#getRandomCoordinate();
	};

	#getRandomCoordinate = () => {
		let coordinates = {
			x: randomNum(10),
			y: randomNum(10),
		};
		const key = JSON.stringify(coordinates);
		if (this.#hits.has(key)) {
			coordinates = this.#getRandomCoordinate();
		}

		this.#hits.set(key, coordinates);
		return coordinates;
	};
}

export const ai = new AiController();
