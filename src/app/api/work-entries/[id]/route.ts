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

    // Fetch photos for this work entry
    const { data: photos, error: photosError } = await supabase
      .from('photos')
      .select('id, filename, file_path, url, label, gps_lat, gps_lon, photo_type, is_before_photo, is_after_photo, created_at')
      .eq('work_entry_id', id)
      .order('created_at', { ascending: true });

    if (photosError) {
      console.error('Error fetching photos:', photosError);
    }

    // Get public URLs for photos - support both file_path (Admin upload) and url (Worker PWA upload)
    const photoUrls = photos
      ?.filter(photo => photo.file_path || photo.url)
      .map(photo => {
        let publicUrl = '';

        if (photo.file_path) {
          // Admin upload format: use file_path
          const { data } = supabase.storage
            .from('work-photos')
            .getPublicUrl(photo.file_path);
          publicUrl = data.publicUrl;
        } else if (photo.url) {
          // Worker PWA format: use url field directly
          const { data } = supabase.storage
            .from('work-photos')
            .getPublicUrl(photo.url);
          publicUrl = data.publicUrl;
        }

        return {
          ...photo,
          url: publicUrl
        };
      }) || [];

    return NextResponse.json({
      ...workEntry,
      photos: photoUrls
    });
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

    const { data: workEntry, error } = await supabase
      .from('work_entries')
      .update({
        date,
        stage_code,
        meters_done_m,
        method,
        width_m,
        depth_m,
        cables_count,
        has_protection_pipe,
        soil_type,
        notes,
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