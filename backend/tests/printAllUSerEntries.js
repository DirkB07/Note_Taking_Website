const db = require('../database/db.js');

// Define the JSON data for the new user
const userData = {
    username: 'testUser',
    email: 'test@email.com',
    password_hash: 'testPassHash',
    avatar_url: 'testAvatarUrl'
};


const getAllUsers = async () => {
    try {
        // Query the database for all users
        const result = await db.query('SELECT * FROM users'); // Assuming your table name is 'users'
        
        // Log the results
        console.log(result.rows);
        
        return result.rows;
    } catch (err) {
        console.error('Error fetching users from database:', err);
    }
};

// Call the function to fetch and print all users
getAllUsers();
