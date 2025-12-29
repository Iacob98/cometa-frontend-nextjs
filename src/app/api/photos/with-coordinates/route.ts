import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/db-pool';

export interface PhotoWithCoordinates {
  id: string;
  url: string;
  gps_lat: number;
  gps_lon: number;
  label: string | null;
  taken_at: string | null;
  work_entry_id: string | null;
  project_id: string | null;
  caption: string | null;
  photo_type: string | null;
  work_entry?: {
    id: string;
    cut_id: string | null;
    segment_id: string | null;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const label = searchParams.get('label');

    const supabase = getSupabaseClient();

    // Build query with filters
    let query = supabase
      .from('photos')
      .select(`
        id,
        url,
        gps_lat,
        gps_lon,
        label,
        taken_at,
        work_entry_id,
        project_id,
        caption,
        photo_type,
        work_entries!photos_work_entry_id_fkey (
          id,
          cut_id,
          segment_id,
          project_id
        )
      `)
      .not('gps_lat', 'is', null)
      .not('gps_lon', 'is', null)
      .not('url', 'is', null);

    // Filter by project_id (check both photo.project_id and work_entry.project_id)
    if (projectId) {
      query = query.or(`project_id.eq.${projectId},work_entries.project_id.eq.${projectId}`);
    }

    // Filter by date range
    if (dateFrom) {
      query = query.gte('taken_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('taken_at', dateTo);
    }

    // Filter by label (before/during/after)
    if (label && label !== 'all') {
      query = query.eq('label', label);
    }

    // Order by taken_at
    query = query.order('taken_at', { ascending: false, nullsFirst: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching photos with coordinates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch photos' },
        { status: 500 }
      );
    }

    // Transform results
    const photos: PhotoWithCoordinates[] = (data || []).map((row: any) => ({
      id: row.id,
      url: row.url,
      gps_lat: parseFloat(row.gps_lat),
      gps_lon: parseFloat(row.gps_lon),
      label: row.label,
      taken_at: row.taken_at,
      work_entry_id: row.work_entry_id,
      project_id: row.project_id,
      caption: row.caption,
      photo_type: row.photo_type,
      work_entry: row.work_entries ? {
        id: row.work_entries.id,
        cut_id: row.work_entries.cut_id,
        segment_id: row.work_entries.segment_id,
      } : undefined,
    }));

    return NextResponse.json({
      photos,
      total: photos.length,
    });
  } catch (error) {
    console.error('Error fetching photos with coordinates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
