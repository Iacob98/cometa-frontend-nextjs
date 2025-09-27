import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get projects directly from Supabase
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;

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

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects from database' },
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

    // Return empty data on total failure
    const { searchParams } = new URL(request.url);
    return NextResponse.json({
      items: [],
      total: 0,
      page: parseInt(searchParams.get('page') || '1'),
      per_page: parseInt(searchParams.get('per_page') || '20'),
      total_pages: 0,
      message: 'Projects service temporarily unavailable'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create project directly in Supabase
    const { data: project, error } = await supabase
      .from('projects')
      .insert([{
        name: body.name,
        customer: body.customer,
        city: body.city,
        address: body.address,
        status: body.status || 'draft',
        total_length_m: body.total_length_m || 0,
        base_rate_per_m: body.base_rate_per_m || 0,
        pm_user_id: body.pm_user_id,
        contact_24h: body.contact_24h,
        start_date: body.start_date,
        end_date_plan: body.end_date_plan,
        language_default: body.language_default || 'de'
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project in database' },
        { status: 500 }
      );
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Projects POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}