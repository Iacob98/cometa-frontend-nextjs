#!/usr/bin/env node

/**
 * Apply Storage Policies for vehicle-documents bucket
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: 'aws-1-eu-north-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.oijmohlhdxoawzvctnxx',
  password: 'Iasaninja1973..',
  ssl: { rejectUnauthorized: false }
});

async function applyPolicies() {
  const client = await pool.connect();

  try {
    console.log('🚀 Applying storage policies for vehicle-documents...\n');

    const sqlFilePath = path.join(__dirname, '..', 'migrations', 'create-vehicle-storage-policies.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('📋 Executing storage policies...');
    await client.query(sql);

    console.log('✅ Storage policies applied successfully!\n');

    // Verify policies
    const { rows } = await client.query(`
      SELECT policyname, cmd
      FROM pg_policies
      WHERE tablename = 'objects'
      AND policyname LIKE '%vehicle documents%'
      ORDER BY policyname;
    `);

    console.log('📊 Verified policies:');
    rows.forEach(row => {
      console.log(`  - ${row.policyname} (${row.cmd})`);
    });

    console.log('\n✅ Storage setup completed!');

  } catch (error) {
    console.error('❌ Failed to apply policies:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

applyPolicies();
