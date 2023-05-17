import { useState } from 'react';
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
	aiGameboard.buildPlayerBoard(enemyEvents, aiBoard);
	ai.calculateMoveSet(playerEvents);
	enemyGameboard.buildEnemyBoard(enemyEvents);

	const [shipsRemaining, setShipsRemaining] = useState(playerGameboard.getShipLength() === 0 ? false : true);
	const [dateKey, setDateKey] = useState(new Date().getTime());
	const [inviteModalVisible, setInviteModalVisible] = useState(false);

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

	return (
		// Game wrapper is a 21 x 22 grid of squares; elements are placed using gridAreas defined in global.css
		// TODO: Media queries.
		<>
			{inviteModalVisible && (
				<Modal onClose={() => setInviteModalVisible(false)}>
					<div className="text-center font-bebas-neue">
						<p className="text-2xl tracking-wider">Invite a player</p>
						<InvitePlayerForm
							closeModal={() => setInviteModalVisible(false)}
							invitePlayer={invitePlayer && invitePlayer}
						/>
					</div>
				</Modal>
			)}
			<div className="game_wrapper">
				{/* Create coordinate bars (numbers/letters) for each player. */}
				<CoordinatesBar type="num" axis="row" gridArea="coordinates_row_p1" />
				<CoordinatesBar type="letter" axis="column" gridArea="coordinates_col_p1" />
				<CoordinatesBar type="num" axis="row" gridArea="coordinates_row_p2" />
				<CoordinatesBar type="letter" axis="column" gridArea="coordinates_col_p2" />

				{/* Player nametags. */}
				<Nametag gridArea="player_name" isPlayerTurn={isPlayerTurn} gameState={gameState}>
					{playerName}
				</Nametag>
				<Nametag gridArea="enemy_name" isPlayerTurn={!isPlayerTurn} gameState={gameState}>
					{enemyName}
				</Nametag>

				{/* Player board. */}
				<CanvasBoard
					key={dateKey.toString(36)}
					gameEventsLen={gameEvents.length}
					isPlayerBoard={true}
					isPlayerTurn={isPlayerTurn}
					gridArea="player_board"
					size={500}
					setShipsRemaining={setShipsRemaining}
					gameState={gameState}
				/>

				{/* Enemy board. */}
				<CanvasBoard
					key={gameState}
					gameEventsLen={gameEvents.length}
					isPlayerBoard={false}
					isPlayerTurn={isPlayerTurn}
					gridArea="enemy_board"
					size={500}
					attack={attack}
					gameState={gameState}
				/>

				{/* Reset and randomize buttons, controls info. */}
				<div className="box_top_right grid auto-rows-fr">
					{!ready && isSetupPhase && (
						<div className="flex gap-4 flex-row justify-center self-end">
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
					<div className="flex flex-col gap-2 place-self-center">
						<div className="text-sm font-semibold font-mono">
							<Kbd>Arrow keys</Kbd> Navigate board
						</div>
						{isSetupPhase && (
							<div className="text-sm font-semibold font-mono">
								<Kbd>Shift</Kbd> Change ship axis
							</div>
						)}
						<div className="text-sm font-semibold font-mono">
							<Kbd>Enter</Kbd> {isSetupPhase ? 'Place ship' : 'Attack'}
						</div>
					</div>
				</div>

				{/* Ready button and turn indicator */}
				<div className="box_bottom_left grid">
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
								Ready?
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
	color?: string | undefined;
}

function Text({ children, color, ...props }: TextProps) {
	return (
		<p className={`tracking-wide ${color ? color : 'text-black'} font-staatliches text-3xl`} {...props}>
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
