import React from 'react';
import { Link } from 'react-router-dom';

export function Index() {
    return (
        <div className="App">
            <p>This is index!</p>
            <Link to='create'>New Game</Link>
            <Link to='join'>Join Game</Link>
        </div>
    );
}