import type { Coordinates, CellStyle, CellState } from '@packages/zod-data-types';
import type { Cell } from './Cell.js';

type DrawProps = {
	bgColor: string;
	markerColor?: string;
};

const colorMap = {
	BLACK: 'rgb(0, 0, 0)',
	WHITE: 'rgb(255, 255, 255)',
	ORANGE: 'rgb(251, 146, 60)',
	SQUARE_BORDER: 'rgb(235,236,238)',
	CANVAS_BORDER: 'rgb(0, 0, 0)',
	INVALID: 'rgb(253, 211, 177)',
	VALID: 'rgb(230, 230, 230)',
	SELECTED_INVALID_MISS: 'rgb(251, 146, 60)',
	SELECTED_INVALID_SHIP: 'rgb(251, 146, 60)',
} as const;

const styleMap: { [key in CellStyle]: string } = {
	NONE: colorMap['WHITE'],
	INVALID: colorMap['ORANGE'],
	VALID: colorMap['VALID'],
	SELECTED_VALID: colorMap['VALID'],
	SELECTED_INVALID_MISS: colorMap['SELECTED_INVALID_MISS'],
	SELECTED_INVALID_SHIP: colorMap['SELECTED_INVALID_SHIP'],
} as const;

const crossStyle = {
	linewidth: 4,
	lineDivideBy: 3,
} as const;

const stateMap: { [key in CellState]: DrawProps } = {
	EMPTY: {
		bgColor: colorMap['WHITE'],
	},
	SHIP: {
		bgColor: colorMap['BLACK'],
	},
	SHOT_MISS: {
		bgColor: colorMap['WHITE'],
		markerColor: colorMap['BLACK'],
	},
	SHIP_HIT: {
		bgColor: colorMap['BLACK'],
		markerColor: colorMap['WHITE'],
	},
	SHIP_SUNK: {
		bgColor: colorMap['BLACK'],
		markerColor: colorMap['ORANGE'],
	},
} as const;

export class CanvasController {
	#size;
	#squareSize;
	#grid;
	#ctx: CanvasRenderingContext2D | null = null;

	constructor(size = 500, grid: Cell[][]) {
		this.#size = size;
		this.#squareSize = size / 10;
		this.#grid = grid;
	}

	drawBoard = (ctx: CanvasRenderingContext2D | null) => {
		if (!ctx) return;

		this.#ctx = ctx;
		for (let x = 0; x < this.#grid.length; x++) {
			for (let y = 0; y < this.#grid.length; y++) {
				const style = this.#grid[x][y].style;
				const state = this.#grid[x][y].state;

				this.#drawCellStyle({ x, y }, style);
				this.#drawCellState({ x, y }, state, style);
				this.#drawBorder({ x, y }, colorMap['SQUARE_BORDER'], this.#squareSize);
			}
		}
		this.#drawBorder({ x: 0, y: 0 }, colorMap['CANVAS_BORDER'], this.#size);
	};

	#drawBorder = ({ x, y }: Coordinates, color: string, size: number) => {
		if (!this.#ctx) return;
		this.#ctx.lineWidth = 1;
		this.#ctx.strokeStyle = color;
		this.#ctx.strokeRect(x * size, y * size, size, size);
	};

	#drawCellStyle = ({ x, y }: Coordinates, style: CellStyle) => {
		if (!this.#ctx) return;
		this.#ctx.fillStyle = styleMap[style];
		this.#ctx.fillRect(x * this.#squareSize, y * this.#squareSize, this.#squareSize, this.#squareSize);
	};

	#drawCellState = ({ x, y }: Coordinates, state: CellState, style: CellStyle) => {
		if (!this.#ctx) return;
		if (state === 'EMPTY') return;

		const { bgColor, markerColor } = stateMap[state];
		const hover = style === 'NONE' ? null : styleMap[style];

		this.#ctx.fillStyle = hover ? hover : bgColor;
		this.#ctx.fillRect(x * this.#squareSize, y * this.#squareSize, this.#squareSize, this.#squareSize);

		if (markerColor) {
			this.#drawCross({ x, y }, markerColor);
		}
	};

	#drawCross = ({ x, y }: Coordinates, color: string) => {
		if (!this.#ctx) return;
		const { lineDivideBy, linewidth } = crossStyle;
		this.#ctx.strokeStyle = color;
		this.#ctx.lineWidth = linewidth;

		// Draw the first diagonal line of the 'x' (start at top left, end bottom right).
		let startX = x * this.#squareSize + this.#squareSize / lineDivideBy;
		let startY = y * this.#squareSize + this.#squareSize / lineDivideBy;
		let endX = x * this.#squareSize + this.#squareSize - this.#squareSize / lineDivideBy;
		let endY = y * this.#squareSize + this.#squareSize - this.#squareSize / lineDivideBy;

		this.#ctx.beginPath();
		this.#ctx.moveTo(startX, startY);
		this.#ctx.lineTo(endX, endY);
		this.#ctx.stroke();

		// Draw the second diagonal line of the 'x' (start at top right, end bottom left).
		startX = x * this.#squareSize + this.#squareSize - this.#squareSize / lineDivideBy;
		startY = y * this.#squareSize + this.#squareSize / lineDivideBy;
		endX = x * this.#squareSize + this.#squareSize / lineDivideBy;
		endY = y * this.#squareSize + this.#squareSize - this.#squareSize / lineDivideBy;

		this.#ctx.beginPath();
		this.#ctx.moveTo(startX, startY);
		this.#ctx.lineTo(endX, endY);
		this.#ctx.stroke();
	};
}
