import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get('threshold') || '10');

    // Get materials with real stock tracking columns
    const { data: materials, error } = await supabase
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
        current_stock,
        min_stock_threshold,
        created_at
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch low stock materials' },
        { status: 500 }
      );
    }

    // Filter for low stock materials using real data (current stock <= min stock threshold)
    const lowStockMaterials = (materials || []).filter(material => {
      const currentStock = material.current_stock || 0;
      const minThreshold = material.min_stock_threshold || 0;
      return currentStock <= minThreshold;
    }).map(material => ({
      ...material,
      unit_cost: material.unit_price_eur || 0,
    }));

    return NextResponse.json({ materials: lowStockMaterials });
  } catch (error) {
    console.error('Low stock materials API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}