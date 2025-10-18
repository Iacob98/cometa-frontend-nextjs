-- Test SQL to check what columns exist in houses table and verify the update
-- Run this in Supabase SQL Editor

-- 1. Check current schema
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'houses'
ORDER BY ordinal_position;

-- 2. Check if the house exists
SELECT * FROM houses WHERE id = '6bacb092-62dc-40a1-ae68-4eae5fa9fae3';

-- 3. Try the update that's failing
UPDATE houses
SET
  street = 'dwawd',
  house_number = '22',
  planned_connection_date = '2025-10-09',
  notes = 'daw',
  status = 'planned',
  updated_at = now()
WHERE id = '6bacb092-62dc-40a1-ae68-4eae5fa9fae3'
RETURNING *;

-- 4. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'houses';

-- 5. Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'houses';
