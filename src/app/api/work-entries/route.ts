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
    const status = searchParams.get('status');
    const work_type = searchParams.get('work_type');

    // Build simple Supabase query first
    let query = supabase
      .from('work_entries')
      .select(`
        id,
        project_id,
        user_id,
        crew_id,
        work_type,
        description,
        start_time,
        end_time,
        duration_hours,
        latitude,
        longitude,
        location_accuracy,
        status,
        approved,
        approved_by,
        approved_at,
        photos,
        notes,
        created_at,
        updated_at
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

    if (status) {
      query = query.eq('status', status);
    }

    if (work_type) {
      query = query.eq('work_type', work_type);
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
      work_type,
      description,
      start_time,
      end_time,
      duration_hours,
      latitude,
      longitude,
      location_accuracy,
      photos = [],
      notes,
      status = 'submitted'
    } = body;

    // Validation
    if (!project_id || !user_id || !work_type || !start_time) {
      return NextResponse.json(
        { error: 'Project ID, User ID, work type, and start time are required' },
        { status: 400 }
      );
    }

    // Calculate duration if not provided and end_time exists
    let calculatedDuration = duration_hours;
    if (!calculatedDuration && start_time && end_time) {
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      calculatedDuration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60); // hours
    }

    // Create work entry in Supabase
    const { data: workEntry, error } = await supabase
      .from('work_entries')
      .insert([{
        project_id,
        user_id,
        crew_id,
        work_type,
        description,
        start_time,
        end_time,
        duration_hours: calculatedDuration,
        latitude,
        longitude,
        location_accuracy,
        photos,
        notes,
        status
      }])
      .select(`
        id,
        project_id,
        user_id,
        crew_id,
        work_type,
        description,
        start_time,
        end_time,
        duration_hours,
        latitude,
        longitude,
        location_accuracy,
        status,
        approved,
        photos,
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