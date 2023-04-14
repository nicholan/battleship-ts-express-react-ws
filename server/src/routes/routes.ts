import { Router } from 'express';
import { Game } from '../models/gameModel';
import { Player } from '../models/userModel';
import type { PlayerType } from '../models/userModel';
import uniqid from 'uniqid';

export const routes = Router();

routes.post('/create', async (req, res) => {
    const gameId = uniqid();
    const player = await Player.create({
        name: req.body.playerName,
        gameId: gameId
    });

    const game = await Game.create({
        gameId: gameId,
    });

    game.players.push(player._id);
    await game.save();
    res.json({ gameId: gameId });
});

routes.post('/join', async (req, res) => {
    const game = await Game.findOne({ gameId: req.body.gameId });

    if (!game) return res.sendStatus(404);
    if (game.players.length > 1) return res.sendStatus(404);

    const player = await Player.create({
        name: req.body.playerName,
        gameId: game.gameId,
        playerTurn: 1,
    });
    game.players.push(player._id);
    await game.save();

    return res.sendStatus(200);
});

routes.get('/:gameId/:playerName', async (req, res) => {
    const { gameId, playerName } = req.params;
    const game = await Game.findOne({ gameId }).populate<{ players: PlayerType[] }>('players');
    if (!game) return res.sendStatus(404);

    const { players, events, turn, started } = game;
    const playerDataIdx = players.findIndex(p => p.name === playerName);
    if (playerDataIdx === -1) return res.sendStatus(404);

    const { board, _id, playerTurn, ready } = players[playerDataIdx];

    const enemyDataIdx = players.findIndex(({ name }) => name !== playerName);
    const enemyName = enemyDataIdx === -1 ? null : players[enemyDataIdx].name;

    res.json({
        gameId,
        playerName,
        board,
        events,
        turn,
        playerTurn,
        ready,
        started,
        enemyName,
        playerId: _id,
    });
});

routes.post('/:gameId/:playerName', async (req, res) => {
    const { gameId, playerName } = req.params;
    const { board, ready } = req.body;
    if (!board || !ready) return res.sendStatus(404);

    const player = await Player.findOne({ name: playerName, gameId: gameId });
    if (!player) return res.sendStatus(404);

    player.board = board;
    player.ready = ready;

    await player.save();
    return res.sendStatus(200);
});

routes.post('/:gameId', async (req, res) => {
    const { gameId } = req.params;
    const game = await Game.findOne({ gameId });
    if (!game) return res.sendStatus(404);

    const gameEvent = req.body.gameEvent;
    const startGame = req.body.startGame;

    if (startGame) {
        game.started = true;
        await game.save();
        return res.sendStatus(200);
    }
    if (gameEvent) {
        game.events.push(gameEvent);
        game.turn === 0 ? game.turn = 1 : game.turn = 0;
        await game.save();
        return res.sendStatus(200);
    }
    return res.sendStatus(404);
});
