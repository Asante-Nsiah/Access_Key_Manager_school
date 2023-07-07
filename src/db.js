const { Pool } = require('pg');
require('dotenv').config();

    const pool = new Pool({
      host: 'localhost',
      port: 5433,
      user: 'postgres',
      password: 'postgres', 
      database: 'project'
      // host: process.env.DB_HOST,
      // port: process.env.DB_PORT,
      // user: process.env.DB_USER,
      // password: process.env.DB_PASSWORD,
      // database: process.env.DB_NAME,
      //   ssl: {
      //     rejectUnauthorized: false, 
      //   },
      });
    
      pool.connect()
      .then(() => {
        console.log('Connected to database');
      })
      .catch((err) => {
        console.error('Error connecting to database:', err);
      });

      postgres://projectadmin:Y4M0LaKBqXFCLXwmdYvdn3NOI6jJxoEN@dpg-ci661uunqql3q38ihjvg-a.oregon-postgres.render.com/fileserverdb_2s24


module.exports = pool;
