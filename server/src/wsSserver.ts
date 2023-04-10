import WebSocket, { WebSocketServer } from 'ws';

export function createWsServer(port: number) {
    const wsServer = new WebSocketServer({ port: port, perMessageDeflate: false });

    wsServer.on('connection', (socket, request) => {
        console.log('connection from ' + request.socket.remoteAddress);

        socket.on('message', async (msg) => {
            wsServer.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {     // check if client is ready
                    client.send(msg.toString());
                }
            });
        });

        socket.on('close', async () => {
            console.log(`disconnection from ${ request.socket.remoteAddress }`);
        });

    });

    return wsServer;
}