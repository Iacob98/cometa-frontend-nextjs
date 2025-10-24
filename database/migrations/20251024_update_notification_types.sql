-- Migration: Update notification type constraint
-- Date: 2024-10-24
-- Description: Extends notification types to support automated notifications

-- Drop old constraint (only allowed: info, warning, error, success)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS check_notification_type;

-- Add new constraint with all notification types
ALTER TABLE notifications
ADD CONSTRAINT check_notification_type CHECK (
  type IN (
    -- Legacy types (for manual notifications)
    'info', 'warning', 'error', 'success',
    -- Automated notification types (from cron job)
    'project_start',          -- Project start date reminders
    'project_end',            -- Project end date reminders
    'material_delivery',      -- Material delivery reminders
    'document_expiration',    -- Vehicle/equipment document expiration
    'maintenance_due',        -- Equipment maintenance due
    'work_entry_approved',    -- Work entry approval notifications
    'work_entry_rejected',    -- Work entry rejection notifications
    'low_stock'               -- Material low stock alerts
  )
);

-- Add comment explaining the types
COMMENT ON CONSTRAINT check_notification_type ON notifications IS
'Allowed notification types:
Legacy: info, warning, error, success
Automated: project_start, project_end, material_delivery, document_expiration, maintenance_due, work_entry_approved, work_entry_rejected, low_stock';
