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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch single material order with material and project details
    const { data: order, error } = await supabaseService
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
        delivery_date,
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
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch material order' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...order,
      total_cost_eur: order.total_price || 0
    });
  } catch (error) {
    console.error('Material order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      actual_delivery_date,
      notes
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get current order to check status change
    const { data: currentOrder, error: fetchError } = await supabaseService
      .from('material_orders')
      .select('status, material_id, quantity')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching current order:', fetchError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update material order
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (actual_delivery_date) updateData.delivery_date = actual_delivery_date;
    if (notes !== undefined) updateData.notes = notes;

    const { data: order, error } = await supabaseService
      .from('material_orders')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        project_id,
        material_id,
        quantity,
        unit_price,
        total_price,
        status,
        order_date,
        delivery_date,
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
      `)
      .single();

    if (error) {
      console.error('Supabase error updating order:', error);
      return NextResponse.json(
        { error: `Failed to update material order: ${error.message}` },
        { status: 500 }
      );
    }

    // If status changed to 'delivered', update material stock
    if (status === 'delivered' && currentOrder.status !== 'delivered') {
      console.log(`Order ${id} delivered - updating material stock for material ${currentOrder.material_id}, quantity: ${currentOrder.quantity}`);

      try {
        // Get current material stock
        const { data: material, error: materialError } = await supabaseService
          .from('materials')
          .select('current_stock')
          .eq('id', currentOrder.material_id)
          .single();

        if (materialError) {
          console.error('Error fetching material:', materialError);
        } else {
          // Update material stock
          const newStock = (material.current_stock || 0) + currentOrder.quantity;
          const { error: updateStockError } = await supabaseService
            .from('materials')
            .update({
              current_stock: newStock,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentOrder.material_id);

          if (updateStockError) {
            console.error('Error updating material stock:', updateStockError);
          } else {
            console.log(`Material ${currentOrder.material_id} stock updated from ${material.current_stock || 0} to ${newStock}`);
          }

          // Create material transaction record for history
          const { error: transactionError } = await supabaseService
            .from('material_transactions')
            .insert([{
              material_id: currentOrder.material_id,
              transaction_type: 'receive',
              quantity: currentOrder.quantity,
              unit_price: order.unit_price || 0,
              total_price: order.total_price || 0,
              reference_type: 'material_order',
              reference_id: id,
              notes: `Received from supplier: ${order.supplier || 'Unknown'}`,
              created_at: new Date().toISOString()
            }]);

          if (transactionError) {
            console.error('Error creating material transaction:', transactionError);
          } else {
            console.log(`Material transaction created for order ${id}`);
          }
        }
      } catch (stockUpdateError) {
        console.error('Error updating stock:', stockUpdateError);
        // Don't fail the order update if stock update fails
      }
    }

    return NextResponse.json({
      ...order,
      total_cost_eur: order.total_price || 0
    });
  } catch (error) {
    console.error('Update material order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Delete material order
    const { error } = await supabaseService
      .from('material_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting order:', error);
      return NextResponse.json(
        { error: `Failed to delete material order: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Material order deleted successfully'
    });
  } catch (error) {
    console.error('Delete material order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}