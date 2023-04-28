import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
	verbose: true,
	testEnvironment: 'node',
	transform: {
		'^.+\\.(t|j)sx?$': '@swc/jest',
	},
};

export default config;
