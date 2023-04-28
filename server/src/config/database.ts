import mongoose from 'mongoose';
import { config } from './config.js';

export async function createDbConnection() {
	await mongoose.connect(config.DATABASE_URI);
	
	mongoose.connection.on('error', err => {
		throw err;
	});
}
