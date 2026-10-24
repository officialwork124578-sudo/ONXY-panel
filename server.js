const http = require('http');
const httpProxy = require('http-proxy');
const WebSocket = require('ws');

const proxy = httpProxy.createProxyServer({ target: 'http://localhost:3000' });

const server = http.createServer((req, res) => {
    proxy.web(req, res);
});

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
    
    if (pathname === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        proxy.ws(request, socket, head);
    }
});

wss.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const deviceId = urlParams.get('device_id');
    console.log(`[+] APK Connected! Device ID: ${deviceId}`);
    
    ws.on('message', (message) => {
        console.log(`[>] Received from APK ${deviceId}:`, message.toString());
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log(`[-] APK Disconnected: ${deviceId}`);
    });
});

server.listen(9090, () => {
    console.log('[*] Master Server running on port 9090');
});
