// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow your client application origin
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Setup Next.js
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// Initialize players object to persist across connections
const players = {};

nextApp.prepare().then(() => {
    app.use(express.static('public')); // Serve the public directory

    // Socket.IO connection logic
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Initialize player data with a default position near the ground
        players[socket.id] = {
            id: socket.id,
            position: { x: 100, y: 650 }, // Align with client ground level
            direction: 'right',
            isMoving: false,
            isAirborne: false // NEW: Track airborne state
        };

        // Immediately broadcast the new player to all other clients
        socket.broadcast.emit('newPlayer', players[socket.id]);

        // Send the current players (excluding the new player) to the newly connected player
        socket.emit('currentPlayers', Object.values(players).filter(p => p.id !== socket.id));

        // Handle newPlayer event from client
        socket.on('newPlayer', (data) => {
            const playerID = socket.id;
            // Validate and update position
            players[playerID].position = {
                x: data.x && Number.isFinite(data.x) ? data.x : 100,
                y: data.y && Number.isFinite(data.y) ? data.y : 650
            };
            console.log(`New player ${playerID} initialized at (${players[playerID].position.x}, ${players[playerID].position.y})`);
            // Broadcast the updated player data to all other clients
            socket.broadcast.emit('newPlayer', players[playerID]);
        });

        // Listen for player movements
        socket.on('playerMovement', (data) => {
            if (!players[socket.id]) return;
            // Validate position data
            players[socket.id].position = {
                x: data.position?.x && Number.isFinite(data.position.x) ? data.position.x : players[socket.id].position.x,
                y: data.position?.y && Number.isFinite(data.position.y) ? data.position.y : players[socket.id].position.y
            };
            players[socket.id].direction = data.direction || 'right';
            players[socket.id].isMoving = data.isMoving || false;
            players[socket.id].isAirborne = data.isAirborne || false;

            // Broadcast the player's movement to other clients
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                position: players[socket.id].position,
                direction: players[socket.id].direction,
                isMoving: players[socket.id].isMoving,
                isAirborne: players[socket.id].isAirborne
            });
        });

        // Listen for player jump events
        socket.on('playerJump', (data) => {
            if (!players[socket.id]) return;
            // Validate position data
            players[socket.id].position = {
                x: data.position?.x && Number.isFinite(data.position.x) ? data.position.x : players[socket.id].position.x,
                y: data.position?.y && Number.isFinite(data.position.y) ? data.position.y : players[socket.id].position.y
            };
            players[socket.id].direction = data.direction || 'right';
            players[socket.id].isAirborne = true;

            // Broadcast the jump event to all clients
            socket.broadcast.emit('playerJumped', {
                id: socket.id,
                position: players[socket.id].position,
                direction: players[socket.id].direction,
                velocityY: data.velocityY || 0
            });
        });

        // Listen for player attack events
        socket.on('playerAttack', (data) => {
            if (!players[socket.id]) return;
            // Validate position data
            players[socket.id].position = {
                x: data.position?.x && Number.isFinite(data.position.x) ? data.position.x : players[socket.id].position.x,
                y: data.position?.y && Number.isFinite(data.position.y) ? data.position.y : players[socket.id].position.y
            };
            players[socket.id].direction = data.direction || 'right';
            players[socket.id].isAirborne = data.isAirborne || false;

            // Broadcast the attack event to all clients
            socket.broadcast.emit('playerAttacked', {
                id: socket.id,
                position: players[socket.id].position,
                direction: players[socket.id].direction,
                isAirborne: players[socket.id].isAirborne
            });
        });

        // Listen for chat messages
        socket.on('chatMessage', (message) => {
            console.log('Chat message received:', message);
            io.emit('chatMessageReceived', message); // Emit to all clients
        });

        // Handle player disconnect
        socket.on('disconnect', () => {
            const playerID = socket.id;
            console.log(`User disconnected: ${playerID}`);
            delete players[playerID];
            socket.broadcast.emit('playerDisconnected', { id: playerID });
        });
    });

    // Serve the Next.js app for all other routes
    app.all('*', (req, res) => {
        return nextHandler(req, res);
    });

    // Start the server
    const PORT = 4000;
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening on port ${PORT}`);
    });
});