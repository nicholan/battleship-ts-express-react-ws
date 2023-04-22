import React, { useEffect, useState, useRef } from 'react';
import type { Coordinates, Message } from '../../../server/src/trpc/zodTypes';
import { zParse, loaderDataSchema, zodMessage } from '../../../server/src/trpc/zodTypes';
import { useLoaderData } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { Game } from '../components/Game/Game';
import { playerGameboard, initLobby } from '../lib/Gameboard';
import { trpc } from '../trpc';
import { toast } from 'react-toastify';

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
const ws = new WebSocket(url);

export function Lobby() {
    const loaderData = useLoaderData();
    const parsedData = zParse(loaderDataSchema, loaderData);

    const { gameId, playerId, name, board, events, started, turn, playerTurn, ready, ...data } = parsedData;

    const playerReady = useRef(ready);
    const enemyJoined = useRef(data.enemyName ? true : false);

    const [isPlayerTurn, setIsPlayerTurn] = useState(turn === playerTurn ? true : false);
    const [gameStarted, setGameStarted] = useState(started);
    const [gameEvents, setGameEvents] = useState(events);
    const [enemyName, setEnemyName] = useState<string | null>(data.enemyName);

    function sendMessage(data: Message) {
        const payload = JSON.stringify(data);
        ws.send(payload);
    }

    function listenMsg(e: MessageEvent) {
        const data = JSON.parse(e.data);
        const wsData = zParse(zodMessage, data);

        if (wsData.gameId !== gameId) return;
        if (wsData.playerId === playerId) return;

        switch (wsData.type) {
            case 'PLAYER_READY':
                startGame();
                break;
            case 'GAME_START':
                setGameStarted(true);
                break;
            case 'PLAYER_JOIN':
                if (!wsData.name) return;
                if (enemyJoined.current) return;
                processPlayerJoin(wsData.name);
                break;
            case 'ATTACK':
                wsData.coordinates && processAttack(wsData.coordinates);
                break;
            case 'RESULT':
                wsData.events && setGameEvents(wsData.events);
                break;
            case 'GAME_OVER':
                break;
            case 'WINNER':
                break;
            default:
                break;
        }
    }

    function processPlayerJoin(enemyName: string){
        toast.success(`${enemyName} joined!`);
        setEnemyName(enemyName);
        enemyJoined.current = true;
    }

    async function readyPlayer() {
        const response = await trpc.readyPlayer
            .mutate({
                gameId,
                name,
                playerBoard: playerGameboard.getBuildArray()
            });

        if ('message' in response) {
            toast.error(response.message);
            return false;
        }

        playerReady.current = true;
        sendMessage({
            type: 'PLAYER_READY',
            playerId,
            gameId,
        });
        return true;
    }

    async function startGame() {
        // If player is in ready state, start the game once other player emits ready-message.
        if (!playerReady.current) return;

        const response = await trpc.startGame.mutate({ gameId });
        if ('message' in response) {
            toast.error(response.message);
            return;
        }

        setGameStarted(true);
        sendMessage({
            type: 'GAME_START',
            playerId,
            gameId,
        });
    }

    function attack(coordinates: Coordinates) {
        // Attack enemy board, set player turn to false.
        if (!isPlayerTurn || !gameStarted) return;
        sendMessage({
            type: 'ATTACK',
            playerId,
            gameId,
            coordinates,
        });
        setIsPlayerTurn(false);
    }

    async function processAttack(coordinates: Coordinates) {
        // Process incoming attack message; respond with result message; update game events; set player turn to true.
        if (!coordinates) return;

        const result = playerGameboard.receiveAttack(coordinates);
        if (!result) return;

        let shipId: string | null = null;
        if (['SHIP_HIT', 'SHIP_SUNK'].includes(result)) {
            shipId = playerGameboard.getShipId(coordinates);
        }

        const gameEvent = {
            playerId,
            coordinates,
            result,
            shipId,
        };

        const response = await trpc.addEvent.mutate({ gameId, gameEvent, playerTurn });
        if ('message' in response) {
            toast.error(response.message);
            return;
        }

        sendMessage({
            type: 'RESULT',
            playerId,
            gameId,
            events: response.gameEvents,
        });

        setGameEvents(response.gameEvents);
        setIsPlayerTurn(true);
    }

    useEffect(() => {
        ws.addEventListener('message', listenMsg);

        sendMessage({
            type: 'PLAYER_JOIN',
            gameId,
            playerId,
            name,
        });

        return (() => {
            ws.removeEventListener('message', listenMsg, true);
        });
    }, []);

    return (
        <Game
            playerId={playerId}
            playerName={name}
            enemyName={enemyName}
            board={board}
            gameEvents={gameEvents}
            gameStarted={gameStarted}
            attack={attack}
            readyPlayer={readyPlayer}
            ready={ready}
            isPlayerTurn={isPlayerTurn}
        />
    );
}