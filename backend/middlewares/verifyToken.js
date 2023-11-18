const jwt = require('jsonwebtoken');

const jwtSecret = '7Fyv!9kT#Qw$4Zp@2Xs&5vR8yB*E(P';

function verifyToken(req, res, next) {
    // Check for the authorization header
    const authHeader = req.headers['authorization'];
    console.log(authHeader)
    if (!authHeader) {
        return res.status(403).json({
            success: false,
            message: 'No authorization header provided.'
        });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({
            success: false,
            message: 'No token provided.'
        });
    }

    // Verify the JWT
    jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
            console.log("Token invalid")
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired. Please log in again.'
                });
            } else {
                
                return res.status(403).json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
            }
        }

        // If successful, set the userId from the decoded payload and proceed
        req.userId = decoded.id;
        console.log("Token Valid")
        next();
    });
}

module.exports = verifyToken;
