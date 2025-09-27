-- =============================================================================
-- COMETA File Upload System - Supabase Storage Buckets Setup
-- =============================================================================
-- This script sets up all required storage buckets and RLS policies
-- Run this in your Supabase SQL Editor or via CLI

-- =============================================================================
-- CREATE STORAGE BUCKETS
-- =============================================================================

-- Project Photos Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-photos',
  'project-photos',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Work Photos Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'work-photos',
  'work-photos',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Project Documents Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  false,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/dwg',
    'application/dxf'
  ]
) ON CONFLICT (id) DO NOTHING;

-- House Documents Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'house-documents',
  'house-documents',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
) ON CONFLICT (id) DO NOTHING;

-- User Avatars Bucket (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Reports Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  26214400, -- 25MB
  ARRAY[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DROP EXISTING POLICIES (if they exist)
-- =============================================================================

DROP POLICY IF EXISTS "project_photos_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "project_photos_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "project_photos_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "project_photos_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "work_photos_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "work_photos_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "work_photos_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "work_photos_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "project_documents_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "project_documents_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "project_documents_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "project_documents_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "house_documents_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "house_documents_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "house_documents_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "house_documents_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "user_avatars_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "user_avatars_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "user_avatars_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "user_avatars_delete_policy" ON storage.objects;

DROP POLICY IF EXISTS "reports_select_policy" ON storage.objects;
DROP POLICY IF EXISTS "reports_insert_policy" ON storage.objects;
DROP POLICY IF EXISTS "reports_update_policy" ON storage.objects;
DROP POLICY IF EXISTS "reports_delete_policy" ON storage.objects;

-- =============================================================================
-- PROJECT PHOTOS POLICIES
-- =============================================================================

-- Select: Users can view photos from projects they are assigned to
CREATE POLICY "project_photos_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'project-photos' AND
  (
    -- Allow if user is project manager
    (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    -- Allow if user is assigned to project crew
    EXISTS (
      SELECT 1 FROM crew_members cm
      JOIN crews c ON cm.crew_id = c.id
      WHERE c.project_id = (storage.foldername(name))[2]::uuid
      AND cm.user_id = auth.uid()
    ) OR
    -- Allow admins and project managers
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

-- Insert: Users can upload photos to projects they are assigned to
CREATE POLICY "project_photos_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-photos' AND
  (
    -- Same permissions as select
    (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    EXISTS (
      SELECT 1 FROM crew_members cm
      JOIN crews c ON cm.crew_id = c.id
      WHERE c.project_id = (storage.foldername(name))[2]::uuid
      AND cm.user_id = auth.uid()
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm', 'foreman', 'crew')
  )
);

-- Update: Only project managers and admins can update photos
CREATE POLICY "project_photos_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-photos' AND
  (
    (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

-- Delete: Only project managers and admins can delete photos
CREATE POLICY "project_photos_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-photos' AND
  (
    (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

-- =============================================================================
-- WORK PHOTOS POLICIES
-- =============================================================================

-- Select: Users can view photos from work entries they created or are assigned to
CREATE POLICY "work_photos_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'work-photos' AND
  (
    -- Allow if user created the work entry
    (SELECT user_id FROM work_entries WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    -- Allow if user is project manager or foreman
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm', 'foreman') OR
    -- Allow if user is in the same project crew
    EXISTS (
      SELECT 1 FROM work_entries we
      JOIN crew_members cm ON we.crew_id = cm.crew_id
      WHERE we.id = (storage.foldername(name))[2]::uuid
      AND cm.user_id = auth.uid()
    )
  )
);

-- Insert: Users can upload photos to work entries they create
CREATE POLICY "work_photos_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'work-photos' AND
  (
    -- Allow if user created the work entry
    (SELECT user_id FROM work_entries WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm', 'foreman', 'crew')
  )
);

-- Update: Same as insert permissions
CREATE POLICY "work_photos_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'work-photos' AND
  (
    (SELECT user_id FROM work_entries WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm', 'foreman')
  )
);

-- Delete: Only work entry creator, foreman, PM, or admin can delete
CREATE POLICY "work_photos_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'work-photos' AND
  (
    (SELECT user_id FROM work_entries WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm', 'foreman')
  )
);

-- =============================================================================
-- PROJECT DOCUMENTS POLICIES
-- =============================================================================

-- Select: Same as project photos
CREATE POLICY "project_documents_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'project-documents' AND
  (
    (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    EXISTS (
      SELECT 1 FROM crew_members cm
      JOIN crews c ON cm.crew_id = c.id
      WHERE c.project_id = (storage.foldername(name))[2]::uuid
      AND cm.user_id = auth.uid()
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

-- Insert: Only PM and admin can upload project documents
CREATE POLICY "project_documents_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-documents' AND
  (
    (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

-- Update: Only PM and admin
CREATE POLICY "project_documents_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-documents' AND
  (
    (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

-- Delete: Only PM and admin
CREATE POLICY "project_documents_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-documents' AND
  (
    (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]::uuid) = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

-- =============================================================================
-- HOUSE DOCUMENTS POLICIES
-- =============================================================================

-- Select: Similar to project documents but for house-specific files
CREATE POLICY "house_documents_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'house-documents' AND
  (
    -- Allow if user is project manager (houses belong to projects)
    EXISTS (
      SELECT 1 FROM housing_units hu
      JOIN projects p ON hu.project_id = p.id
      WHERE hu.id = (storage.foldername(name))[3]::uuid
      AND p.pm_user_id = auth.uid()
    ) OR
    -- Allow crew members assigned to the project
    EXISTS (
      SELECT 1 FROM housing_units hu
      JOIN projects p ON hu.project_id = p.id
      JOIN crews c ON c.project_id = p.id
      JOIN crew_members cm ON cm.crew_id = c.id
      WHERE hu.id = (storage.foldername(name))[3]::uuid
      AND cm.user_id = auth.uid()
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

-- Insert: Only PM and admin can upload house documents
CREATE POLICY "house_documents_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'house-documents' AND
  (
    EXISTS (
      SELECT 1 FROM housing_units hu
      JOIN projects p ON hu.project_id = p.id
      WHERE hu.id = (storage.foldername(name))[3]::uuid
      AND p.pm_user_id = auth.uid()
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

-- Update and Delete: Same as insert
CREATE POLICY "house_documents_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'house-documents' AND
  (
    EXISTS (
      SELECT 1 FROM housing_units hu
      JOIN projects p ON hu.project_id = p.id
      WHERE hu.id = (storage.foldername(name))[3]::uuid
      AND p.pm_user_id = auth.uid()
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

CREATE POLICY "house_documents_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'house-documents' AND
  (
    EXISTS (
      SELECT 1 FROM housing_units hu
      JOIN projects p ON hu.project_id = p.id
      WHERE hu.id = (storage.foldername(name))[3]::uuid
      AND p.pm_user_id = auth.uid()
    ) OR
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
  )
);

-- =============================================================================
-- USER AVATARS POLICIES (Public bucket, but restricted access)
-- =============================================================================

-- Select: Users can view their own avatars, others are public
CREATE POLICY "user_avatars_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-avatars'
  -- Public bucket, no restrictions for viewing
);

-- Insert: Users can only upload their own avatars
CREATE POLICY "user_avatars_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Update: Users can only update their own avatars
CREATE POLICY "user_avatars_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  )
);

-- Delete: Users can only delete their own avatars
CREATE POLICY "user_avatars_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  )
);

-- =============================================================================
-- REPORTS POLICIES
-- =============================================================================

-- Select: Only admins and PMs can view reports
CREATE POLICY "reports_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'reports' AND
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
);

-- Insert: Only admins and PMs can upload reports
CREATE POLICY "reports_insert_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'reports' AND
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
);

-- Update: Only admins and PMs can update reports
CREATE POLICY "reports_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'reports' AND
  (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
);

-- Delete: Only admins can delete reports
CREATE POLICY "reports_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'reports' AND
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check that all buckets were created
SELECT
    name,
    public,
    file_size_limit,
    allowed_mime_types,
    created_at
FROM storage.buckets
WHERE name IN (
    'project-photos',
    'work-photos',
    'project-documents',
    'house-documents',
    'user-avatars',
    'reports'
)
ORDER BY name;

-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Count policies created
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;