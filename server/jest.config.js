const config = {
	verbose: true,
	testEnvironment: 'node',
	transform: {
		'^.+\\.(t|j)sx?$': '@swc/jest',
	},
};

export default config;
