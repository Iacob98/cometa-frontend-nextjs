/**
 * Equipment Reservations API
 * GET: List reservations with filters
 * POST: Create new reservation with conflict detection
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';
import type {
  EquipmentReservation,
  CreateEquipmentReservationRequest,
  EquipmentReservationFilters,
  PaginatedResponse,
} from '@/types/equipment-enhanced';

// GET /api/equipment/reservations - List reservations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const equipment_id = searchParams.get('equipment_id');
    const project_id = searchParams.get('project_id');
    const reserved_by_user_id = searchParams.get('reserved_by_user_id');
    const active_only = searchParams.get('active_only') === 'true';
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (equipment_id) {
      conditions.push(`er.equipment_id = $${paramIndex++}`);
      params.push(equipment_id);
    }

    if (project_id) {
      conditions.push(`er.project_id = $${paramIndex++}`);
      params.push(project_id);
    }

    if (reserved_by_user_id) {
      conditions.push(`er.reserved_by_user_id = $${paramIndex++}`);
      params.push(reserved_by_user_id);
    }

    if (active_only) {
      conditions.push(`er.is_active = true`);
    }

    if (from_date) {
      conditions.push(`er.reserved_until >= $${paramIndex++}`);
      params.push(from_date);
    }

    if (to_date) {
      conditions.push(`er.reserved_from <= $${paramIndex++}`);
      params.push(to_date);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM equipment_reservations er
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Fetch paginated data with joins
    const offset = (page - 1) * per_page;
    params.push(per_page, offset);

    const dataQuery = `
      SELECT
        er.id,
        er.equipment_id,
        er.project_id,
        er.reserved_by_user_id,
        er.reserved_from,
        er.reserved_until,
        er.notes,
        er.is_active,
        er.created_at,
        er.updated_at,
        -- Equipment details
        json_build_object(
          'id', e.id,
          'name', e.name,
          'type', e.type,
          'inventory_no', e.inventory_no,
          'status', e.status
        ) as equipment,
        -- Project details
        json_build_object(
          'id', p.id,
          'name', p.name
        ) as project,
        -- Reserved by user details
        json_build_object(
          'id', u.id,
          'first_name', u.first_name,
          'last_name', u.last_name
        ) as reserved_by
      FROM equipment_reservations er
      LEFT JOIN equipment e ON e.id = er.equipment_id
      LEFT JOIN projects p ON p.id = er.project_id
      LEFT JOIN users u ON u.id = er.reserved_by_user_id
      ${whereClause}
      ORDER BY er.reserved_from DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const dataResult = await query(dataQuery, params);

    const response: PaginatedResponse<EquipmentReservation> = {
      items: dataResult.rows,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching equipment reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment reservations' },
      { status: 500 }
    );
  }
}

// POST /api/equipment/reservations - Create new reservation
export async function POST(request: NextRequest) {
  try {
    const body: CreateEquipmentReservationRequest = await request.json();

    // Validate required fields
    if (!body.equipment_id || !body.reserved_from || !body.reserved_until) {
      return NextResponse.json(
        { error: 'Missing required fields: equipment_id, reserved_from, reserved_until' },
        { status: 400 }
      );
    }

    // Validate dates
    const from = new Date(body.reserved_from);
    const until = new Date(body.reserved_until);

    if (until <= from) {
      return NextResponse.json(
        { error: 'reserved_until must be after reserved_from' },
        { status: 400 }
      );
    }

    // Check for overlapping reservations (database will enforce, but we provide better error)
    const overlapQuery = `
      SELECT
        er.id,
        er.reserved_from,
        er.reserved_until,
        p.name as project_name,
        u.first_name || ' ' || u.last_name as reserved_by_name
      FROM equipment_reservations er
      LEFT JOIN projects p ON p.id = er.project_id
      LEFT JOIN users u ON u.id = er.reserved_by_user_id
      WHERE er.equipment_id = $1
        AND er.is_active = true
        AND tsrange($2::timestamp, $3::timestamp) && tsrange(er.reserved_from, er.reserved_until)
    `;

    const overlapResult = await query(overlapQuery, [
      body.equipment_id,
      body.reserved_from,
      body.reserved_until,
    ]);

    if (overlapResult.rows.length > 0) {
      const conflict = overlapResult.rows[0];
      return NextResponse.json(
        {
          error: 'Reservation conflict',
          message: `Equipment is already reserved from ${new Date(conflict.reserved_from).toLocaleString()} to ${new Date(conflict.reserved_until).toLocaleString()}`,
          conflict: {
            project_name: conflict.project_name,
            reserved_by: conflict.reserved_by_name,
            from: conflict.reserved_from,
            until: conflict.reserved_until,
          },
        },
        { status: 409 }
      );
    }

    // Get current user ID from session (TODO: implement proper auth)
    const reserved_by_user_id = body.reserved_by_user_id || null;

    // Create reservation
    const insertQuery = `
      INSERT INTO equipment_reservations (
        equipment_id,
        project_id,
        reserved_by_user_id,
        reserved_from,
        reserved_until,
        notes,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING
        id,
        equipment_id,
        project_id,
        reserved_by_user_id,
        reserved_from,
        reserved_until,
        notes,
        is_active,
        created_at,
        updated_at
    `;

    const insertResult = await query(insertQuery, [
      body.equipment_id,
      body.project_id || null,
      reserved_by_user_id,
      body.reserved_from,
      body.reserved_until,
      body.notes || null,
    ]);

    const reservation = insertResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        reservation,
        message: 'Reservation created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating equipment reservation:', error);

    // Handle GIST exclusion constraint violation
    if (error.code === '23P01') {
      return NextResponse.json(
        {
          error: 'Reservation conflict',
          message: 'Equipment is already reserved for this time period',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create equipment reservation' },
      { status: 500 }
    );
  }
}
