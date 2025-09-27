import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAllDocumentsWithExpiration } from '@/lib/document-storage';
import { generateExpirationNotifications } from '@/lib/document-expiration';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get all documents with expiration info
    const { expirationInfo, summary } = getAllDocumentsWithExpiration();

    return NextResponse.json({
      documents: expirationInfo,
      summary
    });
  } catch (error) {
    console.error('Document expiration API error:', error);
    return NextResponse.json(
      { error: 'Failed to get document expiration info' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { force = false } = body;

    // Get all documents with expiration info
    const { expirationInfo } = getAllDocumentsWithExpiration();

    // Generate notifications for expiring documents
    const notifications = generateExpirationNotifications(expirationInfo);

    if (notifications.length === 0) {
      return NextResponse.json({
        message: 'No expiring documents found',
        notifications_created: 0
      });
    }

    // Check if we should only create new notifications or force create all
    const existingNotificationsQuery = await supabase
      .from('in_app_notifications')
      .select('id, user_id, title')
      .eq('notification_type', 'info')
      .ilike('title', '%Document expiring%')
      .eq('is_read', false);

    let filteredNotifications = notifications;

    if (!force && existingNotificationsQuery.data) {
      // Filter out notifications that already exist with the same title for the same user
      const existingMap = new Map();
      existingNotificationsQuery.data.forEach(notif => {
        const key = `${notif.user_id}-${notif.title}`;
        existingMap.set(key, true);
      });

      filteredNotifications = notifications.filter(notif => {
        const key = `${notif.user_id}-${notif.title}`;
        return !existingMap.has(key);
      });
    }

    if (filteredNotifications.length === 0) {
      return NextResponse.json({
        message: 'All expiration notifications already exist',
        notifications_created: 0,
        existing_notifications: existingNotificationsQuery.data?.length || 0
      });
    }

    // Create notifications in database
    const notificationsToInsert = filteredNotifications.map(notif => ({
      user_id: notif.user_id,
      title: notif.title,
      message: notif.message,
      notification_type: notif.notification_type,
      priority: notif.priority,
      is_read: false,
      action_url: notif.action_url,
      action_label: notif.action_label,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      created_at: new Date().toISOString()
    }));

    const { data: createdNotifications, error } = await supabase
      .from('in_app_notifications')
      .insert(notificationsToInsert)
      .select();

    if (error) {
      console.error('Supabase notification creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create notifications in database' },
        { status: 500 }
      );
    }

    console.log(`✅ Created ${createdNotifications?.length || 0} document expiration notifications`);

    return NextResponse.json({
      message: 'Document expiration notifications created successfully',
      notifications_created: createdNotifications?.length || 0,
      total_expiring_documents: notifications.length,
      notifications: createdNotifications
    }, { status: 201 });

  } catch (error) {
    console.error('Document expiration notifications POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create document expiration notifications' },
      { status: 500 }
    );
  }
}