import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react({ jsxRuntime: 'classic' })],
	test: {
		globals: true,
		setupFiles: './src/testSetup.vite.ts',
	},
});
