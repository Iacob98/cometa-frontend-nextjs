-- Migration: Add plan fields to cabinets table
-- Description: Allow each NVT point (cabinet) to have its own installation plan
-- Date: 2025-10-30

-- Add columns for cabinet-specific plans
ALTER TABLE cabinets
ADD COLUMN IF NOT EXISTS plan_title TEXT,
ADD COLUMN IF NOT EXISTS plan_description TEXT,
ADD COLUMN IF NOT EXISTS plan_type TEXT CHECK (plan_type IN ('network_design', 'technical_drawing', 'site_layout', 'installation_guide', 'as_built', 'other')),
ADD COLUMN IF NOT EXISTS plan_filename TEXT,
ADD COLUMN IF NOT EXISTS plan_file_size INTEGER,
ADD COLUMN IF NOT EXISTS plan_file_url TEXT,
ADD COLUMN IF NOT EXISTS plan_file_path TEXT,
ADD COLUMN IF NOT EXISTS plan_uploaded_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for faster queries by project
CREATE INDEX IF NOT EXISTS idx_cabinets_project_id ON cabinets(project_id);

-- Add comment explaining the plan fields
COMMENT ON COLUMN cabinets.plan_title IS 'Title of the installation plan for this NVT point';
COMMENT ON COLUMN cabinets.plan_description IS 'Description of the installation plan';
COMMENT ON COLUMN cabinets.plan_type IS 'Type of plan document (network_design, technical_drawing, etc.)';
COMMENT ON COLUMN cabinets.plan_filename IS 'Original filename of the uploaded plan';
COMMENT ON COLUMN cabinets.plan_file_size IS 'File size in bytes';
COMMENT ON COLUMN cabinets.plan_file_url IS 'Public URL to access the plan file from Supabase Storage';
COMMENT ON COLUMN cabinets.plan_file_path IS 'Storage path in Supabase Storage bucket';
COMMENT ON COLUMN cabinets.plan_uploaded_at IS 'Timestamp when the plan was uploaded';
