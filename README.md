#Installing the web application

1. clone the git repo
 git pull git@git.cs.sun.ac.za:/.../project2/24694266.git

2. cd 24694266

3. Start the database
   ```bash
   cd database
   sudo service postgresql start

   sudo -u postgres psql

   CREATE USER postgres WITH PASSWORD 'postgres';
   CREATE DATABASE cs343;
   GRANT ALL PRIVILEGES ON DATABASE cs343 TO postgres;
   ```
4. Start the backend
```bash
   cd backend

   node app.js
```
Testing the database connection:
```bash
   node testdbConnection.js
```



5. Start the frontend:
```bash 
   cd frontend
   npm install
   npm start
```
open the web application in localhost:3001

##If you don't know or have forgotten the password for the `postgres`

1. **Switch to the PostgreSQL User**:
   ```bash
   sudo -i -u postgres
   ```

2. **Access the PostgreSQL Prompt**:
   ```bash
   psql
   ```

3. **Change the Password**:
   At the `postgres=#` prompt, type:
   ```sql
   \password postgres
   ```
   You will be prompted to enter a new password.

4. **Exit**:
   Type `\q` to exit the PostgreSQL prompt and then `exit` to return to your regular user.

5. **Restart PostgreSQL**:
   Depending on your system, use one of the following commands to restart PostgreSQL:
   ```bash
   sudo service postgresql restart
   ```
   OR
   ```bash
   sudo systemctl restart postgresql
   ```

After these steps, you should be able to connect to PostgreSQL using the `postgres` user
