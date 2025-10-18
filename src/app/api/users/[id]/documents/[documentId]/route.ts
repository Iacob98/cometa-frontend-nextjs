import { NextRequest, NextResponse } from 'next/server';
import { deleteDocument, getUserDocuments, updateDocument } from '@/lib/document-storage';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;

    if (!id || !documentId) {
      return NextResponse.json(
        { error: 'User ID and Document ID are required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Update document metadata (not the file itself)
    const updatedDocument = updateDocument(id, documentId, {
      document_number: body.document_number,
      issuing_authority: body.issuing_authority,
      issue_date: body.issue_date || null,
      expiry_date: body.expiry_date || null,
      notes: body.notes || ''
    });

    if (!updatedDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    console.log(`✏️ Документ обновлен:`, {
      documentId,
      fileName: updatedDocument.file_name,
      userId: id
    });

    return NextResponse.json({
      message: 'Document updated successfully',
      document: updatedDocument
    });

  } catch (error) {
    console.error('Document update API error:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;

    if (!id || !documentId) {
      return NextResponse.json(
        { error: 'User ID and Document ID are required' },
        { status: 400 }
      );
    }

    // Delete document using shared storage
    const documentToDelete = deleteDocument(id, documentId);

    if (!documentToDelete) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    console.log(`🗑️ Документ удален:`, {
      documentId,
      fileName: documentToDelete.file_name,
      userId: id,
      remainingDocs: getUserDocuments(id).length
    });

    return NextResponse.json({
      message: 'Document deleted successfully',
      documentId,
      fileName: documentToDelete.file_name
    });

  } catch (error) {
    console.error('Document delete API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}