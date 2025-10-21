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

    // Clear rejection fields but keep was_rejected_before flag
    const { data: workEntry, error } = await supabase
      .from('work_entries')
      .update({
        rejected_by: null,
        rejected_at: null,
        rejection_reason: null,
        approved: false,
        approved_by: null,
        approved_at: null,
        // Keep was_rejected_before = true to show visual indicator
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
        rejected_by,
        rejected_at,
        rejection_reason,
        was_rejected_before,
        notes,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Supabase work entry resubmit error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Work entry not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to resubmit work entry in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Work entry resubmitted successfully',
      workEntry
    });
  } catch (error) {
    console.error('Work entry resubmit API error:', error);
    return NextResponse.json(
      { error: 'Failed to resubmit work entry' },
      { status: 500 }
    );
  }
}
