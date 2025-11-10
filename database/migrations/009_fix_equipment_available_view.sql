-- Migration: Fix v_equipment_available view to include category column
-- Created: 2025-11-10
-- Description: Recreates v_equipment_available view with category column
--              to fix "column v_equipment_available.category does not exist" error

-- Drop existing view
DROP VIEW IF EXISTS v_equipment_available CASCADE;

-- Recreate view with all necessary columns including category
CREATE VIEW v_equipment_available AS
SELECT
  e.id,
  e.name,
  e.type,
  e.category,
  e.inventory_no,
  e.status,
  e.rental_cost_per_day,
  e.purchase_date,
  e.warranty_until,
  e.description,
  e.notes,
  e.owned,
  e.current_location,
  e.is_active,
  e.created_at,
  e.updated_at,
  e.total_usage_hours,
  e.serial_number,
  e.supplier_name,
  e.daily_rate,
  e.warranty_expiry_date,
  e.unit_type,
  e.quantity,
  e.available_quantity,
  e.owner_type,
  e.owner_id,
  e.search_vector
FROM equipment e
WHERE e.status = 'available' AND e.is_active = true;

-- Verify migration
SELECT
  'Migration completed!' as status,
  COUNT(*) as available_equipment_count
FROM v_equipment_available;
