import { singleplayerController } from './SingleplayerController.js';
import { aiGameboard, playerGameboard } from '../Gameboard/Gameboard.js';
import { vi } from 'vitest';

describe('singleplayerController', () => {
	const actions = {
		setGameEvents: vi.fn(),
		setGameState: vi.fn(),
		setIsPlayerTurn: vi.fn(),
		setReady: vi.fn(),
		setWinner: vi.fn(),
		setRematchModalVisible: vi.fn(),
		navigate: vi.fn(),
	};

	const gameId = 'game1';

	const data = {
		playerId: 'playerId',
		name: 'Player',
		gameId,
		board: [],
		events: [],
		turn: 2,
		playerTurn: 0,
		ready: false,
		gameState: 'NOT_STARTED',
		winner: null,
		aiBoard: [],
		isAiGame: true,
		enemyName: 'computer',
	};

	let controller = singleplayerController({ ...data, actions });

	beforeEach(() => {
		controller = singleplayerController({ ...data, actions });
		window.localStorage.setItem(gameId, JSON.stringify(data));
		playerGameboard.populateBoard();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('readyPlayer', () => {
		test('returns false if ships are not placed', async () => {
			const { readyPlayer } = controller;

			playerGameboard.reset();

			const result = await readyPlayer();
			expect(result).toBe(false);
			expect(actions.setReady).not.toHaveBeenCalledWith(true);
		});

		test('sets board and ready state, starts game and returns true', async () => {
			const { readyPlayer } = controller;
			const result = await readyPlayer();

			expect(result).toBe(true);
			expect(actions.setReady).toHaveBeenCalledWith(true);
			expect(actions.setGameState).toHaveBeenCalledWith('STARTED');
			expect(actions.setIsPlayerTurn).toHaveBeenCalled();
		});
	});

	describe('attack', () => {
		test('aiGameboard receiveAttack does not get called if its not player turn', async () => {
			const { readyPlayer, attack } = singleplayerController({ ...data, turn: 1, actions });
			aiGameboard.receiveAttack = vi.fn(() => ({ result: 'SHIP_HIT', shipId: 'testid1', allShipsSunk: false }));

			await readyPlayer();
			await attack({ x: 0, y: 0 });
			expect(aiGameboard.receiveAttack).toHaveBeenCalledTimes(0);
		});

		test('aiGameboard receiveAttack gets called if it is player turn', async () => {
			const { readyPlayer, attack } = singleplayerController({ ...data, turn: 0, actions });
			aiGameboard.receiveAttack = vi.fn(() => ({ result: 'SHIP_HIT', shipId: 'testid1', allShipsSunk: false }));

			await readyPlayer();
			await attack({ x: 0, y: 0 });
			expect(aiGameboard.receiveAttack).toHaveBeenCalledTimes(1);
		});
	});

	describe('aiAttack', () => {
		test('attacks playerGameboard when called', async () => {
			const { readyPlayer, aiAttack } = singleplayerController({ ...data, turn: 1, actions });
			playerGameboard.receiveAttack = vi.fn(() => ({
				result: 'SHIP_HIT',
				shipId: 'testid1',
				allShipsSunk: false,
			}));

			await readyPlayer();
			await aiAttack();
			expect(playerGameboard.receiveAttack).toHaveBeenCalledTimes(1);
			expect(actions.setIsPlayerTurn).toHaveBeenCalledTimes(2);
		});
	});

	describe('processGameEnding', () => {
		test('gets called if all enemy ships are sunk', async () => {
			const { readyPlayer, attack } = singleplayerController({ ...data, turn: 0, actions });
			aiGameboard.receiveAttack = vi.fn(() => ({ result: 'SHIP_SUNK', shipId: 'testid1', allShipsSunk: true }));

			await readyPlayer();
			await attack({ x: 0, y: 0 });
			expect(actions.setWinner).toHaveBeenCalledWith('Player');
			expect(actions.setRematchModalVisible).toHaveBeenCalledWith(true);
			expect(actions.setIsPlayerTurn).toHaveBeenCalledTimes(2);
			expect(actions.setGameState).toHaveBeenCalledWith('GAME_OVER');
		});

		test('gets called if all player ships are sunk', async () => {
			const { readyPlayer, aiAttack } = singleplayerController({ ...data, turn: 1, actions });
			playerGameboard.receiveAttack = vi.fn(() => ({
				result: 'SHIP_SUNK',
				shipId: 'testid1',
				allShipsSunk: true,
			}));

			await readyPlayer();
			await aiAttack();
			expect(actions.setWinner).toHaveBeenCalledWith('computer');
			expect(actions.setRematchModalVisible).toHaveBeenCalledWith(true);
			expect(actions.setIsPlayerTurn).toHaveBeenCalledWith(false);
			expect(actions.setGameState).toHaveBeenCalledWith('GAME_OVER');
		});
	});
});
