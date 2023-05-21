const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				roboto: ['Roboto', 'sans-serif'],
				staatliches: ['Staatliches', 'cursive'],
				'bebas-neue': ['Bebas Neue', 'cursive'],
			},
			textShadow: {
				sm: '0 1px 1px var(--tw-shadow-color)',
				DEFAULT: '0 2px 4px var(--tw-shadow-color)',
				lg: '0 8px 16px var(--tw-shadow-color)',
			},
			gridTemplateColumns: {
				20: 'repeat(20, 38px)',
				21: 'repeat(21, 46px)',
			},
			gridTemplateRows: {
				21: 'repeat(21, 38px)',
				22: 'repeat(22, 46px)',
			},
		},
	},
	plugins: [
		plugin(function ({ matchUtilities, theme }) {
			matchUtilities(
				{
					'text-shadow': (value) => ({
						textShadow: value,
					}),
				},
				{ values: theme('textShadow') }
			);
		}),
	],
};
