/**
 * Equipment Usage Logs API
 * GET: List usage logs with filters
 * POST: Create new usage log (auto-increments total_usage_hours via trigger)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type {
  EquipmentUsageLog,
  CreateUsageLogRequest,
  PaginatedResponse,
} from '@/types/equipment-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/equipment/usage - List usage logs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const equipment_id = searchParams.get('equipment_id');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '50');

    // Build query
    let query = supabase
      .from('equipment_usage_logs')
      .select(
        `
        id,
        equipment_id,
        usage_date,
        hours_used,
        operator_name,
        notes,
        logged_by_user_id,
        created_at,
        equipment:equipment_id (
          id,
          name,
          type,
          inventory_no
        )
      `,
        { count: 'exact' }
      )
      .order('usage_date', { ascending: false });

    // Apply filters
    if (equipment_id) {
      query = query.eq('equipment_id', equipment_id);
    }

    if (from_date) {
      query = query.gte('usage_date', from_date);
    }

    if (to_date) {
      query = query.lte('usage_date', to_date);
    }

    // Pagination
    const offset = (page - 1) * per_page;
    query = query.range(offset, offset + per_page - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching usage logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch equipment usage logs' },
        { status: 500 }
      );
    }

    // Transform data
    const items = (data || []).map((item: any) => ({
      ...item,
      equipment_name: item.equipment?.name,
    }));

    const response: PaginatedResponse<EquipmentUsageLog> = {
      items,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
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

// POST /api/equipment/usage - Create new usage log
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

    // Validate hours (0-24)
    if (body.hours_used < 0 || body.hours_used > 24) {
      return NextResponse.json(
        { error: 'hours_used must be between 0 and 24' },
        { status: 400 }
      );
    }

    // Check daily limit (24h max per day per equipment)
    const { data: existingLogs, error: checkError } = await supabase
      .from('equipment_usage_logs')
      .select('hours_used')
      .eq('equipment_id', body.equipment_id)
      .eq('usage_date', body.usage_date);

    if (checkError) {
      console.error('Error checking daily usage:', checkError);
      return NextResponse.json(
        { error: 'Failed to validate daily usage limit' },
        { status: 500 }
      );
    }

    const existingHours = existingLogs?.reduce((sum, log) => sum + log.hours_used, 0) || 0;
    const totalHours = existingHours + body.hours_used;

    if (totalHours > 24) {
      return NextResponse.json(
        {
          error: 'Daily usage limit exceeded',
          message: `Adding ${body.hours_used}h would exceed 24h limit (current: ${existingHours}h)`,
          existing_hours: existingHours,
          total_hours: totalHours,
        },
        { status: 400 }
      );
    }

    // Create usage log (trigger will auto-increment equipment.total_usage_hours)
    const { data: usageLog, error: insertError } = await supabase
      .from('equipment_usage_logs')
      .insert({
        equipment_id: body.equipment_id,
        usage_date: body.usage_date,
        hours_used: body.hours_used,
        operator_name: body.operator_name || null,
        notes: body.notes || null,
        logged_by_user_id: body.logged_by_user_id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating usage log:', insertError);
      return NextResponse.json(
        { error: 'Failed to create equipment usage log' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        usage_log: usageLog,
        message: 'Usage log created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating equipment usage log:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment usage log' },
      { status: 500 }
    );
  }
}
