import type { Page } from "@playwright/test";

const webSocketEndpoint = "ws://localhost:3000/";

// Custom function to wait for WebSocket connection to be open
export async function waitForWebSocket(
	page: Page,
	wsEndpoint: string = webSocketEndpoint,
	timeout = 30000,
) {
	return await page.evaluate(
		({ wsEndpoint, timeout }) => {
			return new Promise((resolve, reject) => {
				const socket = new WebSocket(wsEndpoint);
				const timer = setTimeout(() => {
					socket.close();
					reject(new Error("WebSocket connection timeout"));
				}, timeout);

				socket.onopen = () => {
					clearTimeout(timer);
					resolve(true);
					socket.close();
				};

				socket.onerror = (error) => {
					clearTimeout(timer);
					reject(error);
				};
			});
		},
		{ wsEndpoint, timeout },
	);
}
