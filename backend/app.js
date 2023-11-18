// app.js

// Import necessary modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

// Import custom middlewares
const errorHandler = require('./middlewares/error');
const verifyToken = require('./middlewares/verifyToken');

// Import routes
const userRoutes = require('./routes/userRoutes');

// Initialize Express app and create an HTTP server
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: ['http://localhost:3001', 'http://localhost:3002'],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Import note routes AFTER the io instance is created
const noteRoutes = require('./routes/noteRoutes')(io);

const corsOptions = {
    origin: ['http://localhost:3001', 'http://localhost:3002'], 
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, 
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions)); // Use the CORS middleware with options.
app.use(morgan('combined'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorHandler);

// Routes --------------------------------------------------------------
app.use('/user', userRoutes);
app.use('/notes', verifyToken, noteRoutes);

// WebSocket connection setup with socket.io
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('noteContentChanged', (messageData) => {
        socket.broadcast.emit('noteContentChanged', messageData);
    });

    socket.on('joinRoom', (data) => {
        const roomId = data.roomId;
        socket.join(roomId);
    });
    
    socket.on('leaveRoom', (data) => {
        const roomId = data.roomId;
        socket.leave(roomId);
    });
    
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Define the port on which the server will run
const PORT = 3000;

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


/* Client-side WebSocket setup (for React)

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', (event) => {
    console.log('Connected to the WebSocket server');
});

socket.addEventListener('message', (event) => {
    console.log('Received:', event.data);
    // Update the note content in your React app based on the received data
});

// To send data (e.g., updated note content) to the server:
socket.send('Updated note content here');

*/