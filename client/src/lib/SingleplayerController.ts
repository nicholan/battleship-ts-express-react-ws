import { aiGameboard, playerGameboard } from './Gameboard.js';
import { trpc } from '../trpc.js';
import { delay } from './utilities.js';
import type { Coordinates, GameEvent, GameState } from '@packages/zod-data-types';
import type { Dispatch, SetStateAction } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { SendMessage } from 'react-use-websocket';
import { ai } from './AiController.js';

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

export function singleplayerController({
	gameId,
	playerId,
	playerTurn,
	actions: { setGameEvents, setGameState, setIsPlayerTurn, setReady, setWinner, navigate, setRematchModalVisible },
}: ControllerProps) {
	const readyPlayer = async () => {
		const response = await trpc.readyPlayerNew.mutate({
			playerId,
			playerBoard: playerGameboard.getBuildArray(),
		});

		if ('message' in response) return false;

		setReady(response.ready);
		await startGame();
		return true;
	};

	const startGame = async () => {
		const response = await trpc.startGame.mutate({ gameId });
		if ('message' in response) return;
		setGameState('STARTED');
		setIsPlayerTurn(response.turn === playerTurn);
	};

	const attack = async (coordinates: Coordinates) => {
		const response = await trpc.getGameTurn.query({ gameId, playerTurn });
		if ('message' in response) return;
		if (!response.isPlayerTurn) return;
		setIsPlayerTurn(false);

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

		const response = await trpc.addEvent.mutate({ gameId, gameEvent });
		if ('message' in response) return;

		setGameEvents(response.gameEvents);

		if (allShipsSunk) {
			await processGameEnding(playerIsAttacker ? 1 : 0);
			return;
		}

		setIsPlayerTurn(response.turn === playerTurn);

		if (playerIsAttacker) {
			await delay(1000);
			await processAttack(ai.getAiMove(), false);
		}
	};

	const processGameEnding = async (playerTurn: number) => {
		const response = await trpc.gameOver.mutate({ gameId, playerTurn });
		if ('message' in response) return;
		await processGameOver(response.winner);
	};

	const processGameOver = async (winner: string) => {
		setWinner(winner);
		setIsPlayerTurn(false);
		setRematchModalVisible(true);

		await delay(1000);
		setGameState('GAME_OVER');
	};

	const initializeAi = async () => {
		aiGameboard.reset();
		aiGameboard.populateBoard();
		await trpc.readyPlayer.mutate({
			gameId,
			name: 'computer',
			playerBoard: aiGameboard.getBuildArray(),
		});
	};

	const requestRematch = async () => {
		const response = await trpc.resetGame.mutate({ gameId });
		if ('message' in response) return;

		await initializeAi();
		navigate(0);
	};

	return { attack, readyPlayer, requestRematch };
}
