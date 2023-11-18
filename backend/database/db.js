const { Pool } = require('pg');

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "postgres",
    database: "cs343"
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
