import { aiGameboard, playerGameboard } from './Gameboard.js';
import { delay } from '@packages/utilities';
import type { Coordinates, GameEvent, GameState, LoaderData } from '@packages/zod-data-types';
import type { Dispatch, SetStateAction } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { SendMessage } from 'react-use-websocket';
import { ai } from './AiController.js';
import { dispatchToast } from '../components/Toasts/Toaster.js';

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
};

function localData(gameId: string) {
	const getLocalData = () => {
		const data = window.localStorage.getItem(gameId);
		if (!data) throw new Error('Local data not found.');

		return JSON.parse(data) as LoaderData;
	};

	const getDataByKey = (key: keyof LoaderData) => {
		const data = getLocalData();
		return data[key];
	};

	const setLocalData = (newData: Partial<LoaderData>) => {
		const data = getLocalData();
		window.localStorage.setItem(gameId, JSON.stringify({ ...data, ...newData }));
	};

	return { setLocalData, getDataByKey, getLocalData };
}

export function singleplayerController({
	gameId,
	playerId,
	playerTurn,
	actions: { setGameEvents, setGameState, setIsPlayerTurn, setReady, setWinner, navigate, setRematchModalVisible },
}: ControllerProps) {
	const { getDataByKey, setLocalData, getLocalData } = localData(gameId);

	const readyPlayer = () => {
		setLocalData({ board: playerGameboard.getBuildArray(), ready: true });
		setReady(true);
		startGame();
		return Promise.resolve(true);
	};

	const startGame = () => {
		const turn = Math.round(Math.random());
		setLocalData({ gameState: 'STARTED', turn });
		setGameState('STARTED');
		dispatchToast('GAME_START');
		setIsPlayerTurn(turn === playerTurn);
	};

	const attack = async (coordinates: Coordinates) => {
		const isTurn = getDataByKey('turn') === playerTurn;
		if (!isTurn) {
			setIsPlayerTurn(false);
			return;
		}

		await processAttack(coordinates, true);
	};

	const processAttack = async (coordinates: Coordinates, playerIsAttacker: boolean) => {
		const attack = playerIsAttacker
			? aiGameboard.receiveAttack(coordinates)
			: playerGameboard.receiveAttack(coordinates);
		if (attack === null) return;

		const { result, shipId, allShipsSunk } = attack;

		const gameEvent = {
			playerId: playerIsAttacker ? 'ai0000000000' : playerId,
			coordinates,
			result,
			shipId,
		};

		const data = getLocalData();
		data.events.push(gameEvent);
		data.turn = data.turn === 1 ? 0 : 1;
		setLocalData(data);
		setGameEvents(data.events);

		if (allShipsSunk) {
			await processGameEnding(playerIsAttacker ? 1 : 0);
			return;
		}

		setIsPlayerTurn(data.turn === playerTurn);

		if (playerIsAttacker) {
			await aiAttack();
		}
	};

	const aiAttack = async () => {
		await delay(1000);
		await processAttack(ai.getAiMove(), false);
	};

	const processGameEnding = async (loserTurnNumber: number) => {
		const data = getLocalData();
		data.gameState = 'GAME_OVER';
		data.turn = 2;
		data.winner = loserTurnNumber === 0 ? data.enemyName ?? 'computer' : data.name;
		setLocalData(data);

		await processGameOver(data.winner);
	};

	const processGameOver = async (winner: string) => {
		setWinner(winner);
		setIsPlayerTurn(false);

		await delay(1000);
		setRematchModalVisible(true);
		setGameState('GAME_OVER');
	};

	const initializeAi = () => {
		aiGameboard.reset();
		aiGameboard.populateBoard();
		const data = getLocalData();
		data.aiBoard = aiGameboard.getBuildArray();
		setLocalData(data);
	};

	const requestRematch = () => {
		const data = getLocalData();
		data.gameState = 'NOT_STARTED';
		data.events.length = 0;
		data.board.length = 0;
		data.ready = false;
		setLocalData(data);
		initializeAi();
		navigate(0);
	};

	return { attack, readyPlayer, requestRematch, aiAttack };
}
