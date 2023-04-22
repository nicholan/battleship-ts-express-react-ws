import mongoose from 'mongoose';
import { config } from './config';

export async function createDbConnection() {
    try {
        await mongoose.connect(config.DATABASE_URI);
    } catch (error) {
        console.error(error);
    }

    mongoose.connection.on('error', err => {
        console.error(err);
    });
}

