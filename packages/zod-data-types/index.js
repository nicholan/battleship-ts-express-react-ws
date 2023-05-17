import { z, ZodError } from 'zod';
const regex = /^[a-z0-9]+$/i;
export function zParse(schema, data) {
    try {
        return schema.parse(data);
    }
    catch (error) {
        if (error instanceof ZodError) {
            throw new Error(error.message);
        }
        throw new Error(JSON.stringify(error));
    }
}
const zodMessageType = z.enum([
    'PLAYER_READY',
    'GAME_START',
    'PLAYER_JOIN',
    'ATTACK',
    'RESULT',
    'GAME_OVER',
    'REQUEST_REMATCH',
    'REMATCH_ACCEPT',
    'PLAYER_INVITE',
]);
const zodCellState = z.enum(['EMPTY', 'SHIP', 'SHOT_MISS', 'SHIP_HIT', 'SHIP_SUNK']);
const zodResult = z.enum(['SHOT_MISS', 'SHIP_HIT', 'SHIP_SUNK']);
const zodCellStyle = z.enum([
    'NONE',
    'INVALID',
    'VALID',
    'SELECTED_VALID',
    'SELECTED_INVALID_SHIP',
    'SELECTED_INVALID_MISS',
]);
const zodGameState = z.literal('STARTED').or(z.literal('NOT_STARTED')).or(z.literal('GAME_OVER'));
const zodAxis = z.enum(['x', 'y']);
export const zodGameId = z.string().trim().min(8, 'Invalid game code.');
export const zodPlayerId = z.string().trim().min(8, 'Invalid player ID.');
export const zodPlayerName = z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Name is required.')
    .max(20, 'Name must be less than 20 characters.')
    .regex(regex, 'Name may contain only letters and numbers.');
const zodCoordinates = z.object({
    x: z.number().min(0).max(9),
    y: z.number().min(0).max(9),
});
const zodShipLength = z.number().min(1).max(5);
const zodShipId = z.string().trim();
const zodShipPlacement = z.object({
    coordinates: zodCoordinates,
    axis: zodAxis,
    shipLength: zodShipLength,
    shipId: zodShipId,
});
// Maximum number of ships is 7.
export const zodPlayerBoard = z.array(zodShipPlacement).min(0).max(7);
export const zodGameEvent = z.object({
    coordinates: zodCoordinates,
    playerId: zodPlayerId,
    result: zodResult,
    shipId: z.nullable(zodShipId),
});
export const zodMessage = z.object({
    type: zodMessageType,
    playerId: zodPlayerId,
    gameId: zodGameId,
    coordinates: zodCoordinates.optional(),
    events: z.array(zodGameEvent).optional(),
    name: zodPlayerName.optional(),
    turn: z.number().min(0).max(1).optional(),
    winner: zodPlayerName.optional(),
});
export const zodGameInvitationMessage = z.object({
    gameId: zodGameId,
    name: zodPlayerName.optional(),
    hostName: zodPlayerName.optional(),
    type: zodMessageType,
});
export const loaderDataSchema = z.object({
    gameId: zodGameId,
    playerId: zodPlayerId,
    name: zodPlayerName,
    enemyName: z.nullable(zodPlayerName),
    board: zodPlayerBoard,
    events: z.array(zodGameEvent),
    turn: z.number().min(0).max(2),
    playerTurn: z.number().min(0).max(1),
    ready: z.boolean(),
    gameState: zodGameState,
    winner: z.nullable(zodPlayerName),
    isAiGame: z.boolean(),
    aiBoard: zodPlayerBoard,
});
//# sourceMappingURL=index.js.map