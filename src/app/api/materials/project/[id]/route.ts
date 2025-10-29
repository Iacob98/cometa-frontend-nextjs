import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/materials/project/[id]
 * 
 * Get all materials allocated to a specific project
 * Includes allocation details, usage, and material information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Get allocations with material details
    const { data: allocations, error } = await supabase
      .from('material_allocations')
      .select(`
        id,
        material_id,
        project_id,
        crew_id,
        quantity_allocated,
        quantity_used,
        quantity_remaining,
        status,
        allocated_date,
        allocated_by,
        notes,
        created_at,
        updated_at,
        materials (
          id,
          name,
          category,
          unit,
          unit_price_eur,
          current_stock,
          reserved_stock,
          sku,
          description
        )
      `)
      .eq('project_id', projectId)
      .order('allocated_date', { ascending: false });

    if (error) {
      console.error('Failed to fetch project materials:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project materials' },
        { status: 500 }
      );
    }

    // Calculate totals
    const totals = (allocations || []).reduce((acc, allocation) => {
      const allocated = Number(allocation.quantity_allocated || 0);
      const used = Number(allocation.quantity_used || 0);
      const remaining = Number(allocation.quantity_remaining || 0);
      const unitPrice = Number(allocation.materials?.unit_price_eur || 0);

      return {
        total_allocated: acc.total_allocated + allocated,
        total_used: acc.total_used + used,
        total_remaining: acc.total_remaining + remaining,
        estimated_value: acc.estimated_value + (allocated * unitPrice),
        materials_count: acc.materials_count + 1,
      };
    }, {
      total_allocated: 0,
      total_used: 0,
      total_remaining: 0,
      estimated_value: 0,
      materials_count: 0,
    });

    return NextResponse.json({
      project_id: projectId,
      allocations: allocations || [],
      totals,
    });

  } catch (error) {
    console.error('Project materials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
