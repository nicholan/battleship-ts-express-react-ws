import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../server/src/trpc/router.js";

const hostURL =  process.env.HOST_URL ? `${process.env.HOST_URL}/trpc` : "http://localhost:3000/trpc";

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: hostURL,
		}),
	],
});

export type TRPC = typeof trpc;
