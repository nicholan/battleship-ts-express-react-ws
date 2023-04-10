import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
require('express-async-errors');
import morgan from 'morgan';
import { routes } from './routes/routes';
import { createWsServer } from './wsSserver';
import { config } from './config/config';
import { createDbConnection } from './config/database';

const app: Application = express();
app.disable('x-powered-by');

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({ origin: config.ALLOWED_HOSTS, credentials: true }));
app.use(express.urlencoded({ extended: false }));

createDbConnection();

// app.use(express.static(path.resolve(__dirname, '../../client/dist')));

app.use('/', routes);

const expressServer = app.listen(config.API_PORT, () => {
    console.log(`App running at http://localhost:${config.API_PORT}`);
});

const wss = createWsServer(Number(config.SOCKET_PORT));

expressServer.on('upgrade', function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
        wss.emit('connection', ws, request);
    });
});

export default app;