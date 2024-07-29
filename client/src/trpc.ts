import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../server/src/trpc/router.js";

const hostURL = import.meta.env.VITE_HOST_URL
	? `${import.meta.env.VITE_HOST_URL}/trpc`
	: "http://localhost:3000/trpc";

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({
			url: hostURL,
		}),
	],
});

export type TRPC = typeof trpc;
