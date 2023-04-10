export const CellState = {
    EMPTY: 'EMPTY',
    SHIP: 'SHIP',
    SHOT_MISS: 'SHOT_MISS',
    SHIP_HIT: 'SHIP_HIT',
    SHIP_SUNK: 'SHIP_SUNK',
} as const;

export const MsgType = {
    PLAYER_READY: 'PLAYER_READY',
    GAME_START: 'GAME_START',
    PLAYER_JOIN: 'PLAYER_JOIN',
    ATTACK: 'ATTACK',
    RESULT: 'RESULT',
    GAME_OVER: 'GAME_OVER',
    WINNER: 'WINNER',
} as const;

export type Coordinates = {
    x: number,
    y: number,
}

export type CellStyle = 'invalid' | 'valid' | '';

export type Message = {
    gameId: string,
    playerId: string,
    type: keyof typeof MsgType,
    coordinates?: Coordinates,
    result?: 'SHOT_MISS' | 'SHIP_HIT',
    name?: string,
}

export type GameEvent = {
    coordinates: Coordinates
    playerId: string,
    result: 'SHOT_MISS' | 'SHIP_HIT',
}