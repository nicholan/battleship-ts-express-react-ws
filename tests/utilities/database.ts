import type { GameProps } from '../../server/src/models/gameModel.js';
import type { PlayerProps } from '../../server/src/models/userModel.js';
import playwrightConfig from '../playwright.config.js';

const baseUrl = playwrightConfig.use?.baseURL!;

// Sets up multiplayer game lobby with either 1 or 2 players joined.
export async function createMultiplayer(numPlayers: 1 | 2 = 1, options: Partial<GameProps & PlayerProps> = {}) {
	const response = await fetch(`${baseUrl}create`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ numPlayers, ...options }),
	});

	return (await response.json()) as { gameCode: string; p1: string; p2: string | null };
}
