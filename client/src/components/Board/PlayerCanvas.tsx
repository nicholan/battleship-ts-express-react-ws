import classNames from "classnames";
import { useEffect, useRef } from "react";
import type { ComponentPropsWithoutRef, KeyboardEvent } from "react";

import type { GameState } from "@packages/zod-data-types";
import { type BoardSize, KEYS, boardSizeMap } from "./utilities.js";

import { CanvasController } from "../../lib/Canvas/CanvasController.js";
import { playerGameboard } from "../../lib/Gameboard/Gameboard.js";
import { getCoordinates } from "./utilities.js";

type PlayerCanvasProps = {
	size: BoardSize;
	gameState: GameState;
	setShipsRemaining: (val: boolean) => void;
} & ComponentPropsWithoutRef<"canvas">;

export function PlayerCanvas({
	setShipsRemaining,
	gameState,
	className,
	size,
}: PlayerCanvasProps) {
	const {
		getGrid,
		isValidPlacement,
		clearCellStyles,
		toggleAxis,
		placeShip,
		getShipLength,
		setSelectedCoordinate,
	} = playerGameboard;

	const grid = getGrid();
	const { drawBoard } = new CanvasController(boardSizeMap[size], grid);

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

	function update() {
		if (!canvasCtxRef.current) return;

		if (gameState === "NOT_STARTED") {
			isValidPlacement();
		}

		drawBoard(canvasCtxRef.current);
	}

	function handleMouseMove(
		event: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
	) {
		if (getShipLength() < 1) return;

		const coordinates = getCoordinates(
			event,
			canvasRef.current,
			boardSizeMap[size],
		);
		if (coordinates === null) return;

		setSelectedCoordinate({ coordinates });
		update();
	}

	function wheelHandler() {
		if (getShipLength() < 1) return;
		toggleAxis();
		update();
	}

	function mouseLeaveHandler() {
		if (getShipLength() < 1) return;

		clearCellStyles();
		drawBoard(canvasCtxRef.current);
	}

	function boardClickHandler() {
		if (gameState !== "NOT_STARTED") return;

		if (getShipLength() > 0) {
			placeShip();
		}

		if (getShipLength() < 1) {
			setShipsRemaining(false);
		}

		update();
	}

	function keyPressHandler({ code }: KeyboardEvent<HTMLCanvasElement>) {
		if (getShipLength() < 1) return;

		if (KEYS.includes(code) && canvasRef.current) {
			canvasRef.current.focus();
		}

		if (code === "KeyQ") {
			wheelHandler();
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

		if (getShipLength() < 1) return;

		update();

		if (gameState === "NOT_STARTED" && canvasRef.current) {
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
			onWheel={wheelHandler}
		/>
	);
}
