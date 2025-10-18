/**
 * Temporary migration endpoint to add notes column to equipment table
 * DELETE THIS FILE AFTER MIGRATION IS COMPLETE
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  try {
    console.log('🚀 Starting equipment notes column migration...');

    // Execute the ALTER TABLE command using raw SQL
    // Note: Supabase JS client doesn't support DDL directly, so we use raw SQL through rpc
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: 'ALTER TABLE equipment ADD COLUMN IF NOT EXISTS notes TEXT'
    });

    if (error) {
      console.error('❌ Migration error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        note: 'Please run this SQL manually in Supabase Dashboard > SQL Editor:',
        sql: 'ALTER TABLE equipment ADD COLUMN IF NOT EXISTS notes TEXT;'
      }, { status: 500 });
    }

    // Verify the column was added
    const { data: verifyData, error: verifyError } = await supabase
      .from('equipment')
      .select('*')
      .limit(1);

    if (verifyError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to verify migration',
        details: verifyError
      }, { status: 500 });
    }

    const hasNotesColumn = verifyData && verifyData.length > 0 && 'notes' in verifyData[0];

    return NextResponse.json({
      success: hasNotesColumn,
      message: hasNotesColumn
        ? '✅ Migration successful! notes column added to equipment table'
        : '⚠️  Migration may have failed. Please verify manually.',
      columns: verifyData && verifyData.length > 0 ? Object.keys(verifyData[0]) : [],
      hasNotesColumn,
      note: hasNotesColumn
        ? 'You can now delete this migration endpoint file: src/app/api/migrate/equipment-notes/route.ts'
        : 'Please run this SQL manually in Supabase Dashboard > SQL Editor: ALTER TABLE equipment ADD COLUMN IF NOT EXISTS notes TEXT;'
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      note: 'Please run this SQL manually in Supabase Dashboard > SQL Editor:',
      sql: 'ALTER TABLE equipment ADD COLUMN IF NOT EXISTS notes TEXT;'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check if notes column exists
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .limit(1);

    if (error) {
      return NextResponse.json({
        error: error.message
      }, { status: 500 });
    }

    const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
    const hasNotesColumn = columns.includes('notes');

    return NextResponse.json({
      hasNotesColumn,
      columns,
      message: hasNotesColumn
        ? '✅ notes column exists in equipment table'
        : '❌ notes column is missing from equipment table',
      action: hasNotesColumn
        ? 'Migration not needed. You can delete this endpoint.'
        : 'Run POST request to this endpoint to add the column, or add it manually in Supabase Dashboard'
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
