import type { GameState } from '@packages/zod-data-types';
import { ReactNode } from 'react';

type Nametag = {
	gridArea: string;
	isPlayerTurn: boolean;
	gameState: GameState;
	children: ReactNode;
};

export function Nametag({ gridArea, isPlayerTurn, gameState, children }: Nametag) {
	const gameStarted = gameState === 'STARTED';

	return (
		<div
			className={`tracking-wider font-bebas-neue text-2xl text-white select-none text-center items-center grid shadow text-shadow shadow-black/20 ${gridArea} ${
				gameStarted && isPlayerTurn ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-neutral-700'
			}`}
		>
			{children ?? 'Player'}
		</div>
	);
}
