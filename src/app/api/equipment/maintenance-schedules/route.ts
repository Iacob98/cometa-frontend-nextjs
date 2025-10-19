/**
 * Equipment Maintenance Schedules API
 * GET: List schedules with overdue/upcoming detection
 * POST: Create preventive maintenance schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';
import type {
  EquipmentMaintenanceSchedule,
  CreateMaintenanceScheduleRequest,
  MaintenanceScheduleFilters,
} from '@/types/equipment-enhanced';

// GET /api/equipment/maintenance-schedules
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const equipment_id = searchParams.get('equipment_id');
    const maintenance_type = searchParams.get('maintenance_type');
    const overdue_only = searchParams.get('overdue_only') === 'true';
    const upcoming_within_days = searchParams.get('upcoming_within_days');
    const active_only = searchParams.get('active_only') !== 'false'; // Default true

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (active_only) {
      conditions.push(`ems.is_active = true`);
    }

    if (equipment_id) {
      conditions.push(`ems.equipment_id = $${paramIndex++}`);
      params.push(equipment_id);
    }

    if (maintenance_type) {
      conditions.push(`ems.maintenance_type = $${paramIndex++}`);
      params.push(maintenance_type);
    }

    if (overdue_only) {
      conditions.push(`(
        (ems.next_due_date IS NOT NULL AND ems.next_due_date < CURRENT_DATE)
        OR
        (ems.next_due_hours IS NOT NULL AND e.total_usage_hours >= ems.next_due_hours)
      )`);
    }

    if (upcoming_within_days) {
      const days = parseInt(upcoming_within_days);
      conditions.push(`(
        (ems.next_due_date IS NOT NULL
         AND ems.next_due_date >= CURRENT_DATE
         AND ems.next_due_date <= CURRENT_DATE + INTERVAL '${days} days')
        OR
        (ems.next_due_hours IS NOT NULL
         AND ems.next_due_hours > e.total_usage_hours
         AND ems.next_due_hours <= e.total_usage_hours + (${days} * 8))
      )`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const dataQuery = `
      SELECT
        ems.id,
        ems.equipment_id,
        ems.maintenance_type,
        ems.interval_type,
        ems.interval_value,
        ems.last_performed_date,
        ems.last_performed_hours,
        ems.next_due_date,
        ems.next_due_hours,
        ems.description,
        ems.notes,
        ems.is_active,
        ems.created_at,
        ems.updated_at,
        -- Computed fields
        CASE
          WHEN ems.next_due_date IS NOT NULL AND ems.next_due_date < CURRENT_DATE
            THEN true
          WHEN ems.next_due_hours IS NOT NULL AND e.total_usage_hours >= ems.next_due_hours
            THEN true
          ELSE false
        END as is_overdue,
        CASE
          WHEN ems.next_due_date IS NOT NULL AND ems.next_due_date < CURRENT_DATE
            THEN (CURRENT_DATE - ems.next_due_date)::INTEGER
          ELSE NULL
        END as days_overdue,
        CASE
          WHEN ems.next_due_hours IS NOT NULL AND e.total_usage_hours >= ems.next_due_hours
            THEN (e.total_usage_hours - ems.next_due_hours)
          ELSE NULL
        END as hours_overdue,
        CASE
          WHEN ems.next_due_date IS NOT NULL AND ems.next_due_date >= CURRENT_DATE
            THEN (ems.next_due_date - CURRENT_DATE)::INTEGER
          ELSE NULL
        END as days_until_due,
        CASE
          WHEN ems.next_due_hours IS NOT NULL AND ems.next_due_hours > e.total_usage_hours
            THEN (ems.next_due_hours - e.total_usage_hours)
          ELSE NULL
        END as hours_until_due,
        -- Equipment details
        json_build_object(
          'id', e.id,
          'name', e.name,
          'type', e.type,
          'total_usage_hours', e.total_usage_hours
        ) as equipment
      FROM equipment_maintenance_schedules ems
      LEFT JOIN equipment e ON e.id = ems.equipment_id
      ${whereClause}
      ORDER BY
        CASE WHEN ems.next_due_date IS NOT NULL THEN ems.next_due_date ELSE '9999-12-31'::DATE END ASC,
        CASE WHEN ems.next_due_hours IS NOT NULL THEN ems.next_due_hours ELSE 999999 END ASC
    `;

    const dataResult = await query(dataQuery, params);

    return NextResponse.json({
      items: dataResult.rows,
      total: dataResult.rows.length,
    });
  } catch (error) {
    console.error('Error fetching maintenance schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance schedules' },
      { status: 500 }
    );
  }
}

// POST /api/equipment/maintenance-schedules
export async function POST(request: NextRequest) {
  try {
    const body: CreateMaintenanceScheduleRequest = await request.json();

    // Validate required fields
    if (!body.equipment_id || !body.maintenance_type || !body.interval_type || !body.interval_value) {
      return NextResponse.json(
        {
          error: 'Missing required fields: equipment_id, maintenance_type, interval_type, interval_value',
        },
        { status: 400 }
      );
    }

    // Validate interval_value
    if (body.interval_value <= 0) {
      return NextResponse.json(
        { error: 'interval_value must be greater than 0' },
        { status: 400 }
      );
    }

    // Insert schedule
    const insertQuery = `
      INSERT INTO equipment_maintenance_schedules (
        equipment_id,
        maintenance_type,
        interval_type,
        interval_value,
        description,
        notes,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING
        id,
        equipment_id,
        maintenance_type,
        interval_type,
        interval_value,
        last_performed_date,
        last_performed_hours,
        next_due_date,
        next_due_hours,
        description,
        notes,
        is_active,
        created_at,
        updated_at
    `;

    const insertResult = await query(insertQuery, [
      body.equipment_id,
      body.maintenance_type,
      body.interval_type,
      body.interval_value,
      body.description || null,
      body.notes || null,
    ]);

    const schedule = insertResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        schedule,
        message: 'Maintenance schedule created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating maintenance schedule:', error);

    // Handle unique constraint (one schedule per equipment per type)
    if (error.code === '23505') {
      return NextResponse.json(
        {
          error: 'Duplicate schedule',
          message: 'A schedule for this maintenance type already exists for this equipment',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create maintenance schedule' },
      { status: 500 }
    );
  }
}
