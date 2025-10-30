import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';
import { createSignedUrl } from '@/lib/worker-document-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: userId, documentId } = await params;

    if (!userId || !documentId) {
      return NextResponse.json(
        { error: 'User ID and Document ID are required' },
        { status: 400 }
      );
    }

    console.log('👁️ View document request:', { userId, documentId });

    // Try to find document in files table (company documents)
    const filesResult = await query(
      `SELECT
        id,
        user_id,
        bucket_name,
        file_path,
        original_filename,
        mime_type
      FROM files
      WHERE id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    if (filesResult.rows.length > 0) {
      const doc = filesResult.rows[0];

      console.log('📄 Found document in files table:', {
        id: doc.id,
        fileName: doc.original_filename,
        bucket: doc.bucket_name,
        path: doc.file_path
      });

      // Create signed URL (valid for 3600 seconds = 1 hour for viewing)
      const signedUrl = await createSignedUrl(doc.bucket_name, doc.file_path, 3600);

      console.log('✅ Generated signed URL for viewing');

      // Redirect to the signed URL for inline viewing
      return NextResponse.redirect(signedUrl);
    }

    // Try to find document in documents table (legal documents)
    const documentsResult = await query(
      `SELECT
        id,
        uploaded_by,
        filename,
        original_filename,
        file_type
      FROM documents
      WHERE id = $1 AND uploaded_by = $2`,
      [documentId, userId]
    );

    if (documentsResult.rows.length > 0) {
      const doc = documentsResult.rows[0];

      console.log('📄 Found document in documents table:', {
        id: doc.id,
        fileName: doc.original_filename
      });

      // Construct file path for legal documents
      // Assuming structure: {userId}/{filename}
      const filePath = `${userId}/${doc.filename}`;

      // Create signed URL (valid for 3600 seconds = 1 hour for viewing)
      const signedUrl = await createSignedUrl('documents', filePath, 3600);

      console.log('✅ Generated signed URL for viewing');

      // Redirect to the signed URL for inline viewing
      return NextResponse.redirect(signedUrl);
    }

    // Document not found in both tables
    console.error('❌ Document not found:', { userId, documentId });
    return NextResponse.json(
      { error: 'Document not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('❌ Document view API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to view document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}