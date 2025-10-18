#!/usr/bin/env node

/**
 * Migration Script: Create vehicle_documents table
 * Executes SQL migration using direct PostgreSQL connection
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configuration
const pool = new Pool({
  host: 'aws-1-eu-north-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.oijmohlhdxoawzvctnxx',
  password: 'Iasaninja1973..',
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting vehicle_documents migration...\n');

    // Read SQL file
    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'create-vehicle-documents-table.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📋 Executing SQL migration...');

    // Execute the migration
    await client.query(sql);

    console.log('✅ Migration completed successfully!\n');

    // Verify table creation
    const { rows } = await client.query(`
      SELECT
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'vehicle_documents'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Verified table structure:');
    console.log('Columns:', rows.length);
    rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });

    // Check indexes
    const { rows: indexes } = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename = 'vehicle_documents';
    `);

    console.log('\n🔍 Indexes created:', indexes.length);
    indexes.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });

    console.log('\n✅ All done! Table is ready to use.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
