import type { SendMessage } from 'react-use-websocket';
import type { Message, Coordinates, GameEvent, GameState, GameInvitationMessage } from '@packages/zod-data-types';
import type { Dispatch, SetStateAction } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { zodMessage } from '@packages/zod-data-types';
import { playerGameboard } from '../Gameboard/Gameboard.js';
import { trpc } from '../../trpc.js';
import { delay } from '@packages/utilities';
import { dispatchToast } from '../../components/Toasts/Toaster.js';

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

export type ControllerProps = {
	gameId: string;
	playerId: string;
	playerTurn: number;
	ready: boolean;
	name: string;
	actions: StateActions;
	enemyName: string | null;
	delayMs?: number;
	db?: typeof trpc;
};

export function multiplayerController({
	gameId,
	playerId,
	playerTurn,
	ready,
	name,
	enemyName,
	delayMs = 0,
	db = trpc,
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
	let enemyJoined = enemyName ? true : false;

	const send = (data: Partial<Message> | GameInvitationMessage) => {
		sendMessage(
			JSON.stringify({
				...data,
				gameId,
				playerId,
			})
		);
	};

	const dispatchTable: Record<string, (data: Message) => Promise<unknown>> = {
		PLAYER_READY: async () => await processGameStart(),
		PLAYER_JOIN: async ({ name }) => name !== undefined && (await Promise.resolve(processPlayerJoin(name))),
		GAME_START: async ({ turn }) => turn !== undefined && (await Promise.resolve(startGame(turn))),
		ATTACK: async ({ coordinates }) => coordinates !== undefined && (await processAttack(coordinates)),
		RESULT: async ({ events }) => events !== undefined && (await Promise.resolve(setGameEvents(events))),
		GAME_OVER: async ({ winner }) => winner !== undefined && (await processGameOver(winner)),
		REQUEST_REMATCH: async ({ name }) => name !== undefined && (await processRematch(name)),
		REMATCH_ACCEPT: async () => await Promise.resolve(navigate(0)),
	};

	const parseSocketMessage = async ({ data }: MessageEvent) => {
		if (typeof data !== 'string') return false;

		const json: unknown = JSON.parse(data);
		const parsed = zodMessage.safeParse(json);
		if (!parsed.success) return false;

		if (parsed.data.gameId !== gameId || parsed.data.playerId === playerId) return;
		await processMessageData(parsed.data);
		return true;
	};

	const processMessageData = async (data: Message) => {
		if (!Object.hasOwn(dispatchTable, data.type)) return;
		await dispatchTable[data.type as keyof typeof dispatchTable](data);
	};

	const readyPlayer = async () => {
		if (playerGameboard.getShipLength() > 0) return false;

		const response = await db.readyPlayer.mutate({
			playerId,
			playerBoard: playerGameboard.getBuildArray(),
		});

		if ('message' in response) {
			dispatchToast('API_RESPONSE', { message: response.message });
			return false;
		}

		setReady(response.ready);
		playerReady = response.ready;

		send({ type: 'PLAYER_READY' });
		return true;
	};

	const processPlayerJoin = (name: string) => {
		if (enemyJoined) return;
		enemyJoined = true;
		setEnemyName(name);
		dispatchToast('PLAYER_JOIN', { name });
	};

	const processGameStart = async () => {
		if (!playerReady) return;

		const response = await db.startGame.mutate({ gameId });
		if ('message' in response) {
			dispatchToast('API_RESPONSE', { message: response.message });
			return;
		}

		send({ type: 'GAME_START', turn: response.turn });
		await Promise.resolve(startGame(response.turn));
		return;
	};

	const startGame = (gameTurn: number) => {
		// Runs when PLAYER_READY or GAME_START messages are emitted.
		setGameState('STARTED');
		setIsPlayerTurn(gameTurn === playerTurn);
		dispatchToast('GAME_START');
		return;
	};

	const attack = async (coordinates: Coordinates) => {
		const response = await db.getGameTurn.query({ gameId, playerTurn });
		if ('message' in response) {
			dispatchToast('API_RESPONSE', { message: response.message });
			return;
		}

		if (!response.isPlayerTurn) {
			setIsPlayerTurn(false);
			return;
		}

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

		const response = await db.addEvent.mutate({ gameId, gameEvent });
		if ('message' in response) {
			dispatchToast('API_RESPONSE', { message: response.message });
			return;
		}

		send({ type: 'RESULT', events: response.gameEvents });
		setGameEvents(response.gameEvents);

		if (allShipsSunk) {
			await processGameEnding(playerTurn);
			return;
		}

		setIsPlayerTurn(response.turn === playerTurn);
	};

	const processGameEnding = async (playerTurn: number) => {
		const response = await db.gameOver.mutate({ gameId, playerTurn });
		if ('message' in response) {
			dispatchToast('API_RESPONSE', { message: response.message });
			return;
		}

		send({ type: 'GAME_OVER', winner: response.winner });
		await processGameOver(response.winner);
	};

	const processGameOver = async (winner: string) => {
		setWinner(winner);
		setIsPlayerTurn(false);
		setRematchModalVisible(true);

		await delay(delayMs);
		setGameState('GAME_OVER');
	};

	const requestRematch = () => {
		if (rematchRequested) return false;
		rematchRequested = true;
		setReady(false);
		send({ type: 'REQUEST_REMATCH', name });
		return true;
	};

	const processRematch = async (name: string) => {
		if (!rematchRequested) {
			setRematchModalVisible(false);
			dispatchToast('REMATCH_REQUEST', { name, requestRematch, setRematchModalVisible });
			return;
		}

		const response = await db.resetGame.mutate({ gameId });
		if ('message' in response) {
			dispatchToast('API_RESPONSE', { message: response.message });
			return;
		}

		send({ type: 'REMATCH_ACCEPT' });
		navigate(0);
	};

	const invite = (playerName: string) => {
		send({ type: 'PLAYER_INVITE', hostName: name, name: playerName });
		dispatchToast('INVITE', { name: playerName });
	};

	return { parseSocketMessage, attack, readyPlayer, requestRematch, invite };
}
