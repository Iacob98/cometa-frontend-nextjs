import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/materials/consume
 *
 * Consumes material from an allocation, creating a transaction and updating stock.
 *
 * Request body:
 * {
 *   allocation_id: string,
 *   consumed_qty: number,
 *   work_entry_id?: string,
 *   notes?: string
 * }
 *
 * Process:
 * 1. Validate allocation exists and has enough remaining quantity
 * 2. Update allocation.quantity_used
 * 3. Update allocation.status (allocated ’ partially_used ’ fully_used)
 * 4. Create material_transaction (type=issue)
 * 5. Update material.current_stock (decrement)
 * 6. Return updated allocation and transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      allocation_id,
      consumed_qty,
      work_entry_id,
      notes = ''
    } = body;

    // Validation
    if (!allocation_id || !consumed_qty) {
      return NextResponse.json(
        { error: 'Allocation ID and consumed quantity are required' },
        { status: 400 }
      );
    }

    if (Number(consumed_qty) <= 0) {
      return NextResponse.json(
        { error: 'Consumed quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // 1. Fetch allocation with material info
    const { data: allocation, error: allocationError } = await supabase
      .from('material_allocations')
      .select(`
        id,
        project_id,
        material_id,
        quantity_allocated,
        quantity_used,
        quantity_remaining,
        status,
        material:materials!material_allocations_material_id_fkey(
          id,
          name,
          unit,
          current_stock,
          unit_price_eur
        )
      `)
      .eq('id', allocation_id)
      .single();

    if (allocationError || !allocation) {
      console.error('Allocation fetch error:', allocationError);
      return NextResponse.json(
        { error: `Allocation not found: ${allocation_id}` },
        { status: 404 }
      );
    }

    // 2. Calculate current remaining quantity
    const currentUsed = Number(allocation.quantity_used || 0);
    const totalAllocated = Number(allocation.quantity_allocated || 0);
    const currentRemaining = totalAllocated - currentUsed;

    // Validate sufficient quantity remaining
    if (Number(consumed_qty) > currentRemaining) {
      return NextResponse.json(
        {
          error: `Insufficient quantity. Requested: ${consumed_qty}, Available: ${currentRemaining}`,
          details: {
            allocated: totalAllocated,
            used: currentUsed,
            remaining: currentRemaining,
            requested: consumed_qty
          }
        },
        { status: 400 }
      );
    }

    // 3. Calculate new values
    const newQuantityUsed = currentUsed + Number(consumed_qty);
    const newQuantityRemaining = totalAllocated - newQuantityUsed;

    // Determine new status
    let newStatus = 'allocated';
    if (newQuantityRemaining === 0) {
      newStatus = 'fully_used';
    } else if (newQuantityUsed > 0) {
      newStatus = 'partially_used';
    }

    // 4. Update allocation
    const { data: updatedAllocation, error: updateError } = await supabase
      .from('material_allocations')
      .update({
        quantity_used: newQuantityUsed,
        quantity_remaining: newQuantityRemaining,
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', allocation_id)
      .select(`
        id,
        project_id,
        material_id,
        quantity_allocated,
        quantity_used,
        quantity_remaining,
        status,
        notes
      `)
      .single();

    if (updateError) {
      console.error('Allocation update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update allocation' },
        { status: 500 }
      );
    }

    // 5. Create material transaction
    const transactionData = {
      material_id: allocation.material_id,
      project_id: allocation.project_id,
      transaction_type: 'issue',
      quantity: Number(consumed_qty),
      unit_price: Number(allocation.material?.unit_price_eur || 0),
      total_price: Number(consumed_qty) * Number(allocation.material?.unit_price_eur || 0),
      reference_type: work_entry_id ? 'work_entry' : 'allocation',
      reference_id: work_entry_id || allocation_id,
      notes: notes || `Consumed from allocation ${allocation_id}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: transaction, error: transactionError } = await supabase
      .from('material_transactions')
      .insert([transactionData])
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      // Note: We already updated the allocation, so we log this error but don't fail
      console.warn('Transaction log failed, but allocation was updated successfully');
    }

    // 6. Update material current_stock (decrement)
    // Note: This assumes current_stock tracks actual warehouse inventory
    // If current_stock only tracks purchases and doesn't decrement on allocation,
    // you may want to skip this step or use a different field
    const currentStock = Number(allocation.material?.current_stock || 0);
    const newStock = Math.max(0, currentStock - Number(consumed_qty));

    const { error: stockUpdateError } = await supabase
      .from('materials')
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', allocation.material_id);

    if (stockUpdateError) {
      console.error('Stock update error:', stockUpdateError);
      console.warn('Stock update failed, but allocation and transaction were updated');
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully consumed ${consumed_qty} ${allocation.material?.unit || 'units'} of ${allocation.material?.name}`,
      data: {
        allocation: updatedAllocation,
        transaction: transaction || null,
        material: {
          id: allocation.material_id,
          name: allocation.material?.name,
          new_stock: newStock,
          previous_stock: currentStock
        },
        consumption: {
          quantity: Number(consumed_qty),
          unit: allocation.material?.unit,
          value: Number(consumed_qty) * Number(allocation.material?.unit_price_eur || 0),
          work_entry_id: work_entry_id || null
        }
      }
    });
  } catch (error) {
    console.error('Material consumption API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
