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
        { error: 'Material ID is required' },
        { status: 400 }
      );
    }

    // Check if material_transactions table exists, if not return empty result
    try {
      // Fetch material transactions history
      const { data: transactions, error } = await supabaseService
        .from('material_transactions')
        .select(`
          id,
          transaction_type,
          quantity,
          unit_price,
          total_price,
          reference_type,
          reference_id,
          notes,
          created_at,
          updated_at
        `)
        .eq('material_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching transactions:', error);
        // If table doesn't exist, return empty result instead of error
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log('material_transactions table does not exist, returning empty result');
          return NextResponse.json({
            items: [],
            total: 0
          });
        }
        return NextResponse.json(
          { error: 'Failed to fetch material transactions' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        items: transactions || [],
        total: transactions?.length || 0
      });
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return empty result instead of error for missing table
      return NextResponse.json({
        items: [],
        total: 0
      });
    }
  } catch (error) {
    console.error('Material transactions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}