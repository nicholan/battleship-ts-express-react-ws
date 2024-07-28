import { vi } from "vitest";
import { playerGameboard } from "../../Gameboard/Gameboard.js";
import { multiplayerController } from "../MultiplayerController.js";
import { actions, data, db } from "./mockSetup.js";

describe("multiplayerController", () => {
	beforeEach(() => {
		playerGameboard.reset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("readyPlayer", () => {
		const { readyPlayer } = multiplayerController({
			...data,
			db,
			actions,
		});

		it("returns false if gameboard is not populated", async () => {
			playerGameboard.reset();
			const readyState = await readyPlayer();
			expect(readyState).toEqual(false);
		});

		it("returns true when all ships are placed on the board", async () => {
			playerGameboard.populateBoard();
			const readyState = await readyPlayer();
			expect(readyState).toEqual(true);
		});

		it("calls actions and db calls with correct values", async () => {
			playerGameboard.populateBoard();
			await readyPlayer();

			expect(actions.setReady).toHaveBeenCalledWith(true);
			expect(actions.sendJsonMessage).toHaveBeenCalledWith({
				type: "PLAYER_READY",
				gameId: data.gameId,
				playerId: data.playerId,
			});
			expect(db.readyPlayer.mutate).toBeCalledWith({
				playerBoard: playerGameboard.getBuildArray(),
				playerId: data.playerId,
			});
		});
	});

	describe("attack", () => {
		const { attack } = multiplayerController({
			...data,
			db,
			actions,
		});

		it("calls actions setIsPlayerTurn and sendJsonMessage with correct values", async () => {
			const coordinates = { x: 0, y: 0 };
			await attack(coordinates);
			expect(actions.sendJsonMessage).toHaveBeenCalledWith({
				type: "ATTACK",
				coordinates,
				gameId: data.gameId,
				playerId: data.playerId,
			});
			expect(db.getGameTurn.query).toBeCalled();
			expect(actions.setIsPlayerTurn).toHaveBeenCalledWith(false);
		});
	});

	describe("requestRematch", () => {
		it("calls actions setReady and sendJsonMessage with correct values", () => {
			const { requestRematch } = multiplayerController({
				...data,
				db,
				actions,
			});

			requestRematch();
			expect(actions.sendJsonMessage).toHaveBeenCalledWith({
				type: "REQUEST_REMATCH",
				name: data.name,
				gameId: data.gameId,
				playerId: data.playerId,
			});
			expect(actions.setReady).toHaveBeenCalledWith(false);
		});

		it("returns true when called first time and false when called again", () => {
			const { requestRematch } = multiplayerController({
				...data,
				db,
				actions,
			});

			const first = requestRematch();
			const again = requestRematch();
			expect(first).toEqual(true);
			expect(again).toEqual(false);
		});
	});

	describe("invite", () => {
		const { invite } = multiplayerController({
			...data,
			db,
			actions,
		});

		it("calls sendJsonMessage with correct values", () => {
			const playerName = "testName";
			invite(playerName);

			expect(actions.sendJsonMessage).toHaveBeenCalledWith({
				type: "PLAYER_INVITE",
				hostName: data.name,
				name: playerName,
				gameId: data.gameId,
				playerId: data.playerId,
			});
		});
	});
});
