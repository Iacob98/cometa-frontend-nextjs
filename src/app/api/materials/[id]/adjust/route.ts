import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * POST /api/materials/[id]/adjust
 * 
 * Adjust material stock (increase or decrease)
 * 
 * Request body:
 * {
 *   quantity: number (positive to add, negative to subtract)
 *   reason: string (required explanation)
 *   reference_type?: string
 *   reference_id?: string
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quantity, reason, reference_type, reference_id } = body;

    // Validation
    if (!quantity || quantity === 0) {
      return NextResponse.json(
        { error: 'Quantity is required and must not be zero' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim() === '') {
      return NextResponse.json(
        { error: 'Reason for adjustment is required' },
        { status: 400 }
      );
    }

    // Get current material
    const { data: material, error: fetchError } = await supabase
      .from('materials')
      .select('id, name, current_stock, unit')
      .eq('id', id)
      .single();

    if (fetchError || !material) {
      return NextResponse.json(
        { error: 'Material not found' },
        { status: 404 }
      );
    }

    // Calculate new stock
    const currentStock = Number(material.current_stock || 0);
    const adjustment = Number(quantity);
    const newStock = Math.max(0, currentStock + adjustment);

    // Update material stock
    const { error: updateError } = await supabase
      .from('materials')
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update material stock:', updateError);
      return NextResponse.json(
        { error: 'Failed to update material stock' },
        { status: 500 }
      );
    }

    // Log transaction
    const transactionType = adjustment > 0 ? 'adjustment_in' : 'adjustment_out';
    const { error: transactionError } = await supabase
      .from('material_transactions')
      .insert({
        material_id: id,
        transaction_type: transactionType,
        quantity: Math.abs(adjustment),
        unit_price: 0,
        total_price: 0,
        reference_type: reference_type || 'manual_adjustment',
        reference_id: reference_id || null,
        notes: reason,
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      console.error('Failed to log transaction:', transactionError);
      // Don't fail the request, just log the error
    }

    // Fetch updated material
    const { data: updatedMaterial } = await supabase
      .from('materials')
      .select('*')
      .eq('id', id)
      .single();

    return NextResponse.json({
      success: true,
      message: `Stock adjusted by ${adjustment} ${material.unit}`,
      material: updatedMaterial,
      adjustment: {
        previous_stock: currentStock,
        adjustment: adjustment,
        new_stock: newStock,
        reason: reason,
      },
    });

  } catch (error) {
    console.error('Stock adjustment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
