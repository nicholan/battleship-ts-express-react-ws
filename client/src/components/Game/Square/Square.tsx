import type { Coordinates, CellStyle, CellState, GameState } from '@packages/zod-data-types';

type Props = {
	coordinates: Coordinates;
	style?: CellStyle;
	state: CellState;
	mouseEventHandler: (coordinates: Coordinates, isClick?: boolean, isWheel?: boolean) => void;
	isPlayerBoard: boolean;
	gameState: GameState;
};

export function Square({ mouseEventHandler, coordinates, style, state, isPlayerBoard, gameState }: Props) {
	const marker = '×';

	const shipCSS = ['!bg-black/90', 'text-white'];
	const sunkCSS = ['!text-orange-400'];
	const validPlacement = 'bg-black/10';
	const invalidPlacement = 'bg-orange-400/40';

	let content: typeof marker | '';
	let stateStyle: string[];
	let placementValidationStyle;

	switch (style) {
		case 'INVALID':
			placementValidationStyle = invalidPlacement;
			break;
		case 'VALID':
			placementValidationStyle = validPlacement;
			break;
		default:
			placementValidationStyle = '';
			break;
	}

	switch (state) {
		case 'EMPTY':
			content = '';
			stateStyle = [];
			break;
		case 'SHIP':
			content = '';
			stateStyle = shipCSS;
			break;
		case 'SHOT_MISS':
			content = marker;
			stateStyle = [];
			break;
		case 'SHIP_HIT':
			content = marker;
			stateStyle = shipCSS;
			break;
		case 'SHIP_SUNK':
			content = marker;
			stateStyle = shipCSS.concat(sunkCSS);
			break;
	}

	return (
		<div
			className={`font-roboto text-3xl grid place-items-center !leading-[0px] border border-gray-700/10 ${placementValidationStyle} ${stateStyle.join(
				' '
			)} ${!isPlayerBoard && gameState === 'STARTED' ? 'hover:bg-gray-700/20' : ''}`}
			onWheel={() => {
				mouseEventHandler(coordinates, false, true);
			}}
			onClick={() => {
				mouseEventHandler(coordinates, true, false);
			}}
			onMouseEnter={() => {
				mouseEventHandler(coordinates, false, false);
			}}
		>
			{content}
		</div>
	);
}
