// config/db.js
const mysql = require('mysql2/promise');

// Create a connection pool (instead of just a single connection)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root!',  // Replace with your database password
  database: 'university_db',  // Replace with your database name
});

module.exports = pool;
