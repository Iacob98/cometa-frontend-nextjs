import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deleteDocument as deleteDocumentFromSupabase } from '@/lib/worker-document-storage';

// Initialize Supabase client for direct queries
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

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

    // Try to update in documents table first (legal documents)
    const { data: legalDoc, error: legalError } = await supabase
      .from('documents')
      .update({
        document_number: body.document_number || null,
        issuing_authority: body.issuing_authority || null,
        issue_date: body.issue_date || null,
        expiry_date: body.expiry_date || null,
        notes: body.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .eq('uploaded_by', id)
      .select()
      .single();

    if (legalDoc) {
      console.log(`✏️ Документ обновлен (legal):`, {
        documentId,
        fileName: legalDoc.original_filename || legalDoc.filename,
        userId: id
      });

      return NextResponse.json({
        message: 'Document updated successfully',
        document: legalDoc
      });
    }

    // If not found in documents, try files table (company documents)
    const { data: companyDoc, error: companyError } = await supabase
      .from('files')
      .update({
        metadata: {
          document_number: body.document_number || null,
          issuing_authority: body.issuing_authority || null,
          issue_date: body.issue_date || null,
          expiry_date: body.expiry_date || null,
          notes: body.notes || null,
        },
        description: body.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .eq('user_id', id)
      .select()
      .single();

    if (companyDoc) {
      console.log(`✏️ Документ обновлен (company):`, {
        documentId,
        fileName: companyDoc.original_filename || companyDoc.filename,
        userId: id
      });

      return NextResponse.json({
        message: 'Document updated successfully',
        document: companyDoc
      });
    }

    // Document not found in either table
    console.log(`❌ Документ не найден:`, { documentId, userId: id });
    return NextResponse.json(
      { error: 'Document not found' },
      { status: 404 }
    );

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

    // First, try to find document in 'documents' table (legal documents)
    const { data: legalDoc } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('uploaded_by', id)
      .single();

    if (legalDoc) {
      // Delete legal document
      await deleteDocumentFromSupabase(
        documentId,
        'documents',
        legalDoc.file_path,
        'legal'
      );

      console.log(`🗑️ Документ удален (legal):`, {
        documentId,
        fileName: legalDoc.original_filename || legalDoc.filename,
        userId: id
      });

      return NextResponse.json({
        message: 'Document deleted successfully',
        documentId,
        fileName: legalDoc.original_filename || legalDoc.filename
      });
    }

    // If not found, try 'files' table (company documents)
    const { data: companyDoc } = await supabase
      .from('files')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', id)
      .single();

    if (companyDoc) {
      // Delete company document
      await deleteDocumentFromSupabase(
        documentId,
        companyDoc.bucket_name || 'worker-documents',
        companyDoc.file_path,
        'company'
      );

      console.log(`🗑️ Документ удален (company):`, {
        documentId,
        fileName: companyDoc.original_filename || companyDoc.filename,
        userId: id
      });

      return NextResponse.json({
        message: 'Document deleted successfully',
        documentId,
        fileName: companyDoc.original_filename || companyDoc.filename
      });
    }

    // Document not found in either table
    console.log(`❌ Документ не найден:`, { documentId, userId: id });
    return NextResponse.json(
      { error: 'Document not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Document delete API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}