import { Ship } from './Ship.js';
import { Cell } from '../Cell/Cell.js';

describe('Ship', () => {
	let ship: Ship;

	beforeEach(() => {
		ship = new Ship(3);
	});

	it('should have correct health when created', () => {
		expect(ship.health).toBe(3);
	});

	it('should generate a unique id when none is provided', () => {
		const ship2 = new Ship(2);
		expect(ship.id).not.toBe(ship2.id);
	});

	it('should use provided id if available', () => {
		const shipId = 'myShipId';
		const shipWithId = new Ship(4, shipId);
		expect(shipWithId.id).toBe(shipId);
	});

	it('should add a cell to shipNodes array when addCell method is called', () => {
		const cell = new Cell({ x: 1, y: 2 });
		ship.addCell(cell);
		expect(ship.shipNodes.length).toBe(1);
		expect(ship.shipNodes[0]).toBe(cell);
	});

	describe('setSunk', () => {
		it('should set state of all cells in ship nodes array to SHIP_SUNK', () => {
			const cell1 = new Cell({ x: 1, y: 1 });
			const cell2 = new Cell({ x: 2, y: 1 });
			const cell3 = new Cell({ x: 3, y: 1 });
			ship.addCell(cell1);
			ship.addCell(cell2);
			ship.addCell(cell3);
			ship.setSunk();
			expect(cell1.state).toBe('SHIP_SUNK');
			expect(cell2.state).toBe('SHIP_SUNK');
			expect(cell3.state).toBe('SHIP_SUNK');
		});
	});

	describe('damage', () => {
		it('should reduce health by 1 and return SHIP_HIT when damage method is called', () => {
			const result = ship.damage();
			expect(ship.health).toBe(2);
			expect(result).toBe('SHIP_HIT');
		});

		it('should set state of all cells to SHIP_SUNK when health is 0 or less and return SHIP_SUNK', () => {
			const cell1 = new Cell({ x: 1, y: 1 });
			const cell2 = new Cell({ x: 2, y: 1 });
			const cell3 = new Cell({ x: 3, y: 1 });
			ship.addCell(cell1);
			ship.addCell(cell2);
			ship.addCell(cell3);
			ship.damage();
			ship.damage();
			const result = ship.damage();
			expect(cell1.state).toBe('SHIP_SUNK');
			expect(cell2.state).toBe('SHIP_SUNK');
			expect(cell3.state).toBe('SHIP_SUNK');
			expect(result).toBe('SHIP_SUNK');
		});
	});
});
