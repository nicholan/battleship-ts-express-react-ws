import { Router } from 'express';

export const indexRoute = Router();

indexRoute.get('/', (req, res) => {
    res.json({ message: 'Express Typescript server' });
});

indexRoute.post('/', (req, res) => {
    console.log(req);
    res.end();
});
