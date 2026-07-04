/* ============================================================
   db.js — Pool de conexiones a MySQL
   Variables requeridas en .env:
     DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
   ============================================================ */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:             process.env.DB_HOST     || 'localhost',
  user:             process.env.DB_USER     || 'root',
  password:         process.env.DB_PASSWORD || '',
  database:         process.env.DB_NAME     || 'nutricion',
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0
});

// Verificar conexión al arrancar
pool.getConnection()
  .then(conn => {
    console.log('✅ Conectado a MySQL');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err.message);
  });

module.exports = pool;
