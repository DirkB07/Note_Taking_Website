const jwt = require('jsonwebtoken');
const jwtSecret = '7Fyv!9kT#Qw$4Zp@2Xs&5vR8yB*E(P';  // Your secret key

function isTokenValid(token) {
    try {
        jwt.verify(token, jwtSecret);
        return { valid: true, expired: false, message: 'Token is valid.' };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, expired: true, message: 'Token has expired.' };
        } else {
            return { valid: false, expired: false, message: 'Invalid token.' };
        }
    }
}

module.exports = isTokenValid;
