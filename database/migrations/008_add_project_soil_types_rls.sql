-- Migration: Add Row-Level Security (RLS) policies for project_soil_types table
-- Author: Claude Code
-- Date: 2025-10-29
-- Related: Phase 1 Security Implementation (.claude/implementation-plans/phase1-progress-log.md)

-- Enable Row-Level Security on project_soil_types table
ALTER TABLE project_soil_types ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Admin can do everything on project_soil_types" ON project_soil_types;
DROP POLICY IF EXISTS "PM can manage their project soil types" ON project_soil_types;
DROP POLICY IF EXISTS "Crew can view assigned project soil types" ON project_soil_types;
DROP POLICY IF EXISTS "Service role bypasses RLS" ON project_soil_types;

-- Policy 1: Admin users can do everything
-- Admins have full access to all project soil types
CREATE POLICY "Admin can do everything on project_soil_types"
ON project_soil_types
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
    AND users.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
    AND users.is_active = true
  )
);

-- Policy 2: PM can manage soil types for their projects
-- Project Managers can read, create, update, and delete soil types
-- for projects where they are the PM
CREATE POLICY "PM can manage their project soil types"
ON project_soil_types
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    JOIN projects ON projects.pm_user_id = users.id
    WHERE users.id = auth.uid()
    AND users.role = 'pm'
    AND users.is_active = true
    AND projects.id = project_soil_types.project_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    JOIN projects ON projects.pm_user_id = users.id
    WHERE users.id = auth.uid()
    AND users.role = 'pm'
    AND users.is_active = true
    AND projects.id = project_soil_types.project_id
  )
);

-- Policy 3: Crew members can view soil types for projects they are assigned to
-- Crew members have read-only access via crew assignments
CREATE POLICY "Crew can view assigned project soil types"
ON project_soil_types
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    JOIN crew_members ON crew_members.user_id = users.id
    JOIN crews ON crews.id = crew_members.crew_id
    WHERE users.id = auth.uid()
    AND users.is_active = true
    AND crews.project_id = project_soil_types.project_id
  )
);

-- Policy 4: Service role bypasses RLS
-- The service role key is used by API routes for administrative operations
-- This is necessary for operations that don't run in a user context
CREATE POLICY "Service role bypasses RLS"
ON project_soil_types
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  CASE
    WHEN length(qual::text) > 50 THEN substring(qual::text, 1, 47) || '...'
    ELSE qual::text
  END as using_clause
FROM pg_policies
WHERE tablename = 'project_soil_types'
ORDER BY policyname;

-- Test RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'project_soil_types';
