import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/materials/assignments/[id]
 * Get a specific material allocation (same as /api/materials/allocations/[id])
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: allocation, error } = await supabase
      .from('material_allocations')
      .select(`
        *,
        materials (
          id,
          name,
          category,
          unit,
          unit_price_eur,
          current_stock,
          sku,
          description
        ),
        projects (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Assignment not found' },
          { status: 404 }
        );
      }
      console.error('Failed to fetch assignment:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json(allocation);

  } catch (error) {
    console.error('Assignment fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/materials/assignments/[id]
 * Update a material allocation
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
        { error: 'Assignment not found' },
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
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update assignment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment updated successfully',
      allocation: updated,
    });

  } catch (error) {
    console.error('Assignment update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/materials/assignments/[id]
 * Delete a material allocation and return unused quantity to stock
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
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Calculate how much to return to stock
    const quantityToReturn = Number(allocation.quantity_remaining || 0);
    const material = allocation.materials;

    if (!material) {
      return NextResponse.json(
        { error: 'Material not found for this assignment' },
        { status: 404 }
      );
    }

    // Update material stock if there's unused quantity
    if (quantityToReturn > 0) {
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
          notes: `Assignment deleted - returned ${quantityToReturn} units to stock`,
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
      console.error('Failed to delete assignment:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Material assignment deleted successfully',
      returned_to_stock: quantityToReturn,
    });

  } catch (error) {
    console.error('Assignment deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}