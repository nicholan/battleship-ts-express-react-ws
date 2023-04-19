import { AnyZodObject, ZodError, z } from 'zod';

export function zParse<T extends AnyZodObject>(schema: T, data: unknown): z.infer<T> {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(error.message);
        }
        throw new Error(JSON.stringify(error));
    }
}

export type GameEvent = z.infer<typeof zodGameEvent>;
export type PlayerBoard = z.infer<typeof zodPlayerBoard>
export type Result = z.infer<typeof zodResult>
export type Coordinates = z.infer<typeof zodCoordinates>
export type Message = z.infer<typeof zodMessage>
export type CellStyle = z.infer<typeof zodCellStyle>
export type CellState = z.infer<typeof zodCellState>

const zodMessageType = z.enum(['PLAYER_READY', 'GAME_START', 'PLAYER_JOIN', 'ATTACK', 'RESULT', 'GAME_OVER', 'WINNER']);
const zodCellState = z.enum(['EMPTY', 'SHIP', 'SHOT_MISS', 'SHIP_HIT', 'SHIP_SUNK']);

export const zodGameId = z
    .string()
    .trim()
    .min(8, 'Invalid game code.');

export const zodPlayerId = z
    .string()
    .trim()
    .min(12, 'Invalid player ID.');

export const zodPlayerName = z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(20, 'Name must be less than 20 characters.');

export const zodCoordinates = z.object({
    x: z
        .number()
        .min(0)
        .max(9),
    y: z
        .number()
        .min(0)
        .max(9),
});

export const zodAxis = z.literal('y')
    .or(z.literal('x'));

export const zodShipLength = z
    .number()
    .min(1)
    .max(5);

export const zodShipId = z
    .string()
    .trim()
    .length(8, 'Invalid ship ID');

export const zodResult = z.union([z.literal('SHOT_MISS'), z.literal('SHIP_HIT'), z.literal('SHIP_SUNK')]);

export const zodCellStyle = z.union([z.literal('invalid'), (z.literal('valid')), (z.literal(''))]);

const zodShipPlacement = z.object({
    coordinates: zodCoordinates,
    axis: zodAxis,
    shipLength: zodShipLength,
    shipId: zodShipId,
});

export const zodPlayerBoard = z.array(zodShipPlacement);

export const zodGameEvent = z.object({
    coordinates: zodCoordinates,
    playerId: zodPlayerId,
    result: zodResult,
    shipId: z.nullable(zodShipId)
});

export const zodMessage = z.object({
    type: zodMessageType,
    playerId: zodPlayerId,
    gameId: zodGameId,
    coordinates: zodCoordinates.optional(),
    result: zodResult.optional(),
    name: zodPlayerName.optional(),
    shipId: z.nullable(zodShipId).optional()
});

export const loaderDataSchema = z.object({
    gameId: zodGameId,
    playerId: zodPlayerId,
    playerName: zodPlayerName,
    enemyName: z.nullable(zodPlayerName),
    board: zodPlayerBoard,
    events: z.array(zodGameEvent),
    turn: z.number().min(0).max(1),
    playerTurn: z.number().min(0).max(1),
    started: z.boolean(),
    ready: z.boolean(),
});
