import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'warehouse';
    const project_id = searchParams.get('project_id');
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;

    if (view === 'warehouse') {
      // Get materials from warehouse/inventory
      const { data: materials, error, count } = await supabase
        .from('materials')
        .select(`
          id,
          name,
          category,
          unit,
          unit_price_eur,
          supplier_name,
          description,
          is_active,
          created_at,
          updated_at
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('name', { ascending: true })
        .range(offset, offset + per_page - 1);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch warehouse materials' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        materials: materials || [],
        total: count || 0,
        page,
        per_page,
        total_pages: Math.ceil((count || 0) / per_page),
        view: 'warehouse'
      });

    } else if (view === 'project_allocations') {
      // Get material allocations for a specific project
      if (!project_id) {
        return NextResponse.json(
          { error: 'Project ID is required for project allocations view' },
          { status: 400 }
        );
      }

      const { data: allocations, error, count } = await supabase
        .from('material_allocations')
        .select(`
          id,
          material_id,
          project_id,
          crew_id,
          quantity_allocated,
          quantity_used,
          quantity_remaining,
          allocated_date,
          return_date,
          status,
          notes,
          allocated_by,
          created_at,
          material:materials(
            id,
            name,
            category,
            unit,
            unit_price_eur
          ),
          project:projects(
            id,
            name,
            city
          )
        `, { count: 'exact' })
        .eq('project_id', project_id)
        .order('allocated_date', { ascending: false })
        .range(offset, offset + per_page - 1);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch project allocations' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        allocations: allocations || [],
        total: count || 0,
        page,
        per_page,
        total_pages: Math.ceil((count || 0) / per_page),
        view: 'project_allocations',
        project_id
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid view parameter. Use "warehouse" or "project_allocations"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Materials unified API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}