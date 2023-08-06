import { vi } from 'vitest';
import type { TRPC } from '../../../trpc.js';
import type { GameEvent } from '@packages/zod-data-types';

export const actions = {
	sendJsonMessage: vi.fn(),
	setEnemyName: vi.fn(),
	setGameEvents: vi.fn(),
	setGameState: vi.fn(),
	setIsPlayerTurn: vi.fn(),
	setReady: vi.fn(),
	setWinner: vi.fn(),
	setRematchModalVisible: vi.fn(),
	navigate: vi.fn(),
};

export const data = {
	playerId: 'playerId',
	name: 'Player',
	gameId: 'game1',
	board: [],
	events: [],
	turn: 2,
	playerTurn: 0,
	ready: false,
	gameState: 'NOT_STARTED',
	winner: null,
	aiBoard: [],
	isAiGame: true,
	enemyName: 'player2',
};

export const msgBase = {
	playerId: 'notPlayerId',
	gameId: data.gameId,
};

export const db = {
	readyPlayer: {
		mutate: vi.fn(() => {
			return { ready: true };
		}),
	},
	getGameTurn: {
		query: vi.fn(() => {
			return { isPlayerTurn: true };
		}),
	},
	startGame: {
		mutate: vi.fn(() => {
			return { turn: 0 };
		}),
	},
	addEvent: {
		mutate: vi.fn((data: { gameEvent: GameEvent }) => {
			return {
				gameEvents: [data.gameEvent],
				turn: 0,
			};
		}),
	},
	gameOver: {
		mutate: vi.fn(() => {
			return {
				winner: 'winner',
				gameState: 'GAME_OVER',
			};
		}),
	},
	resetGame: {
		mutate: vi.fn(() => {
			return {};
		}),
	},
} as unknown as TRPC;
