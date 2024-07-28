import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react({ jsxRuntime: "classic" })],
	test: {
		globals: true,
		setupFiles: "./src/testSetup.vite.ts",
	},
});
