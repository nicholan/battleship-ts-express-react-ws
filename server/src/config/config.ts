import dotenv from 'dotenv';

dotenv.config();

const _productionHosts: string[] = [];
const _devHosts: string[] = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'];

export const config = {
    // IS_DEVELOPMENT: getDefault(process.env.NODE_ENV, 'development') !== 'production',
    API_PORT: process.env.API_PORT ? Number(process.env.API_PORT) : 8080,
    SOCKET_PORT: process.env.SOCKET_PORT ? Number(process.env.SOCKET_PORT) : 65080,
    ALLOWED_HOSTS: _devHosts,
    DATABASE_URI: String(process.env.DATABASE_URI),
};
