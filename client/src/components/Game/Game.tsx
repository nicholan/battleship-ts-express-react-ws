import React, { useState } from 'react';
import { GameEvent, Coordinates } from '../../../../client/src/types/shared';
import { Cell } from '../../lib/Gameboard';
import { CoordinatesBar } from './CoordinatesBar/CoordinatesBar';
import { Nametag } from './Nametag/Nametag';
import { Board } from './Board/Board';
import { Button } from '../Buttons/Button';
import { playerGameboard, enemyGameboard } from '../../lib/Gameboard';
import './Game.css';

type Props = {
    playerId: string,
    playerName: string,
    enemyName: string | null | undefined,
    board: Cell[][],
    gameEvents: GameEvent[],
    gameStarted: boolean,
    ready: boolean,
    isPlayerTurn: boolean,
    readyPlayer: () => Promise<boolean>,
    attack: (coordinates: Coordinates) => void,
}

export function Game(
    {
        playerId,
        playerName,
        enemyName,
        board,
        gameEvents,
        gameStarted,
        ready,
        isPlayerTurn,
        attack,
        readyPlayer
    }: Props) {

    const playerEvents = gameEvents.filter((evt) => { return evt.playerId === playerId; });
    const enemyEvents = gameEvents.filter((evt) => { return evt.playerId !== playerId; });

    playerGameboard.parseGameData(playerEvents, board);
    enemyGameboard.parseGameData(enemyEvents);

    const [shipsRemaining, setShipsRemaining] = useState(playerGameboard.getShipLength() === 0 ? false : true);
    const [playerReady, setPlayerReady] = useState(ready);
    const [dateKey, setDateKey] = useState(new Date().getTime().toString());

    function resetBoard() {
        playerGameboard.reset();
        setShipsRemaining(true);
        setDateKey(new Date().getTime().toString());
    }

    function randomizeBoard() {
        playerGameboard.populateBoard();
        setShipsRemaining(false);
        setDateKey(new Date().getTime().toString());
    }

    async function handlePlayerReady() {
        setPlayerReady(true);
        readyPlayer();
    }

    return (
        <div className="game_wrapper">
            <CoordinatesBar type='num' axis='row' gridArea='coordinates_row_p1' />
            <CoordinatesBar type='letter' axis='column' gridArea='coordinates_col_p1' />
            <Board
                key={dateKey}
                isPlayerBoard={true}
                setShipsRemaining={setShipsRemaining}
                isTurn={gameStarted && isPlayerTurn}
            />
            <Nametag name={playerName} gridArea='player_name' isTurn={gameStarted && isPlayerTurn}/>

            <CoordinatesBar type='num' axis='row' gridArea='coordinates_row_p2' />
            <CoordinatesBar type='letter' axis='column' gridArea='coordinates_col_p2' />
            <Board
                isPlayerBoard={false}
                attack={attack}
                isTurn={gameStarted && isPlayerTurn}
            />
            <Nametag name={enemyName} gridArea='enemy_name' isTurn={gameStarted && !isPlayerTurn}/>

            <div className='box_bottom_left'>
                {!gameStarted && !shipsRemaining && <Button text={playerReady ? 'Waiting...' : 'Ready?'} onClick={handlePlayerReady} disabled={playerReady} />}
            </div>
            <div className='box_top_right'>
                {!playerReady && !gameStarted && <Button text='Reset' onClick={resetBoard} />}
                {!playerReady && !gameStarted && <Button text='Random' onClick={randomizeBoard} />}
            </div>
        </div>
    );
}