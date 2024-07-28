import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

import * as trpcExpress from "@trpc/server/adapters/express";
import { multiplayerRouter } from "./e2e-testing-router.js";
import { appRouter } from "./trpc/router.js";
import { createContext } from "./trpc/trpc.js";

import { startDevelopmentDatabase } from "./database/database.js";
import { startWebSocketServer } from "./wsSserver.js";

// Server used for playwright e2e testing.
const e2eServer = async () => {
	const __dirname = fileURLToPath(import.meta.url);
	const staticFilesDir = path.resolve(__dirname, "../../../client/dist");
	const app = express();
	const server = http.createServer(app);

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));

	app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
	app.use(express.static(staticFilesDir));
	app.use(
		"/trpc",
		trpcExpress.createExpressMiddleware({
			router: appRouter,
			createContext,
		}),
	);

	startWebSocketServer(server);
	const { clearDatabase } = await startDevelopmentDatabase();

	// e2e-server specific route for quickly creating games.
	app.use("/create", multiplayerRouter);

	// e2e-server specific route for clearing mongo memory server between tests.
	app.get("/clearDB", (_req, _res) => {
		clearDatabase();
		console.log("MongoMemoryServer database cleared.");
	});

	app.get("*", (_req, res) => {
		res.sendFile(path.join(staticFilesDir, "index.html"));
	});

	server.listen(3000);
};

await e2eServer();
