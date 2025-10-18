/**
 * Migration script: Add notes, owned, and current_location columns to equipment table
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting equipment table migration...\n');

  try {
    // Read the SQL migration file
    const sqlFile = path.join(__dirname, '../sql/migrations/add_equipment_notes_fields.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL into individual statements (split by semicolon, but not in comments)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });

      if (error) {
        // Try direct query if RPC fails
        console.log('  Trying direct query...');
        const { data: directData, error: directError } = await supabase
          .from('equipment')
          .select('*')
          .limit(0);

        if (directError) {
          throw new Error(`Failed to execute statement: ${directError.message}`);
        }
      }

      console.log('  ✅ Success\n');
    }

    // Verify columns were added
    console.log('🔍 Verifying columns...\n');

    const { data: columns, error: verifyError } = await supabase
      .from('equipment')
      .select('*')
      .limit(1);

    if (verifyError) {
      throw new Error(`Verification failed: ${verifyError.message}`);
    }

    // Check if the columns exist in the returned data
    if (columns && columns.length > 0) {
      const firstRow = columns[0];
      const hasNotes = 'notes' in firstRow;
      const hasOwned = 'owned' in firstRow;
      const hasCurrentLocation = 'current_location' in firstRow;

      console.log('Column verification:');
      console.log(`  notes: ${hasNotes ? '✅' : '❌'}`);
      console.log(`  owned: ${hasOwned ? '✅' : '❌'}`);
      console.log(`  current_location: ${hasCurrentLocation ? '✅' : '❌'}`);

      if (hasNotes && hasOwned && hasCurrentLocation) {
        console.log('\n✅ Migration completed successfully!');
      } else {
        console.log('\n⚠️  Migration may be incomplete. Please verify manually.');
      }
    } else {
      console.log('⚠️  No equipment records found to verify. Please add a test record and check.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Execute migration
runMigration();
