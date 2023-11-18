const express = require('express');
const verifyToken = require('../middlewares/verifyToken'); // Assuming you have a middleware to verify the JWT
const userController = require('../controllers/userController');
const jsonParser = express.json();

const router = express.Router();

// Routes that don't require JWT verification
router.post('/register', jsonParser, userController.register);
router.post('/login', jsonParser, userController.login);

// Use verifyToken middleware for all subsequent routes
router.use(verifyToken);

// Protected routes
router.use('/validate',verifyToken);
router.put('/update', jsonParser, userController.update);
router.delete('/delete', userController.deleteUser);
router.get('/avatar', userController.getAvatar);


// Additional routes if you decide to implement them
// router.post('/profile', jsonParser, userController.profile);
// router.post('/request-password-reset', jsonParser, userController.requestPasswordReset);
// router.post('/reset-password', jsonParser, userController.resetPassword);
// router.post('/verify', jsonParser, userController.verifyAccount);

module.exports = router;
