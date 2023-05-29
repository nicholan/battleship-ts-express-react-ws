import { Cell } from '../Cell/Cell.js';

export class Ship {
	health;
	shipNodes: Cell[] = [];
	id: string;

	constructor(length: number, id?: string | null) {
		this.health = length;
		if (!id) {
			this.id = generateUniqueId();
		} else {
			this.id = id;
		}
	}

	addCell(cell: Cell) {
		this.shipNodes.push(cell);
	}

	setSunk() {
		this.shipNodes.forEach((node) => (node.state = 'SHIP_SUNK'));
	}

	damage() {
		this.health--;
		if (this.health < 1) {
			this.setSunk();
			return 'SHIP_SUNK';
		}
		return 'SHIP_HIT';
	}
}

function generateUniqueId() {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
