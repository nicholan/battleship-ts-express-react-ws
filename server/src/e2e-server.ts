import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

import * as trpcExpress from '@trpc/server/adapters/express';
import { multiplayerRouter } from './e2e-router.js';
import { appRouter } from './trpc/router.js';
import { createContext } from './trpc/trpc.js';

import { startDevelopmentDatabase } from './database/database.js';
import { startWebSocketServer } from './wsSserver.js';

const e2eServer = () => {
	const __dirname = fileURLToPath(import.meta.url);
	const staticFilesDir = path.resolve(__dirname, '../../../client/dist');
	const app = express();
	const server = http.createServer(app);

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));

	app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
	app.use(express.static(staticFilesDir));
	app.use(
		'/trpc',
		trpcExpress.createExpressMiddleware({
			router: appRouter,
			createContext,
		})
	);

	app.use('/create', multiplayerRouter);

	app.get('*', (_req, res) => {
		res.sendFile(path.join(staticFilesDir, 'index.html'));
	});

	startWebSocketServer(server);
	startDevelopmentDatabase().catch((err) => console.log(err));

	server.listen(3000);
};

e2eServer();
