-- Migration: Create equipment_usage_logs table and total_usage_hours tracking
-- Purpose: Track actual usage hours per equipment per day, auto-increment totals
-- Date: 2025-10-19

-- Step 1: Add total_usage_hours column to equipment table
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS total_usage_hours NUMERIC DEFAULT 0
CHECK (total_usage_hours >= 0);

COMMENT ON COLUMN equipment.total_usage_hours IS 'Lifetime total usage hours (auto-calculated from usage logs)';

-- Step 2: Create equipment_usage_logs table
CREATE TABLE IF NOT EXISTS equipment_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,

  -- Optional references to context
  assignment_id UUID REFERENCES equipment_assignments(id) ON DELETE SET NULL,
  work_entry_id UUID REFERENCES work_entries(id) ON DELETE SET NULL,

  -- Usage data
  usage_date DATE NOT NULL,
  hours_used NUMERIC NOT NULL CHECK (hours_used > 0 AND hours_used <= 24),

  -- Additional tracking
  notes TEXT,
  logged_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add unique constraint (cannot use COALESCE in constraint, will validate in app logic)
CREATE UNIQUE INDEX IF NOT EXISTS idx_equipment_usage_logs_unique_per_day
ON equipment_usage_logs(equipment_id, usage_date, work_entry_id)
WHERE work_entry_id IS NOT NULL;

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_equipment_usage_logs_equipment
ON equipment_usage_logs(equipment_id, usage_date DESC);

CREATE INDEX IF NOT EXISTS idx_equipment_usage_logs_assignment
ON equipment_usage_logs(assignment_id)
WHERE assignment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_equipment_usage_logs_work_entry
ON equipment_usage_logs(work_entry_id)
WHERE work_entry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_equipment_usage_logs_date
ON equipment_usage_logs(usage_date DESC);

CREATE INDEX IF NOT EXISTS idx_equipment_usage_logs_logged_by
ON equipment_usage_logs(logged_by_user_id)
WHERE logged_by_user_id IS NOT NULL;

-- Step 3: Trigger to auto-increment total_usage_hours on insert
CREATE OR REPLACE FUNCTION increment_equipment_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Update equipment total hours
  UPDATE equipment
  SET
    total_usage_hours = total_usage_hours + NEW.hours_used,
    updated_at = NOW()
  WHERE id = NEW.equipment_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_equipment_hours_on_insert
AFTER INSERT ON equipment_usage_logs
FOR EACH ROW
EXECUTE FUNCTION increment_equipment_total_hours();

-- Step 4: Trigger to handle updates to usage logs (adjust totals)
CREATE OR REPLACE FUNCTION adjust_equipment_total_hours_on_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If hours changed, adjust the difference
  IF NEW.hours_used != OLD.hours_used THEN
    UPDATE equipment
    SET
      total_usage_hours = total_usage_hours - OLD.hours_used + NEW.hours_used,
      updated_at = NOW()
    WHERE id = NEW.equipment_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER adjust_equipment_hours_on_update
AFTER UPDATE ON equipment_usage_logs
FOR EACH ROW
WHEN (OLD.hours_used IS DISTINCT FROM NEW.hours_used)
EXECUTE FUNCTION adjust_equipment_total_hours_on_update();

-- Step 5: Trigger to handle deletions (decrement totals)
CREATE OR REPLACE FUNCTION decrement_equipment_total_hours_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Subtract deleted hours from total
  UPDATE equipment
  SET
    total_usage_hours = total_usage_hours - OLD.hours_used,
    updated_at = NOW()
  WHERE id = OLD.equipment_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_equipment_hours_on_delete
AFTER DELETE ON equipment_usage_logs
FOR EACH ROW
EXECUTE FUNCTION decrement_equipment_total_hours_on_delete();

-- Step 6: Helper function to get usage summary per equipment
CREATE OR REPLACE FUNCTION get_equipment_usage_summary(
  p_equipment_id UUID,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_hours NUMERIC,
  total_days INTEGER,
  avg_hours_per_day NUMERIC,
  max_hours_single_day NUMERIC,
  min_hours_single_day NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(hours_used) AS total_hours,
    COUNT(DISTINCT usage_date)::INTEGER AS total_days,
    AVG(hours_used) AS avg_hours_per_day,
    MAX(hours_used) AS max_hours_single_day,
    MIN(hours_used) AS min_hours_single_day
  FROM equipment_usage_logs
  WHERE equipment_id = p_equipment_id
    AND (p_from_date IS NULL OR usage_date >= p_from_date)
    AND (p_to_date IS NULL OR usage_date <= p_to_date);
END;
$$ LANGUAGE plpgsql;

-- Step 7: Helper function to validate daily usage total doesn't exceed 24h
CREATE OR REPLACE FUNCTION validate_daily_usage_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_daily_total NUMERIC;
BEGIN
  -- Calculate total hours for this equipment on this date (including new entry)
  SELECT COALESCE(SUM(hours_used), 0) INTO v_daily_total
  FROM equipment_usage_logs
  WHERE equipment_id = NEW.equipment_id
    AND usage_date = NEW.usage_date
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

  -- Add the new hours
  v_daily_total := v_daily_total + NEW.hours_used;

  -- Check if exceeds 24 hours
  IF v_daily_total > 24 THEN
    RAISE EXCEPTION 'Daily usage limit exceeded: % hours total for % (max 24 hours per day)',
      v_daily_total, NEW.usage_date
    USING HINT = 'Consider splitting usage across multiple days or reducing hours';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_daily_usage_before_insert
BEFORE INSERT OR UPDATE ON equipment_usage_logs
FOR EACH ROW
EXECUTE FUNCTION validate_daily_usage_limit();

-- Comments for documentation
COMMENT ON TABLE equipment_usage_logs IS 'Daily usage logs for equipment with actual hours used';
COMMENT ON COLUMN equipment_usage_logs.hours_used IS 'Actual hours used on this date (0-24 per day)';
COMMENT ON COLUMN equipment_usage_logs.usage_date IS 'Date when equipment was used';
COMMENT ON COLUMN equipment_usage_logs.assignment_id IS 'Optional: related assignment';
COMMENT ON COLUMN equipment_usage_logs.work_entry_id IS 'Optional: related work entry';
COMMENT ON FUNCTION increment_equipment_total_hours IS 'Auto-increments total_usage_hours on insert';
COMMENT ON FUNCTION get_equipment_usage_summary IS 'Returns usage statistics for equipment within date range';
COMMENT ON FUNCTION validate_daily_usage_limit IS 'Prevents logging more than 24 hours per day per equipment';

-- Verification query
DO $$
BEGIN
  RAISE NOTICE 'equipment_usage_logs table created successfully';
  RAISE NOTICE 'total_usage_hours column added to equipment table';
  RAISE NOTICE 'Auto-increment triggers enabled';
  RAISE NOTICE 'Daily usage limit validation enabled (max 24h/day)';
END $$;
