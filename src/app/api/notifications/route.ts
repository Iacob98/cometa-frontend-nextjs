import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;
    const user_id = searchParams.get('user_id');
    const read = searchParams.get('read');
    const priority = searchParams.get('priority');
    const created_after = searchParams.get('created_after');

    // Build the query with filters
    let query = supabase
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
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (read !== null) {
      const isRead = read === 'true';
      query = query.eq('is_read', isRead);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (created_after) {
      query = query.gte('created_at', created_after);
    }

    // Execute the query
    const { data: notifications, error } = await query;

    if (error) {
      console.error('Notifications query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('in_app_notifications')
      .select('*', { count: 'exact', head: true });

    if (user_id) {
      countQuery = countQuery.eq('user_id', user_id);
    }
    if (read !== null) {
      const isRead = read === 'true';
      countQuery = countQuery.eq('is_read', isRead);
    }
    if (priority) {
      countQuery = countQuery.eq('priority', priority);
    }
    if (created_after) {
      countQuery = countQuery.gte('created_at', created_after);
    }

    const { count: totalCount } = await countQuery;

    // Get summary counts
    let summaryQueries = [
      supabase
        .from('in_app_notifications')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('in_app_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false),
      supabase
        .from('in_app_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('priority', 'urgent')
        .eq('is_read', false)
    ];

    // Apply user filter to summary queries if specified
    if (user_id) {
      summaryQueries = summaryQueries.map(q => q.eq('user_id', user_id));
    }

    const [
      { count: totalAllCount },
      { count: unreadCount },
      { count: urgentUnreadCount }
    ] = await Promise.all(summaryQueries);

    // Transform data to match frontend expectations
    const transformedNotifications = (notifications || []).map(notif => ({
      ...notif,
      type: notif.notification_type, // Map notification_type to type
      body: notif.message, // Map message to body
      // Keep both is_read and read_at for compatibility
    }));

    return NextResponse.json({
      items: transformedNotifications, // Frontend expects 'items' instead of 'notifications'
      total: totalCount || 0,
      page,
      per_page,
      total_pages: Math.ceil((totalCount || 0) / per_page),
      summary: {
        total_count: totalAllCount || 0,
        unread_count: unreadCount || 0,
        urgent_count: urgentUnreadCount || 0
      }
    });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, title, message, type = 'info', priority = 'normal', action_url, action_label, expires_at } = body;

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Set default expiration to 30 days from now if not provided
    const defaultExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: newNotification, error } = await supabase
      .from('in_app_notifications')
      .insert({
        user_id: user_id || null,
        title,
        message,
        notification_type: type,
        priority,
        is_read: false,
        action_url: action_url || null,
        action_label: action_label || null,
        expires_at: expires_at || defaultExpiresAt,
        created_at: new Date().toISOString()
      })
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
      console.error('Supabase notification creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create notification in database' },
        { status: 500 }
      );
    }

    // Transform response to match frontend expectations
    const transformedNotification = {
      ...newNotification,
      type: newNotification.notification_type,
      body: newNotification.message,
    };

    return NextResponse.json({
      message: 'Notification created successfully',
      notification: transformedNotification
    }, { status: 201 });
  } catch (error) {
    console.error('Notifications POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notification_id, read = true } = body;

    if (!notification_id) {
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
      .eq('id', notification_id)
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
        { error: 'Failed to update notification in database' },
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
    console.error('Notifications PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}