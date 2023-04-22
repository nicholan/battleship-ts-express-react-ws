import React, { useState, useRef } from 'react';
import { useLockedBody } from '../../../hooks/useLockedBody';
import type { Coordinates } from '../../../../../server/src/trpc/zodTypes';
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
    const [locked, setLocked] = useLockedBody(false, 'root');
    const wheelTimeout = useRef(false);
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

    function handleWheel() {
        // Handles gameboard axis toggling with a wheel debounce.
        if(wheelTimeout.current) return;
        wheelTimeout.current = true;
        toggleAxis();
        setTimeout(() => {
            wheelTimeout.current = false;
        }, 400);
    }

    function playerBoardMouseEventHandler(coordinates: Coordinates, isClick?: boolean, isWheel?: boolean) {
        setLocked(true);
        if (!shipsRemaining) return;
        if (isWheel) {
            handleWheel();
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
        if (!isPlayerBoard) return;
        if (!shipsRemaining) return;
        clearCellStyles();
        updateBoard();
        locked ? setLocked(false) : undefined;
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
            onMouseOut={mouseLeaveHandler}
            onContextMenu={(e) => { e.preventDefault(); return false; }}>
            {squares}
        </div>
    );
}