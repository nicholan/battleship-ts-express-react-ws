import { useEffect, useState, useRef } from 'react';
import { zParse, zodMessage, loaderDataSchema } from '@packages/zod-data-types';
import type { Coordinates, Message } from '@packages/zod-data-types';
import { useLoaderData } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Game } from '../components/Game/Game.js';
import { Modal } from '../components/Modal/Modal.js';
import { Button } from '../components/Buttons/Button.js';
import { playerGameboard, aiGameboard, initLobby } from '../lib/Gameboard.js';
import { ai } from '../lib/AiController.js';
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
	const { gameId, playerId, name, playerTurn, events, isAiGame, ...data } = zParse(loaderDataSchema, useLoaderData());

	// These initialize on page load.
	// Refs are used to avoid useState undefined variables on component re-renders.
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
			if (gameState === 'STARTED') return;
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
		processMessageData(zData);
	}

	function processMessageData(data: Message) {
		if (!Object.hasOwn(dispatchTable, data.type)) return;

		dispatchTable[data.type as keyof typeof dispatchTable](data);
	}

	const dispatchTable: Record<string, (data: Message) => void> = {
		PLAYER_READY: () => processGameStart(),
		GAME_START: ({ turn }) => turn !== undefined && startGame(turn),
		PLAYER_JOIN: ({ name }) => name !== undefined && processPlayerJoin(name),
		ATTACK: ({ coordinates }) => coordinates !== undefined && processAttack(coordinates),
		RESULT: ({ events }) => events !== undefined && setGameEvents(events),
		GAME_OVER: ({ winner }) => winner !== undefined && processGameOver(winner),
		REQUEST_REMATCH: ({ name }) => name !== undefined && processRematch(name),
		REMATCH_ACCEPT: () => navigate(0),
	};

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
			playerId: isAiGame ? 'ai0000000000' : playerId,
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

	async function processAiReceiveAttack(coordinates: Coordinates) {
		const attack = aiGameboard.receiveAttack(coordinates);
		if (attack === null) {
			setIsPlayerTurn(true);
			return;
		}

		const { result, shipId, allShipsSunk } = attack;

		const gameEvent = {
			playerId: 'ai0000000000',
			coordinates,
			result,
			shipId,
		};

		const response = await trpc.addEvent.mutate({ gameId, gameEvent });

		if ('gameEvents' in response) {
			setGameEvents(response.gameEvents);
		}

		if (allShipsSunk) {
			await processGameEnding(1);
			return;
		}
		await delay(1000);
		aiAttack();
	}

	function aiAttack() {
		const attackCoordinate: Coordinates = ai.getAiMove();
		dispatchTable['ATTACK']({
			type: 'ATTACK',
			gameId,
			playerId: 'ai0000000000',
			coordinates: attackCoordinate,
		});
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

		if (isAiGame) {
			setIsPlayerTurn(false);
			await processAiReceiveAttack(coordinates);
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
			await processGameEnding(playerTurn);
			return;
		}

		setIsPlayerTurn(response.turn === playerTurn);
	}

	async function processGameEnding(playerTurn: number) {
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
		await processGameOver(response.winner);
	}

	async function processGameOver(winner: string) {
		setWinner(winner);
		setIsPlayerTurn(false);
		setRematchModalVisible(true);

		await delay(1000);
		setGameState('GAME_OVER');
	}

	function requestRematch() {
		// Called when player asks to play again.

		if (rematchRequested.current) return;
		rematchRequested.current = true;
		setReady(false);

		if (isAiGame) {
			dispatchTable['REQUEST_REMATCH']({
				type: 'REQUEST_REMATCH',
				gameId,
				playerId: 'ai0000000000',
				name: enemyName ?? name === 'computer' ? 'computer2' : 'computer',
			});
			return;
		}

		const data = {
			type: 'REQUEST_REMATCH',
			name,
			playerId,
			gameId,
		};

		sendMessage(JSON.stringify(data));
	}

	async function processAiRematch() {
		aiGameboard.reset();
		aiGameboard.populateBoard();
		await trpc.readyPlayer.mutate({
			gameId,
			name: 'computer',
			playerBoard: aiGameboard.getBuildArray(),
		});
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

		if (isAiGame) {
			await processAiRematch();
		}

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

	useEffect(() => {
		async function aiStart() {
			await delay(1000);
			aiAttack();
		}

		if (isAiGame && gameState === 'STARTED' && !isPlayerTurn && gameEvents.length === 0) {
			console.log('ran');
			aiStart().catch((err) => console.log(err));
		}
	}, [gameState]);

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
					aiBoard={data.aiBoard}
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

const delay = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};
