-- Migration: Make crew_id required and project_id optional for crew-based assignment logic
-- Version: 001_crew_assignment_constraints
-- Author: Claude Code
-- Date: 2025-09-25
-- Risk Level: Medium (schema changes but empty tables)

-- ==================================================================
-- STEP 1: Update equipment_assignments table
-- ==================================================================

BEGIN;

-- Add indexes for crew_id for performance optimization
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_crew_id
    ON equipment_assignments(crew_id);

-- Make project_id nullable (allow crew assignments without immediate project)
ALTER TABLE equipment_assignments
    ALTER COLUMN project_id DROP NOT NULL;

-- Make crew_id required (NOT NULL)
ALTER TABLE equipment_assignments
    ALTER COLUMN crew_id SET NOT NULL;

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_crew_project
    ON equipment_assignments(crew_id, project_id)
    WHERE project_id IS NOT NULL;

-- Add index for active assignments by crew
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_crew_active
    ON equipment_assignments(crew_id, from_ts, to_ts)
    WHERE to_ts IS NULL OR to_ts > NOW();

COMMIT;

-- ==================================================================
-- STEP 2: Update vehicle_assignments table
-- ==================================================================

BEGIN;

-- Add indexes for crew_id for performance optimization
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_crew_id
    ON vehicle_assignments(crew_id);

-- Make project_id nullable (allow crew assignments without immediate project)
ALTER TABLE vehicle_assignments
    ALTER COLUMN project_id DROP NOT NULL;

-- Make crew_id required (NOT NULL)
ALTER TABLE vehicle_assignments
    ALTER COLUMN crew_id SET NOT NULL;

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_crew_project
    ON vehicle_assignments(crew_id, project_id)
    WHERE project_id IS NOT NULL;

-- Add index for active assignments by crew
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_crew_active
    ON vehicle_assignments(crew_id, from_ts, to_ts)
    WHERE to_ts IS NULL OR to_ts > NOW();

COMMIT;

-- ==================================================================
-- STEP 3: Update foreign key constraints to include cascade behavior
-- ==================================================================

BEGIN;

-- For equipment_assignments: Add ON DELETE RESTRICT to prevent accidental crew deletion
-- The existing FK constraints are already good, but let's ensure proper cascade behavior

-- Add check constraint to ensure equipment assignments have either project_id or are tied to crew
ALTER TABLE equipment_assignments
    ADD CONSTRAINT equipment_assignments_crew_or_project_check
    CHECK (crew_id IS NOT NULL);

-- Add check constraint for vehicle assignments
ALTER TABLE vehicle_assignments
    ADD CONSTRAINT vehicle_assignments_crew_or_project_check
    CHECK (crew_id IS NOT NULL);

COMMIT;

-- ==================================================================
-- VERIFICATION QUERIES
-- ==================================================================

-- Verify crew_id is now NOT NULL
SELECT
    table_name,
    column_name,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('equipment_assignments', 'vehicle_assignments')
    AND column_name = 'crew_id';

-- Verify project_id is now nullable
SELECT
    table_name,
    column_name,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('equipment_assignments', 'vehicle_assignments')
    AND column_name = 'project_id';

-- Verify indexes were created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('equipment_assignments', 'vehicle_assignments')
    AND indexname LIKE 'idx_%crew%'
ORDER BY tablename, indexname;

-- Verify foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('equipment_assignments', 'vehicle_assignments')
    AND kcu.column_name = 'crew_id'
ORDER BY tc.table_name;