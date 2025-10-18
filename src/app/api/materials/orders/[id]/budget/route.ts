import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Fetch the material order to get budget impact information
    const { data: order, error } = await supabase
      .from('material_orders')
      .select(`
        id,
        project_id,
        total_price,
        status,
        order_date
      `)
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Material order not found' },
        { status: 404 }
      );
    }

    // Check if there's an existing budget transaction for this order
    // For now, return a simple response indicating no budget impact
    // This can be enhanced later to check actual budget transactions
    const budgetImpact = {
      has_budget_impact: false,
      project_id: order.project_id || undefined,
      currency: 'EUR',
      message: 'No budget transaction recorded for this order'
    };

    return NextResponse.json(budgetImpact);
  } catch (error) {
    console.error('Material order budget API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
