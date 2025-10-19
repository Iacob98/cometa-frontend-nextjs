/**
 * Equipment Maintenance Schedules API
 * GET: List schedules with overdue/upcoming detection
 * POST: Create preventive maintenance schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type {
  EquipmentMaintenanceSchedule,
  CreateMaintenanceScheduleRequest,
} from '@/types/equipment-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/equipment/maintenance-schedules
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const equipment_id = searchParams.get('equipment_id');
    const maintenance_type = searchParams.get('maintenance_type');
    const overdue_only = searchParams.get('overdue_only') === 'true';
    const upcoming_within_days = searchParams.get('upcoming_within_days');
    const active_only = searchParams.get('active_only') === 'true';

    // Build query
    let query = supabase
      .from('equipment_maintenance_schedules')
      .select(
        `
        id,
        equipment_id,
        maintenance_type,
        interval_type,
        interval_value,
        last_performed_date,
        last_performed_hours,
        next_due_date,
        next_due_hours,
        notes,
        is_active,
        created_at,
        updated_at,
        equipment:equipment_id (
          id,
          name,
          type,
          total_usage_hours
        )
      `
      )
      .order('created_at', { ascending: false });

    // Apply filters
    if (equipment_id) {
      query = query.eq('equipment_id', equipment_id);
    }

    if (maintenance_type) {
      query = query.eq('maintenance_type', maintenance_type);
    }

    if (active_only) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching schedules:', error);
      return NextResponse.json(
        { error: 'Failed to fetch maintenance schedules' },
        { status: 500 }
      );
    }

    // Transform and compute overdue/upcoming status
    const now = new Date();
    const items = (data || []).map((item: any) => {
      let isOverdue = false;
      let isUpcoming = false;

      // Check if overdue (date-based)
      if (item.next_due_date) {
        const dueDate = new Date(item.next_due_date);
        isOverdue = dueDate < now;

        if (upcoming_within_days && !isOverdue) {
          const upcomingDate = new Date(now);
          upcomingDate.setDate(upcomingDate.getDate() + parseInt(upcoming_within_days));
          isUpcoming = dueDate <= upcomingDate;
        }
      }

      // Check if overdue (hours-based)
      if (item.next_due_hours && item.equipment?.total_usage_hours) {
        if (item.equipment.total_usage_hours >= item.next_due_hours) {
          isOverdue = true;
        }
      }

      return {
        ...item,
        equipment_name: item.equipment?.name,
        is_overdue: isOverdue,
        is_upcoming: isUpcoming,
      };
    });

    // Filter based on overdue/upcoming
    let filteredItems = items;
    if (overdue_only) {
      filteredItems = items.filter((item) => item.is_overdue);
    } else if (upcoming_within_days) {
      filteredItems = items.filter((item) => item.is_upcoming && !item.is_overdue);
    }

    return NextResponse.json({
      items: filteredItems,
      total: filteredItems.length,
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
    if (
      !body.equipment_id ||
      !body.maintenance_type ||
      !body.interval_type ||
      !body.interval_value
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: equipment_id, maintenance_type, interval_type, interval_value',
        },
        { status: 400 }
      );
    }

    // Validate interval_type
    if (!['calendar', 'usage_hours', 'cycles'].includes(body.interval_type)) {
      return NextResponse.json(
        { error: 'interval_type must be one of: calendar, usage_hours, cycles' },
        { status: 400 }
      );
    }

    // Create schedule
    const { data: schedule, error: insertError } = await supabase
      .from('equipment_maintenance_schedules')
      .insert({
        equipment_id: body.equipment_id,
        maintenance_type: body.maintenance_type,
        interval_type: body.interval_type,
        interval_value: body.interval_value,
        last_performed_date: body.last_performed_date || null,
        last_performed_hours: body.last_performed_hours || null,
        notes: body.notes || null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating maintenance schedule:', insertError);

      // Handle unique constraint violation
      if (insertError.code === '23505') {
        return NextResponse.json(
          {
            error: 'Duplicate schedule',
            message: 'A schedule already exists for this equipment and maintenance type',
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create maintenance schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        schedule,
        message: 'Maintenance schedule created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating maintenance schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance schedule' },
      { status: 500 }
    );
  }
}
