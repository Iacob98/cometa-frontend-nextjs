-- Migration: Update cabinet plans allowed types to match frontend
-- Date: 2025-11-03
-- Description: Updates allowed plan_type values to match the types defined in the frontend

-- Drop existing constraint from cabinet_plans table
ALTER TABLE cabinet_plans DROP CONSTRAINT IF EXISTS cabinet_plans_plan_type_check;

-- Add updated constraint with all frontend plan types
ALTER TABLE cabinet_plans ADD CONSTRAINT cabinet_plans_plan_type_check
CHECK (plan_type = ANY (ARRAY[
  'verlegeplan'::text,
  'fremdleitungsplan'::text,
  'verkehrsanordnung'::text,
  'nvt_standortsicherung'::text,
  'hausanschluss_liste'::text,
  'technische_details'::text,
  'andere'::text,
  -- Keep legacy types for backward compatibility
  'network_design'::text,
  'technical_drawing'::text,
  'site_layout'::text,
  'installation_guide'::text,
  'as_built'::text,
  'other'::text
]));
