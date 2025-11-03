import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET - Retrieve installation plans for a specific NVT point (cabinet)
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

    // Fetch cabinet basic info
    const cabinetResult = await query(
      `SELECT id, project_id, code, name, address
       FROM cabinets
       WHERE id = $1`,
      [cabinetId]
    );

    if (cabinetResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cabinet not found' },
        { status: 404 }
      );
    }

    // Fetch all plans for this cabinet
    const plansResult = await query(
      `SELECT
        id,
        title,
        description,
        plan_type,
        filename,
        file_size,
        file_url,
        file_path,
        uploaded_at
      FROM cabinet_plans
      WHERE cabinet_id = $1
      ORDER BY uploaded_at DESC`,
      [cabinetId]
    );

    const cabinet = cabinetResult.rows[0];

    return NextResponse.json({
      cabinet: {
        id: cabinet.id,
        project_id: cabinet.project_id,
        code: cabinet.code,
        name: cabinet.name,
        address: cabinet.address,
      },
      plans: plansResult.rows,
    });
  } catch (error) {
    console.error('Cabinet plans GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cabinet plans' },
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

    // Log received plan_type for debugging
    console.log('🔍 Received plan upload request:', {
      title,
      planType,
      description,
      fileName: file?.name,
      fileSize: file?.size,
    });

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
    const { error: uploadError } = await supabase.storage
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

    // Insert plan into cabinet_plans table
    const insertResult = await query(
      `INSERT INTO cabinet_plans (
         cabinet_id,
         title,
         description,
         plan_type,
         filename,
         file_size,
         file_url,
         file_path
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        cabinetId,
        title,
        description || null,
        planType,
        file.name,
        file.size,
        urlData.publicUrl,
        filePath,
      ]
    );

    const newPlan = insertResult.rows[0];

    console.log(`✅ Plan uploaded for NVT ${cabinet.code || cabinet.name}:`, {
      id: newPlan.id,
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
        id: newPlan.id,
        title: newPlan.title,
        description: newPlan.description,
        plan_type: newPlan.plan_type,
        filename: newPlan.filename,
        file_size: newPlan.file_size,
        file_url: newPlan.file_url,
        file_path: newPlan.file_path,
        uploaded_at: newPlan.uploaded_at,
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

export const runtime = 'nodejs';
export const maxDuration = 60;
