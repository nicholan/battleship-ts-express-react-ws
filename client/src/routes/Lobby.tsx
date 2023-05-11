import { useEffect, useState, useRef } from 'react';
import { zParse, zodMessage, loaderDataSchema } from '@packages/zod-data-types';
import type { Coordinates, Message } from '@packages/zod-data-types';
import { useLoaderData } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Game } from '../components/Game/Game.js';
import { Modal } from '../components/Modal/Modal.js';
import { Button } from '../components/Buttons/Button.js';
import { playerGameboard, initLobby } from '../lib/Gameboard.js';
import { trpc } from '../trpc.js';
import { toast } from 'react-toastify';
import { RematchToast } from '../components/Toasts/RematchToast.js';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export async function loader({ params }: LoaderFunctionArgs) {
	const { gameId, name } = params;
	if (!gameId || !name) {
		throw new Error('Invalid route parameters.');
	}

	const response = await trpc.getGame.query({ gameId, name });
	if ('message' in response) {
		throw new Response(response.message, { status: response.code, statusText: response.message });
	}

	initLobby();
	return response;
}

const url = 'ws://localhost:3001';

export function Lobby() {
	const navigate = useNavigate();
	const { gameId, playerId, name, playerTurn, events, ...data } = zParse(loaderDataSchema, useLoaderData());

	// These initialize on page load.
	// Refs are used to sync behaviour on certain actions; websocket, button clicks.
	const playerReady = useRef(data.ready);
	const enemyJoined = useRef(data.enemyName ? true : false);
	const rematchRequested = useRef(false);

	const [isPlayerTurn, setIsPlayerTurn] = useState(data.turn === playerTurn);
	const [ready, setReady] = useState(data.ready);
	const [gameState, setGameState] = useState(data.gameState);
	const [gameEvents, setGameEvents] = useState(events);
	const [enemyName, setEnemyName] = useState<string | null>(data.enemyName);
	const [winner, setWinner] = useState<string | null>(data.winner);
	const [rematchModalVisible, setRematchModalVisible] = useState(gameState === 'GAME_OVER' ? true : false);

	const { sendMessage, lastMessage, readyState } = useWebSocket(url, {
		onOpen: () => {
			const data = {
				type: 'PLAYER_JOIN',
				gameId,
				playerId,
				name,
			};
			sendMessage(JSON.stringify(data));
		},
		shouldReconnect: (_e: CloseEvent) => true,
	});

	function parseSocketMessage({ data }: MessageEvent) {
		if (typeof data !== 'string') return;

		const json: unknown = JSON.parse(data);
		const zData = zParse(zodMessage, json);

		// Make sure message contains current gameId,
		// and that incoming message was sent by the other player.
		if (zData.gameId !== gameId || zData.playerId === playerId) return;
		processMessageData(zData).catch((err) => {
			throw err;
		});
	}

	async function processMessageData(data: Message) {
		switch (data.type) {
			case 'PLAYER_READY':
				await processGameStart();
				break;
			case 'GAME_START':
				data.turn !== undefined && startGame(data.turn);
				break;
			case 'PLAYER_JOIN':
				data.name !== undefined && processPlayerJoin(data.name);
				break;
			case 'ATTACK':
				data.coordinates !== undefined && (await processAttack(data.coordinates));
				break;
			case 'RESULT':
				data.events !== undefined && setGameEvents(data.events);
				break;
			case 'GAME_OVER':
				data.winner !== undefined && processGameOver(data.winner);
				break;
			case 'REQUEST_REMATCH':
				data.name !== undefined && (await processRematch(data.name));
				break;
			case 'REMATCH_ACCEPT':
				navigate(0);
				break;
			default:
				break;
		}
	}

	function processPlayerJoin(name: string) {
		if (enemyJoined.current) return;
		enemyJoined.current = true;
		toast(
			<p>
				<span className="text-orange-400">{name}</span> has joined the game!
			</p>
		);
		setEnemyName(name);
	}

	async function readyPlayer() {
		if (readyState !== ReadyState.OPEN) return false;
		const response = await trpc.readyPlayer.mutate({
			gameId,
			name,
			playerBoard: playerGameboard.getBuildArray(),
		});

		if ('message' in response) {
			toast(<p>{response.message}</p>);
			return false;
		}

		const data = {
			type: 'PLAYER_READY',
			playerId,
			gameId,
		};

		playerReady.current = true;
		setReady(response.ready);
		sendMessage(JSON.stringify(data));
		return true;
	}

	function startGame(gameTurn: number) {
		// Runs when PLAYER_READY or GAME_START messages are emitted.
		setGameState('STARTED');
		setIsPlayerTurn(gameTurn === playerTurn);
		toast(<p>Game started</p>);
	}

	async function processGameStart() {
		// Runs when other player emits PLAYER_READY message,
		// and current player is ready.
		if (!playerReady.current) return;

		const response = await trpc.startGame.mutate({ gameId });
		if ('message' in response) {
			toast(<p>{response.message}</p>);
			return;
		}

		const data = {
			type: 'GAME_START',
			playerId,
			gameId,
			turn: response.turn,
		};

		sendMessage(JSON.stringify(data));
		startGame(response.turn);
	}

	async function attack(coordinates: Coordinates) {
		// Called when player clicks enemy board.
		if (gameState === 'NOT_STARTED') {
			return;
		}

		if (gameState === 'GAME_OVER') {
			toast(<p>The game has ended.</p>);
			return;
		}

		if (!isPlayerTurn) {
			toast(<p>It is not your turn.</p>);
			return;
		}

		const response = await trpc.getGameTurn.query({ gameId, playerTurn });
		if ('message' in response) {
			toast(<p>{response.message}</p>);
			return;
		}

		if (response.gameOver) {
			toast(<p>The game has ended.</p>);
			setIsPlayerTurn(false);
			setGameState('GAME_OVER');
			return;
		}

		if (!response.isPlayerTurn) {
			toast(<p>It is not your turn.</p>);
			setIsPlayerTurn(false);
			return;
		}

		const data = {
			type: 'ATTACK',
			playerId,
			gameId,
			coordinates,
		};
		sendMessage(JSON.stringify(data));
		setIsPlayerTurn(false);
	}

	async function processAttack(coordinates: Coordinates) {
		// Process incoming attack message; respond with result message;
		// update game events; check win condition; set player turn to true.
		const attack = playerGameboard.receiveAttack(coordinates);
		if (attack === null) return;

		const { result, shipId, allShipsSunk } = attack;

		const gameEvent = {
			playerId,
			coordinates,
			result,
			shipId,
		};

		const response = await trpc.addEvent.mutate({ gameId, gameEvent });
		if ('message' in response) {
			toast(<p>{response.message}</p>);
			return;
		}

		const data = {
			type: 'RESULT',
			playerId,
			gameId,
			events: response.gameEvents,
		};

		sendMessage(JSON.stringify(data));
		setGameEvents(response.gameEvents);

		if (allShipsSunk) {
			await processGameEnding();
			return;
		}

		setIsPlayerTurn(response.turn === playerTurn);
	}

	async function processGameEnding() {
		const response = await trpc.gameOver.mutate({ gameId, playerTurn });
		if ('message' in response) {
			toast(<p>{response.message}</p>);
			return;
		}

		const data = {
			type: 'GAME_OVER',
			playerId,
			gameId,
			winner: response.winner,
		};
		sendMessage(JSON.stringify(data));
		processGameOver(response.winner);
	}

	function processGameOver(winner: string) {
		setWinner(winner);
		setIsPlayerTurn(false);
		setRematchModalVisible(true);
		setTimeout(() => setGameState('GAME_OVER'), 1000);
	}

	function requestRematch() {
		// Called when player asks to play again.

		if (rematchRequested.current) return;
		rematchRequested.current = true;
		setReady(false);

		const data = {
			type: 'REQUEST_REMATCH',
			name,
			playerId,
			gameId,
		};
		sendMessage(JSON.stringify(data));
	}

	async function processRematch(name: string) {
		// Called when player has requested rematch, and the other player emits 'REQUEST_REMATCH'.
		if (!rematchRequested.current) {
			setRematchModalVisible(false);
			toast(
				<RematchToast
					name={name}
					requestRematch={requestRematch}
					setRematchModalVisible={setRematchModalVisible}
				/>,
				{
					autoClose: 30000,
					hideProgressBar: false,
				}
			);
			return;
		}

		const response = await trpc.resetGame.mutate({ gameId });
		if ('message' in response) {
			toast(<p>{response.message}</p>);
			return;
		}

		const data = {
			type: 'REMATCH_ACCEPT',
			playerId,
			gameId,
		};

		sendMessage(JSON.stringify(data));
		navigate(0);
	}

	function invitePlayer(playerName: string) {
		const data = {
			type: 'PLAYER_INVITE',
			gameId,
			playerId,
			hostName: name,
			name: playerName,
		};
		sendMessage(JSON.stringify(data));
		toast(
			<p>
				Invite sent to <span className="text-orange-400">{playerName}</span>
			</p>
		);
	}

	useEffect(() => {
		if (lastMessage !== null) {
			parseSocketMessage(lastMessage);
		}
	}, [lastMessage]);

	return (
		<>
			<div className="mx-auto my-0 grid">
				<Game
					key={gameState}
					playerId={playerId}
					playerName={name}
					enemyName={enemyName}
					board={data.board}
					gameEvents={gameEvents}
					attack={attack}
					readyPlayer={readyPlayer}
					ready={ready}
					isPlayerTurn={isPlayerTurn}
					gameState={gameState}
					invitePlayer={invitePlayer}
				/>
			</div>
			{gameState === 'GAME_OVER' && rematchModalVisible && (
				<Modal onClose={() => setRematchModalVisible(false)}>
					<div className="flex flex-col gap-4 items-center px-8">
						<div className="tracking-wide text-center select-none font-bebas-neue">
							{ready && (
								<p className="text-5xl">
									{enemyName && (winner === enemyName ? `${enemyName} wins!` : 'You win!')}
								</p>
							)}
							{!ready && <p className="text-5xl">Waiting for {enemyName}</p>}
						</div>
						{ready && (
							<div className="flex flex-row gap-4">
								<Button onClick={() => requestRematch()}>Request rematch</Button>
								<Button onClick={() => navigate('/')}>Home</Button>
							</div>
						)}
					</div>
				</Modal>
			)}
		</>
	);
}
