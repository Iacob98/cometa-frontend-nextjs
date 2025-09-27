import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(
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

    const updateData = {
      is_read: true,
      read_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('in_app_notifications')
      .update(updateData)
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Supabase mark all as read error:', error);
      return NextResponse.json(
        { error: 'Failed to mark all notifications as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'All notifications marked as read successfully'
    });
  } catch (error) {
    console.error('Mark all as read API error:', error);
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read' },
      { status: 500 }
    );
  }
}