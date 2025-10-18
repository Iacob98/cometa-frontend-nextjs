-- Migration: Add notes, owned, and current_location fields to equipment table
-- Date: 2025-10-18
-- Description: Adds missing fields that are referenced in the API but don't exist in the schema

-- Add notes field for operational notes (separate from description)
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add owned field (company-owned vs rented equipment)
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS owned BOOLEAN DEFAULT true;

-- Add current_location field for tracking equipment location
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS current_location VARCHAR(200);

-- Add comments for documentation
COMMENT ON COLUMN equipment.notes IS 'Operational notes, maintenance reminders, usage notes';
COMMENT ON COLUMN equipment.description IS 'Equipment specifications and static details';
COMMENT ON COLUMN equipment.owned IS 'True if company-owned, false if rented equipment';
COMMENT ON COLUMN equipment.current_location IS 'Current physical location of the equipment';

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'equipment'
AND column_name IN ('notes', 'owned', 'current_location', 'description')
ORDER BY column_name;
