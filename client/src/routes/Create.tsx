import React, { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface FormElements extends HTMLFormControlsCollection {
    name: HTMLInputElement;
}

interface CustomForm extends HTMLFormElement {
    readonly elements: FormElements;
}

export function Create() {
    const navigate = useNavigate();

    async function handleSubmit(event: FormEvent<CustomForm>) {
        event.preventDefault();
        const target = event.currentTarget;
        const formData = new FormData(target);
        const playerName = formData.get('playerName')?.toString().trim();

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
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type='text' name='playerName' ></input>
                <button>Submit</button>
            </form>
            <Link to='/'>Home</Link>
            <Link to='../join'>Join Game</Link>
        </div>
    );
}