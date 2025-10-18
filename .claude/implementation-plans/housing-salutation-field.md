# Implementation Plan: Add Owner Salutation Field to Housing Units

**Created**: 2025-10-13
**Status**: Ready for Implementation
**Complexity**: Low
**Estimated Time**: 2-3 hours

---

## Requirement Analysis (97% Confidence)

### Confirmed Requirements

**Data Model**: Add `owner_salutation VARCHAR(10)` column to `housing_units` table (nullable/optional)

**Validation Logic**:
- Field is OPTIONAL by default
- Display "Keine Angabe" for NULL/empty values in UI
- **Conditional Validation**: IF any owner contact field (`owner_first_name`, `owner_last_name`, `owner_phone`) is filled, THEN `owner_salutation` becomes REQUIRED

**UI/UX**:
- Component: Dropdown select element
- Options: "Herr" and "Frau" (2 choices)
- Placement: Directly above `owner_first_name` field in the form
- Label: "Anrede" (Salutation)

---

## Current State Analysis

### Database Layer

**Current Table Structure** (from `schema_full.sql` and `init.sql`):
```sql
CREATE TABLE public.housing_units (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    address text NOT NULL,
    rooms_total integer NOT NULL,
    beds_total integer NOT NULL,
    rent_daily_eur numeric(10,2) NOT NULL,
    status text NOT NULL
);
```

**Missing Columns Identified**:
The current schema in `init.sql` is minimal. However, the API routes already reference additional columns that must exist in the actual Supabase database:
- `occupied_beds` (used in GET/POST/PUT routes)
- `advance_payment` (used in GET/POST/PUT routes)
- `check_in_date` (used in GET/POST/PUT routes)
- `check_out_date` (used in GET/POST/PUT routes)
- `owner_first_name` (used in GET/POST/PUT routes)
- `owner_last_name` (used in GET/POST/PUT routes)
- `owner_phone` (used in GET/POST/PUT routes)
- `created_at`, `updated_at` (used in GET/POST/PUT routes)

**Note**: These columns exist in Supabase but are missing from the local schema files. This indicates previous manual migrations were applied to Supabase but not documented in version-controlled SQL files.

**Issues Found**:
- Local schema files (`init.sql`, `schema_full.sql`) are outdated
- Need to add `owner_salutation` to Supabase database
- Need to update local schema files for future reference

---

### API Layer

**Affected Files**:
1. `/src/app/api/project-preparation/housing/route.ts` (GET/POST)
2. `/src/app/api/project-preparation/housing/[id]/route.ts` (PUT/DELETE)

**Current Zod Schemas**:

**CreateHousingUnitSchema** (Lines 10-27 in `route.ts`):
```typescript
const CreateHousingUnitSchema = z.object({
  project_id: z.string().uuid(),
  address: z.string().min(1, "Address is required"),
  rooms_total: z.number().int().positive("Number of rooms must be positive"),
  beds_total: z.number().int().positive("Number of beds must be positive"),
  occupied_beds: z.number().int().min(0, "Occupied beds cannot be negative").optional().default(0),
  rent_daily_eur: z.number().positive("Daily rent must be positive"),
  status: z.enum(['available', 'occupied', 'checked_out', 'maintenance']).default('available'),
  advance_payment: z.number().optional(),
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
  owner_first_name: z.string().optional(),
  owner_last_name: z.string().optional(),
  owner_phone: z.string().optional(),
}).refine((data) => data.occupied_beds <= data.beds_total, {
  message: "Occupied beds cannot exceed total beds",
  path: ["occupied_beds"],
});
```

**UpdateHousingUnitSchema** (Lines 10-31 in `[id]/route.ts`):
```typescript
const UpdateHousingUnitSchema = z.object({
  address: z.string().optional(),
  rooms_total: z.number().int().positive().optional(),
  beds_total: z.number().int().positive().optional(),
  occupied_beds: z.number().int().min(0).optional(),
  rent_daily_eur: z.number().positive().optional(),
  status: z.enum(['available', 'occupied', 'checked_out', 'maintenance']).optional(),
  advance_payment: z.number().optional(),
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
  owner_first_name: z.string().optional(),
  owner_last_name: z.string().optional(),
  owner_phone: z.string().optional(),
}).refine((data) => {
  if (data.occupied_beds !== undefined && data.beds_total !== undefined) {
    return data.occupied_beds <= data.beds_total;
  }
  return true;
}, {
  message: "Occupied beds cannot exceed total beds",
  path: ["occupied_beds"],
});
```

**Issues Found**:
- Missing `owner_salutation` field in both schemas
- Missing conditional validation: "If any owner field is filled, owner_salutation is required"
- GET endpoint needs to include `owner_salutation` in SELECT query
- POST/PUT endpoints need to handle `owner_salutation` in insert/update data

---

### Frontend Layer

**Affected Files**:
1. `/src/components/project-preparation/facilities-management.tsx` (lines 69-947)
2. `/src/hooks/use-housing-units.ts` (TypeScript interfaces)
3. `/src/types/project-preparation.ts` (if housing types are defined there)

**Current Housing Form State** (Lines 69-83):
```typescript
const [housingForm, setHousingForm] = useState({
  address: '',
  rooms_total: '',
  beds_total: '',
  occupied_beds: '0',
  rent_daily_eur: '',
  rent_period: 'daily', // daily or monthly
  advance_payment: '',
  check_in_date: '',
  check_out_date: '',
  status: 'available',
  owner_first_name: '',
  owner_last_name: '',
  owner_phone: '',
});
```

**Issues Found**:
- Missing `owner_salutation` in form state
- No dropdown field for salutation in form (should be before line 920: `owner_first_name`)
- No conditional validation logic in `handleHousingSubmit`
- Missing display of "Keine Angabe" for NULL salutation in housing table (lines 998-1018)

**TypeScript Interfaces** (`/src/hooks/use-housing-units.ts`):

Current `HousingUnit` interface (Lines 4-39):
```typescript
export interface HousingUnit {
  id: string;
  project_id: string;
  house_id?: string;
  unit_number?: string;
  unit_type: string;
  floor?: number;
  room_count?: number;
  area_sqm?: number;
  contact_person?: string;
  contact_phone?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  owner_phone?: string;
  // ... other fields
}
```

Current `CreateHousingUnitData` interface (Lines 41-55):
```typescript
export interface CreateHousingUnitData {
  project_id: string;
  address: string;
  rooms_total: number;
  beds_total: number;
  occupied_beds?: number;
  rent_daily_eur: number;
  status: string;
  advance_payment?: number;
  check_in_date?: string;
  check_out_date?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  owner_phone?: string;
}
```

**Issues Found**:
- Missing `owner_salutation?: string` in `HousingUnit` interface
- Missing `owner_salutation?: string` in `CreateHousingUnitData` interface
- Missing `owner_salutation?: string` in `UpdateHousingUnitData` interface

---

## Consistency Analysis

| Database Column | API Field | Frontend Property | Status | Action Required |
|----------------|-----------|-------------------|--------|-----------------|
| `owner_salutation` | N/A | N/A | Missing | ADD to all layers |
| `owner_first_name` | `owner_first_name` | `owner_first_name` | Exists | No change |
| `owner_last_name` | `owner_last_name` | `owner_last_name` | Exists | No change |
| `owner_phone` | `owner_phone` | `owner_phone` | Exists | No change |

**New Standardized Naming**: `owner_salutation` (snake_case in database, camelCase not used since we keep database naming)

---

## Detailed Implementation Plan

### Phase 1: Database Changes

#### Step 1.1: Create Migration SQL Script

**File**: `/database/migrations/003_add_housing_owner_salutation.sql`

```sql
-- =========================================
-- Add owner_salutation to housing_units
-- Migration: 003_add_housing_owner_salutation
-- Date: 2025-10-13
-- =========================================

-- Step 1: Add the new column (nullable/optional)
ALTER TABLE public.housing_units
ADD COLUMN IF NOT EXISTS owner_salutation VARCHAR(10);

-- Step 2: Add comment for documentation
COMMENT ON COLUMN public.housing_units.owner_salutation IS
'Owner salutation/title: Herr or Frau. Optional field. Required if any owner contact info is provided.';

-- Step 3: Create index for potential filtering (optional, for performance)
-- CREATE INDEX IF NOT EXISTS idx_housing_units_owner_salutation
-- ON public.housing_units(owner_salutation);

-- Verification query
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'housing_units'
  AND column_name = 'owner_salutation';

-- Expected result:
-- column_name        | data_type        | character_maximum_length | is_nullable
-- owner_salutation   | character varying| 10                       | YES

SELECT 'Migration 003 completed: owner_salutation added to housing_units' AS status;
```

#### Step 1.2: Backup Strategy

**Before Migration**:
```sql
-- Create backup of housing_units table
CREATE TABLE housing_units_backup_20251013 AS
SELECT * FROM public.housing_units;

-- Verify backup
SELECT COUNT(*) as total_records FROM housing_units_backup_20251013;
```

#### Step 1.3: Execute Migration

**Execution Steps**:
1. Open Supabase Dashboard: `https://supabase.com/dashboard/project/YOUR_PROJECT/sql`
2. Run backup SQL first
3. Run migration SQL
4. Verify column exists with verification query
5. Test with sample INSERT:

```sql
-- Test insert with new column
INSERT INTO public.housing_units (
    id,
    project_id,
    address,
    rooms_total,
    beds_total,
    rent_daily_eur,
    status,
    owner_salutation,
    owner_first_name,
    owner_last_name
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM projects LIMIT 1), -- use existing project
    'Test Street 123',
    3,
    6,
    50.00,
    'available',
    'Herr',
    'Max',
    'Mustermann'
) RETURNING id, owner_salutation, owner_first_name, owner_last_name;

-- Clean up test record
-- DELETE FROM public.housing_units WHERE address = 'Test Street 123';
```

#### Step 1.4: Rollback Procedure

```sql
-- Rollback: Remove the column
ALTER TABLE public.housing_units
DROP COLUMN IF EXISTS owner_salutation;

-- Restore from backup (if needed)
-- TRUNCATE TABLE public.housing_units;
-- INSERT INTO public.housing_units SELECT * FROM housing_units_backup_20251013;
```

---

### Phase 2: API Layer Updates

#### Step 2.1: Update POST Route (Create Housing)

**File**: `/src/app/api/project-preparation/housing/route.ts`

**Change 1**: Update Zod Schema (Lines 10-27)

```typescript
const CreateHousingUnitSchema = z.object({
  project_id: z.string().uuid(),
  address: z.string().min(1, "Address is required"),
  rooms_total: z.number().int().positive("Number of rooms must be positive"),
  beds_total: z.number().int().positive("Number of beds must be positive"),
  occupied_beds: z.number().int().min(0, "Occupied beds cannot be negative").optional().default(0),
  rent_daily_eur: z.number().positive("Daily rent must be positive"),
  status: z.enum(['available', 'occupied', 'checked_out', 'maintenance']).default('available'),
  advance_payment: z.number().optional(),
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
  owner_salutation: z.enum(['Herr', 'Frau']).optional(),  // ADD THIS LINE
  owner_first_name: z.string().optional(),
  owner_last_name: z.string().optional(),
  owner_phone: z.string().optional(),
}).refine((data) => data.occupied_beds <= data.beds_total, {
  message: "Occupied beds cannot exceed total beds",
  path: ["occupied_beds"],
}).refine((data) => {
  // ADD THIS REFINEMENT: Conditional validation for owner_salutation
  const hasOwnerInfo = data.owner_first_name || data.owner_last_name || data.owner_phone;
  if (hasOwnerInfo && !data.owner_salutation) {
    return false;
  }
  return true;
}, {
  message: "Owner salutation is required when owner contact information is provided",
  path: ["owner_salutation"],
});
```

**Change 2**: Update GET Query (Lines 42-64)

```typescript
// Fetch housing units from database
const { data: housingUnits, error } = await supabase
  .from('housing_units')
  .select(`
    id,
    project_id,
    address,
    rooms_total,
    beds_total,
    occupied_beds,
    rent_daily_eur,
    advance_payment,
    check_in_date,
    check_out_date,
    status,
    owner_salutation,          // ADD THIS LINE
    owner_first_name,
    owner_last_name,
    owner_phone,
    created_at,
    updated_at
  `)
  .eq('project_id', project_id)
  .not('address', 'is', null)
  .order('created_at', { ascending: false });
```

**Change 3**: Update POST Insert Data (Lines 118-132)

```typescript
// Use new rental housing columns directly
const insertData = {
  project_id: validatedData.project_id,
  address: validatedData.address,
  rooms_total: validatedData.rooms_total,
  beds_total: validatedData.beds_total,
  occupied_beds: validatedData.occupied_beds || 0,
  rent_daily_eur: validatedData.rent_daily_eur,
  status: validatedData.status,
  advance_payment: validatedData.advance_payment,
  check_in_date: validatedData.check_in_date,
  check_out_date: validatedData.check_out_date,
  owner_salutation: validatedData.owner_salutation,  // ADD THIS LINE
  owner_first_name: validatedData.owner_first_name,
  owner_last_name: validatedData.owner_last_name,
  owner_phone: validatedData.owner_phone,
};
```

**Change 4**: Update POST Response Select (Lines 138-155)

```typescript
// Create housing unit in database
const { data: housingUnit, error } = await supabase
  .from('housing_units')
  .insert([insertData])
  .select(`
    id,
    project_id,
    address,
    rooms_total,
    beds_total,
    occupied_beds,
    rent_daily_eur,
    advance_payment,
    check_in_date,
    check_out_date,
    status,
    owner_salutation,          // ADD THIS LINE
    owner_first_name,
    owner_last_name,
    owner_phone,
    created_at,
    updated_at
  `)
  .single();
```

#### Step 2.2: Update PUT Route (Update Housing)

**File**: `/src/app/api/project-preparation/housing/[id]/route.ts`

**Change 1**: Update Zod Schema (Lines 10-31)

```typescript
const UpdateHousingUnitSchema = z.object({
  address: z.string().optional(),
  rooms_total: z.number().int().positive().optional(),
  beds_total: z.number().int().positive().optional(),
  occupied_beds: z.number().int().min(0).optional(),
  rent_daily_eur: z.number().positive().optional(),
  status: z.enum(['available', 'occupied', 'checked_out', 'maintenance']).optional(),
  advance_payment: z.number().optional(),
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
  owner_salutation: z.enum(['Herr', 'Frau']).optional(),  // ADD THIS LINE
  owner_first_name: z.string().optional(),
  owner_last_name: z.string().optional(),
  owner_phone: z.string().optional(),
}).refine((data) => {
  if (data.occupied_beds !== undefined && data.beds_total !== undefined) {
    return data.occupied_beds <= data.beds_total;
  }
  return true;
}, {
  message: "Occupied beds cannot exceed total beds",
  path: ["occupied_beds"],
}).refine((data) => {
  // ADD THIS REFINEMENT: Conditional validation for owner_salutation
  const hasOwnerInfo = data.owner_first_name || data.owner_last_name || data.owner_phone;
  if (hasOwnerInfo && !data.owner_salutation) {
    return false;
  }
  return true;
}, {
  message: "Owner salutation is required when owner contact information is provided",
  path: ["owner_salutation"],
});
```

**Change 2**: Update Allowed Fields (Lines 77-82)

```typescript
// Build update data (only include provided fields)
const updateData: any = {};
const allowedFields = [
  'address', 'rooms_total', 'beds_total', 'occupied_beds', 'rent_daily_eur',
  'status', 'advance_payment', 'check_in_date', 'check_out_date',
  'owner_salutation',          // ADD THIS
  'owner_first_name', 'owner_last_name', 'owner_phone'
];
```

**Change 3**: Update PUT Response Select (Lines 101-122)

```typescript
// Update housing unit
const { data: updatedUnit, error } = await supabase
  .from("housing_units")
  .update(updateData)
  .eq("id", id)
  .select(`
    id,
    project_id,
    address,
    rooms_total,
    beds_total,
    rent_daily_eur,
    advance_payment,
    check_in_date,
    check_out_date,
    status,
    owner_salutation,          // ADD THIS LINE
    owner_first_name,
    owner_last_name,
    owner_phone,
    created_at,
    updated_at
  `)
  .single();
```

#### Step 2.3: API Testing Checklist

```bash
# Test 1: GET housing units - verify owner_salutation is returned
curl -X GET "http://localhost:3000/api/project-preparation/housing?project_id=YOUR_PROJECT_ID"
# Expected: Response includes owner_salutation field (null or 'Herr'/'Frau')

# Test 2: POST create housing WITHOUT salutation (should succeed, optional)
curl -X POST "http://localhost:3000/api/project-preparation/housing" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "YOUR_PROJECT_ID",
    "address": "Test Street 1",
    "rooms_total": 3,
    "beds_total": 6,
    "rent_daily_eur": 50.00,
    "status": "available"
  }'
# Expected: 201 Created, owner_salutation is null

# Test 3: POST create housing WITH owner info but NO salutation (should fail)
curl -X POST "http://localhost:3000/api/project-preparation/housing" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "YOUR_PROJECT_ID",
    "address": "Test Street 2",
    "rooms_total": 3,
    "beds_total": 6,
    "rent_daily_eur": 50.00,
    "status": "available",
    "owner_first_name": "Max"
  }'
# Expected: 400 Bad Request with validation error

# Test 4: POST create housing WITH salutation and owner info (should succeed)
curl -X POST "http://localhost:3000/api/project-preparation/housing" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "YOUR_PROJECT_ID",
    "address": "Test Street 3",
    "rooms_total": 3,
    "beds_total": 6,
    "rent_daily_eur": 50.00,
    "status": "available",
    "owner_salutation": "Herr",
    "owner_first_name": "Max",
    "owner_last_name": "Mustermann",
    "owner_phone": "+49123456789"
  }'
# Expected: 201 Created with all fields

# Test 5: PUT update housing - add owner info (should require salutation)
curl -X PUT "http://localhost:3000/api/project-preparation/housing/HOUSING_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "owner_first_name": "Maria"
  }'
# Expected: 400 Bad Request (salutation required when owner info present)

# Test 6: PUT update housing - valid salutation update
curl -X PUT "http://localhost:3000/api/project-preparation/housing/HOUSING_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "owner_salutation": "Frau",
    "owner_first_name": "Maria"
  }'
# Expected: 200 OK
```

---

### Phase 3: Frontend Updates

#### Step 3.1: Update TypeScript Interfaces

**File**: `/src/hooks/use-housing-units.ts`

**Change 1**: Update `HousingUnit` interface (Lines 4-39)

```typescript
export interface HousingUnit {
  id: string;
  project_id: string;
  house_id?: string;
  unit_number?: string;
  unit_type: string;
  floor?: number;
  room_count?: number;
  area_sqm?: number;
  contact_person?: string;
  contact_phone?: string;
  owner_salutation?: string;      // ADD THIS LINE
  owner_first_name?: string;
  owner_last_name?: string;
  owner_phone?: string;
  access_instructions?: string;
  installation_notes?: string;
  status: string;
  // Rental housing fields
  address?: string;
  rooms_total?: number;
  beds_total?: number;
  occupied_beds?: number;
  rent_daily_eur?: number;
  advance_payment?: number;
  check_in_date?: string;
  check_out_date?: string;
  created_at: string;
  updated_at: string;
  project_name?: string;
  project_city?: string;
  house_street?: string;
  house_city?: string;
  house_number?: string;
  postal_code?: string;
  full_address?: string;
}
```

**Change 2**: Update `CreateHousingUnitData` interface (Lines 41-55)

```typescript
export interface CreateHousingUnitData {
  project_id: string;
  address: string;
  rooms_total: number;
  beds_total: number;
  occupied_beds?: number;
  rent_daily_eur: number;
  status: string;
  advance_payment?: number;
  check_in_date?: string;
  check_out_date?: string;
  owner_salutation?: string;      // ADD THIS LINE
  owner_first_name?: string;
  owner_last_name?: string;
  owner_phone?: string;
}
```

**Change 3**: Update `UpdateHousingUnitData` interface (Lines 57-71)

```typescript
export interface UpdateHousingUnitData {
  id: string;
  address?: string;
  rooms_total?: number;
  beds_total?: number;
  occupied_beds?: number;
  rent_daily_eur?: number;
  status?: string;
  advance_payment?: number;
  check_in_date?: string;
  check_out_date?: string;
  owner_salutation?: string;      // ADD THIS LINE
  owner_first_name?: string;
  owner_last_name?: string;
  owner_phone?: string;
}
```

#### Step 3.2: Update Component Form State

**File**: `/src/components/project-preparation/facilities-management.tsx`

**Change 1**: Add to form state (Lines 69-83)

```typescript
const [housingForm, setHousingForm] = useState({
  address: '',
  rooms_total: '',
  beds_total: '',
  occupied_beds: '0',
  rent_daily_eur: '',
  rent_period: 'daily',
  advance_payment: '',
  check_in_date: '',
  check_out_date: '',
  status: 'available',
  owner_salutation: '',           // ADD THIS LINE
  owner_first_name: '',
  owner_last_name: '',
  owner_phone: '',
});
```

**Change 2**: Update form submission validation (Lines 158-228)

Add validation logic before the API call:

```typescript
const handleHousingSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!housingForm.address || !housingForm.rooms_total || !housingForm.beds_total || !housingForm.rent_daily_eur) {
    toast.error('Please fill in all required fields');
    return;
  }

  // ADD THIS VALIDATION BLOCK
  const hasOwnerInfo = housingForm.owner_first_name || housingForm.owner_last_name || housingForm.owner_phone;
  if (hasOwnerInfo && !housingForm.owner_salutation) {
    toast.error('Please select owner salutation when providing owner contact information');
    return;
  }

  try {
    const rentAmount = parseFloat(housingForm.rent_daily_eur);
    const dailyRate = housingForm.rent_period === 'monthly' ? rentAmount / 30 : rentAmount;

    if (editingHousingId) {
      await updateHousingMutation.mutateAsync({
        id: editingHousingId,
        address: housingForm.address,
        rooms_total: parseInt(housingForm.rooms_total),
        beds_total: parseInt(housingForm.beds_total),
        occupied_beds: parseInt(housingForm.occupied_beds || '0'),
        rent_daily_eur: dailyRate,
        status: housingForm.status,
        advance_payment: housingForm.advance_payment ? parseFloat(housingForm.advance_payment) : undefined,
        check_in_date: housingForm.check_in_date || undefined,
        check_out_date: housingForm.check_out_date || undefined,
        owner_salutation: housingForm.owner_salutation || undefined,  // ADD THIS LINE
        owner_first_name: housingForm.owner_first_name || undefined,
        owner_last_name: housingForm.owner_last_name || undefined,
        owner_phone: housingForm.owner_phone || undefined,
      });
      setEditingHousingId(null);
    } else {
      await createHousingMutation.mutateAsync({
        project_id: projectId,
        address: housingForm.address,
        rooms_total: parseInt(housingForm.rooms_total),
        beds_total: parseInt(housingForm.beds_total),
        occupied_beds: parseInt(housingForm.occupied_beds || '0'),
        rent_daily_eur: dailyRate,
        status: housingForm.status,
        advance_payment: housingForm.advance_payment ? parseFloat(housingForm.advance_payment) : undefined,
        check_in_date: housingForm.check_in_date || undefined,
        check_out_date: housingForm.check_out_date || undefined,
        owner_salutation: housingForm.owner_salutation || undefined,  // ADD THIS LINE
        owner_first_name: housingForm.owner_first_name || undefined,
        owner_last_name: housingForm.owner_last_name || undefined,
        owner_phone: housingForm.owner_phone || undefined,
      });
    }

    // Reset form
    setHousingForm({
      address: '',
      rooms_total: '',
      beds_total: '',
      occupied_beds: '0',
      rent_daily_eur: '',
      rent_period: 'daily',
      advance_payment: '',
      check_in_date: '',
      check_out_date: '',
      status: 'available',
      owner_salutation: '',         // ADD THIS LINE
      owner_first_name: '',
      owner_last_name: '',
      owner_phone: '',
    });
    setShowHousingForm(false);
  } catch (error) {
    // Error is handled by the mutation
  }
};
```

**Change 3**: Update `handleEditHousing` function (Lines 230-248)

```typescript
const handleEditHousing = (housing: any) => {
  setHousingForm({
    address: housing.address || '',
    rooms_total: housing.rooms_total ? housing.rooms_total.toString() : '',
    beds_total: housing.beds_total ? housing.beds_total.toString() : '',
    occupied_beds: housing.occupied_beds ? housing.occupied_beds.toString() : '0',
    rent_daily_eur: housing.rent_daily_eur ? housing.rent_daily_eur.toString() : '',
    rent_period: 'daily',
    advance_payment: housing.advance_payment ? housing.advance_payment.toString() : '',
    check_in_date: housing.check_in_date || '',
    check_out_date: housing.check_out_date || '',
    status: housing.status || 'available',
    owner_salutation: housing.owner_salutation || '',  // ADD THIS LINE
    owner_first_name: housing.owner_first_name || '',
    owner_last_name: housing.owner_last_name || '',
    owner_phone: housing.owner_phone || '',
  });
  setEditingHousingId(housing.id);
  setShowHousingForm(true);
};
```

**Change 4**: Update `handleCancelHousingEdit` function (Lines 260-278)

```typescript
const handleCancelHousingEdit = () => {
  setEditingHousingId(null);
  setHousingForm({
    address: '',
    rooms_total: '',
    beds_total: '',
    occupied_beds: '0',
    rent_daily_eur: '',
    rent_period: 'daily',
    advance_payment: '',
    check_in_date: '',
    check_out_date: '',
    status: 'available',
    owner_salutation: '',         // ADD THIS LINE
    owner_first_name: '',
    owner_last_name: '',
    owner_phone: '',
  });
  setShowHousingForm(false);
};
```

**Change 5**: Add dropdown field in form JSX (Insert BEFORE line 920: `owner_first_name`)

Location: Inside the "Owner Contact Information" section (after line 917)

```typescript
{/* Owner Contact Information */}
<div className="space-y-2 border-t pt-4">
  <h4 className="font-medium">Owner Contact Information</h4>
  <p className="text-sm text-muted-foreground">Contact details for the property owner</p>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* ADD THIS NEW FIELD - Owner Salutation Dropdown */}
  <div>
    <Label htmlFor="owner_salutation">
      Anrede
      {(housingForm.owner_first_name || housingForm.owner_last_name || housingForm.owner_phone) &&
        <span className="text-red-500 ml-1">*</span>
      }
    </Label>
    <Select
      value={housingForm.owner_salutation}
      onValueChange={(value) => setHousingForm(prev => ({ ...prev, owner_salutation: value }))}
    >
      <SelectTrigger id="owner_salutation">
        <SelectValue placeholder="Bitte wählen..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Herr">Herr</SelectItem>
        <SelectItem value="Frau">Frau</SelectItem>
      </SelectContent>
    </Select>
    {(housingForm.owner_first_name || housingForm.owner_last_name || housingForm.owner_phone) &&
     !housingForm.owner_salutation && (
      <p className="text-xs text-red-500 mt-1">
        Anrede ist erforderlich bei Kontaktangaben
      </p>
    )}
  </div>

  {/* Existing fields below */}
  <div>
    <Label htmlFor="owner_first_name">Owner First Name</Label>
    <Input
      id="owner_first_name"
      value={housingForm.owner_first_name}
      onChange={(e) => setHousingForm(prev => ({ ...prev, owner_first_name: e.target.value }))}
      placeholder="Max"
    />
  </div>
  {/* ... rest of owner fields ... */}
</div>
```

**Change 6**: Update housing display table (Lines 998-1018)

Modify the "Owner Contact" table cell to display salutation:

```typescript
<TableCell>
  {housing.owner_first_name || housing.owner_last_name ? (
    <div className="flex flex-col">
      <span className="text-sm">
        {/* ADD SALUTATION DISPLAY */}
        {housing.owner_salutation ? `${housing.owner_salutation} ` : ''}
        {[housing.owner_first_name, housing.owner_last_name]
          .filter(Boolean)
          .join(' ')}
      </span>
      {housing.owner_phone && (
        <span className="text-xs text-gray-500">{housing.owner_phone}</span>
      )}
      {/* ADD "Keine Angabe" for missing salutation when owner name exists */}
      {!housing.owner_salutation && (housing.owner_first_name || housing.owner_last_name) && (
        <span className="text-xs text-gray-400 italic">Anrede: Keine Angabe</span>
      )}
    </div>
  ) : (
    <span className="text-gray-400 text-sm">No contact</span>
  )}
</TableCell>
```

---

### Phase 4: Testing Strategy

#### Unit Tests

**File**: `/src/components/project-preparation/__tests__/facilities-management.test.tsx` (create if doesn't exist)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FacilitiesManagement from '../facilities-management';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('FacilitiesManagement - Owner Salutation', () => {
  it('should display salutation dropdown in housing form', () => {
    render(<FacilitiesManagement projectId="test-id" />, { wrapper });

    const addHousingButton = screen.getByText('Add Housing');
    fireEvent.click(addHousingButton);

    expect(screen.getByLabelText(/Anrede/i)).toBeInTheDocument();
  });

  it('should show validation error when owner info provided without salutation', async () => {
    render(<FacilitiesManagement projectId="test-id" />, { wrapper });

    const addHousingButton = screen.getByText('Add Housing');
    fireEvent.click(addHousingButton);

    // Fill owner name but not salutation
    const firstNameInput = screen.getByLabelText(/Owner First Name/i);
    fireEvent.change(firstNameInput, { target: { value: 'Max' } });

    const submitButton = screen.getByText('Add Housing Unit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Anrede ist erforderlich/i)).toBeInTheDocument();
    });
  });

  it('should display "Keine Angabe" for null salutation in table', () => {
    const mockHousing = {
      id: '1',
      owner_first_name: 'Max',
      owner_last_name: 'Mustermann',
      owner_salutation: null,
    };

    // Mock useHousingUnits hook to return test data
    // ... render with mock data

    expect(screen.getByText(/Keine Angabe/i)).toBeInTheDocument();
  });
});
```

#### Integration Tests

**Test Checklist**:

- [ ] **Test 1**: Create housing unit WITHOUT owner info and WITHOUT salutation
  - Expected: Success, salutation is NULL

- [ ] **Test 2**: Create housing unit WITH owner info and WITHOUT salutation
  - Expected: Validation error "Owner salutation is required when owner contact information is provided"

- [ ] **Test 3**: Create housing unit WITH owner info and WITH "Herr" salutation
  - Expected: Success, salutation saved as "Herr"

- [ ] **Test 4**: Create housing unit WITH owner info and WITH "Frau" salutation
  - Expected: Success, salutation saved as "Frau"

- [ ] **Test 5**: Update existing housing unit (no owner info) - add owner name but not salutation
  - Expected: Validation error

- [ ] **Test 6**: Update existing housing unit - add salutation and owner info together
  - Expected: Success

- [ ] **Test 7**: Display existing housing units with NULL salutation
  - Expected: Shows "Keine Angabe" in table

- [ ] **Test 8**: Display existing housing units with "Herr" salutation
  - Expected: Shows "Herr Max Mustermann" in table

- [ ] **Test 9**: Edit housing unit with existing salutation
  - Expected: Dropdown pre-fills with existing value

- [ ] **Test 10**: Clear owner info but leave salutation
  - Expected: Allowed (no validation error, salutation becomes optional)

#### E2E Tests (Playwright)

**File**: `/tests/e2e/housing-salutation.spec.ts` (create new)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Housing Unit Owner Salutation', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to project preparation
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@cometa.de');
    await page.fill('[name="pin"]', '1234');
    await page.click('button[type="submit"]');

    await page.goto('/dashboard/projects');
    await page.click('text=Test Project');
    await page.click('text=Facilities & Housing');
    await page.click('text=Housing');
  });

  test('should create housing unit with salutation', async ({ page }) => {
    await page.click('text=Add Housing');

    await page.fill('[name="address"]', 'Test Street 123');
    await page.fill('[name="rooms_total"]', '3');
    await page.fill('[name="beds_total"]', '6');
    await page.fill('[name="rent_daily_eur"]', '50');

    // Select salutation
    await page.click('[id="owner_salutation"]');
    await page.click('text=Herr');

    await page.fill('[name="owner_first_name"]', 'Max');
    await page.fill('[name="owner_last_name"]', 'Mustermann');

    await page.click('text=Add Housing Unit');

    // Verify success
    await expect(page.locator('text=Herr Max Mustermann')).toBeVisible();
  });

  test('should show validation error without salutation', async ({ page }) => {
    await page.click('text=Add Housing');

    await page.fill('[name="address"]', 'Test Street 456');
    await page.fill('[name="rooms_total"]', '2');
    await page.fill('[name="beds_total"]', '4');
    await page.fill('[name="rent_daily_eur"]', '40');

    // Don't select salutation
    await page.fill('[name="owner_first_name"]', 'Maria');

    await page.click('text=Add Housing Unit');

    // Verify validation error
    await expect(page.locator('text=Anrede ist erforderlich')).toBeVisible();
  });

  test('should display "Keine Angabe" for legacy records', async ({ page }) => {
    // Assuming there's a legacy record without salutation
    await expect(page.locator('text=Keine Angabe')).toBeVisible();
  });
});
```

---

### Phase 5: Deployment Sequence

#### Step 5.1: Pre-Deployment Checklist

- [ ] All code changes committed to `dev` branch
- [ ] Database migration SQL script prepared
- [ ] Backup SQL script prepared
- [ ] API tests passing locally
- [ ] Frontend builds without errors (`npm run build`)
- [ ] TypeScript type checks passing (`npm run type-check`)
- [ ] ESLint passing (`npm run lint`)

#### Step 5.2: Deployment Steps (Production)

**Order of Execution** (to minimize downtime):

1. **Database Migration** (5 minutes):
   ```sql
   -- Step 1: Create backup
   CREATE TABLE housing_units_backup_20251013 AS SELECT * FROM housing_units;

   -- Step 2: Add column
   ALTER TABLE housing_units ADD COLUMN owner_salutation VARCHAR(10);

   -- Step 3: Verify
   SELECT COUNT(*) FROM housing_units WHERE owner_salutation IS NOT NULL;
   ```

2. **Deploy Backend (API Routes)** (2 minutes):
   ```bash
   git checkout dev
   git pull origin dev
   npm run build
   # Deploy Next.js app (Vercel auto-deploy on push)
   git push origin dev
   ```

3. **Verify API Health** (1 minute):
   ```bash
   curl https://your-app.vercel.app/api/project-preparation/housing?project_id=TEST_ID
   # Check response includes owner_salutation field
   ```

4. **Deploy Frontend** (included in step 2 for Next.js)

5. **Post-Deployment Verification** (5 minutes):
   - Test creating housing unit in production UI
   - Verify validation works
   - Check existing housing units display correctly
   - Verify "Keine Angabe" shows for NULL salutations

#### Step 5.3: Rollback Procedures

**If deployment fails**:

1. **Rollback Database** (immediate):
   ```sql
   ALTER TABLE housing_units DROP COLUMN owner_salutation;
   ```

2. **Rollback Application** (2 minutes):
   ```bash
   git revert HEAD
   git push origin dev
   # Vercel will auto-redeploy previous version
   ```

3. **Restore Data** (if corruption occurred):
   ```sql
   TRUNCATE TABLE housing_units;
   INSERT INTO housing_units SELECT * FROM housing_units_backup_20251013;
   ```

#### Step 5.4: Post-Deployment Monitoring

**Metrics to Monitor** (first 24 hours):
- API error rate for `/api/project-preparation/housing` endpoints
- Validation error frequency
- User feedback on form usability
- Database query performance (check if indexes needed)

**Logging**:
```typescript
// Add to API routes for monitoring
console.log('[HOUSING-SALUTATION] Created with salutation:', data.owner_salutation);
console.log('[HOUSING-SALUTATION] Validation failed - missing salutation');
```

---

## Risk Assessment

### Complexity: **Low**

**Rationale**:
- Single column addition to database
- No complex business logic changes
- No data migration required (nullable column)
- Standard CRUD operation updates
- Simple dropdown UI component

### Breaking Changes: **No**

**Rationale**:
- New column is nullable (optional)
- Existing records work without modification
- API remains backward compatible (optional field)
- Frontend gracefully handles NULL values
- No changes to existing database constraints

### Affected Users: **Low Impact**

**User Groups Affected**:
1. **Project Managers**: Need to learn new optional field
2. **Admins**: Minimal training needed
3. **Data Entry Users**: Small form change

**Impact Level**: **Minor**
- Optional field, no workflow disruption
- Validation only triggers when user provides owner info
- Existing data remains valid

### Data Integrity Risks: **Very Low**

**Mitigations**:
1. Nullable column prevents data loss
2. Conditional validation ensures quality when used
3. No changes to existing data required
4. Rollback is simple (DROP COLUMN)

### Performance Impact: **Negligible**

**Analysis**:
- VARCHAR(10) column is minimal storage overhead
- No new indexes required (query performance unchanged)
- Validation runs in-memory (no database queries)
- SELECT queries add one small column

---

## Edge Cases & Considerations

### Edge Case 1: Existing Records with NULL Salutation

**Scenario**: User views housing unit created before this feature
**Expected**: Display "Keine Angabe" in table
**Handled**: Yes, in table cell rendering (Phase 3, Change 6)

### Edge Case 2: User Fills Owner Name Then Deletes It

**Scenario**: User types owner name, validation appears, then user clears name
**Expected**: Validation error disappears (salutation becomes optional again)
**Handled**: Yes, conditional validation checks current form state

### Edge Case 3: Update Request Removes All Owner Info

**Scenario**: PUT request sets `owner_first_name: null, owner_last_name: null, owner_phone: null` but keeps `owner_salutation: "Herr"`
**Expected**: Allowed (no error), salutation remains in database
**Handled**: Yes, validation only requires salutation when owner info is present

### Edge Case 4: Invalid Salutation Value

**Scenario**: User manually sends API request with `owner_salutation: "Dr."`
**Expected**: 400 Bad Request - Zod validation fails (only "Herr" or "Frau" allowed)
**Handled**: Yes, Zod enum validation in API

### Edge Case 5: Mixed Language Environments

**Scenario**: System locale changes, user sees English UI
**Expected**: Dropdown still shows "Herr" and "Frau" (German values stored in database)
**Handled**: Yes, values are German constants (not translated)
**Consideration**: Future i18n may need to translate display labels while keeping database values

### Edge Case 6: API Called Directly (Bypass Frontend)

**Scenario**: External system or script creates housing unit via API
**Expected**: Works with optional salutation, fails if owner info provided without salutation
**Handled**: Yes, API validation is independent of frontend

---

## Summary

### Changes Overview

**Database**: 1 new column (`owner_salutation VARCHAR(10)`)
**API Routes**: 2 files modified (GET/POST/PUT operations)
**Frontend**: 1 component modified, 3 TypeScript interfaces updated
**Tests**: 3 new test files recommended

### Implementation Time Estimate

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | Database Migration | 15 minutes |
| 2 | API Layer Updates | 45 minutes |
| 3 | Frontend Updates | 60 minutes |
| 4 | Testing | 30 minutes |
| 5 | Deployment | 15 minutes |
| **Total** | | **2 hours 45 minutes** |

### Success Criteria

- [ ] Database column `owner_salutation` exists and accepts NULL/"Herr"/"Frau"
- [ ] API GET returns `owner_salutation` field for all housing units
- [ ] API POST/PUT accepts optional `owner_salutation`
- [ ] API POST/PUT validates: salutation required when owner info present
- [ ] Frontend form displays dropdown above owner name fields
- [ ] Frontend form shows validation error when needed
- [ ] Frontend table displays salutation with owner name
- [ ] Frontend table shows "Keine Angabe" for NULL salutations
- [ ] All existing housing units work without modification
- [ ] No breaking changes to API or database

---

## Files Modified Summary

### Created Files
1. `/database/migrations/003_add_housing_owner_salutation.sql` - Database migration
2. `/src/components/project-preparation/__tests__/facilities-management.test.tsx` - Unit tests
3. `/tests/e2e/housing-salutation.spec.ts` - E2E tests

### Modified Files
1. `/src/app/api/project-preparation/housing/route.ts` - GET/POST endpoints
2. `/src/app/api/project-preparation/housing/[id]/route.ts` - PUT/DELETE endpoints
3. `/src/hooks/use-housing-units.ts` - TypeScript interfaces
4. `/src/components/project-preparation/facilities-management.tsx` - Form component
5. `/init.sql` - Update for future reference (optional)
6. `/schema_full.sql` - Update for future reference (optional)

---

## Next Steps After Implementation

1. **Documentation**: Update user manual with new salutation field
2. **Training**: Brief team on new optional field
3. **Monitoring**: Check API logs for validation errors (first week)
4. **Backfill** (optional): Script to add salutations to existing records:
   ```sql
   -- Optional: Add default salutation to existing records with owner names
   UPDATE housing_units
   SET owner_salutation = 'Herr'
   WHERE owner_first_name IS NOT NULL
     AND owner_salutation IS NULL;
   ```
5. **Future Enhancement**: Consider adding more salutation options if needed ("Dr.", "Prof.", etc.)

---

**END OF IMPLEMENTATION PLAN**

*This plan ensures zero ambiguity and provides a clear path from current state to desired state across database, API, and frontend layers.*
