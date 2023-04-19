import { publicProcedure, router } from './trpc';
import { Player } from '../models/userModel';
import { Game } from '../models/gameModel';
import { PlayerType } from '../models/userModel';
import { zodGameEvent, zodGameId, zodPlayerName, zodPlayerBoard } from './zodTypes';
import { z } from 'zod';

const zPlayerName = z.object({ name: zodPlayerName });
const zGameId = z.object({ gameId: zodGameId });
const zGameEvent = z.object({ gameEvent: zodGameEvent });
const zPlayerBoard = z.object({ playerBoard: zodPlayerBoard });

export const appRouter = router({
    createGame: publicProcedure
        .input(zPlayerName)
        .mutation(async ({ input }) => {
            const { name } = input;
            const game = await Game.create({});
            const player = await Player.create({
                name,
                gameId: game.gameId
            });
            game.players.push(player._id);
            await game.save();
            return {
                name: player.name,
                gameId: game.gameId
            };
        }),

    joinGame: publicProcedure
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
                gameId
            };
        }),

    getGame: publicProcedure
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
            const playerData = players.find(p => p.name === name);
            if (!playerData) {
                return {
                    code: 404,
                    message: 'Player not found.',
                };
            }

            const { events, turn, started } = game;
            const { _id, board, playerTurn, ready } = playerData;

            const enemy = players.find((p) => p.name !== name);
            const enemyName = enemy ? enemy.name : null;

            return {
                playerId: _id,
                playerName: name,
                gameId,
                board,
                events,
                turn,
                playerTurn,
                ready,
                started,
                enemyName,
            };
        }),

    addEvent: publicProcedure
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

            game.events.push(gameEvent);
            game.turn === 0 ? game.turn = 1 : game.turn = 0;
            await game.save();
            return { gameEvents: game.events };
        }),

    startGame: publicProcedure
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

            game.started = true;
            await game.save();
            return { gameId };
        }),

    readyPlayer: publicProcedure
        .input(zGameId)
        .input(zPlayerName)
        .input(zPlayerBoard)
        .mutation(async ({ input }) => {
            const { gameId, name, playerBoard } = input;
            const player = await Player.findOne({ name, gameId });
            if (!player) {
                return {
                    code: 404,
                    message: 'Player not found.',
                };
            }
            player.board = playerBoard;
            player.ready = true;
            await player.save();
            return { ready: player.ready };
        }),
});

// Export type router type signature
export type AppRouter = typeof appRouter;