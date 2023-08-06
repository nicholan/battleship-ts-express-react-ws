import { Game } from './Game.js';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { playerGameboard } from '../../lib/Gameboard/Gameboard.js';
import userEvent from '@testing-library/user-event';
import type { GameProps } from './Game.js';

const data = {
	playerId: 'playerId',
	playerName: 'Player',
	enemyName: 'Player2',
	gameId: 'game1',
	board: [],
	gameEvents: [],
	ready: false,
	gameState: 'NOT_STARTED',
	aiBoard: [],
	isPlayerTurn: false,

	readyPlayer: vi.fn(() => {
		return Promise.resolve(true);
	}),
	attack: vi.fn(() => {
		return void 0;
	}),
	invitePlayer: vi.fn(() => {
		return void 0;
	}),
} as GameProps;

beforeEach(() => {
	vi.clearAllMocks();
	playerGameboard.reset();
});

describe('Game component', () => {
	describe('renders', () => {
		beforeEach(() => {
			render(<Game {...data} />);
		});

		it('name props', () => {
			expect(screen.getByText('Player')).toBeInTheDocument();
			expect(screen.getByText('Player2')).toBeInTheDocument();
		});

		it('Reset and Clear buttons', () => {
			expect(screen.getByText('Random')).toBeInTheDocument();
			expect(screen.getByText('Clear')).toBeInTheDocument();
		});
	});

	describe('Random button', () => {
		it('calls populateBoard', async () => {
			const spy = vi.spyOn(playerGameboard, 'populateBoard');
			render(<Game {...data} />);

			const random = screen.getByText('Random');
			await userEvent.click(random);

			expect(playerGameboard.getShipLength()).toEqual(0);
			expect(spy).toHaveBeenCalledTimes(1);
		});
	});

	describe('Clear button', () => {
		it('is disabled if ships are not placed', () => {
			render(<Game {...data} />);
			expect(screen.getByText('Clear')).toHaveAttribute('disabled');
		});

		it('is not disabled if ships are placed', async () => {
			render(<Game {...data} />);
			const random = screen.getByText('Random');
			await userEvent.click(random);

			expect(screen.getByText('Clear')).not.toHaveAttribute('disabled');
		});

		it('resets playerGameboard', async () => {
			const spy = vi.spyOn(playerGameboard, 'reset');
			render(<Game {...data} />);

			const random = screen.getByText('Random');
			await userEvent.click(random);

			expect(playerGameboard.getShipLength()).toEqual(0);

			const clear = screen.getByText('Clear');
			await userEvent.click(clear);

			expect(playerGameboard.getShipLength()).toEqual(5);

			// populateBoard calls reset() internally once; clicking clear calls it again.
			expect(spy).toHaveBeenCalledTimes(2);
		});
	});

	describe('Invite button', () => {
		it('is not rendered if enemyName is provided', () => {
			render(<Game {...data} />);
			expect(screen.queryByText('Invite')).not.toBeInTheDocument();
		});

		it('to be rendered when enemyName is null', () => {
			render(<Game {...data} enemyName={null} />);
			expect(screen.getByText('Invite')).toBeInTheDocument();
		});

		it('opens invite modal when clicked', async () => {
			render(<Game {...data} enemyName={null} />);
			const invite = screen.getByText('Invite');

			await userEvent.click(invite);

			expect(screen.getByText('Send')).toBeInTheDocument();
			expect(screen.getByText(data.gameId)).toBeInTheDocument();
		});
	});

	describe('Ready button', () => {
		it('is not rendered if ships are not placed', () => {
			render(<Game {...data} />);

			expect(screen.queryByText('Ready')).not.toBeInTheDocument();
		});

		it('is rendered when ships are placed', async () => {
			render(<Game {...data} />);

			const random = screen.getByText('Random');
			await userEvent.click(random);

			expect(screen.getByText('Ready')).toBeInTheDocument();
		});

		it('calls readyPlayer when clicked', async () => {
			render(<Game {...data} />);

			const random = screen.getByText('Random');
			await userEvent.click(random);

			const ready = screen.getByText('Ready');
			await userEvent.click(ready);

			expect(data.readyPlayer).toBeCalledTimes(1);
		});
	});

	describe('when gameState is STARTED', () => {
		it('renders correct turn indicators on player turn', () => {
			render(<Game {...data} gameState={'STARTED'} ready={true} isPlayerTurn={true} />);

			expect(screen.getByText('Your turn')).toBeInTheDocument();
		});

		it('renders correct turn indicators on enemy turn', () => {
			render(<Game {...data} gameState={'STARTED'} ready={true} isPlayerTurn={false} />);

			const text = `${data.enemyName ?? 'Enemy'} turn`;

			expect(screen.getByText(text)).toBeInTheDocument();
		});
	});
});
