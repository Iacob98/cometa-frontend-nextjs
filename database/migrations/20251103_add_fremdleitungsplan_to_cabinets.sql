-- Migration: Add fremdleitungsplan to allowed cabinet plan types
-- Date: 2025-11-03
-- Description: Adds "fremdleitungsplan" (foreign line plan) to the allowed values
--              for the plan_type column in the cabinets table

-- Drop existing constraint
ALTER TABLE cabinets DROP CONSTRAINT IF EXISTS cabinets_plan_type_check;

-- Add updated constraint with fremdleitungsplan
ALTER TABLE cabinets ADD CONSTRAINT cabinets_plan_type_check
CHECK (plan_type = ANY (ARRAY[
  'network_design'::text,
  'technical_drawing'::text,
  'site_layout'::text,
  'installation_guide'::text,
  'as_built'::text,
  'fremdleitungsplan'::text,
  'other'::text
]));
