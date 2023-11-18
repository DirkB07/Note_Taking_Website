const db = require('../database/db.js');

// Define the JSON data for the new user
const userData = {
    username: 'testUser',
    email: 'test@email.com',
    password_hash: 'testPassHash',
    avatar_url: 'testAvatarUrl'
};

async function testDB() {
    try {
        // 1. Insert an entry into the "users" table
        const insertQuery = `
            INSERT INTO users(username, email, password_hash, avatar_url) 
            VALUES($1, $2, $3, $4) 
            RETURNING id
        `;
        const insertValues = [
            userData.username,
            userData.email,
            userData.password_hash,
            userData.avatar_url
        ];

        const insertResult = await db.query(insertQuery, insertValues);
        console.log("Inserted entry:", insertResult.rows[0]);

        // 2. Print out the table contents
        const selectResult = await db.query('SELECT * FROM users');
        console.log("Table contents after insertion:", selectResult.rows);

        // 3. Delete the entry we just added
        const deleteId = insertResult.rows[0].id; // Assuming you have an 'id' column that auto-increments
        await db.query('DELETE FROM users WHERE id = $1', [deleteId]);

        // 4. Print out the table contents again
        const selectResultAfterDeletion = await db.query('SELECT * FROM users');
        console.log("Table contents after deletion:", selectResultAfterDeletion.rows);

    } catch (err) {
        console.error('Error executing query', err.stack);
    }
}

testDB();
