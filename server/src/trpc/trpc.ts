import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */

export const createContext = ({
    req,
    res,
}: trpcExpress.CreateExpressContextOptions) => ({}); // no context

type Context = inferAsyncReturnType<typeof createContext>;

const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 * that cane be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;