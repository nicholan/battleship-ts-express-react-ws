import { Router } from 'express';
import { Game } from '../models/gameModel';
import { Player } from '../models/userModel';
import type { PlayerType } from '../models/userModel';
import uniqid from 'uniqid';

export const routes = Router();

routes.post('/create', async (req, res) => {
    const { playerName } = req.body;
    if (!playerName) return res.status(403).json({ message: 'Invalid request.' });

    const gameId = uniqid.time();
    const player = await Player.create({
        name: playerName,
        gameId
    });

    const game = await Game.create({
        gameId,
    });

    game.players.push(player._id);
    await game.save();
    res.json({ gameId });
});

routes.post('/join', async (req, res) => {
    const { gameId, playerName } = req.body;
    if (!gameId || !playerName) return res.status(403).json({ message: 'Invalid request.' });

    const game = await Game.findOne({ gameId });
    if (!game) return res.status(404).json({ message: 'Game not found.' });
    if (game.players.length > 1) return res.status(403).json({ message: 'Game is full.' });

    const { players } = await game.populate<{ players: PlayerType[] }>('players');

    if (players[0].name === playerName) return res.status(403).json({ message: 'Name already in use.' });

    const player = await Player.create({
        name: playerName,
        gameId,
        playerTurn: 1,
    });
    players.push(player);
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
