import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';
export type NotificationType =
  | 'project_start'
  | 'project_end'
  | 'material_delivery'
  | 'document_expiration'
  | 'maintenance_due'
  | 'work_entry_approval'
  | 'low_stock'
  | 'info';

export interface CreateNotificationParams {
  user_id: string;
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  action_url?: string;
  data?: Record<string, any>;
}

/**
 * Check if a similar notification already exists within the last 24 hours
 * to prevent duplicate notifications
 */
export async function checkDuplicateNotification(
  userId: string,
  title: string,
  hours: number = 24
): Promise<boolean> {
  const since = new Date();
  since.setHours(since.getHours() - hours);

  const { data, error } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('title', title)
    .gte('created_at', since.toISOString())
    .limit(1);

  if (error) {
    console.error('Error checking duplicate notification:', error);
    return false; // On error, allow creation
  }

  return (data?.length || 0) > 0;
}

/**
 * Create a notification with automatic deduplication
 */
export async function createNotification(
  params: CreateNotificationParams,
  checkDuplicate: boolean = true
): Promise<{ success: boolean; notificationId?: string; skipped?: boolean }> {
  const {
    user_id,
    title,
    message,
    type = 'info',
    priority = 'normal',
    action_url,
    data = {},
  } = params;

  // Check for duplicates if enabled
  if (checkDuplicate) {
    const isDuplicate = await checkDuplicateNotification(user_id, title);
    if (isDuplicate) {
      console.log(`Skipping duplicate notification: ${title} for user ${user_id}`);
      return { success: true, skipped: true };
    }
  }

  // Create the notification
  const { data: notification, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id,
        title,
        message,
        type,
        priority,
        action_url,
        data,
        is_read: false,
      },
    ])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false };
  }

  console.log(`Created notification: ${title} for user ${user_id}`);
  return { success: true, notificationId: notification.id };
}

/**
 * Create notifications for multiple users with the same content
 */
export async function createBulkNotifications(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'user_id'>,
  checkDuplicate: boolean = true
): Promise<{ total: number; created: number; skipped: number; failed: number }> {
  const results = { total: userIds.length, created: 0, skipped: 0, failed: 0 };

  for (const userId of userIds) {
    const result = await createNotification({ ...params, user_id: userId }, checkDuplicate);

    if (result.success) {
      if (result.skipped) {
        results.skipped++;
      } else {
        results.created++;
      }
    } else {
      results.failed++;
    }
  }

  return results;
}

/**
 * Get user IDs for a specific role or permission
 */
export async function getUserIdsByRole(role: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('role', role)
    .eq('is_active', true);

  if (error) {
    console.error(`Error fetching users with role ${role}:`, error);
    return [];
  }

  return data.map((u) => u.id);
}

/**
 * Get project manager user ID for a specific project
 */
export async function getProjectManagerId(projectId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('pm_user_id')
    .eq('id', projectId)
    .single();

  if (error || !data?.pm_user_id) {
    console.error(`Error fetching PM for project ${projectId}:`, error);
    return null;
  }

  return data.pm_user_id;
}

/**
 * Calculate days until a date
 */
export function daysUntil(dateString: string): number {
  const targetDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Format date for display in notifications
 */
export function formatNotificationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
