-- Migration: Add vehicle safety and capacity features
-- Date: 2025-10-18
-- Description: Adds number_of_seats, fuel_consumption_per_100km (optional),
--              and first aid kit tracking to vehicles table

-- ============================================================================
-- 1. Add new columns to vehicles table
-- ============================================================================

-- Add number of seats (passenger capacity)
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS number_of_seats INTEGER CHECK (number_of_seats >= 0 AND number_of_seats <= 100);

-- Add fuel consumption (make it optional/nullable)
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS fuel_consumption_per_100km NUMERIC(5, 2) CHECK (fuel_consumption_per_100km >= 0);

-- Add first aid kit tracking
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS has_first_aid_kit BOOLEAN DEFAULT false;

ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS first_aid_kit_expiry_date DATE;

-- ============================================================================
-- 2. Create index for first aid kit expiry date (for alerts)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_vehicles_first_aid_kit_expiry
    ON vehicles(first_aid_kit_expiry_date)
    WHERE has_first_aid_kit = true AND first_aid_kit_expiry_date IS NOT NULL;

-- ============================================================================
-- 3. Add comments for documentation
-- ============================================================================

COMMENT ON COLUMN vehicles.number_of_seats IS 'Passenger capacity of the vehicle';
COMMENT ON COLUMN vehicles.fuel_consumption_per_100km IS 'Fuel consumption in liters per 100 kilometers (optional)';
COMMENT ON COLUMN vehicles.has_first_aid_kit IS 'Whether the vehicle has a first aid kit';
COMMENT ON COLUMN vehicles.first_aid_kit_expiry_date IS 'Expiration date of the first aid kit';

-- ============================================================================
-- 4. Verification query
-- ============================================================================

SELECT
    'Migration completed successfully' as status,
    COUNT(*) as vehicle_count
FROM vehicles;

-- Display column information
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicles'
    AND column_name IN ('number_of_seats', 'fuel_consumption_per_100km', 'has_first_aid_kit', 'first_aid_kit_expiry_date')
ORDER BY column_name;
