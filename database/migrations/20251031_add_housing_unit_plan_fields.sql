-- Migration: Add connection plan fields to housing_units table
-- Date: 2025-10-31
-- Description: Add fields to store housing unit connection plans (similar to NVT cabinet plans)

-- Add plan fields to housing_units table
ALTER TABLE housing_units
ADD COLUMN IF NOT EXISTS plan_title TEXT,
ADD COLUMN IF NOT EXISTS plan_description TEXT,
ADD COLUMN IF NOT EXISTS plan_type TEXT CHECK (plan_type IN ('connection_plan', 'wiring_diagram', 'technical_drawing', 'installation_guide', 'as_built', 'other')),
ADD COLUMN IF NOT EXISTS plan_filename TEXT,
ADD COLUMN IF NOT EXISTS plan_file_size INTEGER,
ADD COLUMN IF NOT EXISTS plan_file_url TEXT,
ADD COLUMN IF NOT EXISTS plan_file_path TEXT,
ADD COLUMN IF NOT EXISTS plan_uploaded_at TIMESTAMPTZ DEFAULT NOW();

-- Add comments for documentation
COMMENT ON COLUMN housing_units.plan_title IS 'Title of the connection plan document';
COMMENT ON COLUMN housing_units.plan_description IS 'Description of the connection plan';
COMMENT ON COLUMN housing_units.plan_type IS 'Type of plan: connection_plan, wiring_diagram, technical_drawing, installation_guide, as_built, other';
COMMENT ON COLUMN housing_units.plan_filename IS 'Original filename of the uploaded plan';
COMMENT ON COLUMN housing_units.plan_file_size IS 'File size in bytes';
COMMENT ON COLUMN housing_units.plan_file_url IS 'Public URL to access the plan from Supabase Storage';
COMMENT ON COLUMN housing_units.plan_file_path IS 'Storage path in Supabase bucket (project-documents/projects/{project_id}/housing/{unit_id}/plans/)';
COMMENT ON COLUMN housing_units.plan_uploaded_at IS 'Timestamp when the plan was uploaded';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_housing_units_plan_uploaded
ON housing_units(plan_uploaded_at)
WHERE plan_file_path IS NOT NULL;

-- Add audit log
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    INSERT INTO audit_log (table_name, action, description, created_at)
    VALUES (
      'housing_units',
      'ALTER_TABLE',
      'Added connection plan fields (plan_title, plan_description, plan_type, plan_filename, plan_file_size, plan_file_url, plan_file_path, plan_uploaded_at)',
      NOW()
    );
  END IF;
END $$;
