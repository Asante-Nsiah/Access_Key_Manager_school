const { Pool } = require('pg');

    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'project',
        password: 'postgres',
        port: 5433,
      });
    
      pool.connect()
      .then(() => {
        console.log('Connected to database');
      })
      .catch((err) => {
        console.error('Error connecting to database:', err);
      });

     
module.exports = pool;
