# Housing Status Constraint Fix

**Date**: 2025-10-13
**Issue**: Housing units "Checked Out" status not working - returning 500 error

## Problem

When attempting to update a housing unit's status to "checked_out" via the Edit Housing Unit form, the API returned a 500 Internal Server Error.

**Error Details**:
- Endpoint: `PUT /api/project-preparation/housing/{id}`
- Status: 500 (Internal Server Error)
- Root Cause: Conflicting database constraints on `housing_units.status` column

## Root Cause Analysis

The `housing_units` table had **two conflicting CHECK constraints** for the `status` column:

1. **`check_unit_status`** (Legacy/Old constraint):
   - Allowed values: 'pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'available', 'occupied', 'maintenance'
   - Missing: 'checked_out'
   - This constraint was from the old cabinet/installation-focused housing units

2. **`housing_units_status_check`** (Rental housing constraint):
   - Allowed values: 'available', 'occupied', 'checked_out'
   - Missing: 'maintenance'
   - This constraint was added for rental housing but was incomplete

When attempting to set status to 'checked_out', the old `check_unit_status` constraint would reject the value, even though the API and frontend supported it.

## Solution

### Database Changes

Executed the following SQL commands on Supabase PostgreSQL database:

```sql
-- Drop old conflicting constraint
ALTER TABLE housing_units DROP CONSTRAINT IF EXISTS check_unit_status;

-- Drop the incomplete new constraint
ALTER TABLE housing_units DROP CONSTRAINT IF EXISTS housing_units_status_check;

-- Add proper constraint with all needed statuses
ALTER TABLE housing_units
ADD CONSTRAINT housing_units_status_check
CHECK (status IN ('available', 'occupied', 'checked_out', 'maintenance'));
```

### Final Status Values

The `housing_units.status` field now correctly supports:
- **`available`** - Housing unit is available for rental
- **`occupied`** - Housing unit is currently occupied
- **`checked_out`** - Workers have checked out / unit is vacated
- **`maintenance`** - Housing unit is under maintenance

These values align with the API validation (Zod schemas) in:
- `src/app/api/project-preparation/housing/route.ts` (POST)
- `src/app/api/project-preparation/housing/[id]/route.ts` (PUT)

## Testing

Successfully tested status update in database:

```sql
-- Test 1: Update to 'checked_out'
UPDATE housing_units
SET status = 'checked_out'
WHERE id = '6037f2dc-349b-446a-bea8-f0e3f432023d';
-- ✅ Success

-- Test 2: Restore to 'occupied'
UPDATE housing_units
SET status = 'occupied'
WHERE id = '6037f2dc-349b-446a-bea8-f0e3f432023d';
-- ✅ Success
```

## Impact

- **No API code changes required** - API was already correct
- **No frontend code changes required** - UI was already correct
- **Database only fix** - Removed conflicting constraint
- **All housing unit statuses now work correctly**

## Files Involved

- **Database**: `public.housing_units` table constraint
- **Related API files** (no changes needed):
  - `src/app/api/project-preparation/housing/route.ts`
  - `src/app/api/project-preparation/housing/[id]/route.ts`

## Verification

To verify the fix is working:

1. Navigate to: http://localhost:3000/dashboard/projects/{project_id}
2. Go to "Step 3: Facilities & Housing"
3. Click "Edit" on any housing unit
4. Change status to "Checked Out"
5. Save changes
6. ✅ Should save successfully without 500 error

## Related Tasks

This fix resolves the issue discovered after implementing the salutation field feature. The salutation field feature is tracked in:
- Implementation plan: `.claude/implementation-plans/housing-salutation-field.md`
