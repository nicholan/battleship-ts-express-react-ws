import type { SendMessage } from 'react-use-websocket';
import type { Message, Coordinates, GameEvent, GameState, GameInvitationMessage } from '@packages/zod-data-types';
import type { Dispatch, SetStateAction } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { zParse, zodMessage } from '@packages/zod-data-types';
import { playerGameboard } from './Gameboard.js';
import { trpc } from '../trpc.js';
import { delay } from './utilities.js';

type StateActions = {
	sendMessage: SendMessage;
	setGameEvents: Dispatch<SetStateAction<GameEvent[]>>;
	setGameState: Dispatch<SetStateAction<GameState>>;
	setIsPlayerTurn: Dispatch<SetStateAction<boolean>>;
	setEnemyName: Dispatch<SetStateAction<string | null>>;
	setReady: Dispatch<SetStateAction<boolean>>;
	setWinner: Dispatch<SetStateAction<string | null>>;
	setRematchModalVisible: Dispatch<SetStateAction<boolean>>;
	navigate: NavigateFunction;
};

type ControllerProps = {
	gameId: string;
	playerId: string;
	playerTurn: number;
	ready: boolean;
	name: string;
	actions: StateActions;
};

export function multiplayerController({
	gameId,
	playerId,
	playerTurn,
	ready,
	name,
	actions: {
		sendMessage,
		setGameEvents,
		setGameState,
		setIsPlayerTurn,
		setEnemyName,
		setReady,
		setWinner,
		navigate,
		setRematchModalVisible,
	},
}: ControllerProps) {
	let playerReady = ready;
	let rematchRequested = false;

	const send = (data: Partial<Message> | GameInvitationMessage) => {
		sendMessage(
			JSON.stringify({
				...data,
				gameId,
				playerId,
			})
		);
	};

	const dispatchTable: Record<string, (data: Message) => void> = {
		PLAYER_READY: () => processGameStart(),
		PLAYER_JOIN: ({ name }) => name !== undefined && setEnemyName(name),
		GAME_START: ({ turn }) => turn !== undefined && startGame(turn),
		ATTACK: ({ coordinates }) => coordinates !== undefined && processAttack(coordinates),
		RESULT: ({ events }) => events !== undefined && setGameEvents(events),
		GAME_OVER: ({ winner }) => winner !== undefined && processGameOver(winner),
		REQUEST_REMATCH: ({ name }) => name !== undefined && processRematch(name),
		REMATCH_ACCEPT: () => navigate(0),
	};

	const parseSocketMessage = ({ data }: MessageEvent) => {
		if (typeof data !== 'string') return;

		const json: unknown = JSON.parse(data);
		const z = zParse(zodMessage, json);

		if (z.gameId !== gameId || z.playerId === playerId) return;
		processMessageData(z);
	};

	const processMessageData = (data: Message) => {
		if (!Object.hasOwn(dispatchTable, data.type)) return;
		dispatchTable[data.type as keyof typeof dispatchTable](data);
	};

	const readyPlayer = async () => {
		const response = await trpc.readyPlayerNew.mutate({
			playerId,
			playerBoard: playerGameboard.getBuildArray(),
		});
		if ('message' in response) return false;

		setReady(response.ready);
		playerReady = response.ready;

		send({ type: 'PLAYER_READY' });
		return true;
	};

	const processGameStart = async () => {
		if (!playerReady) return;

		const response = await trpc.startGame.mutate({ gameId });
		if ('message' in response) return;
		send({ type: 'GAME_START', turn: response.turn });
		startGame(response.turn);
		return;
	};

	const startGame = (gameTurn: number) => {
		// Runs when PLAYER_READY or GAME_START messages are emitted.
		setGameState('STARTED');
		setIsPlayerTurn(gameTurn === playerTurn);
		return;
	};

	const attack = async (coordinates: Coordinates) => {
		const response = await trpc.getGameTurn.query({ gameId, playerTurn });
		if ('message' in response) return;
		if (!response.isPlayerTurn) return;

		send({ type: 'ATTACK', coordinates });
		setIsPlayerTurn(false);
	};

	const processAttack = async (coordinates: Coordinates) => {
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
		if ('message' in response) return;

		send({ type: 'RESULT', events: response.gameEvents });
		setGameEvents(response.gameEvents);

		if (allShipsSunk) {
			await processGameEnding(playerTurn);
			return;
		}

		setIsPlayerTurn(response.turn === playerTurn);
	};

	const processGameEnding = async (playerTurn: number) => {
		const response = await trpc.gameOver.mutate({ gameId, playerTurn });
		if ('message' in response) return;

		send({ type: 'GAME_OVER', winner: response.winner });
		await processGameOver(response.winner);
	};

	const processGameOver = async (winner: string) => {
		setWinner(winner);
		setIsPlayerTurn(false);
		setRematchModalVisible(true);

		await delay(1000);
		setGameState('GAME_OVER');
	};

	const requestRematch = () => {
		if (rematchRequested) return;
		rematchRequested = true;
		setReady(false);
		send({ type: 'REQUEST_REMATCH', name });
	};

	const processRematch = async (name: string) => {
		if (!rematchRequested) return;
		const response = await trpc.resetGame.mutate({ gameId });
		if ('message' in response) return;

		send({ type: 'REMATCH_ACCEPT' });
		navigate(0);
	};

	const invite = (playerName: string) => {
		send({ type: 'PLAYER_INVITE', hostName: name, name: playerName });
	};

	return { parseSocketMessage, attack, readyPlayer, requestRematch, invite };
}
