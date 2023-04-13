import React, { useState } from 'react';
import { Coordinates } from '../../../types/shared';
import { Square } from '../Square/Square';
import { playerGameboard, enemyGameboard } from '../../../lib/Gameboard';
import './Board.css';

type Props = {
    isPlayerBoard: boolean,
    isTurn: boolean,
    shipsRemaining?: boolean,
    setShipsRemaining?: (val: boolean) => void,
    attack?: (coordinates: Coordinates) => void,
}

export function Board(
    {
        isPlayerBoard,
        shipsRemaining,
        setShipsRemaining,
        attack
    }: Props) {

    const { getShipLength, getGrid, clearCellStyles, getNodeStack, placeShip, isValidPlacement, toggleAxis } = isPlayerBoard ? playerGameboard : enemyGameboard;
    const [grid, setGrid] = useState(getGrid());
    const style = isPlayerBoard ? 'player_board' : 'enemy_board';
    const mouseEventHandler = isPlayerBoard ? playerBoardMouseEventHandler : enemyBoardMouseEventHandler;

    const squares = grid.map((arr) => {
        return arr.map((cell) => {
            return (
                <Square
                    key={`${cell.coordinates.x}${cell.coordinates.y}`}
                    state={cell.state}
                    style={cell.style}
                    coordinates={cell.coordinates}
                    mouseEventHandler={mouseEventHandler}
                />
            );
        });
    });

    function playerBoardMouseEventHandler(coordinates: Coordinates, isClick?: boolean, isWheel?: boolean) {
        if (!shipsRemaining) return;
        if (isWheel) {
            toggleAxis();
        }
        if (isClick) {
            placeShip(coordinates);
        } else {
            isValidPlacement(coordinates);
        }
        if (getShipLength() === 0) {
            setShipsRemaining && setShipsRemaining(false);
        }
        updateBoard();
    }

    function enemyBoardMouseEventHandler({ x, y }: Coordinates, isClick?: boolean) {
        if (!isClick) return;
        if (grid[x][y].state !== 'EMPTY') return;
        attack && attack({ x, y });
    }

    function mouseLeaveHandler() {
        if (!isPlayerBoard || !shipsRemaining) return;
        clearCellStyles();
        updateBoard();
    }

    function updateBoard() {
        const nodes = getNodeStack();
        setGrid((prev) => {
            const copyGrid = [...prev];
            nodes.forEach(node => {
                const { x, y } = node.coordinates;
                copyGrid[x][y].style = node.style;
            });
            return copyGrid;
        });
    }

    return (
        <div
            className={`board ${style}`}
            onMouseLeave={mouseLeaveHandler}
            onMouseOut={mouseLeaveHandler}>
            {squares}
        </div>
    );
}