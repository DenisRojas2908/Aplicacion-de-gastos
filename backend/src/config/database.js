const { Pool } = require('pg');
require('dotenv').config();

// Detectamos si estamos en producción (Render) o en local
const isProduction = process.env.NODE_ENV === 'production';

// Cadena de conexión para TU COMPUTADORA (Local)
const connectionStringLocal = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Cadena de conexión para RENDER (Nube)
// Render nos dará una variable llamada INTERNAL_DATABASE_URL automáticamente
const connectionStringProd = process.env.INTERNAL_DATABASE_URL;

const pool = new Pool({
  connectionString: isProduction ? connectionStringProd : connectionStringLocal,
  // ¡IMPORTANTE! Render necesita SSL. Si es producción, lo activamos.
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión a PostgreSQL:', err);
});

module.exports = pool;