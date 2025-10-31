import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';

/**
 * GET /api/houses/with-plans?project_id=xxx
 * List all houses that have connection plans uploaded
 * Useful for debugging ID mismatches and finding which houses have plans
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    // Fetch all houses with plans in this project
    const result = await query(
      `SELECT
        id,
        project_id,
        house_number,
        street,
        city,
        postal_code,
        plan_title,
        plan_filename,
        plan_uploaded_at,
        plan_type
       FROM houses
       WHERE project_id = $1 AND plan_file_path IS NOT NULL
       ORDER BY plan_uploaded_at DESC`,
      [projectId]
    );

    const housesWithPlans = result.rows.map(house => ({
      id: house.id,
      house_number: house.house_number,
      address: [house.street, house.city, house.postal_code].filter(Boolean).join(', '),
      plan_title: house.plan_title,
      plan_filename: house.plan_filename,
      plan_type: house.plan_type,
      plan_uploaded_at: house.plan_uploaded_at,
    }));

    console.log(`📋 Houses with plans in project ${projectId}:`, {
      total_houses_with_plans: housesWithPlans.length,
      houses: housesWithPlans.map(h => ({
        id: h.id,
        address: h.address,
        plan_filename: h.plan_filename,
      })),
    });

    return NextResponse.json({
      project_id: projectId,
      total: housesWithPlans.length,
      houses: housesWithPlans,
    });
  } catch (error) {
    console.error('Error fetching houses with plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch houses with plans' },
      { status: 500 }
    );
  }
}
