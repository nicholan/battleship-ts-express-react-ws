import path from 'path';
import express, { Application } from 'express';
import { routes } from './routes/routes';

import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const port = process.env.PORT;

app.use(express.json());

app.use('/', routes);

app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});

export default app;