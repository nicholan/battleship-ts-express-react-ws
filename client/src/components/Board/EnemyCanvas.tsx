import classNames from "classnames";
import { useEffect, useRef } from "react";
import type { ComponentPropsWithoutRef, KeyboardEvent } from "react";

import type { Coordinates, GameState } from "@packages/zod-data-types";
import { type BoardSize, KEYS, boardSizeMap } from "./utilities.js";

import { CanvasController } from "../../lib/Canvas/CanvasController.js";
import { enemyGameboard } from "../../lib/Gameboard/Gameboard.js";
import { getCoordinates } from "./utilities.js";

type EnemyCanvasProps = {
	size: BoardSize;
	gameState: GameState;
	isPlayerTurn: boolean;
	attack: (coordinates: Coordinates) => void;
} & ComponentPropsWithoutRef<"canvas">;

export function EnemyCanvas({
	isPlayerTurn,
	attack,
	gameState,
	className,
	size,
}: EnemyCanvasProps) {
	const {
		getGrid,
		isValidSelection,
		clearCellStyles,
		getSelectedCoordinate,
		setSelectedCoordinate,
	} = enemyGameboard;

	const grid = getGrid();
	const { drawBoard } = new CanvasController(boardSizeMap[size], grid);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

	function update() {
		if (!canvasCtxRef.current) return;

		if (gameState === "STARTED" && isPlayerTurn) {
			isValidSelection(getSelectedCoordinate());
		}

		if (gameState === "STARTED" && !isPlayerTurn) {
			clearCellStyles();
		}

		drawBoard(canvasCtxRef.current);
	}

	function handleMouseMove(
		event: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
	) {
		if (!isPlayerTurn) return;

		const coordinates = getCoordinates(
			event,
			canvasRef.current,
			boardSizeMap[size],
		);
		if (coordinates === null) return;

		setSelectedCoordinate({ coordinates });
		update();
	}

	function mouseLeaveHandler() {
		clearCellStyles();
		drawBoard(canvasCtxRef.current);
	}

	function boardClickHandler() {
		if (gameState !== "STARTED") return;

		const coordinates = getSelectedCoordinate();

		if (isValidSelection(coordinates)) {
			attack(coordinates);
			clearCellStyles();
		}
	}

	function keyPressHandler({ code }: KeyboardEvent<HTMLCanvasElement>) {
		if (gameState !== "STARTED" || !isPlayerTurn) return;

		if (KEYS.includes(code) && canvasRef.current) {
			canvasRef.current.focus();
		}

		if (code === "KeyE") {
			boardClickHandler();
		}

		setSelectedCoordinate({ code });
		update();
	}

	useEffect(() => {
		if (canvasRef.current) {
			canvasCtxRef.current = canvasRef.current.getContext("2d");
			drawBoard(canvasCtxRef.current);
		}

		update();

		if (gameState === "STARTED" && canvasRef.current) {
			canvasRef.current.focus();
		}
	});

	return (
		<canvas
			tabIndex={0}
			onKeyDown={keyPressHandler}
			width={boardSizeMap[size]}
			height={boardSizeMap[size]}
			ref={canvasRef}
			className={classNames(
				[className],
				["select-none"],
				["shadow dark:shadow-none"],
			)}
			onMouseMove={handleMouseMove}
			onMouseEnter={handleMouseMove}
			onClick={boardClickHandler}
			onMouseLeave={mouseLeaveHandler}
		/>
	);
}
