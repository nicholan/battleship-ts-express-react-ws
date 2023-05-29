import type { GameEvent } from '@packages/zod-data-types';
import { Gameboard } from './Gameboard.js';

describe('Gameboard', () => {
	let gameboard: Gameboard;

	beforeEach(() => {
		gameboard = new Gameboard();
	});

	describe('placeShip', () => {
		it('should place a ship on the board on the x-axis', () => {
			const coordinates = { x: 0, y: 0 };
			const shipLength = 3;
			const shipId = 'ship1';

			gameboard.placeShip(coordinates, shipLength, shipId);

			const grid = gameboard.getGrid();
			const shipCells = [grid[0][0], grid[1][0], grid[2][0]];

			expect(shipCells.every((cell) => cell.getShipId() === shipId)).toBe(true);
			expect(gameboard.getBuildArray()).toEqual([{ coordinates, axis: 'x', shipLength, shipId }]);
		});

		it('should place a ship on the board on the y-axis', () => {
			const coordinates = { x: 0, y: 0 };
			const shipLength = 3;
			const shipId = 'ship1';

			gameboard.toggleAxis();
			gameboard.placeShip(coordinates, shipLength, shipId);

			const grid = gameboard.getGrid();
			const shipCells = [grid[0][0], grid[0][1], grid[0][2]];

			expect(shipCells.every((cell) => cell.getShipId() === shipId)).toBe(true);
			expect(gameboard.getBuildArray()).toEqual([{ coordinates, axis: 'y', shipLength, shipId }]);
		});

		it('does not allow ships to overlap', () => {
			const coordinates = { x: 0, y: 0 };
			const shipLength = 3;
			const shipId = 'ship1';
			const shipId2 = 'ship2';

			gameboard.placeShip(coordinates, shipLength, shipId);
			gameboard.placeShip(coordinates, shipLength, shipId2);

			const grid = gameboard.getGrid();
			const shipCells = [grid[0][0], grid[1][0], grid[2][0]];

			expect(shipCells.every((cell) => cell.getShipId() === shipId)).toBe(true);
			expect(gameboard.getBuildArray()).toEqual([{ coordinates, axis: 'x', shipLength, shipId }]);
		});
	});

	describe('populateBoard', () => {
		it('places all ships randomly on board; 18 cells total across 7 ships', () => {
			expect(gameboard.getShipLength()).toEqual(5);

			gameboard.populateBoard();
			const grid = gameboard.getGrid();

			const shipCells = grid
				.map((arr) => {
					return arr.filter((cell) => {
						return cell.state === 'SHIP';
					});
				})
				.flat();

			const uniqueIds: string[] = [];
			shipCells.forEach((cell) => {
				const id = cell.getShipId();
				if (id && !uniqueIds.includes(id)) {
					uniqueIds.push(id);
				}
			});

			expect(shipCells.length).toEqual(18);
			expect(uniqueIds.length).toEqual(7);
			expect(gameboard.getShipLength()).toEqual(0);
		});
	});

	describe('receiveAttack', () => {
		it('should register a miss on the board', () => {
			const coordinates = { x: 0, y: 0 };

			const result = gameboard.receiveAttack(coordinates);

			expect(result).toEqual({ result: 'SHOT_MISS', shipId: null, allShipsSunk: false });
			expect(gameboard.getGrid()[0][0].state).toBe('SHOT_MISS');
		});

		it('should register a hit on the board', () => {
			const coordinates = { x: 0, y: 0 };
			const shipLength = 3;
			const shipId = 'ship1';

			gameboard.placeShip(coordinates, shipLength, shipId);
			const result = gameboard.receiveAttack(coordinates);

			expect(result).toEqual({ result: 'SHIP_HIT', shipId, allShipsSunk: false });
			expect(gameboard.getGrid()[0][0].state).toBe('SHIP_HIT');
		});

		it('should register a sunk ship on the board', () => {
			const coordinates = { x: 0, y: 0 };
			const shipLength = 3;
			const shipId = 'ship1';

			gameboard.placeShip(coordinates, shipLength, shipId);

			gameboard.receiveAttack({ x: 0, y: 0 });
			gameboard.receiveAttack({ x: 1, y: 0 });
			const result = gameboard.receiveAttack({ x: 2, y: 0 });

			expect(result).toEqual({ result: 'SHIP_SUNK', shipId, allShipsSunk: false });
			expect(gameboard.getGrid()[0][0].state).toBe('SHIP_SUNK');
		});
	});

	describe('reset', () => {
		it('should reset the gameboard', () => {
			const coordinates = { x: 0, y: 0 };
			const shipLength = 3;
			const shipId = 'ship1';

			gameboard.placeShip(coordinates, shipLength, shipId);
			gameboard.receiveAttack(coordinates);

			gameboard.reset();

			const grid = gameboard.getGrid();
			const buildArray = gameboard.getBuildArray();

			expect(grid.every((row) => row.every((cell) => cell.state === 'EMPTY'))).toBe(true);
			expect(buildArray).toEqual([]);
		});
	});

	describe('placement validation', () => {
		it('should indicate valid placement', () => {
			const coordinates = { x: 0, y: 0 };
			const shipLength = 5;

			const valid = gameboard.isValidPlacement(coordinates, false, shipLength);
			expect(valid).toEqual(true);
		});

		it('should indicate invalid placement', () => {
			const coordinates = { x: 7, y: 0 };
			const shipLength = 5;

			const valid = gameboard.isValidPlacement(coordinates, false, shipLength);
			expect(valid).toEqual(false);
		});

		it('should mark cell style valid when within board bounds', () => {
			const coordinates = { x: 0, y: 0 };
			const shipLength = 5;

			gameboard.isValidPlacement(coordinates, true, shipLength);
			const nodeStack = gameboard.getNodeStack();
			expect(nodeStack.length).toEqual(5);
			expect(nodeStack.every((cell) => cell.style === 'VALID')).toBe(true);
		});

		it('should mark cell style invalid when out of board bounds', () => {
			const coordinates = { x: 6, y: 0 };
			const shipLength = 5;

			gameboard.isValidPlacement(coordinates, true, shipLength);
			const nodeStack = gameboard.getNodeStack();
			expect(nodeStack.length).toEqual(4);
			expect(nodeStack.every((cell) => cell.style === 'INVALID')).toBe(true);
		});

		it('should indicate invalid placement when ship overlap', () => {
			const coordinates = { x: 0, y: 0 };
			const shipLength = 5;

			gameboard.placeShip(coordinates, shipLength);

			const valid = gameboard.isValidPlacement(coordinates, true, shipLength);
			expect(valid).toEqual(false);
		});

		it('should mark cell style invalid when ship overlap', () => {
			const coordinates = { x: 0, y: 0 };
			const shipLength = 5;

			gameboard.placeShip(coordinates, shipLength);

			gameboard.isValidPlacement(coordinates, true, shipLength);
			const nodeStack = gameboard.getNodeStack();
			expect(nodeStack.length).toEqual(5);
			expect(nodeStack.every((cell) => cell.style === 'INVALID')).toBe(true);
		});
	});

	describe('getLastHitCoordinate', () => {
		it('should return the coordinates of the most recent receiveAttack on the gameboard', () => {
			gameboard.receiveAttack({ x: 0, y: 0 });
			gameboard.receiveAttack({ x: 5, y: 6 });
			expect(gameboard.getLastHitCoordinate()).toEqual({ x: 5, y: 6 });

			gameboard.receiveAttack({ x: 3, y: 2 });
			expect(gameboard.getLastHitCoordinate()).toEqual({ x: 3, y: 2 });
		});
	});

	describe('buildPlayerBoard', () => {
		it('should populate gameboard from the array its passed', () => {
			gameboard.populateBoard();
			const shipArr = [...gameboard.getBuildArray()];
			const {
				coordinates: { x, y },
				shipId,
			} = shipArr[1];

			expect(shipArr.length).toBe(7);

			gameboard.reset();
			gameboard.buildPlayerBoard([], shipArr);
			const grid = gameboard.getGrid();

			expect(grid[x][y].getShipId()).toEqual(shipId);
		});

		it('should populate gameboard from the array its passed and mark events', () => {
			gameboard.populateBoard();
			const shipArr = [...gameboard.getBuildArray()];
			const {
				coordinates: { x, y },
				shipId,
			} = shipArr[1];

			const events: GameEvent[] = [{ coordinates: { x, y }, playerId: '000', result: 'SHIP_HIT', shipId }];

			gameboard.reset();
			gameboard.buildPlayerBoard(events, shipArr);
			const state = gameboard.getGrid()[x][y].state;
			expect(['SHIP_HIT', 'SHIP_SUNK'].includes(state)).toEqual(true);
			expect(gameboard.getLastHitCoordinate()).toEqual({ x, y });
		});
	});

	describe('buildEnemyBoard', () => {
		it('should mark events correctly', () => {
			gameboard.populateBoard();
			const shipArr = [...gameboard.getBuildArray()];

			gameboard.reset();

			const events: GameEvent[] = [];
			shipArr.forEach((ship) => {
				events.push({
					coordinates: ship.coordinates,
					shipId: ship.shipId,
					playerId: '000',
					result: 'SHIP_HIT',
				});
			});
			events[0].result = 'SHIP_SUNK';

			gameboard.buildEnemyBoard(events);
			const grid = gameboard.getGrid();
			let c = events[0].coordinates;
			expect(grid[c.x][c.y].state).toEqual('SHIP_SUNK');

			c = events[1].coordinates;
			expect(grid[c.x][c.y].state).toEqual('SHIP_HIT');

			expect(gameboard.getLastHitCoordinate()).toEqual(events[events.length - 1].coordinates);
		});
	});
});
