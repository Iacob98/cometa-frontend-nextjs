-- Migration: Add missing indexes and full-text search to equipment tables
-- Purpose: Performance optimization and search enhancement
-- Date: 2025-10-19
-- Reference: EQUIPMENT_SYSTEM_ANALYSIS.md recommendations

-- ========================================
-- PART 1: Missing indexes on equipment table
-- ========================================

-- 1. Inventory number unique index (for lookups)
CREATE UNIQUE INDEX IF NOT EXISTS idx_equipment_inventory_no
ON equipment(inventory_no)
WHERE inventory_no IS NOT NULL AND is_active = true;

-- 2. Ownership filter index (common query)
CREATE INDEX IF NOT EXISTS idx_equipment_owned
ON equipment(owned, is_active)
WHERE is_active = true;

-- 3. Location-based queries
CREATE INDEX IF NOT EXISTS idx_equipment_location
ON equipment(current_location)
WHERE current_location IS NOT NULL AND is_active = true;

-- 4. Warranty expiration tracking
CREATE INDEX IF NOT EXISTS idx_equipment_warranty
ON equipment(warranty_until)
WHERE warranty_until IS NOT NULL AND is_active = true;

-- Note: Cannot use CURRENT_DATE in index (not immutable)

-- ========================================
-- PART 2: Indexes on equipment_assignments table
-- ========================================

-- 1. Active assignments index (frequent filter)
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_active
ON equipment_assignments(is_active, from_ts DESC);

-- 2. Composite index for crew/project queries
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_composite
ON equipment_assignments(crew_id, project_id, is_active)
WHERE is_active = true;

-- Note: Time range GIST index requires tstzrange for timestamp with time zone
-- Handled by equipment_reservations table instead

-- ========================================
-- PART 3: Indexes on equipment_maintenance table
-- ========================================

-- Note: equipment_maintenance table uses 'status' field (not is_active)
-- and 'date' field (not maintenance_date)

-- 1. Maintenance status index (using actual column names)
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_status_date
ON equipment_maintenance(status, date DESC);

-- 2. Next maintenance date (for scheduling)
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_next_due
ON equipment_maintenance(next_maintenance_date)
WHERE next_maintenance_date IS NOT NULL;

-- 3. Maintenance type filter
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_type_status
ON equipment_maintenance(maintenance_type, status);

-- ========================================
-- PART 4: Full-text search setup
-- ========================================

-- 1. Add search_vector column to equipment
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 2. Function to update search vector
CREATE OR REPLACE FUNCTION equipment_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.inventory_no, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.type, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(NEW.current_location, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger to maintain search vector on insert/update
CREATE TRIGGER equipment_search_vector_trigger
BEFORE INSERT OR UPDATE ON equipment
FOR EACH ROW
EXECUTE FUNCTION equipment_search_vector_update();

-- 4. GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_equipment_search
ON equipment USING gin(search_vector);

-- 5. Update existing rows with search vectors
UPDATE equipment SET search_vector = NULL WHERE search_vector IS NULL;

-- ========================================
-- PART 5: Composite indexes for common queries
-- ========================================

-- 1. Status + Type (common filter combination)
CREATE INDEX IF NOT EXISTS idx_equipment_status_type
ON equipment(status, type)
WHERE is_active = true;

-- 2. Owned + Status (rental vs owned availability)
CREATE INDEX IF NOT EXISTS idx_equipment_owned_status
ON equipment(owned, status)
WHERE is_active = true;

-- 3. Type + Location (find equipment by type at location)
CREATE INDEX IF NOT EXISTS idx_equipment_type_location
ON equipment(type, current_location)
WHERE is_active = true AND current_location IS NOT NULL;

-- ========================================
-- PART 6: Performance views
-- ========================================

-- View: Available equipment with details
CREATE OR REPLACE VIEW v_equipment_available AS
SELECT
  e.id,
  e.name,
  e.type,
  e.inventory_no,
  e.status,
  e.rental_cost_per_day,
  e.current_location,
  e.owned,
  e.total_usage_hours,
  etd.brand,
  etd.model,
  etd.serial_number
FROM equipment e
LEFT JOIN equipment_type_details etd ON etd.equipment_id = e.id
WHERE e.is_active = true
  AND e.status = 'available'
  AND NOT EXISTS (
    SELECT 1 FROM equipment_assignments ea
    WHERE ea.equipment_id = e.id
      AND ea.is_active = true
  )
  AND NOT EXISTS (
    SELECT 1 FROM equipment_reservations er
    WHERE er.equipment_id = e.id
      AND er.is_active = true
      AND er.reserved_from <= NOW()
      AND er.reserved_until >= NOW()
  );

-- View: Equipment with active assignments
CREATE OR REPLACE VIEW v_equipment_in_use AS
SELECT
  e.id,
  e.name,
  e.type,
  e.inventory_no,
  e.status,
  e.current_location,
  ea.id AS assignment_id,
  ea.crew_id,
  c.name AS crew_name,
  ea.project_id,
  p.name AS project_name,
  ea.from_ts AS assigned_from,
  ea.to_ts AS assigned_until,
  ea.rental_cost_per_day AS assignment_cost
FROM equipment e
JOIN equipment_assignments ea ON ea.equipment_id = e.id AND ea.is_active = true
LEFT JOIN crews c ON c.id = ea.crew_id
LEFT JOIN projects p ON p.id = ea.project_id
WHERE e.is_active = true;

-- View: Equipment requiring maintenance
CREATE OR REPLACE VIEW v_equipment_maintenance_due AS
SELECT
  e.id,
  e.name,
  e.type,
  e.inventory_no,
  e.status,
  e.current_location,
  ems.id AS schedule_id,
  ems.maintenance_type,
  ems.next_due_date,
  ems.next_due_hours,
  e.total_usage_hours AS current_hours,
  CASE
    WHEN ems.next_due_date IS NOT NULL AND ems.next_due_date < CURRENT_DATE
      THEN (CURRENT_DATE - ems.next_due_date)::INTEGER
    ELSE NULL
  END AS days_overdue,
  CASE
    WHEN ems.next_due_hours IS NOT NULL AND e.total_usage_hours >= ems.next_due_hours
      THEN (e.total_usage_hours - ems.next_due_hours)
    ELSE NULL
  END AS hours_overdue
FROM equipment e
JOIN equipment_maintenance_schedules ems ON ems.equipment_id = e.id
WHERE e.is_active = true
  AND ems.is_active = true
  AND (
    (ems.next_due_date IS NOT NULL AND ems.next_due_date < CURRENT_DATE)
    OR
    (ems.next_due_hours IS NOT NULL AND e.total_usage_hours >= ems.next_due_hours)
  );

-- ========================================
-- PART 7: Helper function for search
-- ========================================

CREATE OR REPLACE FUNCTION search_equipment(
  p_query TEXT,
  p_type VARCHAR DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL,
  p_owned BOOLEAN DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  type VARCHAR,
  inventory_no VARCHAR,
  status VARCHAR,
  current_location VARCHAR,
  owned BOOLEAN,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.name,
    e.type,
    e.inventory_no,
    e.status,
    e.current_location,
    e.owned,
    ts_rank(e.search_vector, plainto_tsquery('english', p_query)) AS rank
  FROM equipment e
  WHERE e.is_active = true
    AND e.search_vector @@ plainto_tsquery('english', p_query)
    AND (p_type IS NULL OR e.type = p_type)
    AND (p_status IS NULL OR e.status = p_status)
    AND (p_owned IS NULL OR e.owned = p_owned)
  ORDER BY rank DESC, e.name ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON INDEX idx_equipment_inventory_no IS 'Unique index for inventory number lookups';
COMMENT ON INDEX idx_equipment_search IS 'Full-text search GIN index for equipment';
COMMENT ON VIEW v_equipment_available IS 'Equipment currently available (not assigned or reserved)';
COMMENT ON VIEW v_equipment_in_use IS 'Equipment with active assignments';
COMMENT ON VIEW v_equipment_maintenance_due IS 'Equipment with overdue or due maintenance';
COMMENT ON FUNCTION search_equipment IS 'Full-text search for equipment with filters and ranking';

-- ========================================
-- PART 8: Analyze tables for query planner
-- ========================================

ANALYZE equipment;
ANALYZE equipment_assignments;
ANALYZE equipment_maintenance;
ANALYZE equipment_reservations;
ANALYZE equipment_documents;
ANALYZE equipment_usage_logs;
ANALYZE equipment_maintenance_schedules;
ANALYZE equipment_type_details;

-- Verification query
DO $$
DECLARE
  v_index_count INTEGER;
  v_view_count INTEGER;
BEGIN
  -- Count indexes
  SELECT COUNT(*) INTO v_index_count
  FROM pg_indexes
  WHERE tablename IN (
    'equipment',
    'equipment_assignments',
    'equipment_maintenance',
    'equipment_reservations',
    'equipment_documents',
    'equipment_usage_logs',
    'equipment_maintenance_schedules',
    'equipment_type_details'
  );

  -- Count views
  SELECT COUNT(*) INTO v_view_count
  FROM pg_views
  WHERE viewname LIKE 'v_equipment%';

  RAISE NOTICE 'Performance optimization complete!';
  RAISE NOTICE 'Total indexes created: %', v_index_count;
  RAISE NOTICE 'Total views created: %', v_view_count;
  RAISE NOTICE 'Full-text search enabled on equipment table';
  RAISE NOTICE 'All tables analyzed for query planner';
END $$;
