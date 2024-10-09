const express = require('express');
const next = require('next');
const axios = require('axios');
const cors = require('cors'); // Import CORS

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const http = require('http');
const socketIO = require('socket.io');

app.prepare().then(async () => {
    const server = express();
    
    // Enable CORS for all origins
    server.use(cors({
        origin: '*',//'https://zenith-ide.vercel.app', // Adjust this if your frontend runs on a different URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }));

    const httpServer = http.createServer(server);
    const io = socketIO(httpServer, {
        cors: {
            origin: '*',//'https://zenith-ide.vercel.app', // Allow socket connection from your frontend
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected');
		socket.emit('message2', 'helloooo');

        socket.on('message1', (data) => {
            console.log('Received from client:', data);
            
            // Broadcast the new code to all clients except the sender
            socket.broadcast.emit('message2', data);
        });
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => {
        const host = httpServer.address().address;
        const port = httpServer.address().port;
        console.log(`Server is running at http://${host}:${port}`);
    });
});