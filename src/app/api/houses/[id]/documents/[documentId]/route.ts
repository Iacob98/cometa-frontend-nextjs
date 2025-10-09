import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'house-documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: house_id, documentId } = await params;

    if (!house_id || !documentId) {
      return NextResponse.json(
        { error: 'House ID and Document ID are required' },
        { status: 400 }
      );
    }

    // Fetch the specific document
    const { data: houseDocument, error } = await supabase
      .from('house_documents')
      .select(`
        id,
        house_id,
        document_id,
        document_type,
        created_at,
        document:documents(
          id,
          filename,
          original_filename,
          file_type,
          file_size,
          document_type,
          description,
          upload_date,
          uploaded_by,
          is_active
        )
      `)
      .eq('house_id', house_id)
      .eq('id', documentId)
      .single();

    if (error || !houseDocument) {
      console.error('Document not found:', error);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (!houseDocument.document || !houseDocument.document.is_active) {
      return NextResponse.json(
        { error: 'Document not available' },
        { status: 404 }
      );
    }

    // Generate download URL with longer expiry for direct downloads
    const { data: signedUrl } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(houseDocument.document.filename, 7200); // 2 hours

    if (!signedUrl) {
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: houseDocument.id,
      document_id: houseDocument.document_id,
      house_id: houseDocument.house_id,
      document_type: houseDocument.document_type,
      filename: houseDocument.document.original_filename || houseDocument.document.filename,
      file_type: houseDocument.document.file_type,
      file_size: houseDocument.document.file_size,
      description: houseDocument.document.description,
      upload_date: houseDocument.document.upload_date,
      uploaded_by: houseDocument.document.uploaded_by,
      download_url: signedUrl.signedUrl,
      created_at: houseDocument.created_at
    });
  } catch (error) {
    console.error('Get house document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: house_id, documentId } = await params;

    if (!house_id || !documentId) {
      return NextResponse.json(
        { error: 'House ID and Document ID are required' },
        { status: 400 }
      );
    }

    // Fetch the document to get filename for storage deletion
    const { data: houseDocument, error: fetchError } = await supabase
      .from('house_documents')
      .select(`
        id,
        document_id,
        document:documents(
          id,
          filename,
          is_active
        )
      `)
      .eq('house_id', house_id)
      .eq('id', documentId)
      .single();

    if (fetchError || !houseDocument) {
      console.error('Document not found:', fetchError);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const documentId_db = houseDocument.document_id;
    const filename = houseDocument.document?.filename;

    // Delete house-document link
    const { error: linkDeleteError } = await supabase
      .from('house_documents')
      .delete()
      .eq('id', documentId)
      .eq('house_id', house_id);

    if (linkDeleteError) {
      console.error('Error deleting house-document link:', linkDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete document link' },
        { status: 500 }
      );
    }

    console.log(`Deleted house-document link: ${documentId}`);

    // Check if document is linked to other houses
    const { data: otherLinks, error: checkError } = await supabase
      .from('house_documents')
      .select('id')
      .eq('document_id', documentId_db);

    if (checkError) {
      console.error('Error checking other document links:', checkError);
    }

    // If no other houses reference this document, soft-delete it
    if (!otherLinks || otherLinks.length === 0) {
      const { error: documentDeleteError } = await supabase
        .from('documents')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', documentId_db);

      if (documentDeleteError) {
        console.error('Error soft-deleting document:', documentDeleteError);
      } else {
        console.log(`Soft-deleted document: ${documentId_db}`);
      }

      // Optionally, delete file from storage
      // This is commented out to preserve files even after soft-delete
      // Uncomment if you want to permanently delete files from storage
      /*
      if (filename) {
        const { error: storageDeleteError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([filename]);

        if (storageDeleteError) {
          console.error('Error deleting file from storage:', storageDeleteError);
        } else {
          console.log(`Deleted file from storage: ${filename}`);
        }
      }
      */
    } else {
      console.log(`Document ${documentId_db} is still linked to ${otherLinks.length} other house(s)`);
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete house document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
