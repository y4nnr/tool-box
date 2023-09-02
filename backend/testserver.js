const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Redis = require('ioredis');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('WS connected.');

    const redis = new Redis();

    redis.monitor((err, monitor) => {
        if (err) throw err;

        console.log('Connected to Redis.');

        monitor.on('monitor', (time, args, source, database) => {
            ws.send(JSON.stringify({ time, args }));
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        redis.disconnect();
    });
});

server.listen(3002, () => {
    console.log('Server is running on http://localhost:3002');
});
