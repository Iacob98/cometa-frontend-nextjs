import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const updateData = {
      is_read: true,
      read_at: new Date().toISOString()
    };

    const { data: updatedNotification, error } = await supabase
      .from('in_app_notifications')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        user_id,
        title,
        message,
        notification_type,
        priority,
        is_read,
        read_at,
        action_url,
        action_label,
        expires_at,
        created_at
      `)
      .single();

    if (error) {
      console.error('Supabase notification mark as read error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to mark notification as read' },
        { status: 500 }
      );
    }

    // Transform response to match frontend expectations
    const transformedNotification = {
      ...updatedNotification,
      type: updatedNotification.notification_type,
      body: updatedNotification.message,
    };

    return NextResponse.json(transformedNotification);
  } catch (error) {
    console.error('Notification read PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
}