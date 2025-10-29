import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Zod validation schema for work entry creation
const createWorkEntrySchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  user_id: z.string().uuid('Invalid user ID'),
  crew_id: z.string().uuid('Invalid crew ID').optional().nullable(),
  cabinet_id: z.string().uuid('Invalid cabinet ID').optional().nullable(),
  segment_id: z.string().uuid('Invalid segment ID').optional().nullable(),
  cut_id: z.string().uuid('Invalid cut ID').optional().nullable(),
  house_id: z.string().uuid('Invalid house ID').optional().nullable(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).refine((val) => new Date(val) <= new Date(), {
    message: 'Date cannot be in the future',
  }),
  stage_code: z.enum([
    'stage_1_marking',
    'stage_2_excavation',
    'stage_3_conduit',
    'stage_4_cable',
    'stage_5_splice',
    'stage_6_test',
    'stage_9_backfill'
  ], { errorMap: () => ({ message: 'Invalid stage code' }) }),
  meters_done_m: z.number().nonnegative('Meters done must be non-negative'),
  method: z.enum(['mole', 'hand', 'excavator', 'trencher', 'documentation']).optional().nullable(),
  width_m: z.number().positive('Width must be positive').optional().nullable(),
  depth_m: z.number().positive('Depth must be positive').optional().nullable(),
  cables_count: z.number().int().positive('Cables count must be a positive integer').optional().nullable(),
  has_protection_pipe: z.boolean().optional().default(false),
  soil_type: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  gps_lat: z.number().min(-90).max(90).optional().nullable(),
  gps_lon: z.number().min(-180).max(180).optional().nullable(),
});

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
        photos(id, filename, url, label, gps_lat, gps_lon)
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

    // Add computed status field to each work entry
    const enrichedEntries = (workEntries || []).map(entry => ({
      ...entry,
      status: entry.approved
        ? 'approved'
        : entry.rejected_by
          ? 'rejected'
          : 'pending'
    }));

    return NextResponse.json({
      items: enrichedEntries,
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

    // Validate request body with Zod
    const validationResult = createWorkEntrySchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Create work entry in Supabase
    const { data: workEntry, error } = await supabase
      .from('work_entries')
      .insert([validatedData])
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