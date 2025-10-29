-- Migration: Add GPS coordinates to work_entries table
-- Date: 2025-10-29
-- Description: Add gps_lat and gps_lon fields to work_entries for location tracking

-- Add GPS coordinate fields to work_entries table
ALTER TABLE work_entries
ADD COLUMN IF NOT EXISTS gps_lat NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS gps_lon NUMERIC(11, 8);

-- Add index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_work_entries_gps
ON work_entries(gps_lat, gps_lon)
WHERE gps_lat IS NOT NULL AND gps_lon IS NOT NULL;

-- Add comment explaining the fields
COMMENT ON COLUMN work_entries.gps_lat IS 'GPS Latitude coordinate (-90 to 90 degrees)';
COMMENT ON COLUMN work_entries.gps_lon IS 'GPS Longitude coordinate (-180 to 180 degrees)';
