const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow your client application origin
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Listen for player movements
    socket.on('playerMovement', (data) => {
        // Broadcast the player's movement to other clients
        socket.broadcast.emit('playerMoved', {
            id: socket.id,
            position: data.position,
            direction: data.direction,
            isMoving: data.isMoving    
        });
    });

    socket.on('playerJump', (data) => {
        // Broadcast the jump event to all clients
        socket.broadcast.emit('playerJumped', {
            id: data.id,
            position: data.position,
            direction: data.direction,
            velocityY: data.velocityY
        });
    });

    socket.on('playerAttack', (data) => {
        // Broadcast the jump event to all clients
        socket.broadcast.emit('playerAttacked', {
            id: data.id,
            position: data.position,
            direction: data.direction,
            velocityX: data.velocityX
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        // Handle player disconnection logic here
    });
});

// Start the server
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
