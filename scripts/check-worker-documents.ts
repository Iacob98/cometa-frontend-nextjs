import { query } from '../src/lib/db-client';

async function checkDocuments() {
  console.log('🔍 Checking worker documents in database...\n');

  try {
    // Check files table (company documents)
    console.log('📄 Checking files table (company documents):');
    const filesResult = await query(`
      SELECT
        f.id,
        f.user_id,
        f.bucket_name,
        f.file_path,
        f.original_filename,
        f.file_size,
        f.created_at,
        u.first_name,
        u.last_name,
        u.email
      FROM files f
      LEFT JOIN users u ON u.id = f.user_id
      ORDER BY f.created_at DESC
      LIMIT 10
    `);

    console.log(`Found ${filesResult.rows.length} documents in files table`);
    filesResult.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.original_filename} (${(row.file_size / 1024).toFixed(2)} KB)`);
      console.log(`     User: ${row.first_name} ${row.last_name} (${row.email})`);
      console.log(`     Bucket: ${row.bucket_name}, Path: ${row.file_path}`);
      console.log(`     Created: ${row.created_at}\n`);
    });

    // Check documents table (legal documents)
    console.log('\n📄 Checking documents table (legal documents):');
    const documentsResult = await query(`
      SELECT
        d.id,
        d.project_id,
        d.filename,
        d.original_filename,
        d.file_size,
        d.document_type,
        d.category_id,
        d.uploaded_by,
        d.upload_date,
        u.first_name,
        u.last_name,
        u.email
      FROM documents d
      LEFT JOIN users u ON u.id = d.uploaded_by
      WHERE d.category_id IS NOT NULL
      ORDER BY d.upload_date DESC
      LIMIT 10
    `);

    console.log(`Found ${documentsResult.rows.length} documents with category_id in documents table`);
    documentsResult.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.original_filename || row.filename} (${(row.file_size / 1024).toFixed(2)} KB)`);
      console.log(`     Type: ${row.document_type}, Category ID: ${row.category_id}`);
      if (row.first_name) {
        console.log(`     Uploaded by: ${row.first_name} ${row.last_name} (${row.email})`);
      }
      console.log(`     Date: ${row.upload_date}\n`);
    });

    // Count total documents
    const totalFiles = await query(`SELECT COUNT(*) as count FROM files`);
    const totalDocs = await query(`SELECT COUNT(*) as count FROM documents WHERE category_id IS NOT NULL`);

    console.log('\n📊 Summary:');
    console.log(`Total company documents (files table): ${totalFiles.rows[0].count}`);
    console.log(`Total legal documents with category (documents table): ${totalDocs.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDocuments();
