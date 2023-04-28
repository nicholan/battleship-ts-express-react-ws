import { Schema, ObjectId, model } from 'mongoose';
import type { GameEvent } from '@packages/zod-data-types';

type GameType = {
	_id: ObjectId;
	gameId: string;
	players: ObjectId[];
	turn: number;
	started: boolean;
	createdAt: Date;
	events: GameEvent[];
};

const gameSchema = new Schema(
	{
		gameId: {
			type: String,
			default: () => (Date.now() + Math.random()).toString(36),
		},
		players: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Player',
			},
		],
		events: [],
		turn: {
			type: Number,
			default: () => Math.round(Math.random()),
		},
		started: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Expire game after 24 hours.
gameSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export const Game = model<GameType>('Game', gameSchema);
