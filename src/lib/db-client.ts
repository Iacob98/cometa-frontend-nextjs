import { Pool } from 'pg';

// Create a PostgreSQL connection pool for Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
  connectionTimeoutMillis: 2000, // How long to wait when connecting to a client
});

export { pool };

// Utility function to execute SQL queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 100) + '...', duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Utility function for getting client from pool
export async function getClient() {
  const client = await pool.connect();
  return client;
}