import express, { Application } from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router.js';
import { createContext } from './trpc/trpc.js';
import { config } from './config/config.js';
import cors from 'cors';
import morgan from 'morgan';
import { createWsServer } from './wsSserver.js';
import { createDbConnection } from './config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

const __dirname = fileURLToPath(import.meta.url);
const staticFilesDir = path.resolve(__dirname, '../../../client/dist');

const apiLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const app: Application = express();
app.disable('x-powered-by');

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({ origin: config.ALLOWED_HOSTS, credentials: true }));
app.use(express.urlencoded({ extended: false }));

app.use(express.static(staticFilesDir));

app.use(
	'/trpc',
	apiLimiter,
	trpcExpress.createExpressMiddleware({
		router: appRouter,
		createContext,
	})
);

config.IS_DEVELOPMENT &&
	app.get('*', (_req, res) => {
		res.sendFile(path.join(staticFilesDir, 'index.html'));
	});

const expressServer = app.listen(config.API_PORT, () => {
	console.log(`App running at http://localhost:${config.API_PORT}`);
	createDbConnection().catch((err) => {
		throw err;
	});
});

const wss = createWsServer(config.SOCKET_PORT);

expressServer.on('upgrade', function upgrade(request, socket, head) {
	wss.handleUpgrade(request, socket, head, function done(ws) {
		wss.emit('connection', ws, request);
	});
});

export default app;
