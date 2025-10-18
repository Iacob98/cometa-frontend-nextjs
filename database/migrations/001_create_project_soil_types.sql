-- Create project_soil_types table
-- This table stores soil type information with pricing for each project
-- Migration created: 2025-10-07

CREATE TABLE IF NOT EXISTS project_soil_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  soil_type_name TEXT NOT NULL,
  price_per_meter DECIMAL(10,2) NOT NULL,
  quantity_meters DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries by project_id
CREATE INDEX IF NOT EXISTS idx_project_soil_types_project_id
ON project_soil_types(project_id);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_soil_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
DROP TRIGGER IF EXISTS update_project_soil_types_updated_at ON project_soil_types;
CREATE TRIGGER update_project_soil_types_updated_at
  BEFORE UPDATE ON project_soil_types
  FOR EACH ROW
  EXECUTE FUNCTION update_project_soil_types_updated_at();

-- Add comment explaining table purpose
COMMENT ON TABLE project_soil_types IS 'Stores soil type definitions with pricing per meter for project scope planning';
COMMENT ON COLUMN project_soil_types.soil_type_name IS 'Name of soil type (e.g., Sand, Clay, Rock)';
COMMENT ON COLUMN project_soil_types.price_per_meter IS 'Cost per meter for this soil type in EUR';
COMMENT ON COLUMN project_soil_types.quantity_meters IS 'Optional: estimated quantity in meters for this soil type';
