-- Migration: Create cabinet_plans table for multiple installation plans per cabinet
-- Date: 2025-11-03
-- Description: Allows storing multiple installation plan files per NVT cabinet
--              instead of single plan in cabinets table columns

-- Create cabinet_plans table
CREATE TABLE IF NOT EXISTS cabinet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id UUID NOT NULL REFERENCES cabinets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT cabinet_plans_plan_type_check
  CHECK (plan_type = ANY (ARRAY[
    'network_design'::text,
    'technical_drawing'::text,
    'site_layout'::text,
    'installation_guide'::text,
    'as_built'::text,
    'fremdleitungsplan'::text,
    'other'::text
  ]))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cabinet_plans_cabinet_id ON cabinet_plans(cabinet_id);
CREATE INDEX IF NOT EXISTS idx_cabinet_plans_plan_type ON cabinet_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_cabinet_plans_uploaded_at ON cabinet_plans(uploaded_at DESC);

-- Add comment
COMMENT ON TABLE cabinet_plans IS 'Stores multiple installation plan files for each NVT cabinet';
