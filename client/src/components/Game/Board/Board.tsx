import { useState, useRef } from 'react';
import { useLockedBody } from '../../../hooks/useLockedBody.js';
import type { Coordinates, GameState } from '@packages/zod-data-types';
import { Square } from '../Square/Square.js';
import { playerGameboard, enemyGameboard } from '../../../lib/Gameboard.js';

type Props = {
	isPlayerBoard: boolean;
	shipsRemaining?: boolean;
	setShipsRemaining?: (val: boolean) => void;
	attack?: (coordinates: Coordinates) => void;
	gameState: GameState;
	gridArea: string;
};

export function Board({ isPlayerBoard, shipsRemaining, gameState, gridArea, setShipsRemaining, attack }: Props) {
	const { getShipLength, getGrid, clearCellStyles, getNodeStack, placeShip, isValidPlacement, toggleAxis } =
		isPlayerBoard ? playerGameboard : enemyGameboard;
	const [grid, setGrid] = useState(getGrid());
	const [locked, setLocked] = useLockedBody(false, 'root');
	const wheelTimeout = useRef(false);
	const mouseEventHandler = isPlayerBoard ? playerBoardMouseEventHandler : enemyBoardMouseEventHandler;
	const sKey = isPlayerBoard ? 'p' : 'e';

	const squares = grid.map((arr) => {
		return arr.map(({ state, style, coordinates: { x, y } }) => {
			return (
				<Square
					key={`${x}${y}${state}${sKey}${style}`}
					isPlayerBoard={isPlayerBoard}
					gameState={gameState}
					state={state}
					style={style}
					coordinates={{ x, y }}
					mouseEventHandler={mouseEventHandler}
				/>
			);
		});
	});

	function handleWheel() {
		// Handles gameboard axis toggling with a wheel debounce.
		if (wheelTimeout.current) return;
		wheelTimeout.current = true;
		toggleAxis();
		setTimeout(() => {
			wheelTimeout.current = false;
		}, 400);
	}

	function playerBoardMouseEventHandler(coordinates: Coordinates, isClick?: boolean, isWheel?: boolean) {
		setLocked(true);
		if (gameState !== 'NOT_STARTED') return;
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
		if (gameState !== 'STARTED') return;
		if (!isClick) return;
		if (grid[x][y].state !== 'EMPTY') return;
		attack && attack({ x, y });
	}

	function mouseLeaveHandler() {
		if (gameState !== 'NOT_STARTED') return;
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
			nodes.forEach((node) => {
				const { x, y } = node.coordinates;
				copyGrid[x][y].style = node.style;
			});
			return copyGrid;
		});
	}

	return (
		<div
			className={`bg-white/90 border-black border select-none grid shadow-md grid-cols-10 ${gridArea}`}
			onMouseLeave={mouseLeaveHandler}
			onMouseOut={mouseLeaveHandler}
			onContextMenu={(e) => {
				e.preventDefault();
				return false;
			}}
		>
			{squares}
		</div>
	);
}
