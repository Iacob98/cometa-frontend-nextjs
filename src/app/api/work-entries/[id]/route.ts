import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Work entry ID is required' },
        { status: 400 }
      );
    }

    const { data: workEntry, error } = await supabase
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
        updated_at,
        project:projects(id, name, city),
        user:users!work_entries_user_id_fkey(id, first_name, last_name, email),
        crew:crews(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase work entry fetch error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Work entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch work entry from database' },
        { status: 500 }
      );
    }

    return NextResponse.json(workEntry);
  } catch (error) {
    console.error('Work entry GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch work entry' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Work entry ID is required' },
        { status: 400 }
      );
    }

    const {
      work_type,
      description,
      start_time,
      end_time,
      duration_hours,
      latitude,
      longitude,
      location_accuracy,
      photos,
      notes,
      status
    } = body;

    // Calculate duration if not provided and end_time exists
    let calculatedDuration = duration_hours;
    if (!calculatedDuration && start_time && end_time) {
      const startDate = new Date(start_time);
      const endDate = new Date(end_time);
      calculatedDuration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60); // hours
    }

    const { data: workEntry, error } = await supabase
      .from('work_entries')
      .update({
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
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      `)
      .single();

    if (error) {
      console.error('Supabase work entry update error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Work entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update work entry in database' },
        { status: 500 }
      );
    }

    return NextResponse.json(workEntry);
  } catch (error) {
    console.error('Work entry PUT API error:', error);
    return NextResponse.json(
      { error: 'Failed to update work entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Work entry ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('work_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase work entry delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete work entry from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Work entry deleted successfully' });
  } catch (error) {
    console.error('Work entry DELETE API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete work entry' },
      { status: 500 }
    );
  }
}