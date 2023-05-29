import { Cell } from './Cell.js';
import { Ship } from '../Ship/Ship.js';
import { vi } from 'vitest';

describe('Cell', () => {
	let cell: Cell;

	beforeEach(() => {
		cell = new Cell({ x: 1, y: 2 });
	});

	it('should have correct default state', () => {
		expect(cell.state).toBe('EMPTY');
	});

	it('should have correct default style', () => {
		expect(cell.style).toBe('NONE');
	});

	it('should have coordinates passed to the constructor', () => {
		expect(cell.coordinates.x).toBe(1);
		expect(cell.coordinates.y).toBe(2);
	});

	it('should add a ship and change state to SHIP when addShip method is called', () => {
		const ship = new Ship(3);
		cell.addShip(ship);
		expect(cell.getShipId()).toBe(ship.id);
		expect(cell.state).toBe('SHIP');
	});

	it('should return null if no ship is present when getShipId method is called', () => {
		expect(cell.getShipId()).toBeNull();
	});

	describe('receiveAttack', () => {
		it('should change state to SHOT_MISS and return SHOT_MISS if there is no ship in the cell', () => {
			const result = cell.receiveAttack();
			expect(result).toBe('SHOT_MISS');
			expect(cell.state).toBe('SHOT_MISS');
		});

		it('should change state to SHIP_HIT and call damage method of ship if a ship is in the cell', () => {
			const ship = new Ship(3);
			cell.addShip(ship);
			const damageSpy = vi.spyOn(ship, 'damage');
			const result = cell.receiveAttack();
			expect(result).toBe('SHIP_HIT');
			expect(cell.state).toBe('SHIP_HIT');
			expect(damageSpy).toHaveBeenCalledTimes(1);
		});
	});
});
