#!/bin/bash

# Variables
DATABASE_NAME="cs343"
DATABASE_USER="postgres"
DATABASE_PASSWORD="postgres"

# Install PostgreSQL if it's not installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL not found! Installing..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    echo "PostgreSQL installed."
else
    echo "PostgreSQL already installed!"
fi

# Start the PostgreSQL service
sudo service postgresql start

# Create the user and database using the postgres superuser
sudo -u postgres psql <<EOF
CREATE USER $DATABASE_USER WITH PASSWORD '$DATABASE_PASSWORD';
CREATE DATABASE $DATABASE_NAME;
GRANT ALL PRIVILEGES ON DATABASE $DATABASE_NAME TO $DATABASE_USER;
EOF

# Log into the PostgreSQL client and execute the schema.sql file
sudo -u postgres psql -d $DATABASE_NAME <<EOF
\i schema.sql
EOF

echo "Database setup complete!"
