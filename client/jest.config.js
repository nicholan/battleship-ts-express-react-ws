module.exports = {
	preset: 'ts-jest',
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': ['@swc/jest'],
	},
	testEnvironment: 'jsdom',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1',
	},
};
