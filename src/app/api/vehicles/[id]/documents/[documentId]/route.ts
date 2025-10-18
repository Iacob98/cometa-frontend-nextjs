/**
 * API Route: /api/vehicles/[id]/documents/[documentId]
 * Handles individual vehicle document operations (GET, PUT, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deleteVehicleDocument } from '@/lib/vehicle-document-storage';

// Service role client for bypassing RLS
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==============================================================================
// GET: Fetch single document by ID
// ==============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: vehicleId, documentId } = await params;

    if (!vehicleId || !documentId) {
      return NextResponse.json(
        { error: 'Vehicle ID and Document ID are required' },
        { status: 400 }
      );
    }

    // Fetch document from database
    const { data: document, error } = await supabaseService
      .from('vehicle_documents')
      .select('*')
      .eq('id', documentId)
      .eq('vehicle_id', vehicleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      console.error('❌ Error fetching document:', error);
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 }
      );
    }

    console.log('✅ Document fetched:', {
      vehicleId,
      documentId,
      fileName: document.file_name,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('❌ GET document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ==============================================================================
// PUT: Update document metadata
// ==============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: vehicleId, documentId } = await params;

    if (!vehicleId || !documentId) {
      return NextResponse.json(
        { error: 'Vehicle ID and Document ID are required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate allowed fields for update
    const allowedFields = [
      'document_number',
      'issuing_authority',
      'issue_date',
      'expiry_date',
      'notes',
      'is_verified',
    ];

    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Always update the updated_at timestamp
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length === 1) { // Only updated_at
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update document in database
    const { data: updatedDocument, error } = await supabaseService
      .from('vehicle_documents')
      .update(updates)
      .eq('id', documentId)
      .eq('vehicle_id', vehicleId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating document:', error);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    console.log('✅ Document updated:', {
      vehicleId,
      documentId,
      updatedFields: Object.keys(updates),
    });

    return NextResponse.json({
      message: 'Document updated successfully',
      document: updatedDocument,
    });
  } catch (error) {
    console.error('❌ PUT document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ==============================================================================
// DELETE: Remove document
// ==============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: vehicleId, documentId } = await params;

    if (!vehicleId || !documentId) {
      return NextResponse.json(
        { error: 'Vehicle ID and Document ID are required' },
        { status: 400 }
      );
    }

    // First, fetch the document to get file path
    const { data: document, error: fetchError } = await supabaseService
      .from('vehicle_documents')
      .select('file_path, file_name')
      .eq('id', documentId)
      .eq('vehicle_id', vehicleId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      console.error('❌ Error fetching document for deletion:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch document' },
        { status: 500 }
      );
    }

    // Delete file from storage
    try {
      await deleteVehicleDocument(document.file_path);
    } catch (storageError) {
      console.error('⚠️ Warning: Failed to delete file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete database record
    const { error: deleteError } = await supabaseService
      .from('vehicle_documents')
      .delete()
      .eq('id', documentId)
      .eq('vehicle_id', vehicleId);

    if (deleteError) {
      console.error('❌ Error deleting document from database:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    console.log('✅ Document deleted:', {
      vehicleId,
      documentId,
      fileName: document.file_name,
    });

    return NextResponse.json({
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('❌ DELETE document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
