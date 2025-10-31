-- Migration: Move connection plan fields from housing_units to houses
-- Date: 2025-10-31
-- Description: Connection plans should be for fiber optic connection houses, not worker housing units

-- Step 1: Add plan fields to houses table
ALTER TABLE houses
ADD COLUMN IF NOT EXISTS plan_title TEXT,
ADD COLUMN IF NOT EXISTS plan_description TEXT,
ADD COLUMN IF NOT EXISTS plan_type TEXT CHECK (plan_type IN ('connection_plan', 'wiring_diagram', 'technical_drawing', 'installation_guide', 'as_built', 'other')),
ADD COLUMN IF NOT EXISTS plan_filename TEXT,
ADD COLUMN IF NOT EXISTS plan_file_size INTEGER,
ADD COLUMN IF NOT EXISTS plan_file_url TEXT,
ADD COLUMN IF NOT EXISTS plan_file_path TEXT,
ADD COLUMN IF NOT EXISTS plan_uploaded_at TIMESTAMPTZ;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_houses_plan_uploaded
ON houses(plan_uploaded_at)
WHERE plan_file_path IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN houses.plan_title IS 'Title of the connection plan document';
COMMENT ON COLUMN houses.plan_description IS 'Description of the connection plan';
COMMENT ON COLUMN houses.plan_type IS 'Type of plan: connection_plan, wiring_diagram, technical_drawing, installation_guide, as_built, other';
COMMENT ON COLUMN houses.plan_filename IS 'Original filename of the uploaded plan';
COMMENT ON COLUMN houses.plan_file_size IS 'File size in bytes';
COMMENT ON COLUMN houses.plan_file_url IS 'Public URL to access the plan document';
COMMENT ON COLUMN houses.plan_file_path IS 'Storage path in Supabase Storage';
COMMENT ON COLUMN houses.plan_uploaded_at IS 'Timestamp when the plan was uploaded';

-- Step 2: Remove plan fields from housing_units table (they were added by mistake)
ALTER TABLE housing_units
DROP COLUMN IF EXISTS plan_title,
DROP COLUMN IF EXISTS plan_description,
DROP COLUMN IF EXISTS plan_type,
DROP COLUMN IF EXISTS plan_filename,
DROP COLUMN IF EXISTS plan_file_size,
DROP COLUMN IF EXISTS plan_file_url,
DROP COLUMN IF EXISTS plan_file_path,
DROP COLUMN IF EXISTS plan_uploaded_at;

-- Drop the index from housing_units if it exists
DROP INDEX IF EXISTS idx_housing_units_plan_uploaded;

-- Note: No data migration needed as no plans were uploaded yet
SELECT 'Migration completed: Connection plan fields moved from housing_units to houses' as result;
