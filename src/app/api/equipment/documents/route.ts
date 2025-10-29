/**
 * Equipment Documents API
 * GET: List documents with filters
 * POST: Upload new document to Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { requireEquipmentPermission } from '@/lib/auth-middleware';

import { createClient } from '@supabase/supabase-js';
import type {
  EquipmentDocument,
  PaginatedResponse,
} from '@/types/equipment-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Use project-documents bucket with equipment/ prefix for organization
const BUCKET_NAME = process.env.SUPABASE_PROJECT_DOCUMENTS_BUCKET || 'project-documents';
const EQUIPMENT_DOCS_PREFIX = 'equipment/';

// GET /api/equipment/documents - List documents
export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require view permission
  const authResult = await requireEquipmentPermission(request, 'view');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getSupabaseServerClient();
try {
    const searchParams = request.nextUrl.searchParams;
    const equipment_id = searchParams.get('equipment_id');
    const document_type = searchParams.get('document_type');
    const expiring_within_days = searchParams.get('expiring_within_days');
    const expired_only = searchParams.get('expired_only') === 'true';
    const active_only = searchParams.get('active_only') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');

    // Build query
    let query = supabase
      .from('equipment_documents')
      .select(
        `
        id,
        equipment_id,
        document_type,
        document_name,
        file_path,
        file_size_bytes,
        mime_type,
        issue_date,
        expiry_date,
        notes,
        is_active,
        created_at,
        updated_at,
        uploaded_by_user_id,
        equipment:equipment_id (
          id,
          name,
          type,
          inventory_no
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Apply filters
    if (equipment_id) {
      query = query.eq('equipment_id', equipment_id);
    }

    if (document_type) {
      query = query.eq('document_type', document_type);
    }

    if (active_only) {
      query = query.eq('is_active', true);
    }

    // Expiry filters
    if (expired_only) {
      query = query.lt('expiry_date', new Date().toISOString().split('T')[0]);
    } else if (expiring_within_days) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + parseInt(expiring_within_days));
      query = query
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .gte('expiry_date', new Date().toISOString().split('T')[0]);
    }

    // Pagination
    const offset = (page - 1) * per_page;
    query = query.range(offset, offset + per_page - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch equipment documents' },
        { status: 500 }
      );
    }

    // Transform and add computed fields
    const items = await Promise.all(
      (data || []).map(async (item: any) => {
        const daysUntilExpiry = item.expiry_date
          ? Math.ceil(
              (new Date(item.expiry_date).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;

        // Generate signed URL for file access (valid for 1 hour)
        let fileUrl = null;
        if (item.file_path) {
          const { data: urlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(item.file_path, 3600);
          fileUrl = urlData?.signedUrl || null;
        }

        return {
          ...item,
          equipment_name: item.equipment?.name,
          days_until_expiry: daysUntilExpiry,
          is_expiring_soon: daysUntilExpiry !== null && daysUntilExpiry > 0 && daysUntilExpiry <= 60,
          is_expired: daysUntilExpiry !== null && daysUntilExpiry < 0,
          file_url: fileUrl,
        };
      })
    );

    const response: PaginatedResponse<EquipmentDocument> = {
      items,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching equipment documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment documents' },
      { status: 500 }
    );
  }
}

// POST /api/equipment/documents - Upload new document
export async function POST(request: NextRequest) {
  // 🔒 SECURITY: Require uploadDocuments permission
  const authResult = await requireEquipmentPermission(request, 'uploadDocuments');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getSupabaseServerClient();
try {
    const formData = await request.formData();
    const equipment_id = formData.get('equipment_id') as string;
    const document_type = formData.get('document_type') as string;
    const document_name = formData.get('document_name') as string;
    const file = formData.get('file') as File;
    const issue_date = formData.get('issue_date') as string | null;
    const expiry_date = formData.get('expiry_date') as string | null;
    const notes = formData.get('notes') as string | null;

    // Validate required fields
    if (!equipment_id || !document_type || !document_name || !file) {
      return NextResponse.json(
        { error: 'Missing required fields: equipment_id, document_type, document_name, file' },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${EQUIPMENT_DOCS_PREFIX}${equipment_id}/${timestamp}_${sanitizedFileName}`;

    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Create database record
    const { data: document, error: dbError } = await supabase
      .from('equipment_documents')
      .insert({
        equipment_id,
        document_type,
        document_name,
        file_path: uploadData.path,
        file_size_bytes: file.size,
        mime_type: file.type,
        issue_date: issue_date || null,
        expiry_date: expiry_date || null,
        notes: notes || null,
        is_active: true,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error creating document record:', dbError);
      // Try to cleanup uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([uploadData.path]);
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        document,
        message: 'Document uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading equipment document:', error);
    return NextResponse.json(
      { error: 'Failed to upload equipment document' },
      { status: 500 }
    );
  }
}

// PUT /api/equipment/documents/[id] - Update document metadata
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      document_type,
      document_name,
      issue_date,
      expiry_date,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Update document metadata in database
    const { data: document, error: dbError } = await supabase
      .from('equipment_documents')
      .update({
        document_type: document_type || undefined,
        document_name: document_name || undefined,
        issue_date: issue_date || null,
        expiry_date: expiry_date || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('Error updating document:', dbError);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
      message: 'Document updated successfully',
    });
  } catch (error) {
    console.error('Error updating equipment document:', error);
    return NextResponse.json(
      { error: 'Failed to update equipment document' },
      { status: 500 }
    );
  }
}
