const { Pool } = require('pg');
require('dotenv').config();

    const pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
        ssl: {
          rejectUnauthorized: false, 
        },
      });
    
      pool.connect()
      .then(() => {
        console.log('Connected to database');
      })
      .catch((err) => {
        console.error('Error connecting to database:', err);
      });




module.exports = pool;
