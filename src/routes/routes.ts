import { Router } from 'express';
import { indexRoute } from './index';

export const routes = Router();

routes.use(indexRoute);