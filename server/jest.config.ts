import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    verbose: true,
    testEnvironment: 'node',
    globalTeardown: './src/tests/teardown.ts',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};

export default config;