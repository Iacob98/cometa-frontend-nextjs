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
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const { data: notification, error } = await supabase
      .from('in_app_notifications')
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
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase notification get error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch notification' },
        { status: 500 }
      );
    }

    // Transform response to match frontend expectations
    const transformedNotification = {
      ...notification,
      type: notification.notification_type,
      body: notification.message,
    };

    return NextResponse.json(transformedNotification);
  } catch (error) {
    console.error('Notification GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { read = true } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      is_read: read,
      read_at: read ? new Date().toISOString() : null
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
      console.error('Supabase notification update error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    // Transform response to match frontend expectations
    const transformedNotification = {
      ...updatedNotification,
      type: updatedNotification.notification_type,
      body: updatedNotification.message,
    };

    return NextResponse.json({
      message: 'Notification updated successfully',
      notification: transformedNotification
    });
  } catch (error) {
    console.error('Notification PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { error } = await supabase
      .from('in_app_notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase notification delete error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to delete notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Notification DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    );
  }
}