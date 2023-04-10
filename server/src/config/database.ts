import mongoose from 'mongoose';
import { config } from './config';

const mongoDb = config.DATABASE_URI;

export async function createDbConnection() {
    try {
        await mongoose.connect(mongoDb);
    } catch (err) {
        console.error.bind(console, 'MongoDB connection error');
    }

    mongoose.connection.on('error', err => {
        console.error.bind(console, 'MongoDB connection error');
    });
}

