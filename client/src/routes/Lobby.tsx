import React, { useEffect, useState, useRef } from 'react';
import { Message, GameEvent, MsgType, Coordinates, ShipPlacement } from '../types/shared';
import { useLoaderData } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import { uploadGameEvent, uploadPlayerBoard, uploadStartGame } from '../api/api';
import { Game } from '../components/Game/Game';
import { playerGameboard } from '../lib/Gameboard';

type LoaderData = {
    gameId: string,
    playerId: string,
    playerName: string,
    enemyName: string | null,
    board: ShipPlacement[],
    events: GameEvent[],
    turn: number,
    playerTurn: number,
    started: boolean,
    ready: boolean,
}

export async function loader({ params }: LoaderFunctionArgs) {
    const fetchedData = await fetch(`http://localhost:3000/${params.gameId}/${params.playerName}`, {
        method: 'GET',
        mode: 'cors',
    });
    const data = await fetchedData.json();
    return data;
}

export function Lobby() {
    const url = 'ws://localhost:3001';
    const ws = new WebSocket(url);

    const { gameId, playerId, playerName, board, events, started, turn, playerTurn, ready, ...data } = useLoaderData() as LoaderData;

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
        const data: Message = JSON.parse(e.data);
        if (data.gameId !== gameId) return;
        if (data.playerId === playerId) return;

        switch (data.type) {
            case MsgType.PLAYER_READY:
                startGame();
                break;
            case MsgType.GAME_START:
                setGameStarted(true);
                break;
            case MsgType.PLAYER_JOIN:
                setEnemyName(data.name);
                break;
            case MsgType.ATTACK:
                processAttack(data);
                break;
            case MsgType.RESULT:
                processResult(data);
                break;
            default:
                break;
        }
    }

    async function readyPlayer() {
        if (!(await uploadPlayerBoard(playerGameboard.getBuildArray(), gameId, playerName))) return false;
        playerReady.current = true;
        sendMessage({
            playerId,
            gameId,
            type: MsgType.PLAYER_READY,
        });
        return true;
    }

    async function startGame() {
        if (!playerReady.current) return;
        if (!(await uploadStartGame(gameId))) return;

        setGameStarted(true);
        sendMessage({
            type: MsgType.GAME_START,
            playerId,
            gameId,
        });
    }

    function attack(coordinates: Coordinates) {
        // Attack enemy board, set player turn to false.
        if (!isPlayerTurn || !gameStarted) return;
        sendMessage({
            type: MsgType.ATTACK,
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

        let shipId = null;
        if (['SHIP_HIT', 'SHIP_SUNK'].includes(result)) {
            shipId = playerGameboard.getShipId(coordinates);
        }

        const gameEvent = {
            playerId,
            coordinates,
            result,
            shipId,
        };

        if (await uploadGameEvent(gameEvent, gameId) === false) return;

        sendMessage({
            playerId,
            gameId,
            coordinates,
            result,
            shipId,
            type: MsgType.RESULT,
        });

        setGameEvents(prev => [...prev, gameEvent]);
        setIsPlayerTurn(true);
    }

    function processResult({ result, coordinates, shipId, ...data }: Message) {
        // Process incoming result message, update game events.
        if (!result || !coordinates) return;

        const gameEvent = {
            playerId: data.playerId,
            coordinates,
            result,
            shipId,
        };
        setGameEvents(prev => [...prev, gameEvent]);
    }

    ws.onopen = () => {
        sendMessage({
            gameId,
            playerId,
            type: MsgType.PLAYER_JOIN,
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