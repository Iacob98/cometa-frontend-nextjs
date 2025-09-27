import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    // Get material details from Supabase
    const { data: material, error } = await supabase
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
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Material not found' },
          { status: 404 }
        );
      }
      console.error('Supabase material query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch material' },
        { status: 500 }
      );
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Material API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    // Build update data object (only include provided fields)
    const updateData: any = {};
    const allowedFields = [
      'name', 'category', 'unit', 'unit_price_eur',
      'supplier_name', 'description', 'is_active'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update the material
    const { data: material, error } = await supabase
      .from('materials')
      .update(updateData)
      .eq('id', id)
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
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Material not found' },
          { status: 404 }
        );
      }
      console.error('Supabase material update error:', error);
      return NextResponse.json(
        { error: 'Failed to update material' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Material updated successfully',
      material: material
    });
  } catch (error) {
    console.error('Update material error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    // Check if material exists first
    const { data: existingMaterial, error: checkError } = await supabase
      .from('materials')
      .select('id, name')
      .eq('id', id)
      .single();

    if (checkError || !existingMaterial) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    // Instead of hard delete, we'll soft delete by setting is_active = false
    // This preserves referential integrity with existing allocations/orders
    const { error } = await supabase
      .from('materials')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase material deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete material' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Material deleted successfully',
      deleted_material: existingMaterial
    });
  } catch (error) {
    console.error('Delete material error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}