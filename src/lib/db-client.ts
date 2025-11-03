import { Pool, PoolClient } from 'pg';

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

// Utility function to clear cached prepared statements on a client
async function clearClientCache(client: PoolClient) {
  try {
    // DISCARD ALL clears all cached prepared statements, temporary tables, and session state
    await client.query('DISCARD ALL');
  } catch (error) {
    console.warn('Failed to discard cached statements:', error);
  }
}

// Utility function to execute SQL queries with fresh connection state
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const client = await pool.connect();

  try {
    // Clear any cached prepared statements on this connection
    await clearClientCache(client);

    const res = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 100) + '...', duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Utility function for getting client from pool
export async function getClient() {
  const client = await pool.connect();
  await clearClientCache(client);
  return client;
}

// Utility function to completely drain and reset the connection pool
export async function resetPool() {
  try {
    console.log('🔄 Resetting connection pool...');
    await pool.end();
    console.log('✅ Connection pool reset complete');
  } catch (error) {
    console.error('Failed to reset connection pool:', error);
  }
}