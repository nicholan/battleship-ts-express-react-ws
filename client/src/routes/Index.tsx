import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormElements extends HTMLFormControlsCollection {
    playerName: HTMLInputElement;
    gameId: HTMLInputElement;
}

interface CustomForm extends HTMLFormElement {
    readonly elements: FormElements;
}

export function Index() {
    const navigate = useNavigate();
    const [gameCode, setGameCode] = useState<string>('');

    async function handleSubmit(event: FormEvent<CustomForm>) {
        event.preventDefault();
        const target = event.currentTarget;
        const formData = new FormData(target);
        const playerName = formData.get('playerName')?.toString().trim();
        const gameId = formData.get('gameId')?.toString().trim();

        if (!playerName) return;

        if (gameId) {
            await JoinGame(playerName, gameId);
            return;
        }
        await CreateGame(playerName);
        return;
    }

    async function JoinGame(playerName: string, gameId: string) {
        const response = await fetch('http://localhost:3000/join', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName, gameId })
        });

        if (response.status === 200) {
            navigate(`/${gameId}/${playerName}`);
        }
    }

    async function CreateGame(playerName: string) {
        const response = await fetch('http://localhost:3000/create', {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName })
        });
        const res: unknown = await response.json();

        if (res && typeof res === 'object' && 'gameId' in res && typeof res.gameId === 'string') {
            navigate(`/${res.gameId}/${playerName}`);
        }
        return;
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="playerName">Name:
                    <input type='text' name='playerName' required></input>
                </label>
                <label htmlFor="gameId">Code:
                    <input type='text' name='gameId' onChange={(e) => setGameCode(e.currentTarget.value)}></input>
                </label>
                <button type='submit'>{gameCode.length > 0 ? 'Join' : 'Create'}</button>
            </form>
        </div>
    );
}