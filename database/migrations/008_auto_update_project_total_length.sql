-- Migration: Auto-update project total_length_m from soil types
-- Created: 2025-11-10
-- Description: Creates database triggers to automatically update project.total_length_m
--              whenever project_soil_types are inserted, updated, or deleted

-- Create function to update project total_length_m
CREATE OR REPLACE FUNCTION update_project_total_length()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the project's total_length_m based on sum of soil type quantities
  UPDATE projects
  SET total_length_m = (
    SELECT COALESCE(SUM(quantity_meters), 0)
    FROM project_soil_types
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on INSERT
DROP TRIGGER IF EXISTS trigger_update_project_length_on_insert ON project_soil_types;
CREATE TRIGGER trigger_update_project_length_on_insert
AFTER INSERT ON project_soil_types
FOR EACH ROW
EXECUTE FUNCTION update_project_total_length();

-- Create trigger on UPDATE
DROP TRIGGER IF EXISTS trigger_update_project_length_on_update ON project_soil_types;
CREATE TRIGGER trigger_update_project_length_on_update
AFTER UPDATE ON project_soil_types
FOR EACH ROW
EXECUTE FUNCTION update_project_total_length();

-- Create trigger on DELETE
DROP TRIGGER IF EXISTS trigger_update_project_length_on_delete ON project_soil_types;
CREATE TRIGGER trigger_update_project_length_on_delete
AFTER DELETE ON project_soil_types
FOR EACH ROW
EXECUTE FUNCTION update_project_total_length();

-- Update all existing projects to sync their total_length_m
UPDATE projects p
SET total_length_m = (
  SELECT COALESCE(SUM(quantity_meters), 0)
  FROM project_soil_types
  WHERE project_id = p.id
)
WHERE EXISTS (
  SELECT 1 FROM project_soil_types WHERE project_id = p.id
);

-- Verify the migration
SELECT
  'Migration completed!' as status,
  COUNT(*) as projects_updated
FROM projects p
WHERE EXISTS (SELECT 1 FROM project_soil_types WHERE project_id = p.id);
