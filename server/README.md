
# Customer Management Server

This is the backend server for the Customer Management System.

## Setup Instructions

1. **Create MySQL Database and Configure Environment**

   First, create a `.env` file from the template:
   
   ```bash
   cp .env.example .env
   ```
   
   Then edit the `.env` file with your MySQL credentials:
   - Set `DB_USER` to your MySQL username (typically "root")
   - Set `DB_PASSWORD` to your MySQL password
   - Keep `DB_NAME` as "customer_management" (or change if you prefer a different name)
   - Set a secure random string for `JWT_SECRET`

2. **Create the Database Schema**

   Run the SQL script to create your database structure and initial data:
   
   ```bash
   mysql -u your_username -p < database.sql
   ```
   
   Or open the `database.sql` file in your MySQL client (like MySQL Workbench) and execute it.

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Start the Server**

   Development mode (with auto-restart):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## Troubleshooting

### Database Connection Issues

The most common error is: "Access denied for user 'root'@'localhost' (using password: NO)"

This means:
- Your `.env` file is missing or not being loaded
- The database credentials in your `.env` file are incorrect

Solution:
1. Make sure your `.env` file exists in the server root directory
2. Check that your MySQL username and password are correct in the `.env` file
3. Ensure your MySQL server is running
4. Verify that the database specified in `DB_NAME` exists

### Other Common Issues

1. **"ER_BAD_DB_ERROR"**: The database specified in `DB_NAME` doesn't exist.
   - Create it manually or run the database.sql script

2. **"ECONNREFUSED"**: MySQL server is not running or listening on the wrong port.
   - Start your MySQL server

3. **API Errors**
   - Check the server logs for detailed error messages
   - Set `DEBUG=true` in your `.env` file for more detailed logs

4. **Authentication Issues**
   - Default admin credentials: admin@example.com / password
   - JWT issues can be resolved by updating the JWT_SECRET in `.env`

