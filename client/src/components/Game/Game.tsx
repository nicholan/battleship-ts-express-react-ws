import { useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import { CoordinatesBar } from './CoordinatesBar/CoordinatesBar.js';
import type { PlayerBoard, GameEvent, Coordinates, GameState } from '@packages/zod-data-types';
import { Nametag } from './Nametag/Nametag.js';
import { Board } from './Board/Board.js';
import { Button } from '../Buttons/Button.js';
import { playerGameboard, enemyGameboard } from '../../lib/Gameboard.js';
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
	invitePlayer: (name: string) => void;
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
}: Props) {
	const playerEvents = gameEvents.filter((evt) => {
		return evt.playerId === playerId;
	});
	const enemyEvents = gameEvents.filter((evt) => {
		return evt.playerId !== playerId;
	});

	playerGameboard.buildPlayerBoard(playerEvents, board);
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
		// Game wrapper is a 21 x 22 grid of squares; elements are placed using gridAreas defined in Game.css.
		// TODO: Media queries.
		<>
			{inviteModalVisible && (
				<Modal onClose={() => setInviteModalVisible(false)}>
					<div className="text-center font-bebas-neue">
						<p className="text-2xl tracking-wider">Invite a player</p>
						<InvitePlayerForm closeModal={() => setInviteModalVisible(false)} invitePlayer={invitePlayer} />
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
				<Board
					gridArea={'player_board'}
					gameState={gameState}
					key={`${dateKey.toString(36)}`}
					isPlayerBoard={true}
					shipsRemaining={shipsRemaining}
					setShipsRemaining={setShipsRemaining}
				/>

				{/* Enemy board. */}
				<Board gridArea={'enemy_board'} gameState={gameState} isPlayerBoard={false} attack={attack} />

				{/* Ready button */}
				<div className="box_bottom_left">
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
					</div>
				</div>

				{/* Reset and randomize buttons. */}
				<div className="box_top_right">
					<div className="flex place-self-center gap-4 flex-row">
						{!ready && isSetupPhase && (
							<Button type="button" onClick={randomizeBoard}>
								Random
							</Button>
						)}
						{!ready && isSetupPhase && (
							<Button disabled={shipsRemaining} type="reset" onClick={resetBoard}>
								Reset
							</Button>
						)}
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
	return <p className={`tracking-wide ${color ? color : 'text-black/90'} font-staatliches text-2xl`}>{children}</p>;
}
