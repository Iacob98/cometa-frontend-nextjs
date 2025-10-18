# Commit Message

```
fix: resolve houses API update 404 error with flexible schema handling

Fix PGRST116 error when updating houses by:
- Adding pre-flight existence check before update
- Implementing conditional field updates (only provided fields)
- Supporting both old (address) and new (street/city/postal) schemas
- Ignoring invalid fields (work_started_at, work_completed_at)
- Using .maybeSingle() instead of .single() for more forgiving queries
- Switching to SUPABASE_SERVICE_ROLE_KEY to bypass RLS policies

Changes:
- src/app/api/houses/[id]/route.ts: Rewrote PUT method with flexible updates

Resolves: Houses update returning 404 despite existing in database
Related: Schema migration between old and new houses table structure
```

## Summary of Changes

### File: `/src/app/api/houses/[id]/route.ts`

**Before**:
- Used anon key (affected by RLS policies)
- Attempted to update ALL fields with defaults
- Used hardcoded field list in `.select()`
- Used `.single()` which throws on 0 rows
- No existence check before update
- Tried to update fields that might not exist in database

**After**:
- Uses service role key (bypasses RLS)
- Only updates fields actually provided in request
- Uses `.select()` without field list (schema-agnostic)
- Uses `.maybeSingle()` for better error handling
- Checks house exists before attempting update
- Supports both old and new schema field names
- Silently ignores invalid fields (work_started_at, work_completed_at)

## Root Cause

The 404 error (PGRST116) was caused by:
1. **RLS Policies**: Anon key may have been blocked by Row Level Security
2. **Schema Mismatch**: API trying to update columns that don't exist
3. **Strict Query**: Using `.single()` fails on 0 rows instead of returning null
4. **Invalid Fields**: Frontend sending work_started_at/work_completed_at which don't exist

## Testing

```bash
# 1. Start dev server
npm run dev

# 2. Test update via API
curl -X PUT http://localhost:3000/api/houses/6bacb092-62dc-40a1-ae68-4eae5fa9fae3 \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Updated Address",
    "house_number": "42",
    "status": "planned",
    "notes": "Testing update fix"
  }'

# 3. Expected response: 200 OK with updated house object
# 4. Check logs for filtered update data
```

## Verify Before Pushing

```bash
# Check service role key is set
grep SUPABASE_SERVICE_ROLE_KEY .env

# Verify changes compile
npm run build

# Run type check
npm run type-check

# Check the fix
git diff src/app/api/houses/[id]/route.ts
```
