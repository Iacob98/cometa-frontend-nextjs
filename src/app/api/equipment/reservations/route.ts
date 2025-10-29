/**
 * Equipment Reservations API
 * GET: List reservations with filters
 * POST: Create new reservation with conflict detection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { requireEquipmentPermission } from '@/lib/auth-middleware';

import { createClient } from '@supabase/supabase-js';
import type {
  EquipmentReservation,
  CreateEquipmentReservationRequest,
  PaginatedResponse,
} from '@/types/equipment-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/equipment/reservations - List reservations
export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require view permission
  const authResult = await requireEquipmentPermission(request, 'view');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getSupabaseServerClient();
    const searchParams = request.nextUrl.searchParams;
    const equipment_id = searchParams.get('equipment_id');
    const project_id = searchParams.get('project_id');
    const reserved_by_user_id = searchParams.get('reserved_by_user_id');
    const active_only = searchParams.get('active_only') === 'true';
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');

    // Build query
    let query = supabase
      .from('equipment_reservations')
      .select(
        `
        id,
        equipment_id,
        project_id,
        reserved_by_user_id,
        reserved_from,
        reserved_until,
        notes,
        is_active,
        created_at,
        updated_at,
        equipment:equipment_id (
          id,
          name,
          type,
          inventory_no,
          status
        ),
        project:project_id (
          id,
          name
        ),
        reserved_by:reserved_by_user_id (
          id,
          first_name,
          last_name
        )
      `,
        { count: 'exact' }
      )
      .order('reserved_from', { ascending: false });

    // Apply filters
    if (equipment_id) {
      query = query.eq('equipment_id', equipment_id);
    }

    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    if (reserved_by_user_id) {
      query = query.eq('reserved_by_user_id', reserved_by_user_id);
    }

    if (active_only) {
      query = query.eq('is_active', true);
    }

    if (from_date) {
      query = query.gte('reserved_until', from_date);
    }

    if (to_date) {
      query = query.lte('reserved_from', to_date);
    }

    // Pagination
    const offset = (page - 1) * per_page;
    query = query.range(offset, offset + per_page - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching reservations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch equipment reservations' },
        { status: 500 }
      );
    }

    // Transform data to match expected format
    const items = (data || []).map((item: any) => ({
      ...item,
      equipment_name: item.equipment?.name,
      project_name: item.project?.name,
      reserved_by_user_name: item.reserved_by
        ? `${item.reserved_by.first_name} ${item.reserved_by.last_name}`.trim()
        : null,
    }));

    const response: PaginatedResponse<EquipmentReservation> = {
      items,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
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
  // 🔒 SECURITY: Require reserve permission
  const authResult = await requireEquipmentPermission(request, 'reserve');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getSupabaseServerClient();
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

    // Check for overlapping reservations using RPC function
    // We need to use a custom query because Supabase doesn't support tsrange overlap checks directly
    const { data: conflicts, error: conflictError } = await supabase.rpc(
      'check_equipment_reservation_conflicts',
      {
        p_equipment_id: body.equipment_id,
        p_reserved_from: body.reserved_from,
        p_reserved_until: body.reserved_until,
      }
    );

    // If RPC doesn't exist, fall back to manual check
    if (conflictError && conflictError.code === '42883') {
      // Function doesn't exist - do manual overlap check
      const { data: existingReservations, error: checkError } = await supabase
        .from('equipment_reservations')
        .select(
          `
          id,
          reserved_from,
          reserved_until,
          project:project_id (name),
          reserved_by:reserved_by_user_id (first_name, last_name)
        `
        )
        .eq('equipment_id', body.equipment_id)
        .eq('is_active', true);

      if (checkError) {
        console.error('Error checking conflicts:', checkError);
        return NextResponse.json(
          { error: 'Failed to check reservation conflicts' },
          { status: 500 }
        );
      }

      // Manual overlap detection
      const hasConflict = existingReservations?.some((res: any) => {
        const existingFrom = new Date(res.reserved_from);
        const existingUntil = new Date(res.reserved_until);
        return (
          (from >= existingFrom && from < existingUntil) ||
          (until > existingFrom && until <= existingUntil) ||
          (from <= existingFrom && until >= existingUntil)
        );
      });

      if (hasConflict) {
        const conflict = existingReservations!.find((res: any) => {
          const existingFrom = new Date(res.reserved_from);
          const existingUntil = new Date(res.reserved_until);
          return (
            (from >= existingFrom && from < existingUntil) ||
            (until > existingFrom && until <= existingUntil) ||
            (from <= existingFrom && until >= existingUntil)
          );
        });

        return NextResponse.json(
          {
            error: 'Reservation conflict',
            message: `Equipment is already reserved from ${new Date(
              conflict.reserved_from
            ).toLocaleString()} to ${new Date(conflict.reserved_until).toLocaleString()}`,
            conflict: {
              project_name: conflict.project?.name,
              reserved_by: conflict.reserved_by
                ? `${conflict.reserved_by.first_name} ${conflict.reserved_by.last_name}`.trim()
                : null,
              from: conflict.reserved_from,
              until: conflict.reserved_until,
            },
          },
          { status: 409 }
        );
      }
    } else if (conflicts && conflicts.length > 0) {
      // RPC function exists and found conflicts
      const conflict = conflicts[0];
      return NextResponse.json(
        {
          error: 'Reservation conflict',
          message: `Equipment is already reserved from ${new Date(
            conflict.reserved_from
          ).toLocaleString()} to ${new Date(conflict.reserved_until).toLocaleString()}`,
          conflict,
        },
        { status: 409 }
      );
    }

    // Get current user ID from session (TODO: implement proper auth)
    const reserved_by_user_id = body.reserved_by_user_id || null;

    // Create reservation
    const { data: reservation, error: insertError } = await supabase
      .from('equipment_reservations')
      .insert({
        equipment_id: body.equipment_id,
        project_id: body.project_id || null,
        reserved_by_user_id,
        reserved_from: body.reserved_from,
        reserved_until: body.reserved_until,
        notes: body.notes || null,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating reservation:', insertError);

      // Handle GIST exclusion constraint violation
      if (insertError.code === '23P01') {
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

    return NextResponse.json(
      { error: 'Failed to create equipment reservation' },
      { status: 500 }
    );
  }
}
