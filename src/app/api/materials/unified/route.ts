import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
      // Get materials from warehouse/inventory with stock information using direct SQL query
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
          updated_at,
          current_stock
        `, { count: 'exact' })
        .eq('is_active', true)
        .order('name')
        .range(offset, offset + per_page - 1);

      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch warehouse materials' },
          { status: 500 }
        );
      }

      // Calculate reserved stock for each material
      const materialIds = (materials || []).map(m => m.id);
      const { data: allocations } = materialIds.length > 0 ? await supabase
        .from('material_allocations')
        .select('material_id, quantity_remaining')
        .in('material_id', materialIds)
        .eq('status', 'allocated') : { data: [] };

      // Create a map of reserved stock by material_id
      const reservedStockMap = (allocations || []).reduce((map, allocation) => {
        const materialId = allocation.material_id;
        const reserved = Number(allocation.quantity_remaining) || 0;
        map[materialId] = (map[materialId] || 0) + reserved;
        return map;
      }, {} as Record<string, number>);

      // Process materials with stock information
      const materialsWithStock = (materials || []).map(material => {
        const currentStock = Number(material.current_stock) || 0;
        const reservedStock = reservedStockMap[material.id] || 0;
        const availableStock = Math.max(0, currentStock - reservedStock);

        return {
          id: material.id,
          name: material.name,
          category: material.category,
          unit: material.unit,
          unit_price_eur: material.unit_price_eur,
          supplier_name: material.supplier_name,
          description: material.description,
          is_active: material.is_active,
          created_at: material.created_at,
          updated_at: material.updated_at,
          // Add stock fields expected by frontend
          available_qty: availableStock,
          total_qty: currentStock,
          reserved_qty: reservedStock,
          min_stock: 10, // Default minimum level
          max_stock: null,
          price: material.unit_price_eur || 0,
          // Calculate stock status
          is_low_stock: currentStock <= 10,
          is_over_allocated: reservedStock > currentStock,
          over_allocated_qty: Math.max(0, reservedStock - currentStock)
        };
      });

      return NextResponse.json({
        materials: materialsWithStock,
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

      // Add total_cost_eur calculation for each allocation
      const materialsWithCost = (allocations || []).map((allocation: any) => {
        const quantity = Number(allocation.quantity_allocated) || 0;
        const unitPrice = Number(allocation.material?.unit_price_eur) || 0;
        const totalCost = quantity * unitPrice;

        return {
          ...allocation,
          total_cost_eur: Math.round(totalCost * 100) / 100
        };
      });

      return NextResponse.json({
        materials: materialsWithCost,
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