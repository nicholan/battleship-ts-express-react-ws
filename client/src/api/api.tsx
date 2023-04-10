import { GameEvent } from '../types/shared';
import { Cell } from '../lib/Gameboard';

export async function uploadPlayerBoard(board: Cell[][], gameId: string, playerName: string) {
    const response = await fetch(`http://localhost:3000/${gameId}/${playerName}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            board,
            ready: true,
        })
    });
    return response.ok;
}

export async function uploadGameEvent(gameEvent: GameEvent, gameId: string) {
    const response = await fetch(`http://localhost:3000/${gameId}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            gameEvent,
        })
    });
    return response.ok;
}

export async function uploadStartGame(gameId: string) {
    const response = await fetch(`http://localhost:3000/${gameId}`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            startGame: true,
        })
    });
    return response.ok;
}