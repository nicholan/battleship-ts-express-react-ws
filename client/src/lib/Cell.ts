import type { Coordinates, CellStyle, CellState, Result } from '@packages/zod-data-types';
import type { Ship } from './Ship.js';

export class Cell {
	state: CellState = 'EMPTY';
	style: CellStyle = 'NONE';
	coordinates;
	#ship: Ship | null = null;

	constructor(coordinates: Coordinates) {
		this.coordinates = coordinates;
	}

	addShip(ship: Ship) {
		this.#ship = ship;
		this.state = 'SHIP';
	}

	getShipId() {
		if (!this.#ship) return null;
		return this.#ship.id;
	}

	receiveAttack(): Result {
		if (this.#ship) {
			this.state = 'SHIP_HIT';
			return this.#ship.damage();
		}
		this.state = 'SHOT_MISS';
		return this.state;
	}
}
