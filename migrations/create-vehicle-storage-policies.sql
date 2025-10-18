-- Migration: Create Storage Policies for vehicle-documents bucket
-- Date: 2025-10-18
-- Description: RLS policies for vehicle documents storage

-- ============================================================================
-- Storage Policies for 'vehicle-documents' bucket
-- ============================================================================

-- Policy 1: Allow authenticated users to SELECT (download/view) files
CREATE POLICY "Authenticated users can view vehicle documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'vehicle-documents'
);

-- Policy 2: Allow authenticated users to INSERT (upload) files
CREATE POLICY "Authenticated users can upload vehicle documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'vehicle-documents'
    AND auth.role() = 'authenticated'
);

-- Policy 3: Allow file owners and admins to UPDATE file metadata
CREATE POLICY "Owners and admins can update vehicle documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'vehicle-documents'
    AND (
        -- File owner can update
        auth.uid() = owner
        OR
        -- Admins and PMs can update
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'pm')
        )
    )
);

-- Policy 4: Allow file owners and admins to DELETE files
CREATE POLICY "Owners and admins can delete vehicle documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'vehicle-documents'
    AND (
        -- File owner can delete
        auth.uid() = owner
        OR
        -- Admins and PMs can delete
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'pm')
        )
    )
);

-- ============================================================================
-- Verification
-- ============================================================================

-- Check all policies for vehicle-documents bucket
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%vehicle documents%'
ORDER BY policyname;

-- ============================================================================
-- SUCCESS! Storage policies are configured.
-- Files in 'vehicle-documents' bucket are now protected by RLS.
-- ============================================================================
