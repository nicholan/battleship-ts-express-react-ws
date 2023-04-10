import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FormElements extends HTMLFormControlsCollection {
    playerName: HTMLInputElement;
    gameId: HTMLInputElement;
}

interface CustomForm extends HTMLFormElement {
    readonly elements: FormElements;
}

export function Join() {
    const navigate = useNavigate();
    // const [error, setError] = useState<null | string>(null);

    async function handleSubmit(event: FormEvent<CustomForm>) {
        event.preventDefault();
        const target = event.currentTarget;
        const formData = new FormData(target);
        const playerName = formData.get('playerName')?.toString();
        const gameId = formData.get('gameId')?.toString();

        if (!gameId || !playerName) return;

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

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="playerName">Name: <input type='text' name='playerName' required></input></label>
                <label htmlFor="gameId">Code: <input type='text' name='gameId' required></input></label>
                <button>Submit</button>
            </form>
        </div>
    );
}