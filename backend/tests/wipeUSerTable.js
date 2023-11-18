const db = require('../database/db.js');

async function wipeUsersTable() {
    try {
        // Print out the table contents before deletion
        const selectResultBeforeDeletion = await db.query('SELECT * FROM users');
        console.log("Table contents before deletion:", selectResultBeforeDeletion.rows);

        // Delete all entries from the "users" table
        await db.query('DELETE FROM users');
        console.log("All entries from 'users' table have been removed.");

        // Print out the table contents after deletion
        const selectResultAfterDeletion = await db.query('SELECT * FROM users');
        console.log("Table contents after deletion:", selectResultAfterDeletion.rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
    }
}

wipeUsersTable();
