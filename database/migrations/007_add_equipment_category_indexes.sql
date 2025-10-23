-- Migration: Add category indexes for equipment filtering
-- Date: 2025-10-23
-- Purpose: Optimize category-based queries for equipment tab filtering

-- Index for category filtering (used in category tabs)
CREATE INDEX IF NOT EXISTS idx_equipment_category
ON equipment(category)
WHERE category IS NOT NULL;

-- Composite index for category + status queries (common filter combination)
CREATE INDEX IF NOT EXISTS idx_equipment_category_status
ON equipment(category, status, is_active)
WHERE is_active = true;

-- Verify indexes created
DO $$
BEGIN
  RAISE NOTICE 'Equipment category indexes created successfully';
  RAISE NOTICE 'Index 1: idx_equipment_category - for category filtering';
  RAISE NOTICE 'Index 2: idx_equipment_category_status - for category + status queries';
END $$;
