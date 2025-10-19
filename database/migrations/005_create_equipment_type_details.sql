-- Migration: Create equipment_type_details table for typed attributes
-- Purpose: Store type-specific attributes (Power Tool specs, OTDR specs, etc.)
-- Date: 2025-10-19

-- Create equipment_type_details table
CREATE TABLE IF NOT EXISTS equipment_type_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE UNIQUE,

  -- Power Tool attributes
  power_watts INTEGER CHECK (power_watts > 0),
  voltage_volts INTEGER CHECK (voltage_volts > 0),
  battery_type VARCHAR(50),
  battery_capacity_ah NUMERIC CHECK (battery_capacity_ah > 0),
  ip_rating VARCHAR(10),  -- e.g., IP65, IP67
  blade_size_mm INTEGER CHECK (blade_size_mm > 0),
  rpm INTEGER CHECK (rpm > 0),

  -- Fusion Splicer attributes
  brand VARCHAR(100),
  model VARCHAR(100),
  firmware_version VARCHAR(50),
  arc_calibration_date DATE,
  avg_splice_loss_db NUMERIC CHECK (avg_splice_loss_db >= 0),
  splice_count INTEGER DEFAULT 0 CHECK (splice_count >= 0),
  electrode_replacement_date DATE,

  -- OTDR attributes
  wavelength_nm INTEGER CHECK (wavelength_nm > 0),  -- e.g., 1310, 1550
  dynamic_range_db NUMERIC CHECK (dynamic_range_db > 0),
  fiber_type VARCHAR(50),  -- e.g., SM, MM
  connector_type VARCHAR(50),  -- e.g., SC, LC, FC
  pulse_width_ns INTEGER CHECK (pulse_width_ns > 0),
  measurement_range_km NUMERIC CHECK (measurement_range_km > 0),

  -- Safety Gear attributes
  size VARCHAR(20),  -- e.g., S, M, L, XL, XXL
  certification VARCHAR(100),  -- e.g., EN 397, ANSI Z89.1
  inspection_due_date DATE,
  certification_expiry_date DATE,
  manufacturer VARCHAR(100),

  -- Vehicle/Heavy Equipment attributes
  license_plate VARCHAR(50),
  vin VARCHAR(50),
  engine_hours INTEGER CHECK (engine_hours >= 0),
  fuel_type VARCHAR(50),  -- diesel, petrol, electric, hybrid
  tank_capacity_liters NUMERIC CHECK (tank_capacity_liters > 0),
  load_capacity_kg NUMERIC CHECK (load_capacity_kg > 0),

  -- Measuring Equipment attributes
  accuracy_rating VARCHAR(50),
  measurement_unit VARCHAR(20),
  calibration_interval_months INTEGER CHECK (calibration_interval_months > 0),
  last_calibration_date DATE,
  calibration_certificate_no VARCHAR(100),

  -- Common attributes
  serial_number VARCHAR(100),
  purchase_price_eur NUMERIC CHECK (purchase_price_eur >= 0),
  depreciation_rate_percent NUMERIC CHECK (depreciation_rate_percent >= 0 AND depreciation_rate_percent <= 100),
  residual_value_eur NUMERIC CHECK (residual_value_eur >= 0),

  -- Additional flexible fields (JSONB for future extensibility)
  custom_attributes JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_equipment_type_details_brand
ON equipment_type_details(brand)
WHERE brand IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_equipment_type_details_model
ON equipment_type_details(model)
WHERE model IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_equipment_type_details_serial
ON equipment_type_details(serial_number)
WHERE serial_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_equipment_type_details_calibration_due
ON equipment_type_details(last_calibration_date)
WHERE last_calibration_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_equipment_type_details_inspection_due
ON equipment_type_details(inspection_due_date)
WHERE inspection_due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_equipment_type_details_certification_expiry
ON equipment_type_details(certification_expiry_date)
WHERE certification_expiry_date IS NOT NULL;

-- GIN index for JSONB custom_attributes
CREATE INDEX IF NOT EXISTS idx_equipment_type_details_custom_attrs
ON equipment_type_details USING gin(custom_attributes);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_equipment_type_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_type_details_updated_at
BEFORE UPDATE ON equipment_type_details
FOR EACH ROW
EXECUTE FUNCTION update_equipment_type_details_updated_at();

-- Helper view: Power Tools
CREATE OR REPLACE VIEW v_equipment_power_tools AS
SELECT
  e.id,
  e.name,
  e.type,
  e.inventory_no,
  e.status,
  e.current_location,
  e.owned,
  e.rental_cost_per_day,
  etd.power_watts,
  etd.voltage_volts,
  etd.battery_type,
  etd.battery_capacity_ah,
  etd.ip_rating,
  etd.blade_size_mm,
  etd.rpm,
  etd.serial_number,
  etd.brand,
  etd.model
FROM equipment e
LEFT JOIN equipment_type_details etd ON etd.equipment_id = e.id
WHERE e.type ILIKE '%power%tool%' OR e.type ILIKE '%drill%' OR e.type ILIKE '%saw%'
  AND e.is_active = true;

-- Helper view: Fusion Splicers
CREATE OR REPLACE VIEW v_equipment_fusion_splicers AS
SELECT
  e.id,
  e.name,
  e.type,
  e.inventory_no,
  e.status,
  e.current_location,
  etd.brand,
  etd.model,
  etd.firmware_version,
  etd.arc_calibration_date,
  etd.avg_splice_loss_db,
  etd.splice_count,
  etd.electrode_replacement_date,
  etd.serial_number,
  CASE
    WHEN etd.arc_calibration_date IS NULL THEN 'never_calibrated'
    WHEN etd.arc_calibration_date < CURRENT_DATE - INTERVAL '6 months' THEN 'calibration_overdue'
    WHEN etd.arc_calibration_date < CURRENT_DATE - INTERVAL '5 months' THEN 'calibration_soon'
    ELSE 'calibration_ok'
  END AS calibration_status
FROM equipment e
LEFT JOIN equipment_type_details etd ON etd.equipment_id = e.id
WHERE e.type ILIKE '%fusion%splicer%' OR e.type ILIKE '%splicer%'
  AND e.is_active = true;

-- Helper view: OTDRs
CREATE OR REPLACE VIEW v_equipment_otdrs AS
SELECT
  e.id,
  e.name,
  e.type,
  e.inventory_no,
  e.status,
  e.current_location,
  etd.brand,
  etd.model,
  etd.wavelength_nm,
  etd.dynamic_range_db,
  etd.fiber_type,
  etd.connector_type,
  etd.pulse_width_ns,
  etd.measurement_range_km,
  etd.last_calibration_date,
  etd.calibration_certificate_no,
  etd.serial_number,
  CASE
    WHEN etd.last_calibration_date IS NULL THEN 'never_calibrated'
    WHEN etd.last_calibration_date < CURRENT_DATE - INTERVAL '12 months' THEN 'calibration_overdue'
    WHEN etd.last_calibration_date < CURRENT_DATE - INTERVAL '10 months' THEN 'calibration_soon'
    ELSE 'calibration_ok'
  END AS calibration_status
FROM equipment e
LEFT JOIN equipment_type_details etd ON etd.equipment_id = e.id
WHERE e.type ILIKE '%otdr%' OR e.type ILIKE '%optical%time%domain%'
  AND e.is_active = true;

-- Helper view: Safety Gear
CREATE OR REPLACE VIEW v_equipment_safety_gear AS
SELECT
  e.id,
  e.name,
  e.type,
  e.inventory_no,
  e.status,
  e.current_location,
  etd.size,
  etd.certification,
  etd.inspection_due_date,
  etd.certification_expiry_date,
  etd.manufacturer,
  etd.serial_number,
  CASE
    WHEN etd.inspection_due_date IS NOT NULL AND etd.inspection_due_date < CURRENT_DATE THEN 'inspection_overdue'
    WHEN etd.inspection_due_date IS NOT NULL AND etd.inspection_due_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'inspection_soon'
    WHEN etd.certification_expiry_date IS NOT NULL AND etd.certification_expiry_date < CURRENT_DATE THEN 'certification_expired'
    WHEN etd.certification_expiry_date IS NOT NULL AND etd.certification_expiry_date <= CURRENT_DATE + INTERVAL '60 days' THEN 'certification_expiring'
    ELSE 'ok'
  END AS compliance_status
FROM equipment e
LEFT JOIN equipment_type_details etd ON etd.equipment_id = e.id
WHERE e.type ILIKE '%safety%' OR e.type ILIKE '%ppe%' OR e.type ILIKE '%harness%'
  AND e.is_active = true;

-- Function to get expiring calibrations/certifications
CREATE OR REPLACE FUNCTION get_expiring_equipment_certifications(days_ahead INTEGER DEFAULT 60)
RETURNS TABLE (
  equipment_id UUID,
  equipment_name VARCHAR,
  equipment_type VARCHAR,
  cert_type VARCHAR,
  expiry_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id AS equipment_id,
    e.name AS equipment_name,
    e.type AS equipment_type,
    'calibration'::VARCHAR AS cert_type,
    etd.last_calibration_date + INTERVAL '12 months' AS expiry_date,
    ((etd.last_calibration_date + INTERVAL '12 months')::DATE - CURRENT_DATE)::INTEGER AS days_until_expiry
  FROM equipment e
  JOIN equipment_type_details etd ON etd.equipment_id = e.id
  WHERE e.is_active = true
    AND etd.last_calibration_date IS NOT NULL
    AND (etd.last_calibration_date + INTERVAL '12 months')::DATE <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL

  UNION ALL

  SELECT
    e.id AS equipment_id,
    e.name AS equipment_name,
    e.type AS equipment_type,
    'certification'::VARCHAR AS cert_type,
    etd.certification_expiry_date AS expiry_date,
    (etd.certification_expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry
  FROM equipment e
  JOIN equipment_type_details etd ON etd.equipment_id = e.id
  WHERE e.is_active = true
    AND etd.certification_expiry_date IS NOT NULL
    AND etd.certification_expiry_date <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL

  UNION ALL

  SELECT
    e.id AS equipment_id,
    e.name AS equipment_name,
    e.type AS equipment_type,
    'inspection'::VARCHAR AS cert_type,
    etd.inspection_due_date AS expiry_date,
    (etd.inspection_due_date - CURRENT_DATE)::INTEGER AS days_until_expiry
  FROM equipment e
  JOIN equipment_type_details etd ON etd.equipment_id = e.id
  WHERE e.is_active = true
    AND etd.inspection_due_date IS NOT NULL
    AND etd.inspection_due_date <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL

  ORDER BY days_until_expiry ASC;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE equipment_type_details IS 'Type-specific attributes for equipment (power tools, splicers, OTDRs, safety gear, etc.)';
COMMENT ON COLUMN equipment_type_details.custom_attributes IS 'JSONB field for future extensibility and custom fields';
COMMENT ON VIEW v_equipment_power_tools IS 'Filtered view showing power tools with their specific attributes';
COMMENT ON VIEW v_equipment_fusion_splicers IS 'Filtered view showing fusion splicers with calibration status';
COMMENT ON VIEW v_equipment_otdrs IS 'Filtered view showing OTDRs with calibration status';
COMMENT ON VIEW v_equipment_safety_gear IS 'Filtered view showing safety gear with compliance status';
COMMENT ON FUNCTION get_expiring_equipment_certifications IS 'Returns equipment with expiring calibrations/certifications within specified days';

-- Verification query
DO $$
BEGIN
  RAISE NOTICE 'equipment_type_details table created successfully';
  RAISE NOTICE 'Helper views created: v_equipment_power_tools, v_equipment_fusion_splicers, v_equipment_otdrs, v_equipment_safety_gear';
  RAISE NOTICE 'Expiring certifications function created';
END $$;
