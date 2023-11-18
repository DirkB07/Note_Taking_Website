const express = require('express');
const router = express.Router();
const isTokenValid = require('./isTokenValid.js');

router.post('/validateToken', (req, res) => {
    const token = req.body.token;
    
    if (!token) {
        return res.status(400).json({ success: false, message: 'No token provided.' });
    }

    const validationResult = isTokenValid(token);
    if (validationResult.valid) {
        return res.status(200).json({ success: true, message: validationResult.message });
    } else {
        if (validationResult.expired) {
            return res.status(401).json({ success: false, message: validationResult.message });
        } else {
            return res.status(400).json({ success: false, message: validationResult.message });
        }
    }
});

module.exports = router;
