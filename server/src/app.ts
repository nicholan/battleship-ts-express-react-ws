import express, { Application } from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './trpc/index';
import { createContext } from './trpc/trpc';
import { config } from './config/config';
import cors from 'cors';
require('express-async-errors');
import morgan from 'morgan';
import { createWsServer } from './wsSserver';
import { createDbConnection } from './config/database';

const app: Application = express();
app.disable('x-powered-by');

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({ origin: config.ALLOWED_HOSTS, credentials: true }));
app.use(express.urlencoded({ extended: false }));

// app.use(express.static(path.resolve(__dirname, '../../client/dist')));

app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
    }),
);

const expressServer = app.listen(config.API_PORT, () => {
    console.log(`App running at http://localhost:${config.API_PORT}`);
    createDbConnection();
});

const wss = createWsServer(Number(config.SOCKET_PORT));

expressServer.on('upgrade', function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
    });
});

export default app;