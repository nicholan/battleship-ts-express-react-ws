import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import cfg from './config';

export async function connectDatabase({ IS_DEVELOPMENT, DATABASE_URI }: typeof cfg) {
	let closeDatabase;
	if (IS_DEVELOPMENT) {
		closeDatabase = (await startDevelopmentDatabase()).close;
	} else {
		closeDatabase = (await startProductionDatabase(DATABASE_URI)).close;
	}

	return { closeDatabase };
}

async function startProductionDatabase(DATABASE_URI: string) {
	await mongoose.connect(DATABASE_URI);
	mongoose.connection.on('error', (err) => {
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
	mongoose.connection.on('error', (err) => {
		throw err;
	});

	const close = async () => {
		await mongoose.connection.close();
		await mongoServer.stop();
	};

	return { close };
}
