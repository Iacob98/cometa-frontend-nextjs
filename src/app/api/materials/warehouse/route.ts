import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/materials/warehouse
 * 
 * Get all materials with warehouse/inventory information
 * Includes current stock, reserved stock, available stock, low stock alerts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = Math.min(parseInt(searchParams.get('per_page') || '50'), 1000);
    const offset = (page - 1) * per_page;
    const category = searchParams.get('category');
    const low_stock_only = searchParams.get('low_stock_only') === 'true';
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('materials')
      .select('*', { count: 'exact' });

    // Filters
    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (low_stock_only) {
      query = query.or('current_stock.lte.min_stock_threshold,current_stock.lt.10');
    }

    // Pagination and sorting
    query = query
      .eq('is_active', true)
      .order('name')
      .range(offset, offset + per_page - 1);

    const { data: materials, error, count } = await query;

    if (error) {
      console.error('Failed to fetch warehouse materials:', error);
      return NextResponse.json(
        { error: 'Failed to fetch materials' },
        { status: 500 }
      );
    }

    // Calculate available stock (current - reserved)
    const enrichedMaterials = (materials || []).map(material => {
      const currentStock = Number(material.current_stock || 0);
      const reservedStock = Number(material.reserved_stock || 0);
      const available = Math.max(0, currentStock - reservedStock);
      const minThreshold = Number(material.min_stock_threshold || 10);
      
      return {
        ...material,
        available_stock: available,
        is_low_stock: currentStock <= minThreshold,
        stock_status: currentStock === 0 ? 'out_of_stock' :
                      currentStock <= minThreshold ? 'low' :
                      available <= minThreshold ? 'reserved' : 'available',
      };
    });

    return NextResponse.json({
      materials: enrichedMaterials,
      pagination: {
        page,
        per_page,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / per_page),
      },
    });

  } catch (error) {
    console.error('Warehouse materials error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
