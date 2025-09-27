import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for bypassing RLS
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Crew ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Remove user from crew
    const { error } = await supabaseService
      .from('crew_members')
      .delete()
      .eq('crew_id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase crew member remove error:', error);
      return NextResponse.json(
        { error: 'Failed to remove member from crew' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Member removed from crew successfully'
    });
  } catch (error) {
    console.error('Crew member DELETE API error:', error);
    return NextResponse.json(
      { error: 'Failed to remove member from crew' },
      { status: 500 }
    );
  }
}