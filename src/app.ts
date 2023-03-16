import path from 'path';
import express, { Application, NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { routes } from './routes/routes';

import dotenv from 'dotenv';

dotenv.config();
const port = process.env.PORT;

const app: Application = express();
app.disable('x-powered-by');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', routes);

// 404
app.use((req, res) => {
    res.status(404).send('Page not found.');
});

// Error handler
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});

export default app;