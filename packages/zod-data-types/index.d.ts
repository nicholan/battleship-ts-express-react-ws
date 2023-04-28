import { AnyZodObject, z } from 'zod';
export declare function zParse<T extends AnyZodObject>(schema: T, data: unknown): z.infer<T>;
export type GameEvent = z.infer<typeof zodGameEvent>;
export type PlayerBoard = z.infer<typeof zodPlayerBoard>;
export type Result = z.infer<typeof zodResult>;
export type Coordinates = z.infer<typeof zodCoordinates>;
export type Message = z.infer<typeof zodMessage>;
export type CellStyle = z.infer<typeof zodCellStyle>;
export type CellState = z.infer<typeof zodCellState>;
declare const zodCellState: z.ZodEnum<["EMPTY", "SHIP", "SHOT_MISS", "SHIP_HIT", "SHIP_SUNK"]>;
declare const zodResult: z.ZodEnum<["SHOT_MISS", "SHIP_HIT", "SHIP_SUNK"]>;
declare const zodCellStyle: z.ZodEnum<["", "INVALID", "VALID"]>;
export declare const zodGameId: z.ZodString;
export declare const zodPlayerId: z.ZodString;
export declare const zodPlayerName: z.ZodString;
declare const zodCoordinates: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    x: number;
    y: number;
}, {
    x: number;
    y: number;
}>;
export declare const zodPlayerBoard: z.ZodArray<z.ZodObject<{
    coordinates: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    axis: z.ZodUnion<[z.ZodLiteral<"y">, z.ZodLiteral<"x">]>;
    shipLength: z.ZodNumber;
    shipId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    coordinates: {
        x: number;
        y: number;
    };
    shipId: string;
    axis: "x" | "y";
    shipLength: number;
}, {
    coordinates: {
        x: number;
        y: number;
    };
    shipId: string;
    axis: "x" | "y";
    shipLength: number;
}>, "many">;
export declare const zodGameEvent: z.ZodObject<{
    coordinates: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    playerId: z.ZodString;
    result: z.ZodEnum<["SHOT_MISS", "SHIP_HIT", "SHIP_SUNK"]>;
    shipId: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    coordinates: {
        x: number;
        y: number;
    };
    playerId: string;
    result: "SHOT_MISS" | "SHIP_HIT" | "SHIP_SUNK";
    shipId: string | null;
}, {
    coordinates: {
        x: number;
        y: number;
    };
    playerId: string;
    result: "SHOT_MISS" | "SHIP_HIT" | "SHIP_SUNK";
    shipId: string | null;
}>;
export declare const zodMessage: z.ZodObject<{
    type: z.ZodEnum<["PLAYER_READY", "GAME_START", "PLAYER_JOIN", "ATTACK", "RESULT", "GAME_OVER", "WINNER"]>;
    playerId: z.ZodString;
    gameId: z.ZodString;
    coordinates: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>>;
    events: z.ZodOptional<z.ZodArray<z.ZodObject<{
        coordinates: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        playerId: z.ZodString;
        result: z.ZodEnum<["SHOT_MISS", "SHIP_HIT", "SHIP_SUNK"]>;
        shipId: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coordinates: {
            x: number;
            y: number;
        };
        playerId: string;
        result: "SHOT_MISS" | "SHIP_HIT" | "SHIP_SUNK";
        shipId: string | null;
    }, {
        coordinates: {
            x: number;
            y: number;
        };
        playerId: string;
        result: "SHOT_MISS" | "SHIP_HIT" | "SHIP_SUNK";
        shipId: string | null;
    }>, "many">>;
    name: z.ZodOptional<z.ZodString>;
    turn: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "PLAYER_READY" | "GAME_START" | "PLAYER_JOIN" | "ATTACK" | "RESULT" | "GAME_OVER" | "WINNER";
    playerId: string;
    gameId: string;
    coordinates?: {
        x: number;
        y: number;
    } | undefined;
    events?: {
        coordinates: {
            x: number;
            y: number;
        };
        playerId: string;
        result: "SHOT_MISS" | "SHIP_HIT" | "SHIP_SUNK";
        shipId: string | null;
    }[] | undefined;
    name?: string | undefined;
    turn?: number | undefined;
}, {
    type: "PLAYER_READY" | "GAME_START" | "PLAYER_JOIN" | "ATTACK" | "RESULT" | "GAME_OVER" | "WINNER";
    playerId: string;
    gameId: string;
    coordinates?: {
        x: number;
        y: number;
    } | undefined;
    events?: {
        coordinates: {
            x: number;
            y: number;
        };
        playerId: string;
        result: "SHOT_MISS" | "SHIP_HIT" | "SHIP_SUNK";
        shipId: string | null;
    }[] | undefined;
    name?: string | undefined;
    turn?: number | undefined;
}>;
export declare const loaderDataSchema: z.ZodObject<{
    gameId: z.ZodString;
    playerId: z.ZodString;
    name: z.ZodString;
    enemyName: z.ZodNullable<z.ZodString>;
    board: z.ZodArray<z.ZodObject<{
        coordinates: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        axis: z.ZodUnion<[z.ZodLiteral<"y">, z.ZodLiteral<"x">]>;
        shipLength: z.ZodNumber;
        shipId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        coordinates: {
            x: number;
            y: number;
        };
        shipId: string;
        axis: "x" | "y";
        shipLength: number;
    }, {
        coordinates: {
            x: number;
            y: number;
        };
        shipId: string;
        axis: "x" | "y";
        shipLength: number;
    }>, "many">;
    events: z.ZodArray<z.ZodObject<{
        coordinates: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        playerId: z.ZodString;
        result: z.ZodEnum<["SHOT_MISS", "SHIP_HIT", "SHIP_SUNK"]>;
        shipId: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        coordinates: {
            x: number;
            y: number;
        };
        playerId: string;
        result: "SHOT_MISS" | "SHIP_HIT" | "SHIP_SUNK";
        shipId: string | null;
    }, {
        coordinates: {
            x: number;
            y: number;
        };
        playerId: string;
        result: "SHOT_MISS" | "SHIP_HIT" | "SHIP_SUNK";
        shipId: string | null;
    }>, "many">;
    turn: z.ZodNumber;
    playerTurn: z.ZodNumber;
    started: z.ZodBoolean;
    ready: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    playerId: string;
    gameId: string;
    events: {
        coordinates: {
            x: number;
            y: number;
        };
        playerId: string;
        result: "SHOT_MISS" | "SHIP_HIT" | "SHIP_SUNK";
        shipId: string | null;
    }[];
    name: string;
    turn: number;
    enemyName: string | null;
    board: {
        coordinates: {
            x: number;
            y: number;
        };
        shipId: string;
        axis: "x" | "y";
        shipLength: number;
    }[];
    playerTurn: number;
    started: boolean;
    ready: boolean;
}, {
    playerId: string;
    gameId: string;
    events: {
        coordinates: {
            x: number;
            y: number;
        };
        playerId: string;
        result: "SHOT_MISS" | "SHIP_HIT" | "SHIP_SUNK";
        shipId: string | null;
    }[];
    name: string;
    turn: number;
    enemyName: string | null;
    board: {
        coordinates: {
            x: number;
            y: number;
        };
        shipId: string;
        axis: "x" | "y";
        shipLength: number;
    }[];
    playerTurn: number;
    started: boolean;
    ready: boolean;
}>;
export {};
