import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Root() {
    return (
        <>
            <header>
                Battleship
            </header>
            <div id="detail">
                <Outlet />
            </div>
            <footer>
                Nicholas Anttila 2023
            </footer>
        </>
    );
}