import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/houses/[id]/plan
 * Retrieve the connection plan for a house
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: houseId } = await params;

    // Fetch house with plan information
    const result = await query(
      `SELECT id, project_id, house_number, street, city,
              plan_title, plan_description, plan_type, plan_filename,
              plan_file_size, plan_file_url, plan_file_path, plan_uploaded_at
       FROM houses WHERE id = $1`,
      [houseId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      );
    }

    const house = result.rows[0];

    // VALIDATION: Log house plan check for debugging
    const addressDisplay = [house.street, house.city].filter(Boolean).join(', ') || 'No address';

    console.log('🔍 House Plan Validation Check:', {
      requested_house_id: houseId,
      house_address: addressDisplay,
      house_number: house.house_number || 'none',
      has_plan: !!house.plan_file_path,
      plan_filename: house.plan_filename || null,
      plan_uploaded_at: house.plan_uploaded_at || null,
    });

    // VALIDATION: Check if other houses in project have plans
    if (!house.plan_file_path && house.project_id) {
      const housesWithPlans = await query(
        `SELECT id, house_number, street, city, plan_filename, plan_uploaded_at
         FROM houses
         WHERE project_id = $1 AND plan_file_path IS NOT NULL
         LIMIT 5`,
        [house.project_id]
      );

      if (housesWithPlans.rows.length > 0) {
        console.log('⚠️ VALIDATION: Other houses in this project have plans:',
          housesWithPlans.rows.map(h => ({
            id: h.id,
            address: [h.street, h.city].filter(Boolean).join(', '),
            house_number: h.house_number,
            plan_filename: h.plan_filename,
            uploaded_at: h.plan_uploaded_at,
          }))
        );
      }
    }

    // Structure the response
    const response: {
      house: any;
      plan: any | null;
    } = {
      house: {
        id: house.id,
        project_id: house.project_id,
        house_number: house.house_number,
        street: house.street,
        city: house.city,
      },
      plan: null,
    };

    // Add plan if it exists
    if (house.plan_file_path) {
      response.plan = {
        title: house.plan_title,
        description: house.plan_description,
        plan_type: house.plan_type,
        filename: house.plan_filename,
        file_size: house.plan_file_size,
        file_url: house.plan_file_url,
        file_path: house.plan_file_path,
        uploaded_at: house.plan_uploaded_at,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching house plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch house plan' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/houses/[id]/plan
 * Upload a connection plan for a house
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: houseId } = await params;
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const planType = formData.get('plan_type') as string;

    if (!file || !title || !planType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, title, plan_type' },
        { status: 400 }
      );
    }

    // Validate plan type
    const validPlanTypes = ['connection_plan', 'wiring_diagram', 'technical_drawing', 'installation_guide', 'as_built', 'other'];
    if (!validPlanTypes.includes(planType)) {
      return NextResponse.json(
        { error: `Invalid plan_type. Must be one of: ${validPlanTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Fetch house to get project_id
    const houseResult = await query(
      'SELECT id, project_id FROM houses WHERE id = $1',
      [houseId]
    );

    if (houseResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      );
    }

    const house = houseResult.rows[0];

    // Check if plan already exists
    const existingPlanResult = await query(
      'SELECT plan_file_path FROM houses WHERE id = $1 AND plan_file_path IS NOT NULL',
      [houseId]
    );

    if (existingPlanResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'A connection plan already exists for this house. Delete it first to upload a new one.' },
        { status: 409 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${file.name}`;

    // Storage path: projects/{project_id}/houses/{house_id}/plans/{filename}
    const filePath = `projects/${house.project_id}/houses/${houseId}/plans/${uniqueFileName}`;

    // Upload to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from('project-documents')
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

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('project-documents')
      .getPublicUrl(filePath);

    // Update house with plan metadata
    await query(
      `UPDATE houses SET
         plan_title = $1,
         plan_description = $2,
         plan_type = $3,
         plan_filename = $4,
         plan_file_size = $5,
         plan_file_url = $6,
         plan_file_path = $7,
         plan_uploaded_at = NOW()
       WHERE id = $8`,
      [
        title,
        description,
        planType,
        file.name,
        file.size,
        urlData.publicUrl,
        filePath,
        houseId,
      ]
    );

    return NextResponse.json({
      message: 'Connection plan uploaded successfully',
      plan: {
        title,
        description,
        plan_type: planType,
        filename: file.name,
        file_size: file.size,
        file_url: urlData.publicUrl,
        file_path: filePath,
      },
    });
  } catch (error) {
    console.error('Error uploading house plan:', error);
    return NextResponse.json(
      { error: 'Failed to upload house plan' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/houses/[id]/plan
 * Delete the connection plan for a house
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: houseId } = await params;

    // Fetch current plan
    const result = await query(
      'SELECT plan_file_path FROM houses WHERE id = $1',
      [houseId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      );
    }

    const filePath = result.rows[0].plan_file_path;

    if (!filePath) {
      return NextResponse.json(
        { error: 'No connection plan found for this house' },
        { status: 404 }
      );
    }

    // Delete from Supabase Storage
    const { error: deleteError } = await supabase.storage
      .from('project-documents')
      .remove([filePath]);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      // Continue anyway to clean up database
    }

    // Clear plan fields in database
    await query(
      `UPDATE houses SET
         plan_title = NULL,
         plan_description = NULL,
         plan_type = NULL,
         plan_filename = NULL,
         plan_file_size = NULL,
         plan_file_url = NULL,
         plan_file_path = NULL,
         plan_uploaded_at = NULL
       WHERE id = $1`,
      [houseId]
    );

    return NextResponse.json({
      message: 'Connection plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting house plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete house plan' },
      { status: 500 }
    );
  }
}
