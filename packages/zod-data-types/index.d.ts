import { AnyZodObject, z } from 'zod';
export declare function zParse<T extends AnyZodObject>(schema: T, data: unknown): z.infer<T>;
export type GameEvent = z.infer<typeof zodGameEvent>;
export type PlayerBoard = z.infer<typeof zodPlayerBoard>;
export type Result = z.infer<typeof zodResult>;
export type Coordinates = z.infer<typeof zodCoordinates>;
export type Message = z.infer<typeof zodMessage>;
export type CellStyle = z.infer<typeof zodCellStyle>;
export type CellState = z.infer<typeof zodCellState>;
export type GameState = z.infer<typeof zodGameState>;
export type LoaderData = z.infer<typeof loaderDataSchema>;
export type GameInvitationMessage = z.infer<typeof zodGameInvitationMessage>;
declare const zodGameState: z.ZodEnum<["STARTED", "NOT_STARTED", "GAME_OVER"]>;
declare const zodCellState: z.ZodEnum<["EMPTY", "SHIP", "SHOT_MISS", "SHIP_HIT", "SHIP_SUNK"]>;
declare const zodResult: z.ZodEnum<["SHOT_MISS", "SHIP_HIT", "SHIP_SUNK"]>;
declare const zodCellStyle: z.ZodEnum<["NONE", "INVALID", "VALID", "SELECTED_VALID", "SELECTED_INVALID_SHIP", "SELECTED_INVALID_MISS"]>;
export declare const zodGameId: z.ZodString;
export declare const zodPlayerId: z.ZodString;
export declare const zodPlayerName: z.ZodString;
export declare const zodCoordinates: z.ZodObject<{
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
    axis: z.ZodEnum<["x", "y"]>;
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
    type: z.ZodEnum<["PLAYER_READY", "GAME_START", "PLAYER_JOIN", "ATTACK", "RESULT", "GAME_OVER", "REQUEST_REMATCH", "REMATCH_ACCEPT", "PLAYER_INVITE"]>;
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
    winner: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "PLAYER_READY" | "GAME_START" | "PLAYER_JOIN" | "ATTACK" | "RESULT" | "GAME_OVER" | "REQUEST_REMATCH" | "REMATCH_ACCEPT" | "PLAYER_INVITE";
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
    winner?: string | undefined;
}, {
    type: "PLAYER_READY" | "GAME_START" | "PLAYER_JOIN" | "ATTACK" | "RESULT" | "GAME_OVER" | "REQUEST_REMATCH" | "REMATCH_ACCEPT" | "PLAYER_INVITE";
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
    winner?: string | undefined;
}>;
export declare const zodGameInvitationMessage: z.ZodObject<{
    gameId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    hostName: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["PLAYER_READY", "GAME_START", "PLAYER_JOIN", "ATTACK", "RESULT", "GAME_OVER", "REQUEST_REMATCH", "REMATCH_ACCEPT", "PLAYER_INVITE"]>;
}, "strip", z.ZodTypeAny, {
    type: "PLAYER_READY" | "GAME_START" | "PLAYER_JOIN" | "ATTACK" | "RESULT" | "GAME_OVER" | "REQUEST_REMATCH" | "REMATCH_ACCEPT" | "PLAYER_INVITE";
    gameId: string;
    name?: string | undefined;
    hostName?: string | undefined;
}, {
    type: "PLAYER_READY" | "GAME_START" | "PLAYER_JOIN" | "ATTACK" | "RESULT" | "GAME_OVER" | "REQUEST_REMATCH" | "REMATCH_ACCEPT" | "PLAYER_INVITE";
    gameId: string;
    name?: string | undefined;
    hostName?: string | undefined;
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
        axis: z.ZodEnum<["x", "y"]>;
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
    ready: z.ZodBoolean;
    gameState: z.ZodEnum<["STARTED", "NOT_STARTED", "GAME_OVER"]>;
    winner: z.ZodNullable<z.ZodString>;
    isAiGame: z.ZodBoolean;
    aiBoard: z.ZodArray<z.ZodObject<{
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
        axis: z.ZodEnum<["x", "y"]>;
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
    winner: string | null;
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
    ready: boolean;
    gameState: "GAME_OVER" | "STARTED" | "NOT_STARTED";
    isAiGame: boolean;
    aiBoard: {
        coordinates: {
            x: number;
            y: number;
        };
        shipId: string;
        axis: "x" | "y";
        shipLength: number;
    }[];
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
    winner: string | null;
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
    ready: boolean;
    gameState: "GAME_OVER" | "STARTED" | "NOT_STARTED";
    isAiGame: boolean;
    aiBoard: {
        coordinates: {
            x: number;
            y: number;
        };
        shipId: string;
        axis: "x" | "y";
        shipLength: number;
    }[];
}>;
export {};
