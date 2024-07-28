import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import type cfg from "../configs/config";

export async function connectDatabase({
	IS_DEVELOPMENT,
	DATABASE_URI,
}: typeof cfg) {
	const closeDatabase = IS_DEVELOPMENT
		? (await startDevelopmentDatabase()).close
		: (await startProductionDatabase(DATABASE_URI)).close;

	return { closeDatabase };
}

async function startProductionDatabase(DATABASE_URI: string) {
	await mongoose.connect(DATABASE_URI);
	mongoose.connection.on("error", (err) => {
		throw err;
	});

	const close = async () => {
		await mongoose.connection.close();
	};

	return { close };
}

export async function startDevelopmentDatabase() {
	const mongoServer = await MongoMemoryServer.create();
	const mongoUri = mongoServer.getUri();

	await mongoose.connect(mongoUri);
	mongoose.connection.on("error", (err) => {
		throw err;
	});

	const close = async () => {
		await mongoose.connection.dropDatabase();
		await mongoose.connection.close();
		await mongoServer.stop();
	};

	const clearDatabase = async () => {
		await mongoose.connection.dropDatabase();
	};

	return { close, clearDatabase };
}
