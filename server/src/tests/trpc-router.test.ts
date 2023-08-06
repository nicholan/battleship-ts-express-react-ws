import { appRouter, type AppRouter } from '../trpc/router.js';
import { inferProcedureInput } from '@trpc/server';
import test from 'ava';
import request from 'supertest';

import app from '../app.js';

test('Create game returns name and gameId', async (t) => {
	const caller = appRouter.createCaller({});

	const input: inferProcedureInput<AppRouter['createGame']> = {
		name: 'alice',
	};

	const { name, gameId } = await caller.createGame(input);

	t.is(name, 'alice');
	t.is(gameId.length, 4);
});

test('getGame returns correct type of object', async (t) => {
	const caller = appRouter.createCaller({});

	const input: inferProcedureInput<AppRouter['createGame']> = {
		name: 'alice',
	};

	const { name, gameId } = await caller.createGame(input);
	const game = await caller.getGame({ name, gameId });
	t.is(game.name, name);
	t.is(game.gameId, gameId);
});

test('GET / returns status 200', async (t) => {
	const response = await request(app).get('/');
	t.is(response.status, 200);
});
