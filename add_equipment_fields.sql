-- Add missing fields to equipment table for ownership and financial tracking
-- This script adds the fields needed for the ownership feature fix

-- Add owned column to equipment table
ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS owned BOOLEAN DEFAULT true;

-- Add financial columns to equipment table
ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS purchase_price_eur DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS rental_price_per_day_eur DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS rental_price_per_hour_eur DECIMAL(10,2) DEFAULT 0;

-- Add location tracking
ALTER TABLE public.equipment
ADD COLUMN IF NOT EXISTS current_location TEXT;

-- Add similar fields to vehicles table if they don't exist
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS owned BOOLEAN DEFAULT true;

ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS purchase_price_eur DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS rental_price_per_day_eur DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS rental_price_per_hour_eur DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS current_location TEXT;

ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS fuel_consumption_l_100km DECIMAL(5,2) DEFAULT 0;

-- Update existing equipment records to be owned by default
UPDATE public.equipment
SET owned = true
WHERE owned IS NULL;

-- Update existing vehicle records to be owned by default
UPDATE public.vehicles
SET owned = true
WHERE owned IS NULL;

-- Create indexes for better performance on ownership queries
CREATE INDEX IF NOT EXISTS idx_equipment_owned ON public.equipment(owned);
CREATE INDEX IF NOT EXISTS idx_vehicles_owned ON public.vehicles(owned);

-- Add comments for documentation
COMMENT ON COLUMN public.equipment.owned IS 'Whether the equipment is owned (true) or rented (false)';
COMMENT ON COLUMN public.equipment.purchase_price_eur IS 'Purchase price in EUR for owned equipment';
COMMENT ON COLUMN public.equipment.rental_price_per_day_eur IS 'Internal daily cost for project allocation';
COMMENT ON COLUMN public.equipment.rental_price_per_hour_eur IS 'Internal hourly cost for project allocation';
COMMENT ON COLUMN public.equipment.current_location IS 'Current location of the equipment';

COMMENT ON COLUMN public.vehicles.owned IS 'Whether the vehicle is owned (true) or rented (false)';
COMMENT ON COLUMN public.vehicles.purchase_price_eur IS 'Purchase price in EUR for owned vehicles';
COMMENT ON COLUMN public.vehicles.rental_price_per_day_eur IS 'Internal daily cost for project allocation';
COMMENT ON COLUMN public.vehicles.rental_price_per_hour_eur IS 'Internal hourly cost for project allocation';
COMMENT ON COLUMN public.vehicles.current_location IS 'Current location of the vehicle';
COMMENT ON COLUMN public.vehicles.fuel_consumption_l_100km IS 'Fuel consumption in liters per 100km';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Successfully added ownership and financial tracking fields to equipment and vehicles tables';
END $$;