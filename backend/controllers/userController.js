const db = require('../database/db.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;
const jwtSecret = '7Fyv!9kT#Qw$4Zp@2Xs&5vR8yB*E(P'; // Replace with a strong secret key

// Function to generate a JWT token
function generateToken(user) {
    return jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '24h' }); // Token expires in 24 hours
}

function getUserIdFromToken(token) {
    try {
        // Decode the token using the secret
        const decoded = jwt.verify(token, jwtSecret);
        
        // Return the user ID from the decoded payload
        return decoded.id;
    } catch (error) {
        console.error("Error decoding the token:", error);
        return null; // Return null if there's any error (e.g., invalid token)
    }
}

// user table:
// id
// username
// email
// password_hash
// avatar_url
async function register(req, res) {
    try {
        await getAllUsers();
        const { username, email, password } = req.body;

        // Check if user with the same email or username already exists
        const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const usernameCheck = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'User with this email already exists',
                errorField: 'email'
            });
        }

        if (usernameCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: 'User with this username already exists',
                errorField: 'username'
            });
        }

        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Store the user in the database
        const createUserQuery = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id';
        const createUserValues = [username, email, hashedPassword];
        const newUser = await db.query(createUserQuery, createUserValues);
        console.log("\n AFTER LOGIN: ")
        await getAllUsers();
        // newUser now contains the id that postgresql generated for it
        // Generate a JWT token for the newly registered user
        const token_ = generateToken(newUser.rows[0]);
        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Registered Successful',
            user: {
                username: req.body.username,
                email: req.body.email
            },
            token: token_
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Internal server error',
            errors: {
                system: 'A system error occurred. Please try again later or contact support.'
            }
        });
    }
}

async function login(req, res) {
    try {
        const { usernameOrEmail, password } = req.body;
        
        let userQuery;
        let params;

        // Check if usernameOrEmail is an email or username
        if (usernameOrEmail.includes('@')) {
            // It's an email
            userQuery = 'SELECT * FROM users WHERE email = $1';
            params = [usernameOrEmail];
        } else {
            // It's a username
            userQuery = 'SELECT * FROM users WHERE username = $1';
            params = [usernameOrEmail];
        }

        // Retrieve user by email/username from the database
        const user = await db.query(userQuery, params);

        if (user.rows.length === 0) {
            return res.status(401).json({
                success: false,
                errorField: usernameOrEmail.includes('@') ? 'email' : 'username',
                message: `No user found with this ${usernameOrEmail.includes('@') ? 'email' : 'username'}.`
            });
        }

        // Check if the provided password matches the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.rows[0].password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                errorField: 'password',
                message: 'Incorrect password.'
            });
        }

        // Generate a JWT token for the authenticated user
        const token = generateToken(user.rows[0]);
        
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            userId: user.rows[0].id
        });

    } catch (error) {
        console.error('User login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}


async function update(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: "No authorization header provided." });
        }
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided in authorization header." });
        }
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const avatar_url = req.body.avatar_url;
        const userId = getUserIdFromToken(token);

        if (!username && !email && !password && !avatar_url) {
            return res.status(400).json({ success: false, errorField: 'fields', message: "No fields provided to update." });
        }

        let result;

        if (username) {
            result = await db.query("UPDATE users SET username = $1 WHERE id = $2 RETURNING id", [username, userId]);
            if (result.rows.length === 0) {
                return res.status(400).json({ success: false, message: "Username update failed." });
            }
        }

        if (email) {
            result = await db.query("UPDATE users SET email = $1 WHERE id = $2 RETURNING id", [email, userId]);
            if (result.rows.length === 0) {
                return res.status(400).json({ success: false, message: "Email update failed." });
            }
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            result = await db.query("UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id", [hashedPassword, userId]);
            if (result.rows.length === 0) {
                return res.status(400).json({ success: false, message: "Password update failed." });
            }
        }

        if (avatar_url) {
            result = await db.query("UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id", [avatar_url, userId]);
            if (result.rows.length === 0) {
                return res.status(400).json({ success: false, message: "Avatar update failed." });
            }
        }

        result = await db.query("SELECT id, username, email, avatar_url FROM users WHERE id = $1", [userId]);
        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: "Retrieval of updated user failed." });
        }

        return res.status(200).json({ success: true, message: "Profile updated successfully.", user: result.rows[0] });

    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ success: false, errorField: 'internal', message: "Internal server error." });
    }
}



async function deleteUser(req, res) {
    try {
        // Retrieve the user ID from the JWT token's decoded data
        const userId = getUserIdFromToken(req.headers.authorization.split(' ')[1]);
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not found.'
            });
        }

        await db.query('BEGIN');

        const deleteNotesQuery = `
            DELETE FROM notes
            WHERE id IN (
            SELECT un.note_id
            FROM user_notes AS un
            WHERE un.user_id = $1
            )`;
        await db.query(deleteNotesQuery, [userId]);

        const deleteShareNotesQuery = `
        DELETE FROM shares
        WHERE note_id IN (
        SELECT un.note_id
        FROM user_notes AS un
        WHERE un.user_id = $1
        )`;

        await db.query(deleteShareNotesQuery, [userId]); 

        // Delete the user from the database
        const deleteQuery = 'DELETE FROM users WHERE id = $1 RETURNING id';
        const result = await db.query(deleteQuery, [userId]);

        await db.query('COMMIT');
        
        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Deletion failed. User not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User deleted successfully.',
            deletedUserId: result.rows[0].id
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    }
}

async function getAllUsers() {
    try {
        const result = await db.query('SELECT * FROM users');
        const users = result.rows;
        
        // Print all users to the server's console
        console.log(users);
    } catch (error) {
        console.error("Error fetching all users:", error);
    }
}

async function getAvatar(req, res) {
    try {
        const userId = req.userId; // Assuming the verifyToken middleware sets req.userId
        console.log(userId)
        // Fetch the avatar for the user from the database
        const query = 'SELECT avatar_url FROM users WHERE id = $1';
        const result = await db.query(query, [userId]);
        
        const userAvatar = result.rows[0]?.avatar_url;

        if (userAvatar) {
            // console.log("avatar got user avatar  \n \n\n\n"+ userAvatar)
            res.status(200).json({
                success: true,
                avatar: userAvatar
            });
        } else {
            res.status(404).json({ success: false, message: "Avatar not found." });
        }
    } catch (error) {
        console.error("Error fetching avatar:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}





module.exports = {
    register,
    login,
    update,
    deleteUser,
    getAvatar,
    // Add other controller functions here
};
