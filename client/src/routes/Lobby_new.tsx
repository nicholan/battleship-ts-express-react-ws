import { useEffect, useState, useRef } from 'react';
import { zParse, loaderDataSchema } from '@packages/zod-data-types';
import { useLoaderData } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Game } from '../components/Game/Game.js';
import { Modal } from '../components/Modal/Modal.js';
import { Button } from '../components/Buttons/Button.js';
import { initLobby } from '../lib/Gameboard.js';
import { trpc } from '../trpc.js';
import { toast } from 'react-toastify';
import { RematchToast } from '../components/Toasts/RematchToast.js';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { multiplayerController } from '../lib/MultiplayerController.js';
import { singleplayerController } from '../lib/SingleplayerController.js';
import { ControllerProps } from '../lib/MultiplayerController.js';

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

export function LobbyTwo() {
	const navigate = useNavigate();
	const { gameId, playerId, name, playerTurn, events, isAiGame, ...data } = zParse(loaderDataSchema, useLoaderData());

	const [isPlayerTurn, setIsPlayerTurn] = useState(data.turn === playerTurn);
	const [ready, setReady] = useState(data.ready);
	const [gameState, setGameState] = useState(data.gameState);
	const [gameEvents, setGameEvents] = useState(events);
	const [enemyName, setEnemyName] = useState<string | null>(data.enemyName);
	const [winner, setWinner] = useState<string | null>(data.winner);
	const [rematchModalVisible, setRematchModalVisible] = useState(gameState === 'GAME_OVER' ? true : false);

	const enemyJoined = useRef(enemyName ? true : false);

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

	const controller = isAiGame ? singleplayerController : multiplayerController;

	const game = useRef(
		controller({
			gameId,
			playerId,
			playerTurn,
			ready,
			name,
			actions: {
				sendMessage,
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
		current: { attack, readyPlayer, requestRematch, ...multiplayer },
	} = game;

	function invitePlayer(playerName: string) {
		if ('invite' in multiplayer) {
			multiplayer.invite(playerName);
			toast(
				<p>
					Invite sent to <span className="text-orange-400">{playerName}</span>
				</p>
			);
		}
	}

	useEffect(() => {
		if (!enemyName || enemyJoined.current) return;
		toast(
			<p>
				<span className="text-orange-400">{enemyName}</span> has joined the game!
			</p>
		);
		enemyJoined.current = true;
	}, [enemyName]);

	useEffect(() => {
		if (lastMessage === null) return;

		if ('parseSocketMessage' in multiplayer) {
			multiplayer.parseSocketMessage(lastMessage);
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
