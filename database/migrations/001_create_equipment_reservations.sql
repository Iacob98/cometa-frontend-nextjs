-- Migration: Create equipment_reservations table
-- Purpose: Time-based equipment reservations with overlap prevention
-- Date: 2025-10-19

-- Enable btree_gist extension for UUID+range constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Create equipment_reservations table
CREATE TABLE IF NOT EXISTS equipment_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  reserved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reserved_from TIMESTAMP NOT NULL,
  reserved_until TIMESTAMP NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Validation: reserved_until must be after reserved_from
  CONSTRAINT check_reservation_dates CHECK (reserved_until > reserved_from),

  -- Prevent overlapping reservations for the same equipment
  -- Uses PostgreSQL's GIST index with range types
  EXCLUDE USING gist (
    equipment_id WITH =,
    tsrange(reserved_from, reserved_until) WITH &&
  ) WHERE (is_active = true)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_equipment_reservations_equipment
ON equipment_reservations(equipment_id);

CREATE INDEX IF NOT EXISTS idx_equipment_reservations_project
ON equipment_reservations(project_id);

CREATE INDEX IF NOT EXISTS idx_equipment_reservations_user
ON equipment_reservations(reserved_by_user_id);

CREATE INDEX IF NOT EXISTS idx_equipment_reservations_dates
ON equipment_reservations(reserved_from, reserved_until)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_equipment_reservations_active
ON equipment_reservations(is_active, reserved_from DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_equipment_reservations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_reservations_updated_at
BEFORE UPDATE ON equipment_reservations
FOR EACH ROW
EXECUTE FUNCTION update_equipment_reservations_updated_at();

-- Comments for documentation
COMMENT ON TABLE equipment_reservations IS 'Time-based reservations for equipment to prevent conflicts';
COMMENT ON COLUMN equipment_reservations.reserved_from IS 'Start of reservation period';
COMMENT ON COLUMN equipment_reservations.reserved_until IS 'End of reservation period';
COMMENT ON COLUMN equipment_reservations.is_active IS 'Active reservations enforced by overlap constraint';
COMMENT ON CONSTRAINT check_reservation_dates ON equipment_reservations IS 'Ensures reservation end is after start';

-- Verification query
DO $$
BEGIN
  RAISE NOTICE 'equipment_reservations table created successfully';
  RAISE NOTICE 'Overlap prevention constraint enabled via GIST index';
END $$;
