-- Migration: Create equipment_documents table
-- Purpose: Document management for equipment (warranties, manuals, calibrations)
-- Date: 2025-10-19
-- Reference: Similar to vehicle_documents table

-- Create equipment_documents table
CREATE TABLE IF NOT EXISTS equipment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,

  -- Document metadata
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'warranty', 'manual', 'calibration', 'inspection', 'safety', 'purchase', 'other'
  )),
  document_name VARCHAR(255) NOT NULL,

  -- File storage (Supabase Storage)
  file_path VARCHAR(500) NOT NULL,
  file_size_bytes INTEGER,
  mime_type VARCHAR(100),

  -- Date tracking
  issue_date DATE,
  expiry_date DATE,

  -- Additional info
  notes TEXT,
  uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Soft delete
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Validation: expiry_date must be after issue_date if both provided
  CONSTRAINT check_document_dates CHECK (
    expiry_date IS NULL OR issue_date IS NULL OR expiry_date > issue_date
  )
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_equipment_documents_equipment
ON equipment_documents(equipment_id)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_equipment_documents_type
ON equipment_documents(document_type)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_equipment_documents_expiry
ON equipment_documents(expiry_date)
WHERE is_active = true AND expiry_date IS NOT NULL;

-- Note: Cannot create partial index with CURRENT_DATE (not immutable)
-- Use query-time filtering instead: WHERE expiry_date <= CURRENT_DATE + INTERVAL '60 days'

CREATE INDEX IF NOT EXISTS idx_equipment_documents_uploaded_by
ON equipment_documents(uploaded_by_user_id)
WHERE is_active = true;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_equipment_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER equipment_documents_updated_at
BEFORE UPDATE ON equipment_documents
FOR EACH ROW
EXECUTE FUNCTION update_equipment_documents_updated_at();

-- Helper function to get expiring documents (30/60/90 days)
CREATE OR REPLACE FUNCTION get_expiring_equipment_documents(days_ahead INTEGER DEFAULT 60)
RETURNS TABLE (
  document_id UUID,
  equipment_id UUID,
  equipment_name VARCHAR,
  document_type VARCHAR,
  document_name VARCHAR,
  expiry_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ed.id AS document_id,
    ed.equipment_id,
    e.name AS equipment_name,
    ed.document_type,
    ed.document_name,
    ed.expiry_date,
    (ed.expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry
  FROM equipment_documents ed
  JOIN equipment e ON e.id = ed.equipment_id
  WHERE ed.is_active = true
    AND ed.expiry_date IS NOT NULL
    AND ed.expiry_date > CURRENT_DATE
    AND ed.expiry_date <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL
  ORDER BY ed.expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE equipment_documents IS 'Documents for equipment (warranties, manuals, calibration certificates, etc.)';
COMMENT ON COLUMN equipment_documents.document_type IS 'Type of document: warranty, manual, calibration, inspection, safety, purchase, other';
COMMENT ON COLUMN equipment_documents.file_path IS 'Path in Supabase Storage bucket';
COMMENT ON COLUMN equipment_documents.expiry_date IS 'Expiration date for time-sensitive documents (calibrations, warranties, inspections)';
COMMENT ON COLUMN equipment_documents.is_active IS 'Soft delete flag';
COMMENT ON FUNCTION get_expiring_equipment_documents IS 'Returns equipment documents expiring within specified days';

-- Verification query
DO $$
BEGIN
  RAISE NOTICE 'equipment_documents table created successfully';
  RAISE NOTICE 'Expiring documents helper function created';
END $$;
