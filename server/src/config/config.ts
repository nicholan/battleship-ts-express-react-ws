import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
	API_PORT: z.coerce.number().int().positive(),
	SOCKET_PORT: z.coerce.number().int().positive(),
	SECRET_KEY: z.string().nonempty(),
	DATABASE_URI: z.string().nonempty(),
	NODE_ENV: z.string().nonempty(),
});

const _productionHosts: string[] = [];
const _devHosts = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'];

function createConfig() {
	const env = envSchema.parse(process.env);
	const hosts = env.NODE_ENV === 'dev' ? _devHosts : _productionHosts;
	const config = {
		IS_TESTING: env.NODE_ENV === 'test',
		IS_DEVELOPMENT: env.NODE_ENV === 'dev',
		API_PORT: env.API_PORT ? env.API_PORT : 8080,
		SOCKET_PORT: env.SOCKET_PORT ? env.SOCKET_PORT : 65080,
		ALLOWED_HOSTS: hosts,
		DATABASE_URI: env.DATABASE_URI,
	};

	return config;
}

export default createConfig();
