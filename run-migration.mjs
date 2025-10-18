#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Running equipment table migration...\n');

// Execute SQL commands one by one
const queries = [
  "ALTER TABLE equipment ADD COLUMN IF NOT EXISTS notes TEXT",
  "ALTER TABLE equipment ADD COLUMN IF NOT EXISTS owned BOOLEAN DEFAULT true",
  "ALTER TABLE equipment ADD COLUMN IF NOT EXISTS current_location VARCHAR(200)"
];

for (const query of queries) {
  console.log(`Executing: ${query}`);
  try {
    // Since Supabase JS doesn't support DDL, we'll verify by trying to select
    // The actual ALTER TABLE needs to be run in Supabase Dashboard SQL Editor
    console.log('  ⚠️  This query needs to be run in Supabase Dashboard SQL Editor');
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }
}

// Verify by selecting from equipment table
console.log('\n🔍 Verifying table structure...');
const { data, error } = await supabase
  .from('equipment')
  .select('*')
  .limit(1);

if (data && data.length > 0) {
  const columns = Object.keys(data[0]);
  console.log('\nAvailable columns:');
  columns.forEach(col => console.log(`  - ${col}`));

  const hasNotes = columns.includes('notes');
  const hasOwned = columns.includes('owned');
  const hasCurrentLocation = columns.includes('current_location');

  console.log('\nMigration status:');
  console.log(`  notes: ${hasNotes ? '✅' : '❌ MISSING'}`);
  console.log(`  owned: ${hasOwned ? '✅' : '❌ MISSING'}`);
  console.log(`  current_location: ${hasCurrentLocation ? '✅' : '❌ MISSING'}`);
} else {
  console.log('⚠️  No equipment records found or error occurred');
  if (error) console.error(error);
}

console.log('\n📝 To complete migration, run these commands in Supabase Dashboard > SQL Editor:');
console.log('');
queries.forEach(q => console.log(q + ';'));
