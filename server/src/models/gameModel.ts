import { Schema, ObjectId, model, Document } from 'mongoose';
import type { GameEvent, GameState } from '@packages/zod-data-types';

interface GameTypes extends Document {
	gameId: string;
	players: ObjectId[];
	turn: number;
	createdAt: Date;
	events: GameEvent[];
	winner: string;
	gameState: GameState;
	round: number;
}

const gameSchema: Schema = new Schema(
	{
		gameId: {
			type: String,
			default: () => generateUniqueId(),
		},
		players: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Player',
			},
		],
		events: [],
		round: {
			type: Number,
			default: 1,
		},
		turn: {
			type: Number,
			default: 2,
		},
		winner: {
			type: String,
		},
		gameState: {
			type: String,
			default: 'NOT_STARTED',
		},
	},
	{ timestamps: true }
);

// Expire game after 24 hours.
gameSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export const Game = model<GameTypes>('Game', gameSchema);

function generateUniqueId() {
	return (Date.now() + Math.trunc(Math.random() * 10_000)).toString(36);
}
