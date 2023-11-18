module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',              // If your database is hosted locally
      database: 'cs343', // Replace with your database name
      user: 'Rekenaarman',     // Replace with your database user
      password: "1" // Replace with your database password
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',   // Replace with your staging DB host
      database: 'cs343', // Replace with your staging database name
      user: 'Rekenaarman',     // Replace with your staging database user
      password: "1" // Replace with your staging database password
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',   // Replace with your production DB host
      database: 'cs343', // Replace with your production database name
      user: 'Rekenaarman',     // Replace with your production database user
      password: "1" // Replace with your production database password
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    }
  }
};

