# Houses Table Schema Diagnostic Report

## Problem
API update returning 404 (PGRST116 - 0 rows) when trying to update house ID: `6bacb092-62dc-40a1-ae68-4eae5fa9fae3`

## Root Cause Analysis

### 1. Schema Mismatch Issue
There are TWO different schemas for the `houses` table in the codebase:

#### OLD Schema (schema_full.sql - current live database?):
```sql
CREATE TABLE public.houses (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    cabinet_id uuid,
    address text NOT NULL,           -- Single address field
    house_number text,
    connection_type text NOT NULL,
    method text NOT NULL,
    status text,
    planned_length_m numeric(10,2),
    contact_name text,               -- Full name
    contact_phone text,
    contact_email text,
    appointment_date date,
    appointment_time text,
    notes text,
    geom_point jsonb                 -- GeoJSON for coordinates
);
```

#### NEW Schema (restore-missing-tables.sql - migration target):
```sql
CREATE TABLE IF NOT EXISTS public.houses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    house_number text,
    street text,                     -- Split address fields
    city text,
    postal_code text,
    latitude numeric(10,8),          -- Separate coordinate fields
    longitude numeric(11,8),
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_house_status CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text]))
);
```

### 2. Request Data Fields
The frontend is sending these fields:
```json
{
  "address": "dwawd",
  "house_number": "22",
  "planned_connection_date": "2025-10-09",
  "work_started_at": "2025-10-10T14:05",      // DOES NOT EXIST in any schema!
  "work_completed_at": "2025-10-11T14:05",    // DOES NOT EXIST in any schema!
  "notes": "daw",
  "status": "planned"
}
```

### 3. API Code Issues (BEFORE FIX)
The old code was:
1. Always setting ALL fields (even if not provided)
2. Using default values for missing fields
3. Trying to update fields that might not exist in the database
4. Using `.select()` with specific field list that might not match the schema

### 4. Why PGRST116 Error Occurs
Supabase PostgREST returns PGRST116 when:
- The UPDATE query affects 0 rows
- Possible causes:
  a) Row doesn't exist (but SQL query confirms it does)
  b) RLS policy blocks the update
  c) Column doesn't exist (PostgreSQL would error first)
  d) UPDATE sets nothing because all columns are invalid
  e) Transaction rollback due to constraint violation

## Solution Applied

### Fix #1: Conditional Field Updates
Changed from "always update all fields" to "only update provided fields":

```typescript
// OLD (WRONG):
const updateData: any = {
  street,
  city,
  postal_code,
  house_number: data.house_number || null,  // Always sets
  apartment_count: data.apartment_count || 1,  // Always defaults to 1
  // ... etc
};

// NEW (CORRECT):
const updateData: any = {
  updated_at: new Date().toISOString()
};

if (data.house_number !== undefined) {
  updateData.house_number = data.house_number || null;  // Only if provided
}
// ... etc for all fields
```

### Fix #2: Flexible SELECT
Changed from specific field list to `.select()` without fields:

```typescript
// OLD:
.select(`id, project_id, street, city, ...`) // Might fail if columns don't exist

// NEW:
.select() // Returns all available columns
```

## Remaining Issues to Check

### 1. Actual Database Schema
Need to verify which schema is actually live in Supabase:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'houses'
ORDER BY ordinal_position;
```

### 2. RLS Policies
Check if RLS is blocking updates:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'houses';
```

### 3. Missing Fields in Frontend
The frontend sends `work_started_at` and `work_completed_at` but:
- These fields don't exist in ANY database schema
- The API doesn't handle them
- They should probably map to something else or be removed

## Next Steps

1. Run diagnostic SQL in Supabase to check actual schema
2. Verify RLS policies aren't blocking updates
3. Test the update with the fixed API code
4. Add migration if database has OLD schema but code expects NEW schema
5. Fix frontend to not send `work_started_at`/`work_completed_at` OR add columns to database

## Test Query
Run this in Supabase SQL Editor to test:

```sql
-- Check actual columns
\d houses

-- Try direct update
UPDATE houses
SET
  street = 'dwawd',
  house_number = '22',
  status = 'planned',
  notes = 'daw',
  updated_at = now()
WHERE id = '6bacb092-62dc-40a1-ae68-4eae5fa9fae3'
RETURNING *;
```

If the above SQL fails, the issue is the schema. If it works, the issue is RLS or API key permissions.
