/**
 * Equipment Usage Logs API
 * GET: List usage logs with filters
 * POST: Create new usage log (auto-increments total_usage_hours)
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';
import type {
  EquipmentUsageLog,
  CreateUsageLogRequest,
  EquipmentUsageFilters,
  PaginatedResponse,
} from '@/types/equipment-enhanced';

// GET /api/equipment/usage - List usage logs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const equipment_id = searchParams.get('equipment_id');
    const assignment_id = searchParams.get('assignment_id');
    const work_entry_id = searchParams.get('work_entry_id');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    const logged_by_user_id = searchParams.get('logged_by_user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '50');

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (equipment_id) {
      conditions.push(`eul.equipment_id = $${paramIndex++}`);
      params.push(equipment_id);
    }

    if (assignment_id) {
      conditions.push(`eul.assignment_id = $${paramIndex++}`);
      params.push(assignment_id);
    }

    if (work_entry_id) {
      conditions.push(`eul.work_entry_id = $${paramIndex++}`);
      params.push(work_entry_id);
    }

    if (from_date) {
      conditions.push(`eul.usage_date >= $${paramIndex++}`);
      params.push(from_date);
    }

    if (to_date) {
      conditions.push(`eul.usage_date <= $${paramIndex++}`);
      params.push(to_date);
    }

    if (logged_by_user_id) {
      conditions.push(`eul.logged_by_user_id = $${paramIndex++}`);
      params.push(logged_by_user_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM equipment_usage_logs eul
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Fetch paginated data
    const offset = (page - 1) * per_page;
    params.push(per_page, offset);

    const dataQuery = `
      SELECT
        eul.id,
        eul.equipment_id,
        eul.assignment_id,
        eul.work_entry_id,
        eul.usage_date,
        eul.hours_used,
        eul.notes,
        eul.logged_by_user_id,
        eul.created_at,
        -- Equipment details
        json_build_object(
          'id', e.id,
          'name', e.name,
          'type', e.type
        ) as equipment,
        -- Assignment details (if applicable)
        CASE
          WHEN ea.id IS NOT NULL THEN
            json_build_object(
              'id', ea.id,
              'crew_id', ea.crew_id,
              'crew_name', c.name,
              'project_id', ea.project_id,
              'project_name', p.name
            )
          ELSE NULL
        END as assignment,
        -- Logged by user details
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name
        ) as logged_by
      FROM equipment_usage_logs eul
      LEFT JOIN equipment e ON e.id = eul.equipment_id
      LEFT JOIN equipment_assignments ea ON ea.id = eul.assignment_id
      LEFT JOIN crews c ON c.id = ea.crew_id
      LEFT JOIN projects p ON p.id = ea.project_id
      LEFT JOIN users u ON u.id = eul.logged_by_user_id
      ${whereClause}
      ORDER BY eul.usage_date DESC, eul.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const dataResult = await query(dataQuery, params);

    const response: PaginatedResponse<EquipmentUsageLog> = {
      items: dataResult.rows,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching equipment usage logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment usage logs' },
      { status: 500 }
    );
  }
}

// POST /api/equipment/usage - Create usage log
export async function POST(request: NextRequest) {
  try {
    const body: CreateUsageLogRequest = await request.json();

    // Validate required fields
    if (!body.equipment_id || !body.usage_date || body.hours_used === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: equipment_id, usage_date, hours_used' },
        { status: 400 }
      );
    }

    // Validate hours_used (0-24)
    if (body.hours_used < 0 || body.hours_used > 24) {
      return NextResponse.json(
        { error: 'hours_used must be between 0 and 24' },
        { status: 400 }
      );
    }

    // Get current user ID from session (TODO: implement proper auth)
    const logged_by_user_id = body.logged_by_user_id || null;

    // Insert usage log (triggers will auto-increment total_usage_hours and validate daily limit)
    const insertQuery = `
      INSERT INTO equipment_usage_logs (
        equipment_id,
        assignment_id,
        work_entry_id,
        usage_date,
        hours_used,
        notes,
        logged_by_user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        equipment_id,
        assignment_id,
        work_entry_id,
        usage_date,
        hours_used,
        notes,
        logged_by_user_id,
        created_at
    `;

    const insertResult = await query(insertQuery, [
      body.equipment_id,
      body.assignment_id || null,
      body.work_entry_id || null,
      body.usage_date,
      body.hours_used,
      body.notes || null,
      logged_by_user_id,
    ]);

    const usageLog = insertResult.rows[0];

    // Get updated equipment total_usage_hours
    const equipmentQuery = `
      SELECT total_usage_hours FROM equipment WHERE id = $1
    `;
    const equipmentResult = await query(equipmentQuery, [body.equipment_id]);
    const totalHours = equipmentResult.rows[0]?.total_usage_hours || 0;

    return NextResponse.json(
      {
        success: true,
        usage_log: usageLog,
        equipment_total_hours: totalHours,
        message: 'Usage log created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating equipment usage log:', error);

    // Handle daily limit validation error
    if (error.message && error.message.includes('Daily usage limit exceeded')) {
      return NextResponse.json(
        {
          error: 'Daily usage limit exceeded',
          message: error.message,
        },
        { status: 400 }
      );
    }

    // Handle unique constraint violation (duplicate log for same day + work_entry)
    if (error.code === '23505') {
      return NextResponse.json(
        {
          error: 'Duplicate usage log',
          message: 'Usage already logged for this equipment, date, and work entry',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create equipment usage log' },
      { status: 500 }
    );
  }
}
