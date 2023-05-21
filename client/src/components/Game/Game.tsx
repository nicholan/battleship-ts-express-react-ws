import { useEffect, useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { CoordinatesBar } from './CoordinatesBar/CoordinatesBar.js';
import type { PlayerBoard, GameEvent, Coordinates, GameState } from '@packages/zod-data-types';
import { Nametag } from './Nametag/Nametag.js';
import { CanvasBoard } from './Board/CanvasBoard.js';
import { Button } from '../Buttons/Button.js';
import { playerGameboard, enemyGameboard, aiGameboard } from '../../lib/Gameboard.js';
import { ai } from '../../lib/AiController.js';
import { InvitePlayerForm } from '../Forms/InvitePlayerForm.js';
import { Modal } from '../Modal/Modal.js';
import classNames from 'classnames';
import { useWindowSize } from '../../hooks/useWindowSize.js';
import type { BoardSize } from './Board/CanvasBoard.js';

type Props = {
	playerId: string;
	playerName: string;
	enemyName: string | null | undefined;
	board: PlayerBoard;
	gameEvents: GameEvent[];
	ready: boolean;
	isPlayerTurn: boolean;
	readyPlayer: () => Promise<boolean>;
	attack: (coordinates: Coordinates) => void;
	gameState: GameState;
	invitePlayer?: (name: string) => void;
	aiBoard: PlayerBoard;
};

export function Game({
	playerId,
	playerName,
	enemyName,
	board,
	gameEvents,
	ready,
	isPlayerTurn,
	gameState,
	attack,
	readyPlayer,
	invitePlayer,
	aiBoard,
}: Props) {
	const playerEvents = gameEvents.filter((evt) => {
		return evt.playerId === playerId;
	});
	const enemyEvents = gameEvents.filter((evt) => {
		return evt.playerId !== playerId;
	});

	playerGameboard.buildPlayerBoard(playerEvents, board);
	enemyGameboard.buildEnemyBoard(enemyEvents);

	// Player is playing against ai in offline game.
	aiBoard.length > 0 && aiGameboard.buildPlayerBoard(enemyEvents, aiBoard);
	aiBoard.length > 0 && ai.calculateMoveSet(playerEvents);

	const [shipsRemaining, setShipsRemaining] = useState(playerGameboard.getShipLength() === 0 ? false : true);
	const [dateKey, setDateKey] = useState(new Date().getTime());
	const [inviteModalVisible, setInviteModalVisible] = useState(false);
	const { width } = useWindowSize(100);
	const [size, setSize] = useState<BoardSize>('lg');

	function resetBoard() {
		playerGameboard.reset();
		setShipsRemaining(true);
		setDateKey(new Date().getTime());
	}

	function randomizeBoard() {
		playerGameboard.populateBoard();
		setShipsRemaining(false);
		setDateKey(new Date().getTime());
	}

	const isSetupPhase = gameState === 'NOT_STARTED';

	useEffect(() => {
		if (width < 410) {
			setSize('xxs');
			return;
		}
		if (width < 510) {
			setSize('xs');
			return;
		}
		if (width < 768) {
			setSize('sm');
			return;
		}
		if (width < 1024) {
			setSize('md');
			return;
		}
		setSize('lg');
		return;
	}, [width]);

	return (
		<>
			{inviteModalVisible && (
				<Modal onClose={() => setInviteModalVisible(false)}>
					<InvitePlayerForm
						closeModal={() => setInviteModalVisible(false)}
						invitePlayer={invitePlayer && invitePlayer}
					/>
				</Modal>
			)}
			<div
				className={classNames(
					['grid mx-auto'],
					['pt-4 md:py-4'],
					['row-auto grid-cols-1'],
					['md:grid-rows-21 md:grid-cols-20'],
					['lg:grid-rows-22 lg:grid-cols-21']
				)}
			>
				{/* ----------- LETTER / NUMBER COORDINATES ----------- */}
				{size === 'lg' && (
					<>
						<CoordinatesBar
							type="num"
							className={classNames(['flex-row'], ['row-start-1 col-start-2 row-end-2 col-end-12'])}
						/>
						<CoordinatesBar
							type="letter"
							className={classNames(['flex-col'], ['row-start-2 col-start-1 row-end-[12] col-end-2'])}
						/>
						<CoordinatesBar
							type="num"
							className={classNames(
								['flex-row'],
								['row-start-[11] col-start-12 row-end-[12] col-end-[22]']
							)}
						/>
						<CoordinatesBar
							type="letter"
							className={classNames(
								['flex-col'],
								['row-start-[12] col-start-11 row-end-[22] col-end-[12]']
							)}
						/>
					</>
				)}

				{/* ----------- NAMETAGS ----------- */}
				<Nametag
					active={gameState === 'STARTED' && isPlayerTurn}
					className={classNames(
						['mb-3 md:mb-0'],
						['row-start-3 col-start-1 row-end-4 col-end-2'],
						['md:row-start-[11] md:col-start-2 md:row-end-[12] md:col-end-[10]'],
						['lg:row-start-[12] lg:col-start-3 lg:row-end-[13] lg:col-end-[11]']
					)}
				>
					{playerName}
				</Nametag>
				<Nametag
					active={gameState === 'STARTED' && !isPlayerTurn}
					className={classNames(
						['row-start-5 col-start-1 row-end-6 col-end-2'],
						['md:row-start-[21] md:col-start-12 md:row-end-[22] md:col-end-[20]'],
						['lg:row-start-[22] lg:col-start-13 lg:row-end-[23] lg:col-end-[21]']
					)}
				>
					{enemyName}
				</Nametag>

				{/* ----------- PLAYER BOARD ----------- */}
				<CanvasBoard
					key={dateKey.toString(36)}
					gameEventsLen={gameEvents.length}
					className={classNames(
						['row-start-2 col-start-1 row-end-3 col-end-2'],
						['md:row-start-1 md:col-start-1 md:row-end-11 md:col-end-11'],
						['lg:row-start-2 lg:col-start-2 lg:row-end-12 lg:col-end-12']
					)}
					isPlayerBoard={true}
					isPlayerTurn={isPlayerTurn}
					size={size}
					setShipsRemaining={setShipsRemaining}
					gameState={gameState}
				/>

				{/* ----------- ENEMY BOARD ----------- */}
				<CanvasBoard
					key={`${gameState}_enemy_board`}
					gameEventsLen={gameEvents.length}
					className={classNames(
						['row-start-4 col-start-1 row-end-5 col-end-2'],
						['md:row-start-[11] md:col-start-11 md:row-end-[21] md:col-end-[21]'],
						['lg:row-start-[12] lg:col-start-12 lg:row-end-[22] lg:col-end-[22]']
					)}
					isPlayerBoard={false}
					isPlayerTurn={isPlayerTurn}
					size={size}
					attack={attack}
					gameState={gameState}
				/>

				{/* ----------- RESET, RANDOM, KBD CONTROLS CONTAINER ----------- */}

				<div
					className={classNames(
						['grid'],
						[!ready && 'py-3'],
						['md:py-0'],
						['row-start-1 col-start-1 row-end-2 col-end-2'],
						['md:row-start-1 md:col-start-11 md:row-end-[11] md:col-end-[21]'],
						['lg:row-start-2 lg:col-start-12 lg:row-end-[11] lg:col-end-[22]']
					)}
				>
					{!ready && (
						<div
							className={classNames(['flex gap-4 flex-row justify-center'], ['self-center lg:self-end'])}
						>
							<>
								<Button type="button" onClick={randomizeBoard}>
									Random
								</Button>
								<Button disabled={shipsRemaining} type="reset" onClick={resetBoard}>
									Reset
								</Button>
							</>
						</div>
					)}

					{size === 'lg' && (
						<div
							className={classNames(
								['flex flex-col gap-2 place-self-center'],
								['p-4 border rounded-sm'],
								['rounded border dark:border-neutral-300/10']
							)}
						>
							<div className="text-sm font-semibold font-mono dark:text-white">
								<Kbd>Arrow keys</Kbd> Navigate board
							</div>
							{isSetupPhase && (
								<div className="text-sm font-semibold font-mono dark:text-white">
									<Kbd>Shift</Kbd> Change ship axis
								</div>
							)}
							<div className="text-sm font-semibold font-mono dark:text-white">
								<Kbd>Enter</Kbd> {isSetupPhase ? 'Place ship' : 'Attack'}
							</div>
						</div>
					)}
				</div>

				{/* ----------- READY, TURN INDICATOR CONTAINER ----------- */}
				<div
					className={classNames(
						['grid'],
						['py-3 md:py-0'],
						['row-start-6 col-start-1 row-end-7 col-end-2'],
						['md:row-start-[12] md:col-start-2 md:row-end-[22] md:col-end-[10]'],
						['lg:row-start-[13] lg:col-start-3 lg:row-end-[22] lg:col-end-[11]']
					)}
				>
					<div className={classNames({ 'flex-col': ready }, ['flex items-center gap-4 place-self-center'])}>
						{!enemyName && (
							<Button disabled={inviteModalVisible} onClick={() => setInviteModalVisible(true)}>
								Invite
							</Button>
						)}
						{isSetupPhase && !shipsRemaining && !ready && (
							<Button
								onClick={async () => {
									await readyPlayer();
								}}
								disabled={ready}
								type="submit"
							>
								{aiBoard.length > 0 ? 'Start' : 'Ready'}
							</Button>
						)}
						{isSetupPhase && !shipsRemaining && ready && <Text>Waiting for {enemyName ?? 'Player 2'}</Text>}
						{gameState === 'STARTED' &&
							(isPlayerTurn ? <Text color="text-orange-400">Your turn</Text> : <Text>Enemy turn</Text>)}
					</div>
				</div>
			</div>
		</>
	);
}

interface TextProps extends ComponentPropsWithoutRef<'p'> {
	color?: string;
}

function Text({ children, color, className, ...props }: TextProps) {
	return (
		<p
			className={classNames(
				['text-xl md:text-2xl lg:text-3xl'],
				[`tracking-wide font-staatliches`],
				[color ? color : 'text-black dark:text-white'],
				[className]
			)}
			{...props}
		>
			{children}
		</p>
	);
}

function Kbd({ children, ...props }: ComponentPropsWithoutRef<'kbd'>) {
	return (
		<kbd
			className="inline-block px-2 py-1.5 text-xs font-semibold rounded-lg bg-neutral-700 text-gray-100 border border-neutral-600 shadow"
			{...props}
		>
			{children}
		</kbd>
	);
}
