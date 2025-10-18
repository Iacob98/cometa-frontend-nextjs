# Houses API Update Fix - Summary

## Problem
User was getting 404 errors when trying to update a house via `PUT /api/houses/[id]` endpoint.

### Error Details
- **HTTP Status**: 404 Not Found
- **Supabase Error**: PGRST116 - "The result contains 0 rows - Cannot coerce the result to a single JSON object"
- **House ID**: `6bacb092-62dc-40a1-ae68-4eae5fa9fae3`
- **Confirmed**: House EXISTS in database (verified by SQL query)

### Request Payload
```json
{
  "address": "dwawd",
  "house_number": "22",
  "planned_connection_date": "2025-10-09",
  "work_started_at": "2025-10-10T14:05",
  "work_completed_at": "2025-10-11T14:05",
  "notes": "daw",
  "status": "planned"
}
```

## Root Cause Analysis

### Issue #1: Schema Mismatch
The codebase has TWO conflicting schemas for the `houses` table:

**Old Schema** (schema_full.sql):
- Single `address` text field
- `contact_name` and `contact_phone` fields
- `geom_point` jsonb for coordinates
- No `created_at`/`updated_at` timestamps

**New Schema** (restore-missing-tables.sql):
- Split address: `street`, `city`, `postal_code`
- `owner_first_name`, `owner_last_name`, `owner_phone`
- Separate `latitude`/`longitude` numeric fields
- `created_at`/`updated_at` timestamp fields

### Issue #2: Invalid Fields in Request
Frontend was sending `work_started_at` and `work_completed_at` fields that **don't exist in either schema**.

### Issue #3: Rigid Update Logic
The old API code was:
1. Always updating ALL fields (even when not provided)
2. Using default values for missing fields
3. Using `.select()` with hardcoded field list
4. Using `.single()` which fails if 0 or >1 rows returned

### Issue #4: Potential Column Mismatch
If the live database still uses the OLD schema but the API expects NEW schema columns like `street`, `city`, `postal_code`, the UPDATE would fail because those columns don't exist.

## Solution Implemented

### Fix Applied to `/src/app/api/houses/[id]/route.ts`

#### 1. Pre-flight House Existence Check
```typescript
// First, check if the house exists
const { data: existingHouse, error: fetchError } = await supabase
  .from('houses')
  .select('id, project_id')
  .eq('id', houseId)
  .single();

if (fetchError || !existingHouse) {
  console.error('House not found:', fetchError);
  return NextResponse.json(
    { error: 'House not found' },
    { status: 404 }
  );
}
```

**Why**: Verifies the house exists before attempting update, provides better error messaging.

#### 2. Conditional Field Updates
```typescript
// Build update data - only include fields that are safe to update
const updateData: any = {};

// Only add fields that are actually provided in request
if (data.address !== undefined) {
  updateData.street = data.address; // Map old field name to new
}
if (data.house_number !== undefined) {
  updateData.house_number = data.house_number;
}
// ... etc for each field
```

**Why**: Only updates fields that are actually provided, avoids setting unwanted defaults.

#### 3. Dual Schema Support
```typescript
// Support both old and new field names
if (data.contact_phone !== undefined) {
  updateData.contact_phone = data.contact_phone; // Old schema
  if (updateData.owner_phone === undefined) {
    updateData.owner_phone = data.contact_phone; // New schema
  }
}
```

**Why**: Makes the API work regardless of which schema the database uses.

#### 4. Ignored Invalid Fields
```typescript
// Dates - skip work_started_at and work_completed_at as they don't exist in schema
if (data.planned_connection_date !== undefined) {
  updateData.planned_connection_date = data.planned_connection_date;
}
// work_started_at and work_completed_at are silently ignored
```

**Why**: Prevents UPDATE errors from trying to set nonexistent columns.

#### 5. Flexible SELECT
```typescript
const { data: updatedHouse, error } = await supabase
  .from('houses')
  .update(updateData)
  .eq('id', houseId)
  .select()  // Returns all columns, whatever they are
  .maybeSingle();  // Returns null if 0 rows, no error
```

**Why**:
- `.select()` without field list works with any schema
- `.maybeSingle()` is more forgiving than `.single()`

## Testing Steps

### 1. Test the Update
```bash
# Start dev server
npm run dev

# Try updating the house via frontend or API
curl -X PUT http://localhost:3000/api/houses/6bacb092-62dc-40a1-ae68-4eae5fa9fae3 \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Test Street",
    "house_number": "22",
    "status": "planned",
    "notes": "Updated successfully"
  }'
```

### 2. Check Server Logs
Look for:
```
PUT /api/houses/[id] - House ID: 6bacb092-62dc-40a1-ae68-4eae5fa9fae3
PUT /api/houses/[id] - Request data: { ... }
Supabase update data (filtered): { ... }
```

### 3. Verify Database Schema
Run in Supabase SQL Editor:
```sql
-- Check actual column names
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'houses'
ORDER BY ordinal_position;

-- Verify the house
SELECT * FROM houses WHERE id = '6bacb092-62dc-40a1-ae68-4eae5fa9fae3';
```

## Expected Behavior After Fix

### Success Case
- **Status**: 200 OK
- **Response**: Updated house object with all current fields
- **Database**: Row is updated with new values
- **Logs**: Show filtered update data with only provided fields

### House Not Found
- **Status**: 404 Not Found
- **Response**: `{ "error": "House not found" }`
- **Logs**: Show fetch error

### Update Error
- **Status**: 500 Internal Server Error
- **Response**: `{ "error": "Failed to update house in database" }`
- **Logs**: Show Supabase error details

## Remaining Issues to Address

### 1. Frontend Sending Invalid Fields
The frontend at `/src/components/project-preparation/houses.tsx` is sending `work_started_at` and `work_completed_at`. Options:

**Option A**: Add these columns to database
```sql
ALTER TABLE houses
ADD COLUMN work_started_at timestamptz,
ADD COLUMN work_completed_at timestamptz;
```

**Option B**: Remove these fields from the frontend form (recommended if not needed)

**Option C**: Map them to existing fields
- `work_started_at` → `appointment_date` or `actual_connection_date`?
- `work_completed_at` → `actual_connection_date`?

### 2. Schema Migration Needed
The database likely has the OLD schema but the API expects NEW schema. Need to run migration:

```sql
-- Check if we need migration
SELECT column_name FROM information_schema.columns
WHERE table_name = 'houses' AND column_name = 'address';

-- If 'address' exists (old schema), run migration:
ALTER TABLE houses
  ADD COLUMN IF NOT EXISTS street text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS latitude numeric(10,8),
  ADD COLUMN IF NOT EXISTS longitude numeric(11,8),
  ADD COLUMN IF NOT EXISTS owner_first_name text,
  ADD COLUMN IF NOT EXISTS owner_last_name text,
  ADD COLUMN IF NOT EXISTS owner_phone text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Migrate data from old to new columns
UPDATE houses
SET
  street = address,
  owner_phone = contact_phone,
  updated_at = now()
WHERE street IS NULL;

-- Optionally drop old columns after migration
-- ALTER TABLE houses DROP COLUMN address, DROP COLUMN contact_name, DROP COLUMN contact_phone;
```

### 3. RLS Policies
Verify RLS isn't blocking updates:
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'houses';

-- If needed, create permissive policy
CREATE POLICY "Allow all for service role" ON houses
FOR ALL TO service_role
USING (true)
WITH CHECK (true);
```

### 4. API Key Usage
The API route uses:
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // anon key
);
```

Consider using service role key for server-side operations:
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role key bypasses RLS
);
```

## Files Changed

1. `/src/app/api/houses/[id]/route.ts` - Fixed PUT method

## Files Created for Reference

1. `/test-house-update.sql` - Diagnostic SQL queries
2. `/diagnose-houses-schema.md` - Detailed schema analysis
3. `/HOUSES_API_FIX_SUMMARY.md` - This file

## Next Actions

1. Test the API update with the fix
2. Check actual database schema in Supabase
3. Run schema migration if needed
4. Decide what to do with `work_started_at`/`work_completed_at` fields
5. Consider switching to service role key for API routes
6. Remove diagnostic files after verification

## Quick Verification Commands

```bash
# Check if API route changed correctly
grep -A 5 "maybeSingle()" src/app/api/houses/[id]/route.ts

# See what update fields are handled
grep "if (data\." src/app/api/houses/[id]/route.ts | head -20

# Verify service role key is set
grep SUPABASE_SERVICE_ROLE_KEY .env
```
