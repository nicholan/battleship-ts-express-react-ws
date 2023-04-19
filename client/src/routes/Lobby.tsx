import React, { useEffect, useState, useRef } from 'react';
import type { Coordinates, Message } from '../../../server/src/trpc/zodTypes';
import { zParse, loaderDataSchema } from '../../../server/src/trpc/zodTypes';
import { useLoaderData } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { Game } from '../components/Game/Game';
import { playerGameboard } from '../lib/Gameboard';
import { trpc } from '../trpc';

export async function loader({ params }: LoaderFunctionArgs) {
    const { gameId, playerName } = params;
    if (!gameId || !playerName){
        throw new Response('Not Found', { status: 404 });
    }

    const response = await trpc.getGame.query({ gameId, name: playerName });
    if ('message' in response) {
        throw new Response(response.message, { status: response.code, statusText: response.message });
    }
    return response;
}

export function Lobby() {
    const loaderData = useLoaderData();
    let parsedData;
    try {
        parsedData = zParse(loaderDataSchema, loaderData);
    } catch (error) {
        return;
    }

    const { gameId, playerId, playerName, board, events, started, turn, playerTurn, ready, ...data } = parsedData;
    const url = 'ws://localhost:3001';
    const ws = new WebSocket(url);

    const playerReady = useRef(ready);
    const [isPlayerTurn, setIsPlayerTurn] = useState(turn === playerTurn ? true : false);
    const [gameStarted, setGameStarted] = useState(started);
    const [gameEvents, setGameEvents] = useState(events);
    const [enemyName, setEnemyName] = useState<string | null | undefined>(data.enemyName);

    function sendMessage(data: Message) {
        const payload = JSON.stringify(data);
        ws.send(payload);
    }

    function listenMsg(e: MessageEvent) {
        const wsData: Message = JSON.parse(e.data);
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
                setEnemyName(wsData.name);
                break;
            case 'ATTACK':
                processAttack(wsData);
                break;
            case 'RESULT':
                processResult(wsData);
                break;
            case 'GAME_OVER':
                break;
            case 'WINNER':
                break;
            default:
                break;
        }
    }

    async function readyPlayer() {
        const response = await trpc.readyPlayer.mutate({ gameId, name: playerName, playerBoard: playerGameboard.getBuildArray() });
        if ('message' in response) return false;

        playerReady.current = true;
        sendMessage({
            type: 'PLAYER_READY',
            playerId,
            gameId,
        });
        return true;
    }

    async function startGame() {
        if (!playerReady.current) return;
        const response = await trpc.startGame.mutate({ gameId });
        if ('message' in response) return;

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

    async function processAttack({ coordinates }: Message) {
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

        const response = await trpc.addEvent.mutate({ gameId, gameEvent });
        if ('message' in response) return;

        sendMessage({
            type: 'RESULT',
            playerId,
            gameId,
            coordinates,
            result,
            shipId,
        });

        setGameEvents(response.gameEvents);
        setIsPlayerTurn(true);
    }

    function processResult({ result, coordinates, shipId, ...data }: Message) {
        // Process incoming result message, update game events.
        if (!result || !coordinates) return;

        const gameEvent = {
            playerId: data.playerId,
            coordinates,
            result,
            shipId: shipId ? shipId : null,
        };
        setGameEvents(prev => [...prev, gameEvent]);
    }

    ws.onopen = () => {
        sendMessage({
            type: 'PLAYER_JOIN',
            gameId,
            playerId,
            name: playerName,
        });
    };

    useEffect(() => {
        ws.addEventListener('message', listenMsg);

        return (() => {
            ws.removeEventListener('message', listenMsg, true);
        });
    }, []);

    return (
        <Game
            playerId={playerId}
            playerName={playerName}
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