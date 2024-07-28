import type http from "node:http";
import WebSocket, { WebSocketServer } from "ws";

export const startWebSocketServer = (server: http.Server) => {
	const wss = new WebSocketServer({ server });

	wss.on("connection", (socket) => {
		socket.on("message", (msg) => {
			for (const client of wss.clients) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(msg.toString());
				} else {
					const openTimer = setTimeout(() => {
						// Handle timeout if the client socket doesn't open within the specified time
						console.log(
							"Timeout: Client socket did not open within the specified time.",
						);
						clearTimeout(openTimer);
					}, 5000);

					client.once("open", () => {
						clearTimeout(openTimer);
						client.send(msg.toString());
					});
				}
			}
		});
	});
};
