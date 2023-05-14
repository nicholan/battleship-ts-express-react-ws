import { useNavigate } from 'react-router-dom';
import { trpc } from '../trpc.js';
import { toast } from 'react-toastify';
import { SubmitHandler } from 'react-hook-form';
import type { IndexFormSchema } from '../components/Forms/IndexForm.js';
import { IndexForm } from '../components/Forms/IndexForm.js';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket.js';
import { zParse, zodGameInvitationMessage, type GameInvitationMessage } from '@packages/zod-data-types';
import { useEffect, useState, useRef } from 'react';
import { GameInviteToast } from '../components/Toasts/GameInviteToast.js';
import { aiGameboard } from '../lib/Gameboard.js';

const url = 'ws://localhost:3001';

export function Index() {
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const suffix = useRef(Date.now().toString().slice(-3));

	const { lastMessage } = useWebSocket(url, {
		shouldReconnect: (_e: CloseEvent) => true,
	});

	const onSubmit: SubmitHandler<IndexFormSchema> = async (data) => {
		const { name, gameId, isComputer } = data;
		if (gameId) {
			await joinGame(name, gameId);
			return;
		}

		if (isComputer) {
			await createAiGame(name);
			return;
		}
		await createGame(name);
	};

	async function joinGame(name: string, gameId: string) {
		const response = await trpc.joinGame.mutate({ gameId, name });
		if ('message' in response) {
			toast(<p>{response.message}</p>);
			return;
		}

		if ('name' in response && 'gameId' in response) {
			navigate(`/${response.gameId}/${response.name}`);
			return;
		}
	}

	async function createGame(name: string) {
		const response = await trpc.createGame.mutate({ name });
		if ('name' in response && 'gameId' in response) {
			navigate(`/${response.gameId}/${response.name}`);
			return;
		}
	}

	async function createAiGame(name: string) {
		aiGameboard.reset();
		aiGameboard.populateBoard();
		const board = aiGameboard.getBuildArray();

		const response = await trpc.createAiGame.mutate({ name, playerBoard: board });
		if ('name' in response && 'gameId' in response) {
			navigate(`/${response.gameId}/${response.name}`);
			return;
		}
	}

	function processSocketMessage({ hostName, gameId, type, ...data }: GameInvitationMessage) {
		if (type !== 'PLAYER_INVITE') return;
		if (data.name === undefined || hostName === undefined || gameId === undefined) return;
		if (data.name !== name + suffix.current) return;

		toast(<GameInviteToast gameId={gameId} name={name} hostName={hostName} joinGame={joinGame} />, {
			autoClose: 30000,
			hideProgressBar: false,
		});
	}

	function parseSocketMessage({ data }: MessageEvent) {
		if (typeof data !== 'string') return;

		const json: unknown = JSON.parse(data);
		const zData = zParse(zodGameInvitationMessage, json);
		processSocketMessage(zData);
	}

	useEffect(() => {
		if (lastMessage !== null) {
			parseSocketMessage(lastMessage);
		}
	}, [lastMessage]);

	return <IndexForm onSubmit={onSubmit} setName={setName} suffix={suffix.current} />;
}
