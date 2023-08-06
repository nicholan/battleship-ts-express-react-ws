import { Schema, ObjectId, model, Document } from 'mongoose';
import type { PlayerBoard } from '@packages/zod-data-types';

export interface PlayerType extends PlayerProps, Document {
	_id: ObjectId;
	isAi: boolean;
	playerTurn: number;
}

export type PlayerProps = {
	name: string;
	board: PlayerBoard;
	ready: boolean;
	gameId: string;
};

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
	},
	{ timestamps: true }
);

// Expire player after 24 hours.
playerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export default model<PlayerType>('Player', playerSchema);
