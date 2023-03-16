import { Router, Request, Response } from 'express';

export const indexRoute = Router();

indexRoute.get('/', (req: Request, res: Response) => {
    res.send('Express Typescript server');
});
