-- Migration: Create vehicle_documents table for German vehicle documentation
-- Date: 2025-10-18
-- Description: Creates table for managing vehicle documents (TÜV, Insurance, Registration, etc.)

-- ============================================================================
-- 1. Create vehicle_documents table
-- ============================================================================

CREATE TABLE IF NOT EXISTS vehicle_documents (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,

    -- Document classification (German vehicle document types)
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'fahrzeugschein',      -- Vehicle Registration Certificate (Part I)
        'fahrzeugbrief',       -- Vehicle Title (Part II / Zulassungsbescheinigung)
        'tuv',                 -- Technical Inspection (TÜV/HU)
        'versicherung',        -- Insurance
        'au',                  -- Emissions Test (Abgasuntersuchung)
        'wartung',             -- Service Records (Wartungsnachweis)
        'sonstiges'            -- Other
    )),

    -- File information
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100),

    -- Document metadata
    document_number VARCHAR(100),
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    notes TEXT,

    -- Status and tracking
    is_verified BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. Create indexes for performance
-- ============================================================================

-- Index on vehicle_id for fast lookups by vehicle
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_vehicle_id
    ON vehicle_documents(vehicle_id);

-- Index on document_type for filtering
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_document_type
    ON vehicle_documents(document_type);

-- Index on expiry_date for finding expiring documents
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_expiry_date
    ON vehicle_documents(expiry_date);

-- Index on created_at for sorting by upload date
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_created_at
    ON vehicle_documents(created_at DESC);

-- Composite index for common query patterns (vehicle + type + expiry)
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_vehicle_type_expiry
    ON vehicle_documents(vehicle_id, document_type, expiry_date);

-- ============================================================================
-- 3. Create trigger for updated_at timestamp
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vehicle_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_vehicle_documents_updated_at ON vehicle_documents;
CREATE TRIGGER trigger_update_vehicle_documents_updated_at
    BEFORE UPDATE ON vehicle_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_documents_updated_at();

-- ============================================================================
-- 4. Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on vehicle_documents
ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documents for vehicles they have access to
CREATE POLICY "Users can view vehicle documents"
    ON vehicle_documents
    FOR SELECT
    USING (true);  -- Adjust based on your access control requirements

-- Policy: Authenticated users can insert documents
CREATE POLICY "Authenticated users can upload vehicle documents"
    ON vehicle_documents
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update documents they uploaded or are admin
CREATE POLICY "Users can update vehicle documents"
    ON vehicle_documents
    FOR UPDATE
    USING (
        uploaded_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'pm')
        )
    );

-- Policy: Admins can delete documents
CREATE POLICY "Admins can delete vehicle documents"
    ON vehicle_documents
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'pm')
        )
    );

-- ============================================================================
-- 5. Grant permissions
-- ============================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON vehicle_documents TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- 6. Verification queries
-- ============================================================================

-- Verify table creation
SELECT
    'vehicle_documents table created successfully' as status,
    COUNT(*) as row_count
FROM vehicle_documents;

-- Verify indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'vehicle_documents'
ORDER BY indexname;

-- Verify RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'vehicle_documents';

-- ============================================================================
-- SUCCESS! Vehicle documents table is ready to use.
-- Next steps:
-- 1. Create Supabase Storage bucket: 'vehicle-documents'
-- 2. Configure storage policies
-- 3. Implement API endpoints
-- ============================================================================
