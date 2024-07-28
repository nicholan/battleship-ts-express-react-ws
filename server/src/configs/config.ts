import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
	API_PORT: z.coerce.number().int().positive(),
	SECRET_KEY: z.string().min(1),
	DATABASE_URI: z.string().min(1),
	NODE_ENV: z.string().min(1),
});

export type cfgSchema = z.infer<typeof envSchema>;

type Config = cfgSchema | NodeJS.ProcessEnv;

const _productionHosts: string[] = [];
const _devHosts = [
	"http://localhost:3000",
	"http://localhost:5173",
	"http://localhost:3001",
];

export function createConfig(cfg: Config = process.env) {
	const env = envSchema.parse(cfg);
	const hosts = env.NODE_ENV === "dev" ? _devHosts : _productionHosts;
	const config = {
		IS_TESTING: env.NODE_ENV === "test",
		IS_DEVELOPMENT: env.NODE_ENV === "dev",
		API_PORT: env.API_PORT ? env.API_PORT : 8080,
		ALLOWED_HOSTS: hosts,
		DATABASE_URI: env.DATABASE_URI,
	};

	return config;
}

export default createConfig();
