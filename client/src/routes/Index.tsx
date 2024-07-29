import { generateUniqueId } from "@packages/utilities";
import {
	type GameInvitationMessage,
	type LoaderData,
	zodGameInvitationMessage,
} from "@packages/zod-data-types";
import { useRef, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket.js";
import type { IndexFormSchema } from "../components/Forms/IndexForm.js";
import { IndexForm } from "../components/Forms/IndexForm.js";
import { dispatchToast } from "../components/Toasts/Toaster.js";
import { aiGameboard } from "../lib/Gameboard/Gameboard.js";
import { trpc } from "../trpc.js";

const websocketURL =  import.meta.env.VITE_WEBSOCKET_URL ?? "ws://localhost:3000";

export function Index() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const suffix = useRef(Date.now().toString().slice(-3));

	useWebSocket(websocketURL, {
		shouldReconnect: (_e: CloseEvent) => true,
		filter: parseMessage,
	});

	const onSubmit: SubmitHandler<IndexFormSchema> = async (data) => {
		const { name, gameId, isComputer } = data;
		if (gameId) {
			await joinGame(name, gameId);
			return;
		}

		if (isComputer) {
			createAiGame(name);
			return;
		}

		await createGame(name);
	};

	async function joinGame(name: string, gameId: string) {
		const response = await trpc.joinGame.mutate({ gameId, name });
		if ("message" in response) {
			dispatchToast("API_RESPONSE", { message: response.message });
			return;
		}

		if ("name" in response && "gameId" in response) {
			navigate(`/${response.gameId}/${response.name}`);
			return;
		}
	}

	async function createGame(name: string) {
		const response = await trpc.createGame.mutate({ name });
		if ("name" in response && "gameId" in response) {
			navigate(`/${response.gameId}/${response.name}`);
			return;
		}
	}

	function createAiGame(name: string) {
		aiGameboard.reset();
		aiGameboard.populateBoard();
		const aiBoard = aiGameboard.getBuildArray();

		const data: LoaderData = {
			playerId: generateUniqueId(),
			name: name,
			gameId: generateUniqueId(),
			board: [],
			events: [],
			turn: 2,
			playerTurn: 0,
			ready: false,
			gameState: "NOT_STARTED",
			winner: null,
			aiBoard,
			isAiGame: true,
			enemyName: "computer",
		};
		window.localStorage.setItem(data.gameId, JSON.stringify(data));

		navigate(`/${data.gameId}/${data.name}`);
		return;
	}

	function processSocketMessage({
		hostName,
		gameId,
		type,
		...data
	}: GameInvitationMessage) {
		if (type !== "PLAYER_INVITE") return;
		if (
			data.name === undefined ||
			hostName === undefined ||
			gameId === undefined
		)
			return;
		if (data.name.toLowerCase() !== name + suffix.current) return;

		dispatchToast("INVITE_RECEIVED", { gameId, name, hostName, joinGame });
	}

	function parseMessage({ data }: MessageEvent) {
		if (typeof data !== "string") return false;

		const json: unknown = JSON.parse(data);
		const parsed = zodGameInvitationMessage.safeParse(json);
		if (!parsed.success) return false;

		processSocketMessage(parsed.data);
		return false;
	}

	return (
		<IndexForm onSubmit={onSubmit} setName={setName} suffix={suffix.current} />
	);
}
