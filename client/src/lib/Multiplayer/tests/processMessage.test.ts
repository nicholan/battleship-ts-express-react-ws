import type { GameEvent, Message } from "@packages/zod-data-types";
import { vi } from "vitest";
import { playerGameboard } from "../../Gameboard/Gameboard.js";
import { multiplayerController } from "../MultiplayerController.js";
import { actions, data, db, msgBase } from "./mockSetup.js";

// processMessage is destructured from multiplayerController.
// tests functions that should run when websocket receives message.
describe("processMessage", () => {
	beforeEach(() => {
		playerGameboard.reset();
		const controller = multiplayerController({
			...data,
			db,
			actions,
		});

		processMessage = controller.processMessage;
		readyPlayer = controller.readyPlayer;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	let processMessage: (data: Message) => Promise<boolean>;
	let readyPlayer: () => Promise<boolean>;

	describe("", () => {
		it("returns false and does not call any actions if data does not match zodMessage schema", async () => {
			const message = {
				something: "NOT_IN_SCHEMA",
			} as unknown as Message;

			const result = await processMessage(message);
			expect(result).toEqual(false);

			for (const key of Object.keys(actions)) {
				expect(actions[key as keyof typeof actions]).not.toBeCalled();
			}
		});
	});

	describe("dispatchTable[PLAYER_READY]", () => {
		it("does not run processGameStart when player is not ready", async () => {
			const message = {
				type: "PLAYER_READY",
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			expect(actions.setGameState).not.toBeCalledWith("STARTED");
			expect(actions.setIsPlayerTurn).not.toBeCalledWith(true);
		});

		it("runs processGameStart when player is ready", async () => {
			const message = {
				type: "PLAYER_READY",
				...msgBase,
			} as Message;

			playerGameboard.populateBoard();
			await readyPlayer();

			const result = await processMessage(message);
			expect(result).toEqual(true);

			expect(db.startGame.mutate).toBeCalledWith({ gameId: data.gameId });
			expect(actions.setGameState).toBeCalledWith("STARTED");
			expect(actions.setIsPlayerTurn).toBeCalledWith(true);
		});
	});

	describe("dispatchTable[PLAYER_JOIN]", () => {
		it("does not run processPlayerJoin if enemyName is not null", async () => {
			const { processMessage } = multiplayerController({
				...data,
				enemyName: "enemy",
				db,
				actions,
			});

			const message = {
				type: "PLAYER_JOIN",
				name: "John",
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			// Name gets transformed to lowercase by zod.
			expect(actions.setEnemyName).not.toBeCalledWith("john");
		});

		it("runs processPlayerJoin if enemyName is null", async () => {
			const { processMessage } = multiplayerController({
				...data,
				enemyName: null,
				db,
				actions,
			});

			const message = {
				type: "PLAYER_JOIN",
				name: "John",
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			// Name gets transformed to lowercase by zod.
			expect(actions.setEnemyName).toBeCalledWith("john");
		});
	});

	describe("dispatchTable[GAME_START]", () => {
		it("runs startGame", async () => {
			const { processMessage } = multiplayerController({
				...data,
				db,
				actions,
			});

			const message = {
				type: "GAME_START",
				turn: 1,
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			expect(actions.setGameState).toBeCalledWith("STARTED");
			expect(actions.setIsPlayerTurn).toBeCalled();
		});
	});

	describe("dispatchTable[ATTACK]", () => {
		it("runs processAttack", async () => {
			const { processMessage } = multiplayerController({
				...data,
				db,
				actions,
			});

			const coordinates = { x: 1, y: 2 };

			// playerGameboard has no ships placed, so result will always be miss.
			const expectedEvent: GameEvent = {
				result: "SHOT_MISS",
				coordinates,
				playerId: data.playerId,
				shipId: null,
			};

			const message = {
				type: "ATTACK",
				coordinates,
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			expect(db.addEvent.mutate).toBeCalledWith({
				gameEvent: expectedEvent,
				gameId: data.gameId,
			});
			expect(actions.setGameEvents).toBeCalledWith([expectedEvent]);
			expect(actions.setIsPlayerTurn).toBeCalledWith(true);
		});

		it("runs processGameEnding if receiveAttack sinks the last ship", async () => {
			const { processMessage } = multiplayerController({
				...data,
				db,
				actions,
			});

			const coordinates = { x: 1, y: 2 };

			// Mock receiveAttack result
			playerGameboard.receiveAttack = vi.fn(() => ({
				result: "SHIP_SUNK",
				shipId: "testid1",
				allShipsSunk: true,
			}));

			const expectedEvent: GameEvent = {
				result: "SHIP_SUNK",
				coordinates,
				playerId: data.playerId,
				shipId: "testid1",
			};

			const message = {
				type: "ATTACK",
				coordinates,
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			expect(db.gameOver.mutate).toBeCalledWith({
				gameId: data.gameId,
				playerTurn: data.playerTurn,
			});
			expect(actions.setGameEvents).toBeCalledWith([expectedEvent]);
			expect(actions.setIsPlayerTurn).toBeCalledWith(false);
			expect(actions.setWinner).toBeCalledWith("winner");
			expect(actions.setRematchModalVisible).toBeCalledWith(true);
			expect(actions.setGameState).toBeCalledWith("GAME_OVER");
		});
	});

	describe("dispatchTable[RESULT]", () => {
		it("calls setGameEvents with the received result", async () => {
			const { processMessage } = multiplayerController({
				...data,
				db,
				actions,
			});

			const coordinates = { x: 1, y: 2 };

			const event: GameEvent = {
				result: "SHIP_SUNK",
				coordinates,
				playerId: data.playerId,
				shipId: "testid1",
			};

			const message = {
				type: "RESULT",
				events: [event],
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			expect(actions.setGameEvents).toBeCalledWith([event]);
		});
	});

	describe("dispatchTable[GAME_OVER]", () => {
		it("runs processGameOver", async () => {
			const { processMessage } = multiplayerController({
				...data,
				db,
				actions,
			});

			const message = {
				type: "GAME_OVER",
				winner: "WINNERNAME",
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			expect(actions.setIsPlayerTurn).toBeCalledWith(false);
			expect(actions.setWinner).toBeCalledWith("winnername");
			expect(actions.setRematchModalVisible).toBeCalledWith(true);
			expect(actions.setGameState).toBeCalledWith("GAME_OVER");
		});
	});

	describe("dispatchTable[REQUEST_REMATCH]", () => {
		it("runs processRematch and closes rematch modal if player has not requested rematch first", async () => {
			const { processMessage } = multiplayerController({
				...data,
				db,
				actions,
			});

			const message = {
				type: "REQUEST_REMATCH",
				name: "mockName",
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			expect(actions.setRematchModalVisible).toBeCalledWith(false);
			expect(actions.navigate).not.toBeCalled();
		});

		it("runs processRematch, resets game and reloads current page if player has requested rematch first", async () => {
			const { processMessage, requestRematch } = multiplayerController({
				...data,
				db,
				actions,
			});

			requestRematch();

			const message = {
				type: "REQUEST_REMATCH",
				name: "mockName",
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			expect(actions.navigate).toBeCalledWith(0);
		});
	});

	describe("dispatchTable[REMATCH_ACCEPT]", () => {
		it("reloads page with navigate(0)", async () => {
			const { processMessage } = multiplayerController({
				...data,
				db,
				actions,
			});

			const message = {
				type: "REMATCH_ACCEPT",
				...msgBase,
			} as Message;

			const result = await processMessage(message);
			expect(result).toEqual(true);

			expect(actions.navigate).toBeCalledWith(0);
		});
	});
});
