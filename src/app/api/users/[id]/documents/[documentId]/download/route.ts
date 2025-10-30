import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';
import { createSignedUrl } from '@/lib/worker-document-storage';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: userId, documentId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

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

      // Create signed URL (valid for 60 seconds)
      const signedUrl = await createSignedUrl(doc.bucket_name, doc.file_path, 60);

      return NextResponse.json({
        url: signedUrl,
        filename: doc.original_filename,
        mimeType: doc.mime_type,
      });
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

      // Construct file path for legal documents
      // Assuming structure: {userId}/{filename}
      const filePath = `${userId}/${doc.filename}`;

      // Create signed URL (valid for 60 seconds)
      const signedUrl = await createSignedUrl('documents', filePath, 60);

      return NextResponse.json({
        url: signedUrl,
        filename: doc.original_filename,
        mimeType: doc.file_type,
      });
    }

    // Document not found in both tables
    return NextResponse.json(
      { error: 'Document not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Document download API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate download URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}