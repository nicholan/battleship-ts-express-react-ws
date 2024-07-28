import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc/router.js";
import { createContext } from "./trpc/trpc.js";

import defaultConfig from "./configs/config.js";

import { connectDatabase } from "./database/database.js";
import { startWebSocketServer } from "./wsSserver.js";

const __dirname = fileURLToPath(import.meta.url);
const staticFilesDir = path.resolve(__dirname, "../../../client/dist");

const apiLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 10000, // Limit each IP to 100 (production) or 10000 (development) requests per `window` (here, per 1 minute)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default async function main(config: typeof defaultConfig) {
	const app = express();
	const server = http.createServer(app);

	app.disable("x-powered-by");
	app.use(morgan("dev"));
	app.use(express.json());
	app.use(cors({ origin: config.ALLOWED_HOSTS, credentials: true }));
	app.use(express.urlencoded({ extended: false }));
	app.use(express.static(staticFilesDir));

	app.use(
		"/trpc",
		apiLimiter,
		trpcExpress.createExpressMiddleware({
			router: appRouter,
			createContext,
		}),
	);

	app.get("*", (_req, res) => {
		res.sendFile(path.join(staticFilesDir, "index.html"));
	});

	await connectDatabase(config);
	startWebSocketServer(server);

	server.listen(config.API_PORT, () => {
		console.log(`Server started on port ${config.API_PORT}`);
	});
}

await main(defaultConfig);
