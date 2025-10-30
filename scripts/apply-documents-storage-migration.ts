import { query } from '../src/lib/db-client';

async function applyMigration() {
  console.log('📝 Applying migration: Add storage fields to documents table...');

  try {
    // Add file_url column
    await query(`
      ALTER TABLE documents
      ADD COLUMN IF NOT EXISTS file_url TEXT;
    `);
    console.log('✅ Added file_url column');

    // Add file_path column
    await query(`
      ALTER TABLE documents
      ADD COLUMN IF NOT EXISTS file_path TEXT;
    `);
    console.log('✅ Added file_path column');

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_documents_file_path ON documents(file_path);
    `);
    console.log('✅ Created index on file_path');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_documents_project_id_active ON documents(project_id, is_active);
    `);
    console.log('✅ Created composite index on project_id and is_active');

    // Add comments
    await query(`
      COMMENT ON COLUMN documents.file_url IS 'Public URL from Supabase Storage (may be signed URL)';
    `);
    await query(`
      COMMENT ON COLUMN documents.file_path IS 'Full path in Supabase Storage bucket: projects/{projectId}/{documentType}s/{filename}';
    `);
    console.log('✅ Added column comments');

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
