import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Service role client for bypassing RLS
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Warehouse orders don't need a project_id (it will be null)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;
    const status = searchParams.get('status');
    const supplier_id = searchParams.get('supplier_id');

    // Build query for material orders
    let query = supabaseService
      .from('material_orders')
      .select(`
        id,
        project_id,
        material_id,
        quantity,
        unit_price,
        total_price,
        status,
        order_date,
        expected_delivery_date,
        actual_delivery_date,
        supplier,
        notes,
        created_at,
        updated_at,
        material:materials(
          id,
          name,
          category,
          unit,
          unit_price_eur,
          supplier_name
        ),
        project:projects(
          id,
          name,
          city,
          address
        )
      `, { count: 'exact' })
      .order('order_date', { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (supplier_id) {
      query = query.ilike('supplier', `%${supplier_id}%`);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch material orders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: orders || [],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page)
    });
  } catch (error) {
    console.error('Material orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      warehouse_location,
      supplier_material_id,
      material_id = supplier_material_id, // Accept either field name for backward compatibility
      quantity,
      unit_price_eur,
      unit_price = unit_price_eur, // Accept either field name for backward compatibility
      delivery_date,
      expected_delivery_date = delivery_date, // Accept either field name
      supplier,
      status = 'pending',
      notes
    } = body;

    // Validation
    if (!material_id || !quantity) {
      return NextResponse.json(
        { error: 'Material ID and quantity are required' },
        { status: 400 }
      );
    }

    // Check if material_id is actually a supplier_material_id and convert it
    let actualMaterialId = material_id;

    // First, try to find it in supplier_materials table
    const { data: supplierMaterial } = await supabaseService
      .from('supplier_materials')
      .select('material_id')
      .eq('id', material_id)
      .single();

    if (supplierMaterial) {
      // If found in supplier_materials, use the linked material_id
      actualMaterialId = supplierMaterial.material_id;
      console.log(`Converted supplier_material_id ${material_id} to material_id ${actualMaterialId}`);
    } else {
      // Check if it exists directly in materials table
      const { data: directMaterial } = await supabaseService
        .from('materials')
        .select('id')
        .eq('id', material_id)
        .single();

      if (!directMaterial) {
        return NextResponse.json(
          { error: `Material with ID ${material_id} not found` },
          { status: 400 }
        );
      }
      console.log(`Using direct material_id ${material_id}`);
    }

    // Project ID is optional - orders can be for warehouse (no project) or specific project
    // if (!project_id) {
    //   return NextResponse.json(
    //     { error: 'Project ID is required' },
    //     { status: 400 }
    //   );
    // }

    // Create material order
    // For warehouse orders, project_id will be null
    const orderData = {
      project_id: project_id || null,
      material_id: actualMaterialId,
      quantity,
      unit_price: unit_price || 0,
      total_price: (quantity || 0) * (unit_price || 0),
      status,
      order_date: new Date().toISOString(),
      expected_delivery_date: expected_delivery_date || null,
      supplier: supplier || null,
      notes: notes || null
    };

    console.log('Creating material order with data:', orderData);

    const { data: order, error: orderError } = await supabaseService
      .from('material_orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('Supabase error creating order:', orderError);
      console.error('Order data that failed:', orderData);
      return NextResponse.json(
        { error: `Failed to create material order: ${orderError.message}` },
        { status: 500 }
      );
    }


    return NextResponse.json({
      ...order,
      total_cost_eur: order.total_price || 0
    }, { status: 201 });
  } catch (error) {
    console.error('Create material order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}