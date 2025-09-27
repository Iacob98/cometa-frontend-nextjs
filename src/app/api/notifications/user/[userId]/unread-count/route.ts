import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { count, error } = await supabase
      .from('in_app_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Supabase unread count error:', error);
      return NextResponse.json(
        { error: 'Failed to get unread count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Unread count API error:', error);
    return NextResponse.json(
      { error: 'Failed to get unread count' },
      { status: 500 }
    );
  }
}