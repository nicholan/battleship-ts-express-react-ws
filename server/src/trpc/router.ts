import { publicProcedure, router } from './trpc.js';
import Player from '../models/userModel.js';
import Game from '../models/gameModel.js';
import type { PlayerType } from '../models/userModel.js';
import { zodGameEvent, zodGameId, zodPlayerName, zodPlayerBoard, zodPlayerId } from '@packages/zod-data-types';
import { z } from 'zod';

const zPlayerName = z.object({ name: zodPlayerName });
const zGameId = z.object({ gameId: zodGameId });
const zGameEvent = z.object({ gameEvent: zodGameEvent });
const zPlayerBoard = z.object({ playerBoard: zodPlayerBoard });
const zPlayerTurn = z.object({ playerTurn: z.number().min(0).max(1) });
const zPlayerId = z.object({ playerId: zodPlayerId });

export const appRouter = router({
	createGame: publicProcedure
		// Called when creating a new game.
		.input(zPlayerName)
		.mutation(async ({ input }) => {
			const { name } = input;
			const game = await Game.create({});
			const player = await Player.create({
				name,
				gameId: game.gameId,
			});
			game.players.push(player._id);
			await game.save();
			return {
				name: player.name,
				gameId: game.gameId,
			};
		}),

	joinGame: publicProcedure
		// Called in Index page when joining a game via code.
		.input(zGameId)
		.input(zPlayerName)
		.mutation(async ({ input }) => {
			const { gameId, name } = input;
			const game = await Game.findOne({ gameId });
			if (!game) {
				return {
					code: 404,
					message: 'Game not found.',
				};
			}

			if (game.players.length > 1) {
				return {
					code: 403,
					message: 'Game is full.',
				};
			}

			const { players } = await game.populate<{ players: PlayerType[] }>('players');
			if (players[0].name === name) {
				return {
					code: 404,
					message: 'Name already in use.',
				};
			}

			const player = await Player.create({
				name,
				gameId,
				playerTurn: 1,
			});
			players.push(player);
			await game.save();

			return {
				name,
				gameId,
			};
		}),

	getGame: publicProcedure
		// Called in Lobby page loader function.
		.input(zGameId)
		.input(zPlayerName)
		.query(async ({ input }) => {
			const { gameId, name } = input;
			const game = await Game.findOne({ gameId });
			if (!game) {
				return {
					code: 404,
					message: 'Game not found.',
				};
			}
			const { players } = await game.populate<{ players: PlayerType[] }>('players');
			const playerData = players.find((p) => p.name === name);
			if (!playerData) {
				return {
					code: 404,
					message: 'Player not found.',
				};
			}

			const { events, turn, gameState } = game;
			const { _id, board, playerTurn, ready } = playerData;

			const enemy = players.find((p) => p.name !== name);

			return {
				playerId: _id,
				name,
				gameId,
				board,
				events,
				turn,
				playerTurn,
				ready,
				gameState,
				winner: game.winner ?? null,
				aiBoard: [],
				isAiGame: false,
				enemyName: enemy ? enemy.name : null,
			};
		}),

	addEvent: publicProcedure
		// Player receiving an attack calls this.
		// Save game event to events array.
		.input(zGameId)
		.input(zGameEvent)
		.mutation(async ({ input }) => {
			const { gameId, gameEvent } = input;
			const game = await Game.findOne({ gameId });
			if (!game) {
				return {
					code: 404,
					message: 'Game not found.',
				};
			}
			if (game.gameState !== 'STARTED') {
				return {
					code: 403,
					message: 'Game has not started yet.',
				};
			}
			game.events.push(gameEvent);
			game.turn !== 2 && (game.turn === 0 ? (game.turn = 1) : (game.turn = 0));
			await game.save();
			return {
				gameEvents: game.events,
				turn: game.turn,
			};
		}),

	startGame: publicProcedure
		// The second player to ready up calls this;
		// sets game started and randomizes starting player turn.
		.input(zGameId)
		.mutation(async ({ input }) => {
			const { gameId } = input;
			const game = await Game.findOne({ gameId });
			if (!game) {
				return {
					code: 404,
					message: 'Game not found.',
				};
			}
			game.turn = Math.round(Math.random()); // 0 or 1;
			game.gameState = 'STARTED';
			await game.save();
			return { turn: game.turn };
		}),

	readyPlayer: publicProcedure
		// Called when ships are placed on board and player clicks ready;
		// Save board build instructions; set player ready.
		.input(zPlayerId)
		.input(zPlayerBoard)
		.mutation(async ({ input }) => {
			const { playerId, playerBoard } = input;
			const player = await Player.findById(playerId);
			if (!player) {
				return {
					code: 404,
					message: 'Player not found.',
				};
			}
			// If player is already 'ready', prevent uploading new gameboard.
			if (player.ready) return { ready: player.ready };

			player.board = playerBoard;
			player.ready = true;
			await player.save();
			return { ready: player.ready };
		}),

	getGameTurn: publicProcedure
		// Attacking player calls this.
		.input(zGameId)
		.input(zPlayerTurn)
		.query(async ({ input }) => {
			const { gameId, playerTurn } = input;
			const game = await Game.findOne({ gameId });
			if (!game) {
				return {
					code: 404,
					message: 'Game not found.',
				};
			}

			const gameOver = game.gameState === 'GAME_OVER';

			const isPlayerTurn = game.turn === playerTurn;
			return { isPlayerTurn, gameOver };
		}),

	gameOver: publicProcedure
		// Losing player calls this.
		.input(zGameId)
		.input(zPlayerTurn)
		.mutation(async ({ input }) => {
			const { gameId, playerTurn } = input;
			const game = await Game.findOne({ gameId });
			if (!game) {
				return {
					code: 404,
					message: 'Game not found.',
				};
			}
			game.gameState = 'GAME_OVER';

			// Querying player turn will always be false for both players:
			game.turn = 2;
			const { players } = await game.populate<{ players: PlayerType[] }>('players');

			const winner = playerTurn === 0 ? 1 : 0;
			game.winner = players[winner].name;
			await game.save();
			return { winner: game.winner, gameState: game.gameState };
		}),

	resetGame: publicProcedure
		// Called when both players want to play again.
		.input(zGameId)
		.mutation(async ({ input }) => {
			const { gameId } = input;
			const game = await Game.findOne({ gameId });
			if (!game) {
				return {
					code: 404,
					message: 'Game not found.',
				};
			}

			game.gameState = 'NOT_STARTED';
			game.events = [];

			const { players } = await game.populate<{ players: PlayerType[] }>('players');
			players.forEach(async (p) => {
				p.board = [];
				p.ready = false;
				await p.save();
			});

			await game.save();
			return { gameId };
		}),
});

// Export type router type signature
export type AppRouter = typeof appRouter;
