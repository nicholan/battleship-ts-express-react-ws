import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoaderData } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import { Button } from '../components/Buttons/Button.js';
import { Game } from '../components/Game/Game.js';
import { Modal } from '../components/Modal/Modal.js';

import { ai } from '../lib/Ai/AiController.js';
import { multiplayerController } from '../lib/Multiplayer/MultiplayerController.js';
import { singleplayerController } from '../lib/Singleplayer/SingleplayerController.js';

import { resetGameboards } from '../lib/Gameboard/Gameboard.js';

import { trpc } from '../trpc.js';

import { zParse, loaderDataSchema, zodMessage } from '@packages/zod-data-types';

export async function loader({ params }: LoaderFunctionArgs) {
	const { gameId, name } = params;
	if (!gameId || !name) {
		throw new Error('Invalid route parameters.');
	}

	resetGameboards();

	const localData = window.localStorage.getItem(gameId);
	if (localData) {
		ai.reset();
		const json: unknown = JSON.parse(localData);
		return json;
	}

	const response = await trpc.getGame.query({ gameId, name });
	if ('message' in response) {
		throw new Response(response.message, { status: response.code, statusText: response.message });
	}

	return response;
}

const url = 'ws://localhost:3000';

export function Lobby() {
	const navigate = useNavigate();
	const { gameId, playerId, name, playerTurn, events, isAiGame, ...data } = zParse(loaderDataSchema, useLoaderData());

	const [isPlayerTurn, setIsPlayerTurn] = useState(data.turn === playerTurn);
	const [ready, setReady] = useState(data.ready);
	const [gameState, setGameState] = useState(data.gameState);
	const [gameEvents, setGameEvents] = useState(events);
	const [enemyName, setEnemyName] = useState<string | null>(data.enemyName);
	const [winner, setWinner] = useState<string | null>(data.winner);
	const [rematchModalVisible, setRematchModalVisible] = useState(gameState === 'GAME_OVER' ? true : false);

	const { sendJsonMessage } = useWebSocket(url, {
		onOpen: () => {
			if (gameState === 'STARTED' && !isAiGame) return;
			const data = {
				type: 'PLAYER_JOIN',
				gameId,
				playerId,
				name,
			};
			sendJsonMessage(data);
		},
		shouldReconnect: (_e: CloseEvent) => (isAiGame ? false : true),
		filter: parseMessage,
	});

	const controller = isAiGame ? singleplayerController : multiplayerController;

	const game = useRef(
		controller({
			gameId,
			playerId,
			playerTurn,
			ready,
			name,
			enemyName,
			wait: 1000,
			actions: {
				sendJsonMessage,
				setGameEvents,
				setEnemyName,
				setGameState,
				setIsPlayerTurn,
				setReady,
				setWinner,
				setRematchModalVisible,
				navigate,
			},
		})
	);

	const {
		current: { attack, readyPlayer, requestRematch, ...actions },
	} = game;

	function parseMessage({ data }: MessageEvent) {
		if (isAiGame) return false;
		if (typeof data !== 'string') return false;

		const json: unknown = JSON.parse(data);
		const parsed = zodMessage.safeParse(json);
		if (!parsed.success) return false;

		if ('processMessage' in actions) {
			actions.processMessage(parsed.data).catch((err) => console.log(err));
		}

		return false;
	}

	useEffect(() => {
		// Runs when ai starts the game.
		if (gameState === 'STARTED' && gameEvents.length === 0 && !isPlayerTurn && 'aiAttack' in actions) {
			actions.aiAttack().catch((err) => console.log(err));
		}
	}, [gameState]);

	return (
		<>
			<div className="mx-auto my-0 grid">
				<Game
					key={gameState}
					playerId={playerId}
					playerName={name}
					gameId={gameId}
					enemyName={enemyName}
					board={data.board}
					gameEvents={gameEvents}
					attack={attack}
					readyPlayer={readyPlayer}
					ready={ready}
					isPlayerTurn={isPlayerTurn}
					gameState={gameState}
					invitePlayer={'invite' in actions ? actions.invite : undefined}
					aiBoard={data.aiBoard}
				/>
			</div>
			{gameState === 'GAME_OVER' && rematchModalVisible && (
				<Modal onClose={() => setRematchModalVisible(false)}>
					<div className="flex flex-col gap-4 items-center px-8">
						<div className="tracking-wide text-center select-none font-bebas-neue">
							{ready && (
								<p className="text-3xl md:text-4xl lg:text-5xl">
									{enemyName && (winner === enemyName ? `${enemyName} wins!` : 'You win!')}
								</p>
							)}
							{!ready && <p className="text-5xl">Waiting for {enemyName}</p>}
						</div>
						{ready && (
							<div className="flex flex-row gap-4">
								<Button onClick={() => requestRematch()}>
									{isAiGame ? 'Play again' : 'Request rematch'}
								</Button>
								<Button onClick={() => navigate('/')}>Home</Button>
							</div>
						)}
					</div>
				</Modal>
			)}
		</>
	);
}
