const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// Conexión LOCAL: Usa tus variables actuales de .env
const connectionStringLocal = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Conexión NUBE (Supabase): En Render configuraremos la variable DATABASE_URL
const connectionStringProd = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: isProduction ? connectionStringProd : connectionStringLocal,
  // Supabase siempre requiere SSL. En local usualmente no es necesario.
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log(isProduction ? '☁️ Conectado a Supabase (Producción)' : '🏠 Conectado a PostgreSQL Local');
});

pool.on('error', (err) => {
  console.error('❌ Error en la conexión:', err);
});

module.exports = pool;