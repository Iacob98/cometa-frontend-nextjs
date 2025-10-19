/**
 * Equipment Documents API
 * GET: List documents with filters
 * POST: Upload new document
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';
import { createClient } from '@supabase/supabase-js';
import type {
  EquipmentDocument,
  EquipmentDocumentFilters,
  PaginatedResponse,
} from '@/types/equipment-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'equipment-documents';

// GET /api/equipment/documents - List documents
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const equipment_id = searchParams.get('equipment_id');
    const document_type = searchParams.get('document_type');
    const expiring_within_days = searchParams.get('expiring_within_days');
    const expired_only = searchParams.get('expired_only') === 'true';
    const active_only = searchParams.get('active_only') !== 'false'; // Default true
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (active_only) {
      conditions.push(`ed.is_active = true`);
    }

    if (equipment_id) {
      conditions.push(`ed.equipment_id = $${paramIndex++}`);
      params.push(equipment_id);
    }

    if (document_type) {
      conditions.push(`ed.document_type = $${paramIndex++}`);
      params.push(document_type);
    }

    if (expiring_within_days) {
      const days = parseInt(expiring_within_days);
      conditions.push(`ed.expiry_date IS NOT NULL`);
      conditions.push(`ed.expiry_date > CURRENT_DATE`);
      conditions.push(`ed.expiry_date <= CURRENT_DATE + INTERVAL '${days} days'`);
    }

    if (expired_only) {
      conditions.push(`ed.expiry_date IS NOT NULL`);
      conditions.push(`ed.expiry_date < CURRENT_DATE`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM equipment_documents ed
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Fetch paginated data with computed fields
    const offset = (page - 1) * per_page;
    params.push(per_page, offset);

    const dataQuery = `
      SELECT
        ed.id,
        ed.equipment_id,
        ed.document_type,
        ed.document_name,
        ed.file_path,
        ed.file_size_bytes,
        ed.mime_type,
        ed.issue_date,
        ed.expiry_date,
        ed.notes,
        ed.uploaded_by_user_id,
        ed.is_active,
        ed.created_at,
        ed.updated_at,
        -- Computed fields
        CASE
          WHEN ed.expiry_date IS NULL THEN NULL
          ELSE (ed.expiry_date - CURRENT_DATE)::INTEGER
        END as days_until_expiry,
        CASE
          WHEN ed.expiry_date IS NULL THEN false
          WHEN ed.expiry_date < CURRENT_DATE THEN false
          WHEN ed.expiry_date <= CURRENT_DATE + INTERVAL '60 days' THEN true
          ELSE false
        END as is_expiring_soon,
        CASE
          WHEN ed.expiry_date IS NULL THEN false
          WHEN ed.expiry_date < CURRENT_DATE THEN true
          ELSE false
        END as is_expired,
        -- Equipment details
        json_build_object(
          'id', e.id,
          'name', e.name,
          'type', e.type
        ) as equipment,
        -- Uploaded by user details
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name
        ) as uploaded_by
      FROM equipment_documents ed
      LEFT JOIN equipment e ON e.id = ed.equipment_id
      LEFT JOIN users u ON u.id = ed.uploaded_by_user_id
      ${whereClause}
      ORDER BY
        CASE WHEN ed.expiry_date IS NOT NULL THEN ed.expiry_date ELSE '9999-12-31'::DATE END ASC,
        ed.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const dataResult = await query(dataQuery, params);

    const response: PaginatedResponse<EquipmentDocument> = {
      items: dataResult.rows,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
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

// POST /api/equipment/documents - Upload document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const equipment_id = formData.get('equipment_id') as string;
    const document_type = formData.get('document_type') as string;
    const document_name = formData.get('document_name') as string;
    const file = formData.get('file') as File;
    const issue_date = formData.get('issue_date') as string | null;
    const expiry_date = formData.get('expiry_date') as string | null;
    const notes = formData.get('notes') as string | null;
    const uploaded_by_user_id = formData.get('uploaded_by_user_id') as string | null;

    // Validate required fields
    if (!equipment_id || !document_type || !document_name || !file) {
      return NextResponse.json(
        { error: 'Missing required fields: equipment_id, document_type, document_name, file' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Generate unique file path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${equipment_id}/${timestamp}_${sanitizedFileName}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Insert document record
    const insertQuery = `
      INSERT INTO equipment_documents (
        equipment_id,
        document_type,
        document_name,
        file_path,
        file_size_bytes,
        mime_type,
        issue_date,
        expiry_date,
        notes,
        uploaded_by_user_id,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING
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
        uploaded_by_user_id,
        is_active,
        created_at,
        updated_at
    `;

    const insertResult = await query(insertQuery, [
      equipment_id,
      document_type,
      document_name,
      uploadData.path,
      file.size,
      file.type,
      issue_date || null,
      expiry_date || null,
      notes || null,
      uploaded_by_user_id || null,
    ]);

    const document = insertResult.rows[0];

    // Generate signed URL for immediate access
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(uploadData.path, 3600); // 1 hour

    return NextResponse.json(
      {
        success: true,
        document: {
          ...document,
          signed_url: urlData?.signedUrl,
        },
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
