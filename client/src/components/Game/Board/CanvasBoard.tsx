import { useRef, useEffect, useState, type ComponentPropsWithoutRef } from 'react';
import type { Coordinates, GameState } from '@packages/zod-data-types';
import { zodCoordinates } from '@packages/zod-data-types';
import { playerGameboard, enemyGameboard } from '../../../lib/Gameboard.js';
import { CanvasController } from '../../../lib/CanvasController.js';
import classNames from 'classnames';

type CanvasProps = {
	isPlayerBoard: boolean;
	size: BoardSize;
	gameState: GameState;
	isPlayerTurn: boolean;
	attack?: (coordinates: Coordinates) => void;
	setShipsRemaining?: (val: boolean) => void;
	gameEventsLen: number;
} & ComponentPropsWithoutRef<'canvas'>;

export type BoardSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg';

export const boardSizeMap: { [key in BoardSize]: number } = {
	xxs: 350,
	xs: 400,
	sm: 500,
	md: 380,
	lg: 460,
} as const;

export function CanvasBoard({
	setShipsRemaining,
	isPlayerTurn,
	attack,
	gameState,
	isPlayerBoard,
	className,
	size,
	gameEventsLen,
}: CanvasProps) {
	const {
		getGrid,
		isValidPlacement,
		isValidSelection,
		clearCellStyles,
		toggleAxis,
		placeShip,
		getShipLength,
		getLastHitCoordinate,
	} = isPlayerBoard ? playerGameboard : enemyGameboard;

	const [coordinates, setCoordinates] = useState<Coordinates | null>(
		!isPlayerBoard && isPlayerTurn ? getLastHitCoordinate() : null
	);

	const coordinatesRef = useRef<Coordinates | null>(null);

	const grid = getGrid();
	const { drawBoard } = new CanvasController(boardSizeMap[size], grid);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

	const getCoordinates = ({ pageX, pageY }: React.MouseEvent<HTMLCanvasElement, MouseEvent>): Coordinates | null => {
		if (!canvasRef.current) {
			return null;
		}

		const { offsetLeft, offsetTop } = canvasRef.current;
		const x = Math.floor(((pageX - offsetLeft) / boardSizeMap[size]) * 10);
		const y = Math.floor(((pageY - offsetTop) / boardSizeMap[size]) * 10);

		return {
			x: x < 0 ? 0 : x,
			y: y < 0 ? 0 : y,
		};
	};

	const update = () => {
		if (!coordinatesRef.current) return;
		if (!zodCoordinates.safeParse(coordinatesRef.current).success) return;

		if (gameState === 'NOT_STARTED' && isPlayerBoard) {
			isValidPlacement(coordinatesRef.current);
		}

		if (gameState === 'STARTED' && isPlayerTurn) {
			isValidSelection(coordinatesRef.current);
		}

		if (gameState === 'STARTED' && !isPlayerTurn) {
			clearCellStyles();
		}

		drawBoard(canvasCtxRef.current);
	};

	const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
		if (getShipLength() < 1) return;

		const pos = getCoordinates(event);
		if (pos === null) return;

		if (!coordinates) {
			setCoordinates(pos);
			return;
		}

		if (pos.x === coordinates.x && pos.y === coordinates.y) return;
		setCoordinates(pos);
	};

	const playerWheelHandler = () => {
		if (getShipLength() < 1) return;
		toggleAxis();
		update();
	};

	const mouseLeaveHandler = () => {
		if (getShipLength() < 1) return;

		if (gameState === 'NOT_STARTED') {
			setCoordinates(null);
		}

		if (gameState === 'STARTED') {
			setCoordinates(getLastHitCoordinate());
		}

		clearCellStyles();
		drawBoard(canvasCtxRef.current);
	};

	const playerBoardClickHandler = () => {
		if (!coordinatesRef.current) return;
		if (gameState !== 'NOT_STARTED') return;

		if (getShipLength() > 0) {
			placeShip(coordinatesRef.current);
		}

		if (getShipLength() < 1) {
			setShipsRemaining && setShipsRemaining(false);
		}
		update();
	};

	const enemyBoardClickHandler = (event?: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
		if (!coordinatesRef.current) return;
		if (gameState !== 'STARTED') return;

		const pos = event ? getCoordinates(event) : coordinatesRef.current;
		if (!pos) return;

		if (grid[pos.x][pos.y].state === 'EMPTY') {
			attack && attack(pos);
			clearCellStyles();
		}
	};

	const playerKeypressHandler = ({ key }: KeyboardEvent) => {
		if (!Object.hasOwn(keyboardDispatch, key)) return;
		if (getShipLength() < 1) return;

		if (!coordinatesRef.current) {
			setCoordinates((prev) => (prev ? prev : { x: 0, y: 0 }));
			return;
		}
		keyboardDispatch[key as keyof typeof keyboardDispatch]();
	};

	const enemyKeypressHandler = ({ key }: KeyboardEvent) => {
		if (!Object.hasOwn(keyboardDispatch, key)) return;
		if (gameState !== 'STARTED' || !isPlayerTurn) return;

		const lastHit = getLastHitCoordinate();
		if (!coordinatesRef.current) {
			setCoordinates((prev) => (prev ? prev : lastHit ?? { x: 0, y: 0 }));
			return;
		}

		keyboardDispatch[key as keyof typeof keyboardDispatch]();
	};

	const handleKeyboardEvent = isPlayerBoard ? playerKeypressHandler : enemyKeypressHandler;
	const handleClick = isPlayerBoard ? playerBoardClickHandler : enemyBoardClickHandler;
	const handleWheel = isPlayerBoard ? playerWheelHandler : () => void 0;

	const keyboardDispatch = {
		Enter: handleClick,
		ArrowDown: () =>
			setCoordinates((prev) => {
				return prev ? { x: prev.x, y: prev.y <= 9 ? prev.y++ : 0 } : prev;
			}),
		ArrowLeft: () =>
			setCoordinates((prev) => {
				return prev ? { x: prev.x >= 0 ? prev.x-- : 9, y: prev.y } : prev;
			}),
		ArrowRight: () =>
			setCoordinates((prev) => {
				return prev ? { x: prev.x <= 9 ? prev.x++ : 0, y: prev.y } : prev;
			}),
		ArrowUp: () =>
			setCoordinates((prev) => {
				return prev ? { x: prev.x, y: prev.y >= 0 ? prev.y-- : 9 } : prev;
			}),
		Shift: handleWheel,
	} as const;

	useEffect(() => {
		// Initialize
		if (canvasRef.current) {
			canvasCtxRef.current = canvasRef.current.getContext('2d');
			drawBoard(canvasCtxRef.current);
		}
	}, [gameEventsLen, size]);

	useEffect(() => {
		if (!canvasCtxRef.current) return;
		if (getShipLength() < 1) return;

		coordinatesRef.current = coordinates;

		update();
	}, [coordinates, gameEventsLen, size]);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyboardEvent);

		return () => {
			window.removeEventListener('keydown', handleKeyboardEvent);
		};
	}, []);

	return (
		<canvas
			width={boardSizeMap[size]}
			height={boardSizeMap[size]}
			ref={canvasRef}
			className={classNames([className], ['select-none'], ['shadow dark:shadow-none'])}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseMove}
			onClick={handleClick}
			onMouseLeave={mouseLeaveHandler}
			onWheel={handleWheel}
		></canvas>
	);
}
