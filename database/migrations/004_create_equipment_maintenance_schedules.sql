-- Migration: Create equipment_maintenance_schedules table
-- Purpose: Preventive maintenance scheduling with calendar and usage-based intervals
-- Date: 2025-10-19

-- Create equipment_maintenance_schedules table
CREATE TABLE IF NOT EXISTS equipment_maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,

  -- Maintenance details
  maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN (
    'routine', 'inspection', 'calibration', 'lubrication', 'cleaning', 'testing', 'other'
  )),

  -- Interval configuration
  interval_type VARCHAR(20) NOT NULL CHECK (interval_type IN (
    'calendar',      -- Days-based (e.g., every 180 days)
    'usage_hours',   -- Hours-based (e.g., every 100 hours)
    'cycles'         -- Usage cycles (e.g., every 1000 cycles)
  )),
  interval_value INTEGER NOT NULL CHECK (interval_value > 0),

  -- Tracking last maintenance
  last_performed_date DATE,
  last_performed_hours NUMERIC,  -- Usage hours at last maintenance

  -- Next due calculation
  next_due_date DATE,
  next_due_hours NUMERIC,  -- Usage hours for next maintenance

  -- Description
  description TEXT,
  notes TEXT,

  -- Active flag
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Unique constraint: one schedule per equipment per maintenance type
  UNIQUE(equipment_id, maintenance_type)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_schedules_equipment
ON equipment_maintenance_schedules(equipment_id)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_schedules_due_date
ON equipment_maintenance_schedules(next_due_date)
WHERE is_active = true AND next_due_date IS NOT NULL;

-- Note: Cannot use CURRENT_DATE in partial index (not immutable)
-- Use query-time filtering instead for overdue/upcoming maintenance

CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_schedules_type
ON equipment_maintenance_schedules(maintenance_type)
WHERE is_active = true;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_equipment_maintenance_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_maintenance_schedules_updated_at
BEFORE UPDATE ON equipment_maintenance_schedules
FOR EACH ROW
EXECUTE FUNCTION update_equipment_maintenance_schedules_updated_at();

-- Function to calculate next due date/hours
CREATE OR REPLACE FUNCTION calculate_next_maintenance_due(
  p_last_date DATE,
  p_last_hours NUMERIC,
  p_interval_type VARCHAR,
  p_interval_value INTEGER,
  p_current_hours NUMERIC
)
RETURNS TABLE(next_date DATE, next_hours NUMERIC) AS $$
BEGIN
  IF p_interval_type = 'calendar' THEN
    -- Calendar-based: add days to last date
    RETURN QUERY SELECT
      (p_last_date + (p_interval_value || ' days')::INTERVAL)::DATE AS next_date,
      NULL::NUMERIC AS next_hours;

  ELSIF p_interval_type = 'usage_hours' THEN
    -- Usage hours-based: add hours to last hours
    RETURN QUERY SELECT
      NULL::DATE AS next_date,
      (COALESCE(p_last_hours, 0) + p_interval_value)::NUMERIC AS next_hours;

  ELSIF p_interval_type = 'cycles' THEN
    -- Cycles-based: similar to calendar for now
    RETURN QUERY SELECT
      (p_last_date + (p_interval_value || ' days')::INTERVAL)::DATE AS next_date,
      NULL::NUMERIC AS next_hours;

  ELSE
    -- Unknown type, return NULLs
    RETURN QUERY SELECT
      NULL::DATE AS next_date,
      NULL::NUMERIC AS next_hours;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update schedule after maintenance completion
CREATE OR REPLACE FUNCTION update_maintenance_schedule_after_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_equipment_hours NUMERIC;
  v_next_due RECORD;
  v_schedule RECORD;
BEGIN
  -- Only process when maintenance is marked complete
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN

    -- Get current equipment hours
    SELECT total_usage_hours INTO v_equipment_hours
    FROM equipment
    WHERE id = NEW.equipment_id;

    -- Get the schedule for this maintenance type
    SELECT * INTO v_schedule
    FROM equipment_maintenance_schedules
    WHERE equipment_id = NEW.equipment_id
      AND maintenance_type = NEW.maintenance_type
      AND is_active = true
    LIMIT 1;

    -- If schedule exists, update it
    IF FOUND THEN
      -- Calculate next due
      SELECT * INTO v_next_due
      FROM calculate_next_maintenance_due(
        NEW.maintenance_date,
        v_equipment_hours,
        v_schedule.interval_type,
        v_schedule.interval_value,
        v_equipment_hours
      );

      -- Update schedule
      UPDATE equipment_maintenance_schedules
      SET
        last_performed_date = NEW.maintenance_date,
        last_performed_hours = v_equipment_hours,
        next_due_date = v_next_due.next_date,
        next_due_hours = v_next_due.next_hours,
        updated_at = NOW()
      WHERE id = v_schedule.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on equipment_maintenance to auto-update schedules
DROP TRIGGER IF EXISTS update_maintenance_schedule_on_completion ON equipment_maintenance;
CREATE TRIGGER update_maintenance_schedule_on_completion
AFTER INSERT OR UPDATE ON equipment_maintenance
FOR EACH ROW
EXECUTE FUNCTION update_maintenance_schedule_after_completion();

-- Function to get overdue maintenance
CREATE OR REPLACE FUNCTION get_overdue_maintenance()
RETURNS TABLE (
  schedule_id UUID,
  equipment_id UUID,
  equipment_name VARCHAR,
  maintenance_type VARCHAR,
  next_due_date DATE,
  days_overdue INTEGER,
  next_due_hours NUMERIC,
  current_hours NUMERIC,
  hours_overdue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ems.id AS schedule_id,
    ems.equipment_id,
    e.name AS equipment_name,
    ems.maintenance_type,
    ems.next_due_date,
    CASE
      WHEN ems.next_due_date IS NOT NULL
      THEN (CURRENT_DATE - ems.next_due_date)::INTEGER
      ELSE NULL
    END AS days_overdue,
    ems.next_due_hours,
    e.total_usage_hours AS current_hours,
    CASE
      WHEN ems.next_due_hours IS NOT NULL
      THEN GREATEST(0, e.total_usage_hours - ems.next_due_hours)
      ELSE NULL
    END AS hours_overdue
  FROM equipment_maintenance_schedules ems
  JOIN equipment e ON e.id = ems.equipment_id
  WHERE ems.is_active = true
    AND (
      (ems.next_due_date IS NOT NULL AND ems.next_due_date < CURRENT_DATE)
      OR
      (ems.next_due_hours IS NOT NULL AND e.total_usage_hours >= ems.next_due_hours)
    )
  ORDER BY
    COALESCE(days_overdue, 0) DESC,
    COALESCE(hours_overdue, 0) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get upcoming maintenance (next 30 days)
CREATE OR REPLACE FUNCTION get_upcoming_maintenance(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  schedule_id UUID,
  equipment_id UUID,
  equipment_name VARCHAR,
  maintenance_type VARCHAR,
  next_due_date DATE,
  days_until_due INTEGER,
  next_due_hours NUMERIC,
  current_hours NUMERIC,
  hours_until_due NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ems.id AS schedule_id,
    ems.equipment_id,
    e.name AS equipment_name,
    ems.maintenance_type,
    ems.next_due_date,
    CASE
      WHEN ems.next_due_date IS NOT NULL
      THEN (ems.next_due_date - CURRENT_DATE)::INTEGER
      ELSE NULL
    END AS days_until_due,
    ems.next_due_hours,
    e.total_usage_hours AS current_hours,
    CASE
      WHEN ems.next_due_hours IS NOT NULL
      THEN GREATEST(0, ems.next_due_hours - e.total_usage_hours)
      ELSE NULL
    END AS hours_until_due
  FROM equipment_maintenance_schedules ems
  JOIN equipment e ON e.id = ems.equipment_id
  WHERE ems.is_active = true
    AND (
      (ems.next_due_date IS NOT NULL
       AND ems.next_due_date >= CURRENT_DATE
       AND ems.next_due_date <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL)
      OR
      (ems.next_due_hours IS NOT NULL
       AND ems.next_due_hours > e.total_usage_hours
       AND ems.next_due_hours <= e.total_usage_hours + (days_ahead * 8)) -- Assume 8 hours/day
    )
  ORDER BY
    COALESCE(days_until_due, 999) ASC,
    COALESCE(hours_until_due, 999999) ASC;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE equipment_maintenance_schedules IS 'Preventive maintenance schedules per equipment with auto-calculation';
COMMENT ON COLUMN equipment_maintenance_schedules.interval_type IS 'Type: calendar (days), usage_hours, or cycles';
COMMENT ON COLUMN equipment_maintenance_schedules.interval_value IS 'Interval value (e.g., 180 days, 100 hours, 1000 cycles)';
COMMENT ON COLUMN equipment_maintenance_schedules.next_due_date IS 'Auto-calculated next due date (calendar-based)';
COMMENT ON COLUMN equipment_maintenance_schedules.next_due_hours IS 'Auto-calculated next due hours (usage-based)';
COMMENT ON FUNCTION calculate_next_maintenance_due IS 'Calculates next maintenance due date/hours based on interval';
COMMENT ON FUNCTION update_maintenance_schedule_after_completion IS 'Auto-updates schedule when maintenance is completed';
COMMENT ON FUNCTION get_overdue_maintenance IS 'Returns all overdue maintenance schedules';
COMMENT ON FUNCTION get_upcoming_maintenance IS 'Returns upcoming maintenance within specified days';

-- Verification query
DO $$
BEGIN
  RAISE NOTICE 'equipment_maintenance_schedules table created successfully';
  RAISE NOTICE 'Auto-update trigger linked to equipment_maintenance table';
  RAISE NOTICE 'Helper functions created: calculate_next_maintenance_due, get_overdue_maintenance, get_upcoming_maintenance';
END $$;
