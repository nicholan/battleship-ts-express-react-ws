module.exports = {
	extends: [
		'@nicholan/eslint-config',
		'@nicholan/eslint-config/react',
		'@nicholan/eslint-config/prettier',
		'@nicholan/eslint-config/rules',
	],
	parserOptions: {
		project: ['./tsconfig.test.json'],
		tsconfigRootDir: __dirname,
	},
	root: true,
	ignorePatterns: ['.eslintrc.cjs', '*.js'],
	rules: {
		'react/react-in-jsx-scope': 'off',
		'@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
	},
};
