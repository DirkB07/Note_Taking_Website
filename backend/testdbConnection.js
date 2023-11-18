const { Client } = require('pg');

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "postgres",
    database: "cs343"
});



// New function to fetch and print all data from the given table
async function fetchTableData(tableName) {
    const res = await client.query(`SELECT * FROM ${tableName}`);
    console.log(`\nData in table: ${tableName}`);
    console.table(res.rows);
}

async function displayTableDetails() {
    await client.connect();

    // Fetch all table names from the 'public' schema
    const tableNamesRes = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    for (let row of tableNamesRes.rows) {
        await fetchTableData(row.tablename); // Fetch and print data for each table
    }

    await client.end();
}

displayTableDetails().catch(err => console.error(err));
