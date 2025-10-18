import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');

    if (!project_id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { data: cabinets, error } = await supabase
      .from('cabinets')
      .select(`
        id,
        code,
        name,
        address,
        latitude,
        longitude,
        cabinet_type,
        capacity,
        status,
        installation_date,
        notes,
        created_at,
        updated_at
      `)
      .eq('project_id', project_id)
      .order('code', { ascending: true });

    if (error) {
      console.error('Supabase error fetching cabinets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cabinets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: cabinets || [],
      total: cabinets?.length || 0
    });
  } catch (error) {
    console.error('Cabinets API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
