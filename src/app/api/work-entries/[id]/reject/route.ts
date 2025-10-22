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
    const body = await request.json();
    const { rejection_reason, userId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Work entry ID is required' },
        { status: 400 }
      );
    }

    if (!rejection_reason || rejection_reason.trim() === '') {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // TODO: Get current user ID from authentication
    // For now, only set rejected_by if we have a valid UUID
    const updateData: any = {
      approved: false,
      rejected_at: new Date().toISOString(),
      rejection_reason: rejection_reason,
      was_rejected_before: true,
      updated_at: new Date().toISOString()
    };

    // Only add rejected_by if userId is a valid UUID
    if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      updateData.rejected_by = userId;
    }

    const { data: workEntry, error } = await supabase
      .from('work_entries')
      .update(updateData)
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
        rejected_by,
        rejected_at,
        rejection_reason,
        notes,
        created_at,
        updated_at,
        project:projects(id, name, city),
        user:users!work_entries_user_id_fkey(id, first_name, last_name, email),
        crew:crews(id, name)
      `)
      .single();

    if (error) {
      console.error('Supabase work entry reject error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Work entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to reject work entry in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Work entry rejected successfully',
      workEntry
    });
  } catch (error) {
    console.error('Work entry reject API error:', error);
    return NextResponse.json(
      { error: 'Failed to reject work entry' },
      { status: 500 }
    );
  }
}
