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
    const project_id = searchParams.get('project_id');
    const status = searchParams.get('status');
    const material_id = searchParams.get('material_id');

    // Build the query for material allocations with related data
    let query = supabase
      .from('material_allocations')
      .select(`
        id,
        project_id,
        material_id,
        quantity_allocated,
        quantity_used,
        allocated_date,
        allocated_by,
        status,
        notes,
        created_at,
        updated_at,
        project:projects!material_allocations_project_id_fkey(
          id,
          name,
          city,
          address
        ),
        material:materials!material_allocations_material_id_fkey(
          id,
          name,
          category,
          unit,
          unit_price_eur,
          supplier_name
        ),
        allocator:users!material_allocations_allocated_by_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    if (material_id) {
      query = query.eq('material_id', material_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: allocations, error, count } = await query;

    if (error) {
      console.error('Supabase material allocations query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch material allocations data' },
        { status: 500 }
      );
    }

    // Format response to ensure proper structure for frontend
    const formattedAllocations = (allocations || []).map((allocation: any) => ({
      id: allocation.id,
      project_id: allocation.project_id,
      material_id: allocation.material_id,
      quantity_allocated: Number(allocation.quantity_allocated) || 0,
      quantity_used: Number(allocation.quantity_used) || 0,
      quantity_remaining: Number(allocation.quantity_allocated) - Number(allocation.quantity_used || 0),
      allocated_date: allocation.allocated_date,
      allocated_by: allocation.allocated_by,
      status: allocation.status || 'allocated',
      notes: allocation.notes || '',
      project: allocation.project ? {
        id: allocation.project.id,
        name: allocation.project.name,
        city: allocation.project.city,
        address: allocation.project.address
      } : null,
      material: allocation.material ? {
        id: allocation.material.id,
        name: allocation.material.name,
        category: allocation.material.category,
        unit: allocation.material.unit,
        unit_price_eur: Number(allocation.material.unit_price_eur) || 0,
        supplier_name: allocation.material.supplier_name
      } : null,
      allocator: allocation.allocator ? {
        id: allocation.allocator.id,
        name: `${allocation.allocator.first_name} ${allocation.allocator.last_name}`,
        first_name: allocation.allocator.first_name,
        last_name: allocation.allocator.last_name,
        email: allocation.allocator.email,
        role: allocation.allocator.role
      } : null,
      total_value: allocation.material ?
        (Number(allocation.quantity_allocated) * Number(allocation.material.unit_price_eur || 0)) : 0,
      created_at: allocation.created_at,
      updated_at: allocation.updated_at
    }));

    // Calculate summary statistics
    const totalAllocations = formattedAllocations.length;
    const totalValue = formattedAllocations.reduce((sum, alloc) => sum + alloc.total_value, 0);
    const totalQuantityAllocated = formattedAllocations.reduce((sum, alloc) => sum + alloc.quantity_allocated, 0);
    const totalQuantityUsed = formattedAllocations.reduce((sum, alloc) => sum + alloc.quantity_used, 0);

    const statusCounts = {
      allocated: formattedAllocations.filter(a => a.status === 'allocated').length,
      partially_used: formattedAllocations.filter(a => a.status === 'partially_used').length,
      fully_used: formattedAllocations.filter(a => a.status === 'fully_used').length,
      returned: formattedAllocations.filter(a => a.status === 'returned').length,
      lost: formattedAllocations.filter(a => a.status === 'lost').length
    };

    return NextResponse.json({
      allocations: formattedAllocations,
      pagination: {
        page,
        per_page,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / per_page)
      },
      summary: {
        total_allocations: count || 0,
        total_value: totalValue,
        total_quantity_allocated: totalQuantityAllocated,
        total_quantity_used: totalQuantityUsed,
        utilization_rate: totalQuantityAllocated > 0 ?
          ((totalQuantityUsed / totalQuantityAllocated) * 100).toFixed(2) : 0,
        status_counts: statusCounts
      }
    });
  } catch (error) {
    console.error('Material allocations API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      material_id,
      quantity_allocated,
      allocated_by,
      status = 'allocated',
      notes = '',
      allocated_date
    } = body;

    // Validate required fields
    if (!project_id || !material_id || !quantity_allocated) {
      return NextResponse.json(
        { error: 'Project ID, material ID, and quantity allocated are required' },
        { status: 400 }
      );
    }

    // Validate quantity is positive
    if (Number(quantity_allocated) <= 0) {
      return NextResponse.json(
        { error: 'Quantity allocated must be greater than 0' },
        { status: 400 }
      );
    }

    // Create new material allocation
    const { data: newAllocation, error: allocationError } = await supabase
      .from('material_allocations')
      .insert({
        project_id,
        material_id,
        quantity_allocated: Number(quantity_allocated),
        quantity_used: 0,
        allocated_by: allocated_by || null,
        status,
        notes,
        allocated_date: allocated_date || new Date().toISOString().split('T')[0]
      })
      .select(`
        id,
        project_id,
        material_id,
        quantity_allocated,
        quantity_used,
        allocated_date,
        allocated_by,
        status,
        notes,
        created_at,
        updated_at,
        project:projects!material_allocations_project_id_fkey(
          id,
          name,
          city
        ),
        material:materials!material_allocations_material_id_fkey(
          id,
          name,
          category,
          unit,
          unit_price_eur,
          supplier_name
        ),
        allocator:users!material_allocations_allocated_by_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (allocationError) {
      console.error('Supabase material allocation creation error:', allocationError);
      return NextResponse.json(
        { error: 'Failed to create material allocation' },
        { status: 500 }
      );
    }

    // Format response
    const formattedAllocation = {
      id: newAllocation.id,
      project_id: newAllocation.project_id,
      material_id: newAllocation.material_id,
      quantity_allocated: Number(newAllocation.quantity_allocated),
      quantity_used: Number(newAllocation.quantity_used),
      quantity_remaining: Number(newAllocation.quantity_allocated) - Number(newAllocation.quantity_used),
      allocated_date: newAllocation.allocated_date,
      allocated_by: newAllocation.allocated_by,
      status: newAllocation.status,
      notes: newAllocation.notes,
      project: newAllocation.project ? {
        id: newAllocation.project.id,
        name: newAllocation.project.name,
        city: newAllocation.project.city
      } : null,
      material: newAllocation.material ? {
        id: newAllocation.material.id,
        name: newAllocation.material.name,
        category: newAllocation.material.category,
        unit: newAllocation.material.unit,
        unit_price_eur: Number(newAllocation.material.unit_price_eur || 0),
        supplier_name: newAllocation.material.supplier_name
      } : null,
      allocator: newAllocation.allocator ? {
        id: newAllocation.allocator.id,
        name: `${newAllocation.allocator.first_name} ${newAllocation.allocator.last_name}`,
        email: newAllocation.allocator.email
      } : null,
      total_value: newAllocation.material ?
        (Number(newAllocation.quantity_allocated) * Number(newAllocation.material.unit_price_eur || 0)) : 0,
      created_at: newAllocation.created_at,
      updated_at: newAllocation.updated_at
    };

    return NextResponse.json({
      message: 'Material allocation created successfully',
      allocation: formattedAllocation
    }, { status: 201 });
  } catch (error) {
    console.error('Material allocations POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create material allocation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      quantity_used,
      status,
      notes
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Allocation ID is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (quantity_used !== undefined) {
      updateData.quantity_used = Number(quantity_used);
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Update material allocation
    const { data: updatedAllocation, error: updateError } = await supabase
      .from('material_allocations')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        project_id,
        material_id,
        quantity_allocated,
        quantity_used,
        allocated_date,
        allocated_by,
        status,
        notes,
        created_at,
        updated_at,
        material:materials!material_allocations_material_id_fkey(
          id,
          name,
          unit_price_eur
        )
      `)
      .single();

    if (updateError) {
      console.error('Supabase material allocation update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update material allocation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Material allocation updated successfully',
      allocation: updatedAllocation
    });
  } catch (error) {
    console.error('Material allocations PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update material allocation' },
      { status: 500 }
    );
  }
}