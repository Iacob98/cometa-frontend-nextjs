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
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;

    console.log('Starting direct Supabase query...');

    const { data: projects, error, count } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        customer,
        city,
        address,
        contact_24h,
        start_date,
        end_date_plan,
        status,
        total_length_m,
        base_rate_per_m,
        pm_user_id,
        language_default,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    console.log('Supabase query completed. Projects:', projects?.length, 'Error:', error);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects from database', details: error.message },
        { status: 500 }
      );
    }

    // Add calculated fields
    const projectsWithStats = (projects || []).map((project: any) => ({
      ...project,
      budget: project.total_length_m * project.base_rate_per_m,
      progress: 0, // Will be calculated based on work entries later
      description: `Fiber optic construction project in ${project.city || 'various locations'}`,
    }));

    return NextResponse.json({
      items: projectsWithStats,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    });
  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}