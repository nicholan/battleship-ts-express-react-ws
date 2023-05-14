import { Schema, ObjectId, model, Document } from 'mongoose';
import type { PlayerBoard } from '@packages/zod-data-types';

export interface PlayerType extends Document {
	_id: ObjectId;
	name: string;
	board: PlayerBoard;
	gameId: string;
	playerTurn: number;
	ready: boolean;
	isAi: boolean;
}

const playerSchema = new Schema(
	{
		name: {
			type: String,
			default: 'Player',
		},
		board: [],
		gameId: {
			type: String,
		},
		playerTurn: {
			type: Number,
			default: 0,
		},
		ready: {
			type: Boolean,
			default: false,
		},
		isAi: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Expire player after 24 hours.
playerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export const Player = model<PlayerType>('Player', playerSchema);
