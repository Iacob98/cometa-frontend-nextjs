-- Migration: Update material_orders delivery date tracking
-- Date: 2025-10-07
-- Description: Rename delivery_date to expected_delivery_date and add actual_delivery_date for better tracking

-- Rename delivery_date to expected_delivery_date
ALTER TABLE material_orders
RENAME COLUMN delivery_date TO expected_delivery_date;

-- Add actual_delivery_date column
ALTER TABLE material_orders
ADD COLUMN IF NOT EXISTS actual_delivery_date DATE;

-- Create index for query performance
CREATE INDEX IF NOT EXISTS idx_material_orders_expected_delivery ON material_orders(expected_delivery_date);
CREATE INDEX IF NOT EXISTS idx_material_orders_actual_delivery ON material_orders(actual_delivery_date);

-- Comments for documentation
COMMENT ON COLUMN material_orders.expected_delivery_date IS 'Expected/planned delivery date for the order';
COMMENT ON COLUMN material_orders.actual_delivery_date IS 'Actual date when the order was delivered (NULL if not yet delivered)';
