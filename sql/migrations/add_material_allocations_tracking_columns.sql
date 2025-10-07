-- Migration: Add tracking columns to material_allocations table
-- Date: 2025-10-07
-- Description: Adds quantity_used, quantity_remaining, and status columns for material allocation tracking

-- Add missing columns to material_allocations
ALTER TABLE material_allocations
ADD COLUMN IF NOT EXISTS quantity_used numeric(14,3) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS quantity_remaining numeric(14,3) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'allocated' NOT NULL;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_material_allocations_status
ON material_allocations(status);

-- Create index for project_id + status for efficient queries
CREATE INDEX IF NOT EXISTS idx_material_allocations_project_status
ON material_allocations(project_id, status);

-- Update quantity_remaining for existing records
UPDATE material_allocations
SET quantity_remaining = quantity_allocated - COALESCE(quantity_used, 0)
WHERE quantity_remaining IS NULL OR quantity_remaining = 0;

-- Create trigger to automatically update quantity_remaining when quantity_used changes
CREATE OR REPLACE FUNCTION update_material_allocation_remaining()
RETURNS TRIGGER AS $$
BEGIN
  NEW.quantity_remaining = NEW.quantity_allocated - COALESCE(NEW.quantity_used, 0);

  -- Auto-update status based on usage
  IF NEW.quantity_used = 0 THEN
    NEW.status = 'allocated';
  ELSIF NEW.quantity_used >= NEW.quantity_allocated THEN
    NEW.status = 'fully_used';
  ELSE
    NEW.status = 'partially_used';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_material_allocation_remaining ON material_allocations;
CREATE TRIGGER trigger_update_material_allocation_remaining
  BEFORE INSERT OR UPDATE OF quantity_used, quantity_allocated
  ON material_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_material_allocation_remaining();

-- Add check constraint to ensure quantity_used doesn't exceed quantity_allocated
ALTER TABLE material_allocations
ADD CONSTRAINT check_quantity_used_not_exceeds_allocated
CHECK (quantity_used <= quantity_allocated);

-- Add comments for documentation
COMMENT ON COLUMN material_allocations.quantity_used IS 'Amount of allocated material that has been used';
COMMENT ON COLUMN material_allocations.quantity_remaining IS 'Calculated remaining quantity (allocated - used)';
COMMENT ON COLUMN material_allocations.status IS 'Allocation status: allocated, partially_used, fully_used, returned, lost';
