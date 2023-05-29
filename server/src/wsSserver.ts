import WebSocket, { WebSocketServer } from 'ws';

export function createWsServer(port: number) {
	const wsServer = new WebSocketServer({
		port: port,
		perMessageDeflate: false,
	});

	wsServer.on('connection', (socket, request) => {
		console.log(`connection from ${request.socket.remoteAddress ?? '<unknown>'}`);

		socket.on('message', (msg) => {
			wsServer.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(msg.toString());
				}
			});
		});

		socket.on('close', () => {
			console.log(`disconnection from ${request.socket.remoteAddress ?? '<unknown>'}`);
		});
	});

	return wsServer;
}
