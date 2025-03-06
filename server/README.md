
# Customer Management Server

This is the backend server for the Customer Management System.

## Setup Instructions

1. **Create MySQL Database**

   Run the SQL script in the `database.sql` file to create your database structure and initial data:
   
   ```bash
   mysql -u your_username -p < database.sql
   ```
   
   or open the `database.sql` file in your MySQL client (like MySQL Workbench) and execute it.

2. **Configure Environment Variables**

   Copy the `.env.example` file to create a `.env` file:
   
   ```bash
   cp .env.example .env
   ```
   
   Then edit the `.env` file with your database credentials and other settings.

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

If you encounter errors:

1. **Database Connection Issues**
   - Verify MySQL server is running
   - Check your database credentials in `.env`
   - Make sure the database exists

2. **API Errors**
   - Check the server logs for detailed error messages
   - Set `DEBUG=true` in your `.env` file for more detailed logs

3. **Authentication Issues**
   - Default admin credentials: admin@example.com / password
   - JWT issues can be resolved by updating the JWT_SECRET in `.env`
