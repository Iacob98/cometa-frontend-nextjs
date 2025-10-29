import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/materials/allocations/[id]
 *
 * Get a specific material allocation with details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get allocation with material details
    const { data: allocation, error } = await supabase
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
          description,
          supplier_name
        ),
        project:projects (
          id,
          name,
          city,
          address
        ),
        crew:crews (
          id,
          crew_name
        ),
        allocated_by_user:users!material_allocations_allocated_by_fkey (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Allocation not found' },
          { status: 404 }
        );
      }
      console.error('Failed to fetch allocation:', error);
      return NextResponse.json(
        { error: 'Failed to fetch allocation' },
        { status: 500 }
      );
    }

    // Enrich with calculated fields
    const enriched = {
      ...allocation,
      allocated_by_name: allocation.allocated_by_user
        ? `${allocation.allocated_by_user.first_name} ${allocation.allocated_by_user.last_name}`.trim()
        : null,
      material_name: allocation.materials?.name,
      project_name: allocation.project?.name,
      crew_name: allocation.crew?.crew_name,
    };

    return NextResponse.json(enriched);

  } catch (error) {
    console.error('Allocation fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/materials/allocations/[id]
 *
 * Update a material allocation (quantity used, status, notes)
 *
 * Request body:
 * {
 *   quantity_used?: number
 *   status?: 'allocated' | 'partially_used' | 'fully_used' | 'returned' | 'lost'
 *   notes?: string
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity_used, status, notes } = body;

    // Get current allocation
    const { data: allocation, error: fetchError } = await supabase
      .from('material_allocations')
      .select('id, material_id, quantity_allocated, quantity_used, quantity_remaining')
      .eq('id', id)
      .single();

    if (fetchError || !allocation) {
      return NextResponse.json(
        { error: 'Allocation not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Update quantity_used if provided
    if (quantity_used !== undefined) {
      const newQuantityUsed = Number(quantity_used);
      const quantityAllocated = Number(allocation.quantity_allocated);

      // Validate quantity_used doesn't exceed allocated
      if (newQuantityUsed > quantityAllocated) {
        return NextResponse.json(
          { error: `Quantity used (${newQuantityUsed}) cannot exceed quantity allocated (${quantityAllocated})` },
          { status: 400 }
        );
      }

      if (newQuantityUsed < 0) {
        return NextResponse.json(
          { error: 'Quantity used cannot be negative' },
          { status: 400 }
        );
      }

      updateData.quantity_used = newQuantityUsed;
      updateData.quantity_remaining = quantityAllocated - newQuantityUsed;

      // Auto-update status based on usage
      if (newQuantityUsed === 0) {
        updateData.status = 'allocated';
      } else if (newQuantityUsed === quantityAllocated) {
        updateData.status = 'fully_used';
      } else if (newQuantityUsed > 0 && newQuantityUsed < quantityAllocated) {
        updateData.status = 'partially_used';
      }
    }

    // Override status if explicitly provided
    if (status !== undefined) {
      const validStatuses = ['allocated', 'partially_used', 'fully_used', 'returned', 'lost'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Update notes if provided
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Perform update
    const { data: updated, error: updateError } = await supabase
      .from('material_allocations')
      .update(updateData)
      .eq('id', id)
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
          unit_price_eur
        )
      `)
      .single();

    if (updateError) {
      console.error('Failed to update allocation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update allocation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Allocation updated successfully',
      allocation: updated,
    });

  } catch (error) {
    console.error('Allocation update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/materials/allocations/[id]
 *
 * Delete a material allocation
 * This should also:
 * 1. Return the allocated quantity back to material stock
 * 2. Update reserved_stock
 * 3. Log a transaction
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get allocation details before deleting
    const { data: allocation, error: fetchError } = await supabase
      .from('material_allocations')
      .select(`
        id,
        material_id,
        quantity_allocated,
        quantity_used,
        quantity_remaining,
        status,
        materials (
          id,
          name,
          current_stock,
          reserved_stock
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError || !allocation) {
      return NextResponse.json(
        { error: 'Allocation not found' },
        { status: 404 }
      );
    }

    // Calculate how much to return to stock
    const quantityToReturn = Number(allocation.quantity_remaining || 0);
    const material = allocation.materials;

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found for this allocation' },
        { status: 404 }
      );
    }

    // Update material stock if there's unused quantity
    if (quantityToReturn > 0) {
      const currentStock = Number(material.current_stock || 0);
      const reservedStock = Number(material.reserved_stock || 0);
      const newReservedStock = Math.max(0, reservedStock - quantityToReturn);

      const { error: stockError } = await supabase
        .from('materials')
        .update({
          reserved_stock: newReservedStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', allocation.material_id);

      if (stockError) {
        console.error('Failed to update material stock:', stockError);
        // Continue with deletion even if stock update fails
      }

      // Log transaction for returned quantity
      const { error: transactionError } = await supabase
        .from('material_transactions')
        .insert({
          material_id: allocation.material_id,
          transaction_type: 'return',
          quantity: quantityToReturn,
          unit_price: 0,
          total_price: 0,
          reference_type: 'allocation_deletion',
          reference_id: id,
          notes: `Allocation deleted - returned ${quantityToReturn} units to stock`,
          created_at: new Date().toISOString(),
        });

      if (transactionError) {
        console.error('Failed to log transaction:', transactionError);
        // Continue with deletion even if transaction log fails
      }
    }

    // Delete the allocation
    const { error: deleteError } = await supabase
      .from('material_allocations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Failed to delete allocation:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete allocation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Allocation deleted successfully',
      returned_to_stock: quantityToReturn,
    });

  } catch (error) {
    console.error('Allocation deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
