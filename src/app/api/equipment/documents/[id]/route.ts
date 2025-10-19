/**
 * Equipment Document Detail API
 * GET: Get document with signed URL
 * DELETE: Delete document
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'equipment-documents';

// GET /api/equipment/documents/[id] - Get document with signed URL
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const selectQuery = `
      SELECT * FROM equipment_documents WHERE id = $1 AND is_active = true
    `;
    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = result.rows[0];

    // Generate signed URL (valid for 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(document.file_path, 3600);

    if (urlError) {
      console.error('Error generating signed URL:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...document,
      signed_url: urlData.signedUrl,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/documents/[id] - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get document to delete from storage
    const selectQuery = `
      SELECT file_path FROM equipment_documents WHERE id = $1 AND is_active = true
    `;
    const selectResult = await query(selectQuery, [id]);

    if (selectResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const filePath = selectResult.rows[0].file_path;

    // Soft delete in database
    const deleteQuery = `
      UPDATE equipment_documents
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;
    await query(deleteQuery, [id]);

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (storageError) {
      console.error('Storage deletion error (non-fatal):', storageError);
      // Continue - database record is already soft-deleted
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
