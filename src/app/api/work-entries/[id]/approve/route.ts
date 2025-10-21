import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
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

    // TODO: Get current user ID from authentication
    // For now, using a placeholder user ID
    const currentUserId = 'admin-user-id'; // This should come from auth

    const { data: workEntry, error } = await supabase
      .from('work_entries')
      .update({
        approved: true,
        approved_by: currentUserId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
        updated_at,
        project:projects(id, name, city),
        user:users!work_entries_user_id_fkey(id, first_name, last_name, email),
        crew:crews(id, name)
      `)
      .single();

    if (error) {
      console.error('Supabase work entry approve error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Work entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to approve work entry in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Work entry approved successfully',
      workEntry
    });
  } catch (error) {
    console.error('Work entry approve API error:', error);
    return NextResponse.json(
      { error: 'Failed to approve work entry' },
      { status: 500 }
    );
  }
}