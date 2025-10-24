-- Migration: Add data JSONB column and priority to notifications table
-- Date: 2024-10-24
-- Description: Adds structured data storage for notification context and priority field

-- Add data JSONB column for storing structured notification context
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- Add priority column for notification importance
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'
CHECK (priority IN ('urgent', 'high', 'normal', 'low'));

-- Add index on priority for faster filtering
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Add index on data for JSONB queries (GIN index)
CREATE INDEX IF NOT EXISTS idx_notifications_data ON notifications USING GIN(data);

-- Add index on type for faster filtering by notification type
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Add composite index for common query pattern (user_id, is_read, created_at)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
ON notifications(user_id, is_read, created_at DESC);

-- Add comment explaining data column usage
COMMENT ON COLUMN notifications.data IS 'Structured JSONB data for notification context. Examples:
- Project reminders: {"project_id": "uuid", "project_name": "...", "days_until": 7}
- Document expiration: {"document_id": "uuid", "document_type": "...", "expires_at": "..."}
- Material delivery: {"order_id": "uuid", "supplier": "...", "delivery_date": "..."}';

COMMENT ON COLUMN notifications.priority IS 'Notification priority level: urgent (red), high (orange), normal (default), low (gray)';
