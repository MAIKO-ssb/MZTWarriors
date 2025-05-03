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

        // Initialize player data
        players[socket.id] = {
            id: socket.id,
            position: { x: 100, y: 100 }, // Default starting position
            direction: 'right',
            isMoving: false,
        };

        // Send the current players to the newly connected player
        socket.emit('currentPlayers', Object.values(players));

        // socket.broadcast.emit('newPlayerJoined', players[socket.id]); // Send the new player's info to all other clients
        socket.on('newPlayer', (data) => {
            const playerID = socket.id;
            // Broadcast the new player info to all other clients
            socket.broadcast.emit('newPlayer', players[playerID]);
            socket.broadcast.emit('newPlayerJoined', data);
        });


        // Listen for player movements
        socket.on('playerMovement', (data) => {
            // Update the player's position and state
            players[socket.id].position = data.position;
            players[socket.id].direction = data.direction;
            players[socket.id].isMoving = data.isMoving;

            // Broadcast the player's movement to other clients
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                position: data.position,
                direction: data.direction,
                isMoving: data.isMoving
            });
        });

        // Listen for player jump events
        socket.on('playerJump', (data) => {
            // Broadcast the jump event to all clients
            socket.broadcast.emit('playerJumped', {
                id: socket.id,
                position: data.position,
                direction: data.direction,
                velocityY: data.velocityY
            });
        });

        // Listen for player attack events
        socket.on('playerAttack', (data) => {
            // Broadcast the attack event to all clients
            socket.broadcast.emit('playerAttacked', {
                id: socket.id,
                position: data.position,
                direction: data.direction,
                velocityX: data.velocityX
            });
        });

        // ** Listen for chat messages **
        socket.on('chatMessage', (message) => {
            console.log('Chat message received:', message);
            io.emit('chatMessageReceived', message); // Emit to all clients
        });
        
        
        // Handle player disconnect
        socket.on('disconnect', () => {
            const playerID = socket.id;

            console.log(`User disconnected: ${playerID}`);

            // Remove the player from the players object
            delete players[playerID];

            // Notify other clients that this player has disconnected
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
