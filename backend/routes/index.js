// routes/index.js

const express = require('express');
const router = express.Router();

// Root route
router.get('/', (req, res) => {
    res.send('Welcome to the collaborative markdown note-taking web app!');
});

// Test GET route
router.get('/test', (req, res) => {
    res.send('GET request received!');
});

// Test POST route
router.post('/post', (req, res) => {
    const { name, age } = req.body;
    res.send(`Received data - Name: ${name}, Age: ${age}`);
});

module.exports = router;
