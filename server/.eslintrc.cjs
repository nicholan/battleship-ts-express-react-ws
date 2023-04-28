module.exports = {
	extends: ['@nicholan/eslint-config', '@nicholan/eslint-config/prettier', '@nicholan/eslint-config/rules'],
	parserOptions: {
		project: ['./tsconfig.json'],
		tsconfigRootDir: __dirname,
	},
	root: true,
	ignorePatterns: ['.eslintrc.cjs', 'jest.config.ts', 'dist'],
};
