import { randomNum } from "@packages/utilities";
import type {
	Coordinates,
	GameEvent,
	PlayerBoard,
} from "@packages/zod-data-types";
import { Cell } from "../Cell/Cell.js";
import { keyboardDispatch } from "../Keyboard/Dispatcher.js";
import { Ship } from "../Ship/Ship.js";

export class Gameboard {
	#grid = this.#createGrid();
	#hits = new Map<string, Coordinates>();
	#buildArr: PlayerBoard = [];
	#axis: "x" | "y" = "x";
	#nodeStack: Cell[] = [];
	#shipInventory = [
		{ allowed: 1, length: 5, placed: 0 },
		{ allowed: 1, length: 4, placed: 0 },
		{ allowed: 1, length: 3, placed: 0 },
		{ allowed: 2, length: 2, placed: 0 },
		{ allowed: 2, length: 1, placed: 0 },
	];
	#numSunkShips = 0;
	#selectedCoordinate: Coordinates = { x: 0, y: 0 };

	setSelectedCoordinate = ({
		code,
		coordinates,
	}: { code?: string; coordinates?: Coordinates }) => {
		if (code) {
			this.#selectedCoordinate =
				keyboardDispatch().move(code, this.#selectedCoordinate) ??
				this.#selectedCoordinate;
			return;
		}

		this.#selectedCoordinate = coordinates ?? this.#selectedCoordinate;
	};

	getSelectedCoordinate = () => this.#selectedCoordinate;

	getBuildArray = () => this.#buildArr;

	getNodeStack = () => this.#nodeStack;

	getGrid = () => this.#grid;

	getLastHitCoordinate = () => Array.from(this.#hits.values()).pop() ?? null;

	getShipLength = () => {
		for (const ship of this.#shipInventory) {
			if (ship.allowed > ship.placed) {
				return ship.length;
			}
		}
		return 0;
	};

	receiveAttack = ({ x, y }: Coordinates) => {
		if (this.#numSunkShips > 6) return null;

		const key = JSON.stringify({ x, y });
		if (this.#hits.has(key)) return null;
		this.#hits.set(key, { x, y });

		const result = this.#grid[x][y].receiveAttack();

		let shipId: string | null = null;
		let allShipsSunk = false;

		if (result === "SHOT_MISS") {
			return { result, shipId, allShipsSunk };
		}

		shipId = this.#grid[x][y].getShipId();

		if (result === "SHIP_SUNK") {
			this.#numSunkShips++;
		}

		if (this.#numSunkShips > 6) {
			allShipsSunk = true;
		}

		return { result, shipId, allShipsSunk };
	};

	clearCellStyles = () => {
		// Clear placement validation visual display
		for (const cell of this.#nodeStack) {
			cell.style = "NONE";
		}
		this.#nodeStack.length = 0;
	};

	toggleAxis = () => {
		if (this.#axis === "x") {
			this.#axis = "y";
		} else {
			this.#axis = "x";
		}
		this.clearCellStyles();
	};

	reset = () => {
		// Remove ships on board, reset inventory.
		for (const ship of this.#shipInventory) {
			ship.placed = 0;
		}
		this.#buildArr.length = 0;
		this.clearCellStyles();
		this.#grid = this.#createGrid();
		this.#hits.clear();
		this.#numSunkShips = 0;
		this.#selectedCoordinate = { x: 0, y: 0 };
		this.#axis = "x";
	};

	buildPlayerBoard = (eventArr: GameEvent[], shipArr: PlayerBoard = []) => {
		// Build player board from database, mark enemy actions on player board.
		if (this.#buildArr.length === 0) {
			this.#buildArr = shipArr;
			for (const { axis, coordinates, shipLength, shipId } of this.#buildArr) {
				this.#axis = axis;
				this.placeShip(coordinates, shipLength, shipId);
			}
		}

		for (const event of eventArr) {
			const { coordinates } = event;
			this.receiveAttack(coordinates);
		}
	};

	buildEnemyBoard = (eventArr: GameEvent[]) => {
		// Mark player actions on enemy board; misses, hits; set ships sunk.
		const copyArr = [...eventArr];
		for (const { coordinates } of eventArr) {
			this.receiveAttack(coordinates);
		}

		const sunkShips = copyArr.filter(({ result }) => result === "SHIP_SUNK");
		for (const ship of sunkShips) {
			for (const evt of copyArr) {
				if (ship.shipId === evt.shipId) {
					evt.result = ship.result;
				}
			}
		}
		for (const {
			coordinates: { x, y },
			result,
		} of copyArr) {
			this.#grid[x][y].state = result;
		}
		this.#selectedCoordinate = this.getLastHitCoordinate() ?? { x: 0, y: 0 };
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

	updateCellStyle(isValid: boolean) {
		// Placement validation visual display on board
		if (isValid) {
			for (const cell of this.#nodeStack) {
				cell.style = "VALID";
			}
		} else {
			for (const cell of this.#nodeStack) {
				cell.style = "INVALID";
			}
		}
	}

	placeShip = (
		coordinates = this.getSelectedCoordinate(),
		shipLength = this.getShipLength(),
		id: string | null = null,
	) => {
		// Check available ships; check validity of placement; place ship on board; save ship to build array; update inventory.
		// Called either when player clicks on board while in build phase or when board is loaded from database.
		if (shipLength === 0) return;
		if (!this.isValidPlacement(coordinates, false)) return;

		const ship = new Ship(shipLength, id);

		const { x, y } = coordinates;

		if (this.#axis === "x") {
			for (let i = 0; i < shipLength; i++) {
				this.#grid[x + i][y].addShip(ship);
				ship.addCell(this.#grid[x + i][y]);
			}
		}
		if (this.#axis === "y") {
			for (let i = 0; i < shipLength; i++) {
				this.#grid[x][y + i].addShip(ship);
				ship.addCell(this.#grid[x][y + i]);
			}
		}
		this.#buildArr.push({
			coordinates: { x, y },
			axis: this.#axis,
			shipLength,
			shipId: ship.id,
		});
		this.#updateInventory(shipLength);
	};

	#updateInventory(shipLength: number) {
		for (const ship of this.#shipInventory) {
			if (ship.length === shipLength) {
				ship.placed++;
			}
		}
	}

	populateBoard() {
		// Generate ship placements on board randomly.
		this.reset();

		while (this.getShipLength() > 0) {
			this.#axis = Math.random() > 0.5 ? "x" : "y";

			const [x, y] = [randomNum(10), randomNum(10)];
			const isValid = this.isValidPlacement({ x, y }, false);
			if (isValid) {
				this.placeShip({ x, y });
			}
		}
	}

	isValidSelection = ({ x, y }: Coordinates) => {
		this.clearCellStyles();
		const isValid = this.isValidPlacement({ x, y }, true, 1);
		if (isValid) {
			this.#grid[x][y].style = "SELECTED_VALID";
			return true;
		}
		if (!isValid && this.#grid[x][y].state === "SHOT_MISS") {
			this.#grid[x][y].style = "SELECTED_INVALID_MISS";
			return false;
		}
		if (!isValid && this.#grid[x][y].state === "SHIP_HIT") {
			this.#grid[x][y].style = "SELECTED_INVALID_SHIP";
			return false;
		}
		return false;
	};

	isValidPlacement = (
		coordinates = this.getSelectedCoordinate(),
		useNodeStack = true,
		shipLen = this.getShipLength(),
	) => {
		// Check that placement is not out of bounds or overlapping.
		this.clearCellStyles();
		if (this.getShipLength() === 0) return false;

		if (this.#axis === "x") {
			return this.#noCollisionX(coordinates, shipLen, useNodeStack);
		}
		return this.#noCollisionY(coordinates, shipLen, useNodeStack);
	};

	#noCollisionY(
		{ x, y }: Coordinates,
		shipLength: number,
		useNodeStack: boolean,
	) {
		// Checks that ships do not collide on the Y-axis.
		let isValid = true;
		for (let i = 0; i < shipLength; i++) {
			if (y + i > 9) {
				isValid = false;
				break;
			}
			if (this.#grid[x][y + i].state !== "EMPTY") {
				isValid = false;
			}
			useNodeStack && this.#nodeStack.push(this.#grid[x][y + i]);
		}
		this.updateCellStyle(isValid);
		return isValid;
	}

	#noCollisionX(
		{ x, y }: Coordinates,
		shipLength: number,
		useNodeStack: boolean,
	) {
		// Checks that ships do not collide on the X-axis.
		let isValid = true;

		for (let i = 0; i < shipLength; i++) {
			if (x + i > 9) {
				// Index out of bounds
				isValid = false;
				break;
			}
			if (this.#grid[x + i][y].state !== "EMPTY") {
				isValid = false;
			}
			useNodeStack && this.#nodeStack.push(this.#grid[x + i][y]);
		}
		this.updateCellStyle(isValid);
		return isValid;
	}
}

export const playerGameboard = new Gameboard();
export const enemyGameboard = new Gameboard();
export const aiGameboard = new Gameboard();

export function resetGameboards() {
	playerGameboard.reset();
	enemyGameboard.reset();
	aiGameboard.reset();
}
