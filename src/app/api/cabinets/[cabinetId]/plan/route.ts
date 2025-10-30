import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET - Retrieve installation plan for a specific NVT point (cabinet)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ cabinetId: string }> }
) {
  try {
    const { cabinetId } = await params;

    if (!cabinetId) {
      return NextResponse.json(
        { error: 'Cabinet ID is required' },
        { status: 400 }
      );
    }

    // Fetch cabinet with plan information
    const result = await query(
      `SELECT
        id,
        project_id,
        code,
        name,
        address,
        plan_title,
        plan_description,
        plan_type,
        plan_filename,
        plan_file_size,
        plan_file_url,
        plan_file_path,
        plan_uploaded_at
      FROM cabinets
      WHERE id = $1`,
      [cabinetId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cabinet not found' },
        { status: 404 }
      );
    }

    const cabinet = result.rows[0];

    return NextResponse.json({
      cabinet: {
        id: cabinet.id,
        project_id: cabinet.project_id,
        code: cabinet.code,
        name: cabinet.name,
        address: cabinet.address,
      },
      plan: cabinet.plan_filename ? {
        title: cabinet.plan_title,
        description: cabinet.plan_description,
        plan_type: cabinet.plan_type,
        filename: cabinet.plan_filename,
        file_size: cabinet.plan_file_size,
        file_url: cabinet.plan_file_url,
        file_path: cabinet.plan_file_path,
        uploaded_at: cabinet.plan_uploaded_at,
      } : null,
    });
  } catch (error) {
    console.error('Cabinet plan GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cabinet plan' },
      { status: 500 }
    );
  }
}

/**
 * POST - Upload installation plan for a specific NVT point (cabinet)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cabinetId: string }> }
) {
  try {
    const { cabinetId } = await params;

    if (!cabinetId) {
      return NextResponse.json(
        { error: 'Cabinet ID is required' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const planType = formData.get('plan_type') as string;

    if (!file || !title || !planType) {
      return NextResponse.json(
        { error: 'File, title, and plan type are required' },
        { status: 400 }
      );
    }

    // Get cabinet and project info
    const cabinetResult = await query(
      `SELECT id, project_id, code, name FROM cabinets WHERE id = $1`,
      [cabinetId]
    );

    if (cabinetResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cabinet not found' },
        { status: 404 }
      );
    }

    const cabinet = cabinetResult.rows[0];

    // Create file path: projects/{project_id}/nvt/{cabinet_id}/plans/{filename}
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileExtension = sanitizedFileName.split('.').pop();
    const baseFileName = sanitizedFileName.replace(`.${fileExtension}`, '');
    const uniqueFileName = `${baseFileName}_${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const filePath = `projects/${cabinet.project_id}/nvt/${cabinetId}/plans/${uniqueFileName}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-documents')
      .getPublicUrl(filePath);

    // Update cabinet with plan information
    const updateResult = await query(
      `UPDATE cabinets
       SET
         plan_title = $1,
         plan_description = $2,
         plan_type = $3,
         plan_filename = $4,
         plan_file_size = $5,
         plan_file_url = $6,
         plan_file_path = $7,
         plan_uploaded_at = NOW(),
         updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        title,
        description || null,
        planType,
        file.name,
        file.size,
        urlData.publicUrl,
        filePath,
        cabinetId,
      ]
    );

    console.log(`✅ Plan uploaded for NVT ${cabinet.code || cabinet.name}:`, {
      title,
      planType,
      filename: file.name,
      size: file.size,
      path: filePath,
    });

    return NextResponse.json({
      success: true,
      message: 'Plan uploaded successfully',
      plan: {
        title,
        description,
        plan_type: planType,
        filename: file.name,
        file_size: file.size,
        file_url: urlData.publicUrl,
        file_path: filePath,
        uploaded_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Cabinet plan upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove installation plan from a specific NVT point (cabinet)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cabinetId: string }> }
) {
  try {
    const { cabinetId } = await params;

    if (!cabinetId) {
      return NextResponse.json(
        { error: 'Cabinet ID is required' },
        { status: 400 }
      );
    }

    // Get current plan info
    const cabinetResult = await query(
      `SELECT plan_file_path FROM cabinets WHERE id = $1`,
      [cabinetId]
    );

    if (cabinetResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cabinet not found' },
        { status: 404 }
      );
    }

    const filePath = cabinetResult.rows[0].plan_file_path;

    // Delete from storage if file exists
    if (filePath) {
      const { error: deleteError } = await supabase.storage
        .from('project-documents')
        .remove([filePath]);

      if (deleteError) {
        console.error('Storage delete error:', deleteError);
        // Continue even if storage delete fails
      }
    }

    // Clear plan fields in database
    await query(
      `UPDATE cabinets
       SET
         plan_title = NULL,
         plan_description = NULL,
         plan_type = NULL,
         plan_filename = NULL,
         plan_file_size = NULL,
         plan_file_url = NULL,
         plan_file_path = NULL,
         plan_uploaded_at = NULL,
         updated_at = NOW()
       WHERE id = $1`,
      [cabinetId]
    );

    console.log(`✅ Plan deleted for cabinet ${cabinetId}`);

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    console.error('Cabinet plan delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;
