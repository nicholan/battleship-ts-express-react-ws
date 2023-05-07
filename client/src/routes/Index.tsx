import { useNavigate } from 'react-router-dom';
import { trpc } from '../trpc.js';
import { toast, type ToastContentProps } from 'react-toastify';
import { SubmitHandler } from 'react-hook-form';
import type { IndexFormSchema } from '../components/Forms/IndexForm.js';
import { IndexForm } from '../components/Forms/IndexForm.js';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket.js';
import { zParse, zodGameInvitationMessage, type GameInvitationMessage } from '@packages/zod-data-types';
import { useEffect, useState, useRef } from 'react';
import { Button } from '../components/Buttons/Button.js';

const url = 'ws://localhost:3001';

type CustomToastProps = {
	gameId: string;
	name: string;
	hostName: string;
};

export function Index() {
	const navigate = useNavigate();
	const [name, setName] = useState('');
	const suffix = useRef(Date.now().toString().slice(-3));

	const { lastMessage } = useWebSocket(url, {
		shouldReconnect: (_e: CloseEvent) => true,
	});

	const onSubmit: SubmitHandler<IndexFormSchema> = async (data) => {
		const { name, gameId } = data;
		if (gameId) {
			await JoinGame(name, gameId);
			return;
		}
		await CreateGame(name);
	};

	async function JoinGame(name: string, gameId: string) {
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

	async function CreateGame(name: string) {
		const response = await trpc.createGame.mutate({ name });
		if ('name' in response && 'gameId' in response) {
			navigate(`/${response.gameId}/${response.name}`);
			return;
		}
	}

	const GameJoinToastContent = ({
		closeToast,
		gameId,
		hostName,
		name,
	}: Partial<ToastContentProps> & CustomToastProps) => {
		return (
			<div className="px-8 py-4 flex flex-col gap-4">
				<p>
					Invitation from <span className="text-orange-400">{hostName}</span>
				</p>
				<div className="flex gap-2 flex-row justify-center">
					<Button onClick={async () => await JoinGame(name, gameId)}>Join</Button>
					<Button onClick={() => closeToast && closeToast()}>Decline</Button>
				</div>
			</div>
		);
	};

	function processSocketMessage({ hostName, gameId, type, ...data }: GameInvitationMessage) {
		if (type !== 'PLAYER_INVITE') return;
		if (data.name === undefined || hostName === undefined || gameId === undefined) return;
		if (data.name !== name + suffix.current) return;

		toast(<GameJoinToastContent gameId={gameId} name={name} hostName={hostName} />, {
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
