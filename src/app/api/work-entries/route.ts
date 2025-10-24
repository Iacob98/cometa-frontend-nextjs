import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || searchParams.get('limit') || '20');
    const offset = (page - 1) * per_page;
    const project_id = searchParams.get('project_id');
    const user_id = searchParams.get('user_id');
    const crew_id = searchParams.get('crew_id');
    const approved = searchParams.get('approved');
    const stage_code = searchParams.get('stage_code');

    // Build simple Supabase query first
    let query = supabase
      .from('work_entries')
      .select(`
        id,
        project_id,
        user_id,
        crew_id,
        cabinet_id,
        segment_id,
        cut_id,
        house_id,
        date,
        stage_code,
        meters_done_m,
        method,
        width_m,
        depth_m,
        cables_count,
        has_protection_pipe,
        soil_type,
        approved,
        approved_by,
        approved_at,
        rejected_by,
        rejected_at,
        rejection_reason,
        was_rejected_before,
        notes,
        created_at,
        updated_at,
        project:projects(id, name, city, customer),
        user:users!work_entries_user_id_fkey(id, first_name, last_name, email),
        crew:crews(id, name),
        cabinet:cabinets(id, name, address),
        segment:segments(id, name),
        cut:cuts(id, name),
        house:housing_units(id, address, building_number)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (crew_id) {
      query = query.eq('crew_id', crew_id);
    }

    if (approved !== null && approved !== undefined) {
      if (approved === 'false') {
        // Pending approval: not approved AND not rejected
        query = query.eq('approved', false).is('rejected_by', null);
      } else {
        query = query.eq('approved', approved === 'true');
      }
    }

    if (stage_code) {
      query = query.eq('stage_code', stage_code);
    }

    const { data: workEntries, error, count } = await query;

    if (error) {
      console.error('Supabase work entries error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch work entries from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: workEntries || [],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page)
    });
  } catch (error) {
    console.error('Work entries API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      user_id,
      crew_id,
      cabinet_id,
      segment_id,
      cut_id,
      house_id,
      date,
      stage_code,
      meters_done_m,
      method,
      width_m,
      depth_m,
      cables_count,
      has_protection_pipe,
      soil_type,
      notes
    } = body;

    // Validation
    if (!project_id || !user_id || !stage_code || !date) {
      return NextResponse.json(
        { error: 'Project ID, User ID, stage code, and date are required' },
        { status: 400 }
      );
    }

    if (meters_done_m === undefined || meters_done_m === null) {
      return NextResponse.json(
        { error: 'Meters done is required' },
        { status: 400 }
      );
    }

    // Create work entry in Supabase
    const { data: workEntry, error } = await supabase
      .from('work_entries')
      .insert([{
        project_id,
        user_id,
        crew_id,
        cabinet_id,
        segment_id,
        cut_id,
        house_id,
        date,
        stage_code,
        meters_done_m,
        method,
        width_m,
        depth_m,
        cables_count,
        has_protection_pipe,
        soil_type,
        notes
      }])
      .select(`
        id,
        project_id,
        user_id,
        crew_id,
        cabinet_id,
        segment_id,
        cut_id,
        house_id,
        date,
        stage_code,
        meters_done_m,
        method,
        width_m,
        depth_m,
        cables_count,
        has_protection_pipe,
        soil_type,
        approved,
        approved_by,
        approved_at,
        notes,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Supabase work entry creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create work entry in database' },
        { status: 500 }
      );
    }

    return NextResponse.json(workEntry, { status: 201 });
  } catch (error) {
    console.error('Work entries POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to create work entry' },
      { status: 500 }
    );
  }
}