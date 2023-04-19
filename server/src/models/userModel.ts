import { Schema, ObjectId, model } from 'mongoose';
import { PlayerBoard } from '../trpc/zodTypes';

export type PlayerType = {
    _id: ObjectId,
    name: string,
    board: PlayerBoard,
    gameId: string,
    playerTurn: number,
    ready: boolean,
};

const playerSchema = new Schema({
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
    }
});

export const Player = model<PlayerType>('Player', playerSchema);