import express, { Router } from 'express';
import Player, { type PlayerProps, PlayerType } from './models/userModel.js';
import Game, { type GameProps } from './models/gameModel.js';

const [p1name, p2name] = ['alice', 'bobby'];

// Used for creating games quickly for e2e testing; different gamestates etc.
const multiplayerRouter: Router = express.Router();

multiplayerRouter.post('/', async (req, res) => {
	const data = req.body as PlayerProps & GameProps & { numPlayers: 1 | 2 };

	let p1: PlayerType | null = null;
	let p2: PlayerType | null = null;

	const game = await Game.create({
		gameState: data.gameState,
		turn: data.turn,
		winner: data.winner,
	});

	p1 = await Player.create({
		gameId: game.gameId,
		name: p1name,
		playerTurn: 0,
		ready: data.ready,
	});

	p2 =
		data.numPlayers === 2
			? await Player.create({
					gameId: game.gameId,
					name: p2name,
					playerTurn: 1,
					ready: data.ready,
			  })
			: null;

	game.players = [p1._id];
	p2 && game.players.push(p2._id);

	await game.save();

	res.send({
		p1: p1.name,
		p2: p2 && p2.name,
		gameCode: game.gameId,
	});
});

export { multiplayerRouter };
