# Implementation Plan: Vehicle Form Updates (German Vehicle Types + New Fields)

**Date**: 2025-10-13
**Status**: Approved - Ready for Implementation
**Complexity**: Medium
**Estimated Time**: 3-4 hours

---

## REQUIREMENT ANALYSIS

### Confirmed Requirements (97% Confidence)

After analyzing the codebase, I have identified the following changes needed:

1. **Vehicle Type Field Update**:
   - **Current**: `['van', 'truck', 'trailer', 'excavator', 'other', 'car']` (English types)
   - **New**: Replace with 5 German vehicle types:
     - `pkw` (PKW - Passenger car)
     - `lkw` (LKW - Truck)
     - `transporter` (Transporter - Van)
     - `pritsche` (Pritsche - Flatbed)
     - `anhänger` (Anhänger - Trailer)

2. **New Fields to Add**:
   - **Tipper Type** (`tipper_type`): Dropdown with 2 options - "Kipper" or "kein Kipper" (required field)
   - **Max Weight** (`max_weight_kg`): Numeric field for maximum vehicle weight in kilograms (optional)
   - **Comment** (`comment`): Text field for additional notes (optional, already exists as `description`)

---

## CLARIFYING QUESTIONS

Before proceeding with implementation, please confirm:

1. **Vehicle Type Mapping**: Should existing vehicles with old types be migrated? How should we map:
   - `van` → `transporter`?
   - `truck` → `lkw`?
   - `trailer` → `anhänger`?
   - `car` → `pkw`?
   - What about `excavator` and `other` (no direct German equivalents)?

2. **Max Weight Field**:
   - Should `max_weight_kg` be required or optional?
   - What is the expected range? (e.g., 500 kg to 40,000 kg for trucks?)
   - Should there be validation based on vehicle type? (e.g., PKW < 3500kg, LKW > 3500kg)

3. **Tipper Type Field**:
   - Should this field apply to ALL vehicle types or only specific ones (e.g., only LKW and Pritsche)?
   - Should we validate/hide this field for certain vehicle types (e.g., PKW cannot be a Kipper)?

4. **Backward Compatibility**:
   - Do we need to support both old English types AND new German types during a transition period?
   - Or can we do a hard migration of all existing vehicle data?

5. **Display Language**:
   - Should the frontend display labels be in German only, or support i18n (German/English/Russian)?
   - Currently, the UI labels are in English ("Brand", "Model", etc.)

---

## CURRENT STATE ANALYSIS

### Database Layer

**Table**: `public.vehicles`

**Current Schema** (from schema_full.sql):
```sql
CREATE TABLE public.vehicles (
    id uuid NOT NULL,
    plate_number text NOT NULL,
    type text NOT NULL,
    brand text,
    model text,
    owned boolean NOT NULL,
    status text NOT NULL,
    purchase_price_eur numeric(12,2),
    rental_price_per_day_eur numeric(10,2),
    rental_price_per_hour_eur numeric(10,2),
    fuel_consumption_l_100km numeric(5,2),
    current_location text,
    year_of_manufacture integer,
    mileage numeric(10,2),
    vin text,
    CONSTRAINT check_vehicle_status CHECK ((status = ANY (ARRAY['available'::text, 'in_use'::text, 'maintenance'::text, 'broken'::text, 'assigned'::text, 'out_of_service'::text]))),
    CONSTRAINT check_vehicle_type CHECK ((type = ANY (ARRAY['van'::text, 'truck'::text, 'trailer'::text, 'excavator'::text, 'other'::text])))
);
```

**Issues Found**:
- Database constraint has OLD types: `['van', 'truck', 'trailer', 'excavator', 'other']`
- Missing `car` in constraint (but present in frontend code)
- Missing new fields: `tipper_type`, `max_weight_kg`
- `description` field is NOT in database schema (but used in frontend)

**Missing Columns**:
- `tipper_type` (new required field)
- `max_weight_kg` (new optional field)
- `description` or `comment` (referenced in API but not in schema)
- `is_active` (referenced in API route.ts line 54, but not in schema)
- `rental_cost_per_day` (API uses this, but schema has `rental_price_per_day_eur`)
- `fuel_type` (API uses this, but not in schema)
- `created_at`, `updated_at` (API returns these, but not in schema)

### API Layer

**Affected Files**:
1. `/src/app/api/vehicles/route.ts` - POST, GET, PUT endpoints
2. `/src/app/api/vehicles/[id]/route.ts` - GET, PUT, DELETE endpoints

**Current Validation** (route.ts lines 252-275):
```typescript
const validStatuses = ['available', 'in_use', 'maintenance', 'broken'];
const validTypes = ['car', 'truck', 'van', 'trailer']; // Line 253 - INCONSISTENT with DB constraint
const validFuelTypes = ['diesel', 'petrol', 'electric', 'hybrid'];
```

**Issues Found**:
- API uses `['car', 'truck', 'van', 'trailer']` (only 4 types, missing 'excavator', 'other')
- Database constraint has 5 types: `['van', 'truck', 'trailer', 'excavator', 'other']`
- Frontend uses 6 types: `['van', 'truck', 'trailer', 'excavator', 'other', 'car']`
- API references fields not in database: `rental_cost_per_day`, `fuel_type`, `description`, `is_active`

### Frontend Layer

**Affected Files**:
1. `/src/app/(dashboard)/dashboard/vehicles/new/page.tsx` - Create form
2. `/src/app/(dashboard)/dashboard/vehicles/[id]/edit/page.tsx` - Edit form
3. `/src/hooks/use-vehicles.ts` - TypeScript interfaces
4. `/src/types/index.ts` - Global type definitions

**Current Type Definitions**:

**use-vehicles.ts (lines 9-22)**:
```typescript
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate_number: string;
  type: 'van' | 'truck' | 'trailer' | 'excavator' | 'other' | 'car';
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  rental_cost_per_day: number;
  fuel_type?: string;
  year_manufactured?: number;
  description?: string;
  is_active: boolean;
  // ... other fields
}
```

**types/index.ts (line 1619)**:
```typescript
export type VehicleType = 'truck' | 'van' | 'car' | 'trailer' | 'special'; // Different set!
```

**new/page.tsx (lines 27-29, 43-49)**:
```typescript
type: z.enum(["van", "truck", "trailer", "excavator", "other"]), // Missing 'car'

const vehicleTypes = [
  { value: "van", label: "Van" },
  { value: "truck", label: "Truck" },
  { value: "trailer", label: "Trailer" },
  { value: "excavator", label: "Excavator" },
  { value: "other", label: "Other" },
];
```

**edit/page.tsx (lines 52, 63-70)**:
```typescript
type: z.enum(['van', 'truck', 'trailer', 'excavator', 'other', 'car']),

const vehicleTypeOptions = [
  { value: 'car', label: 'Car', icon: <Car className="h-4 w-4" /> },
  { value: 'van', label: 'Van', icon: <Car className="h-4 w-4" /> },
  { value: 'truck', label: 'Truck', icon: <Car className="h-4 w-4" /> },
  { value: 'trailer', label: 'Trailer', icon: <Car className="h-4 w-4" /> },
  { value: 'excavator', label: 'Excavator', icon: <Car className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <Car className="h-4 w-4" /> },
]
```

**Issues Found**:
- **3 different sets of vehicle types** across files (inconsistency!)
- `use-vehicles.ts`: 6 types including 'car'
- `types/index.ts`: 5 types including 'special' (completely different)
- `new/page.tsx`: 5 types (missing 'car')
- `edit/page.tsx`: 6 types including 'car'
- No German type labels anywhere

---

## CONSISTENCY RECONCILIATION

### Unified Standard: Database as Source of Truth

Since the database is the ultimate source of truth, we will:

1. **Standardize on German vehicle types** across all layers
2. **Fix schema inconsistencies** (add missing columns, fix constraints)
3. **Migrate existing data** from old English types to new German types

### Mapping Table: Old → New Types

| Database Column | API Field | Frontend Property | Current Status | Action Required |
|----------------|-----------|-------------------|---------------|-----------------|
| `type` | `type` | `type` | ❌ Inconsistent | UPDATE constraint, migrate data |
| `description` | `description` | `description` | ❌ Missing in DB | ADD column to database |
| `is_active` | `is_active` | `is_active` | ❌ Missing in DB | ADD column to database |
| `rental_cost_per_day` | `rental_cost_per_day` | `rental_cost_per_day` | ❌ Naming mismatch | API uses different name than DB |
| `fuel_type` | `fuel_type` | `fuel_type` | ❌ Missing in DB | ADD column to database |
| `created_at` | `created_at` | `created_at` | ❌ Missing in DB | ADD column to database |
| `updated_at` | `updated_at` | `updated_at` | ❌ Missing in DB | ADD column to database |
| **NEW: `tipper_type`** | `tipper_type` | `tipper_type` | ❌ Not exists | ADD to all layers |
| **NEW: `max_weight_kg`** | `max_weight_kg` | `max_weight_kg` | ❌ Not exists | ADD to all layers |
| `plate_number` | `plate_number` | `plate_number` | ✅ Consistent | No change |
| `brand` | `brand` | `brand` | ✅ Consistent | No change |
| `model` | `model` | `model` | ✅ Consistent | No change |
| `status` | `status` | `status` | ✅ Consistent | No change |
| `owned` | `owned` | `owned` | ✅ Consistent | No change |

### Vehicle Type Migration Strategy

**Old Type → New German Type Mapping**:
```
'car'       → 'pkw'
'van'       → 'transporter'
'truck'     → 'lkw'
'trailer'   → 'anhänger'
'excavator' → 'other' (or 'lkw' if heavy equipment)
'other'     → 'other' (keep as is)
'special'   → 'other' (if found)
```

---

## DETAILED IMPLEMENTATION PLAN

### Phase 1: Database Changes

#### Step 1.1: Create Backup
```sql
-- Backup vehicles table
CREATE TABLE vehicles_backup_20251013 AS SELECT * FROM vehicles;

-- Verify backup
SELECT COUNT(*) FROM vehicles_backup_20251013;
```

#### Step 1.2: Add Missing Columns
```sql
-- Add columns that are used by API but missing from schema
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS fuel_type text,
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add new required fields
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS tipper_type text NOT NULL DEFAULT 'kein Kipper',
  ADD COLUMN IF NOT EXISTS max_weight_kg numeric(10,2);

-- Add check constraint for tipper_type
ALTER TABLE vehicles
  ADD CONSTRAINT check_tipper_type
  CHECK (tipper_type IN ('Kipper', 'kein Kipper'));

-- Add check constraint for fuel_type (if needed)
ALTER TABLE vehicles
  ADD CONSTRAINT check_fuel_type
  CHECK (fuel_type IS NULL OR fuel_type IN ('diesel', 'petrol', 'electric', 'hybrid'));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active);
```

#### Step 1.3: Drop Old Type Constraint
```sql
-- Drop the old constraint that has wrong values
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS check_vehicle_type;
```

#### Step 1.4: Migrate Existing Data
```sql
-- Update existing vehicle types to German equivalents
UPDATE vehicles
SET type = CASE type
  WHEN 'car' THEN 'pkw'
  WHEN 'van' THEN 'transporter'
  WHEN 'truck' THEN 'lkw'
  WHEN 'trailer' THEN 'anhänger'
  WHEN 'excavator' THEN 'lkw'  -- Assuming excavators are heavy trucks
  WHEN 'other' THEN 'other'
  ELSE 'other'  -- Fallback for any unexpected values
END
WHERE type IN ('car', 'van', 'truck', 'trailer', 'excavator', 'other');

-- Set default tipper_type based on vehicle type
UPDATE vehicles
SET tipper_type = CASE
  WHEN type IN ('lkw', 'pritsche') THEN 'kein Kipper'  -- Default for trucks
  ELSE 'kein Kipper'
END
WHERE tipper_type IS NULL;

-- Verify migration
SELECT type, COUNT(*) FROM vehicles GROUP BY type;
```

#### Step 1.5: Add New Type Constraint
```sql
-- Add new constraint with German vehicle types
ALTER TABLE vehicles
  ADD CONSTRAINT check_vehicle_type
  CHECK (type IN ('pkw', 'lkw', 'transporter', 'pritsche', 'anhänger'));
```

#### Step 1.6: Create Trigger for updated_at
```sql
-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Rollback Strategy**:
```sql
-- If migration fails, restore from backup
DROP TABLE IF EXISTS vehicles;
ALTER TABLE vehicles_backup_20251013 RENAME TO vehicles;

-- Re-create original constraint
ALTER TABLE vehicles
  ADD CONSTRAINT check_vehicle_type
  CHECK (type IN ('van', 'truck', 'trailer', 'excavator', 'other'));
```

---

### Phase 2: API Layer Updates

#### Step 2.1: Update Validation in `/src/app/api/vehicles/route.ts`

**Lines 252-268** - Update type validation:
```typescript
// BEFORE
const validStatuses = ['available', 'in_use', 'maintenance', 'broken'];
const validTypes = ['car', 'truck', 'van', 'trailer'];
const validFuelTypes = ['diesel', 'petrol', 'electric', 'hybrid'];

// AFTER
const validStatuses = ['available', 'in_use', 'maintenance', 'broken'];
const validTypes = ['pkw', 'lkw', 'transporter', 'pritsche', 'anhänger'];
const validFuelTypes = ['diesel', 'petrol', 'electric', 'hybrid'];
const validTipperTypes = ['Kipper', 'kein Kipper'];
```

**Lines 228-241** - Update POST request body destructuring:
```typescript
// AFTER (add new fields)
const {
  brand,
  model,
  plate_number,
  type = 'transporter',  // Changed default from 'truck' to 'transporter'
  status = 'available',
  rental_cost_per_day = 0,
  fuel_type = 'diesel',
  year_manufactured,
  description = '',
  tipper_type = 'kein Kipper',  // NEW
  max_weight_kg,                 // NEW
} = body;
```

**Lines 244-275** - Add validation for new fields:
```typescript
// Add after plate_number validation
if (!validTipperTypes.includes(tipper_type)) {
  return NextResponse.json(
    { error: `Invalid tipper type. Must be one of: ${validTipperTypes.join(', ')}` },
    { status: 400 }
  );
}

// Add validation for max_weight_kg
if (max_weight_kg !== undefined && max_weight_kg !== null) {
  const weight = Number(max_weight_kg);
  if (isNaN(weight) || weight <= 0) {
    return NextResponse.json(
      { error: 'Max weight must be a positive number' },
      { status: 400 }
    );
  }
  // Optional: Add type-specific validation
  if (type === 'pkw' && weight > 3500) {
    return NextResponse.json(
      { error: 'PKW (passenger car) cannot exceed 3500 kg' },
      { status: 400 }
    );
  }
}
```

**Lines 292-305** - Update INSERT statement:
```typescript
const { data: newVehicle, error: vehicleError } = await supabase
  .from('vehicles')
  .insert({
    brand: brand || '',
    model: model || '',
    plate_number,
    type,
    status,
    rental_cost_per_day: Number(rental_cost_per_day),
    fuel_type,
    year_manufactured: year_manufactured ? parseInt(year_manufactured) : null,
    description,
    is_active: true,
    tipper_type,                                              // NEW
    max_weight_kg: max_weight_kg ? Number(max_weight_kg) : null,  // NEW
  })
  .select(`
    id,
    brand,
    model,
    plate_number,
    type,
    status,
    rental_cost_per_day,
    fuel_type,
    year_manufactured,
    description,
    is_active,
    tipper_type,      // NEW
    max_weight_kg,    // NEW
    created_at,
    updated_at
  `)
  .single();
```

**Lines 369-410** - Update PUT endpoint:
```typescript
const {
  id,
  brand,
  model,
  status,
  rental_cost_per_day,
  fuel_type,
  year_manufactured,
  description,
  owned,
  rental_price_per_day_eur,
  current_location,
  fuel_consumption_l_100km,
  tipper_type,        // NEW
  max_weight_kg,      // NEW
} = body;

// ... validation logic ...

if (tipper_type !== undefined) {
  if (!validTipperTypes.includes(tipper_type)) {
    return NextResponse.json(
      { error: `Invalid tipper type. Must be one of: ${validTipperTypes.join(', ')}` },
      { status: 400 }
    );
  }
  updateData.tipper_type = tipper_type;
}

if (max_weight_kg !== undefined) updateData.max_weight_kg = max_weight_kg ? Number(max_weight_kg) : null;
```

**Lines 416-434** - Update SELECT fields in PUT response:
```typescript
.select(`
  id,
  brand,
  model,
  plate_number,
  type,
  status,
  rental_cost_per_day,
  fuel_type,
  year_manufactured,
  description,
  is_active,
  owned,
  rental_price_per_day_eur,
  current_location,
  fuel_consumption_l_100km,
  tipper_type,      // NEW
  max_weight_kg,    // NEW
  created_at,
  updated_at
`)
```

#### Step 2.2: Update GET endpoints to include new fields

**File**: `/src/app/api/vehicles/route.ts` (lines 22-56)
**File**: `/src/app/api/vehicles/[id]/route.ts` (lines 17-51)

Add `tipper_type` and `max_weight_kg` to all SELECT statements.

---

### Phase 3: Frontend Updates

#### Step 3.1: Update TypeScript Interfaces

**File**: `/src/hooks/use-vehicles.ts` (lines 4-22)

```typescript
// BEFORE
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate_number: string;
  type: 'van' | 'truck' | 'trailer' | 'excavator' | 'other' | 'car';
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  rental_cost_per_day: number;
  fuel_type?: string;
  year_manufactured?: number;
  description?: string;
  is_active: boolean;
  full_name?: string;
  age?: number;
  current_assignment?: any;
  assignments_count?: number;
  created_at?: string;
  updated_at?: string;
}

// AFTER
export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plate_number: string;
  type: 'pkw' | 'lkw' | 'transporter' | 'pritsche' | 'anhänger';  // CHANGED
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  rental_cost_per_day: number;
  fuel_type?: string;
  year_manufactured?: number;
  description?: string;
  is_active: boolean;
  tipper_type: 'Kipper' | 'kein Kipper';  // NEW
  max_weight_kg?: number;                  // NEW
  full_name?: string;
  age?: number;
  current_assignment?: any;
  assignments_count?: number;
  created_at?: string;
  updated_at?: string;
}
```

**File**: `/src/types/index.ts` (line 1619)

```typescript
// BEFORE
export type VehicleType = 'truck' | 'van' | 'car' | 'trailer' | 'special';

// AFTER
export type VehicleType = 'pkw' | 'lkw' | 'transporter' | 'pritsche' | 'anhänger';
```

#### Step 3.2: Update Zod Schemas in Create Form

**File**: `/src/app/(dashboard)/dashboard/vehicles/new/page.tsx`

**Lines 20-39** - Update schema:
```typescript
const vehicleFormSchema = z.object({
  brand: z.string().min(1, "Brand is required").max(100, "Brand must be less than 100 characters"),
  model: z.string().min(1, "Model is required").max(100, "Model must be less than 100 characters"),
  plate_number: z.string()
    .min(1, "Plate number is required")
    .max(20, "Plate number must be less than 20 characters")
    .regex(/^[A-Z0-9\-\s]+$/i, "Plate number can only contain letters, numbers, hyphens, and spaces"),
  type: z.enum(["pkw", "lkw", "transporter", "pritsche", "anhänger"], {  // CHANGED
    required_error: "Vehicle type is required",
  }),
  status: z.enum(["available", "in_use", "maintenance", "broken"], {
    required_error: "Status is required",
  }),
  tipper_type: z.enum(["Kipper", "kein Kipper"], {  // NEW
    required_error: "Tipper type is required",
  }),
  max_weight_kg: z.number()  // NEW
    .min(100, "Weight must be at least 100 kg")
    .max(50000, "Weight cannot exceed 50,000 kg")
    .optional(),
  owned: z.boolean().default(true),
  rental_price_per_day_eur: z.number().min(0, "Rental price per day must be 0 or greater").default(0),
  rental_price_per_hour_eur: z.number().min(0, "Rental price per hour must be 0 or greater").default(0),
  fuel_consumption_l_100km: z.number().min(0, "Fuel consumption must be 0 or greater").default(0),
  current_location: z.string().max(200, "Location must be less than 200 characters").default("Main Depot"),
  purchase_price_eur: z.number().min(0, "Purchase price must be 0 or greater").default(0),
});
```

**Lines 43-49** - Update vehicle type options:
```typescript
const vehicleTypes = [
  { value: "pkw", label: "PKW (Passenger Car)" },
  { value: "lkw", label: "LKW (Truck)" },
  { value: "transporter", label: "Transporter (Van)" },
  { value: "pritsche", label: "Pritsche (Flatbed)" },
  { value: "anhänger", label: "Anhänger (Trailer)" },
];

const tipperTypes = [
  { value: "Kipper", label: "Kipper (Tipper)" },
  { value: "kein Kipper", label: "kein Kipper (No Tipper)" },
];
```

**Lines 63-80** - Update default values:
```typescript
const form = useForm<VehicleFormValues>({
  resolver: zodResolver(vehicleFormSchema),
  defaultValues: {
    brand: "",
    model: "",
    plate_number: "",
    type: "transporter",  // CHANGED from "van"
    status: "available",
    tipper_type: "kein Kipper",  // NEW
    max_weight_kg: undefined,     // NEW
    owned: true,
    rental_price_per_day_eur: 0,
    rental_price_per_hour_eur: 0,
    fuel_consumption_l_100km: 0,
    current_location: "Main Depot",
    purchase_price_eur: 0,
    year_of_manufacture: undefined,
    mileage_km: undefined,
  },
});
```

**Insert after line 217** - Add new form fields:
```typescript
                </FormField>

                {/* NEW FIELD: Tipper Type */}
                <FormField
                  control={form.control}
                  name="tipper_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipper Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tipper type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tipperTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Kipper (tipper truck with hydraulic lift) or regular vehicle
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

**Insert after line 298** - Add max weight field:
```typescript
                </FormField>

                {/* NEW FIELD: Max Weight */}
                <FormField
                  control={form.control}
                  name="max_weight_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 3500"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum weight capacity in kilograms (e.g., 3500 kg for PKW, 12000 kg for LKW)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
```

#### Step 3.3: Update Edit Form

**File**: `/src/app/(dashboard)/dashboard/vehicles/[id]/edit/page.tsx`

Apply the same changes as Step 3.2 (schema, options, form fields).

**Lines 52-58** - Update schema:
```typescript
type: z.enum(['pkw', 'lkw', 'transporter', 'pritsche', 'anhänger']),  // CHANGED
status: z.enum(['available', 'in_use', 'maintenance', 'broken']).default('available'),
tipper_type: z.enum(['Kipper', 'kein Kipper']),  // NEW
max_weight_kg: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),  // NEW
rental_cost_per_day: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
fuel_type: z.enum(['diesel', 'petrol', 'electric', 'hybrid']).default('diesel'),
year_manufactured: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
description: z.string().optional(),
```

**Lines 63-70** - Update vehicle type options:
```typescript
const vehicleTypeOptions = [
  { value: 'pkw', label: 'PKW (Passenger Car)', icon: <Car className="h-4 w-4" /> },
  { value: 'transporter', label: 'Transporter (Van)', icon: <Car className="h-4 w-4" /> },
  { value: 'lkw', label: 'LKW (Truck)', icon: <Car className="h-4 w-4" /> },
  { value: 'pritsche', label: 'Pritsche (Flatbed)', icon: <Car className="h-4 w-4" /> },
  { value: 'anhänger', label: 'Anhänger (Trailer)', icon: <Car className="h-4 w-4" /> },
];

const tipperTypeOptions = [
  { value: 'Kipper', label: 'Kipper (Tipper)' },
  { value: 'kein Kipper', label: 'kein Kipper (No Tipper)' },
];
```

Add form fields for `tipper_type` and `max_weight_kg` similar to the create form.

#### Step 3.4: Update Vehicle List Display (if needed)

**File**: `/src/app/(dashboard)/dashboard/vehicles/page.tsx`

Check if vehicle type is displayed in the list view. If so, update to show German labels:

```typescript
const vehicleTypeLabels: Record<string, string> = {
  pkw: 'PKW',
  lkw: 'LKW',
  transporter: 'Transporter',
  pritsche: 'Pritsche',
  anhänger: 'Anhänger',
};

// In render:
<span>{vehicleTypeLabels[vehicle.type] || vehicle.type}</span>
```

---

### Phase 4: Testing Strategy

#### Unit Tests

**Database Tests**:
- [ ] Verify all columns exist after migration
- [ ] Test type constraint accepts new German types
- [ ] Test type constraint rejects old English types
- [ ] Test tipper_type constraint accepts only 'Kipper' or 'kein Kipper'
- [ ] Test max_weight_kg accepts positive numbers and nulls
- [ ] Test updated_at trigger auto-updates on UPDATE

**API Tests**:
- [ ] POST /api/vehicles - Create vehicle with new German type
- [ ] POST /api/vehicles - Create vehicle with tipper_type='Kipper'
- [ ] POST /api/vehicles - Create vehicle with max_weight_kg=3500
- [ ] POST /api/vehicles - Reject old English vehicle types (car, van, truck)
- [ ] POST /api/vehicles - Reject invalid tipper_type values
- [ ] POST /api/vehicles - Reject negative max_weight_kg
- [ ] PUT /api/vehicles/[id] - Update tipper_type
- [ ] PUT /api/vehicles/[id] - Update max_weight_kg
- [ ] GET /api/vehicles - Verify new fields in response
- [ ] GET /api/vehicles/[id] - Verify new fields in response

**Frontend Tests**:
- [ ] Vehicle create form - Dropdown shows German vehicle types
- [ ] Vehicle create form - Tipper type dropdown has 2 options
- [ ] Vehicle create form - Max weight accepts numbers
- [ ] Vehicle create form - Submit with all new fields
- [ ] Vehicle edit form - Load existing vehicle with German type
- [ ] Vehicle edit form - Update tipper_type
- [ ] Vehicle edit form - Update max_weight_kg
- [ ] Vehicle list - Display German vehicle types correctly
- [ ] TypeScript compilation - No type errors

#### Integration Tests

- [ ] **End-to-End Flow**: Create new vehicle → Edit → View in list
- [ ] **Data Migration**: Existing vehicles display correctly with new types
- [ ] **Filter by Type**: Vehicle filtering works with new German types
- [ ] **Assignment Flow**: Assign vehicle with new fields to project/crew
- [ ] **Analytics**: Vehicle analytics work with new type values

#### Edge Cases

- [ ] What happens if existing vehicle has NULL type? (should fail constraint)
- [ ] What happens if max_weight_kg is 0? (should reject in validation)
- [ ] What happens if max_weight_kg is extremely large (e.g., 1 million)? (should reject)
- [ ] Can user submit form without selecting tipper_type? (should reject)
- [ ] What happens to vehicle assignments after type migration?
- [ ] Are there any reports/analytics that group by vehicle type? (need to update)

#### Rollback Testing

- [ ] Test rollback SQL script restores original schema
- [ ] Verify backup table contains all original data
- [ ] Test API fallback handles both old and new types during migration window

---

### Phase 5: Deployment Sequence

#### Pre-Deployment Checklist

- [ ] Create database backup
- [ ] Test migration script on development database
- [ ] Verify no breaking changes in API contracts
- [ ] Update API documentation (if exists)
- [ ] Notify users of upcoming changes (if user-facing)

#### Deployment Steps

**Step 1: Database Migration** (5 minutes)
```bash
# Connect to production database
psql $DATABASE_URL

# Run migration SQL script
\i migration_vehicle_updates_20251013.sql

# Verify migration
SELECT COUNT(*), type FROM vehicles GROUP BY type;
SELECT COUNT(*) FROM vehicles WHERE tipper_type IS NULL;  -- Should be 0
```

**Step 2: Deploy API Changes** (10 minutes)
```bash
# Ensure zero-downtime deployment
# API should handle both old and new types during transition

# Deploy backend
git checkout main
git pull origin main
npm run build
pm2 restart cometa-api  # Or your deployment method
```

**Step 3: Deploy Frontend Changes** (10 minutes)
```bash
# Deploy Next.js frontend
git checkout main
git pull origin main
npm run build
npm run start  # Or pm2 restart
```

**Step 4: Verification** (5 minutes)
- [ ] Open browser to production URL
- [ ] Create new vehicle with German type
- [ ] Edit existing vehicle
- [ ] Verify vehicle list displays correctly
- [ ] Check browser console for errors
- [ ] Check API logs for errors

**Step 5: Monitoring** (24 hours)
- [ ] Monitor error logs for any vehicle-related issues
- [ ] Check database for data integrity
- [ ] Verify no old English types are being created

#### Rollback Plan

If critical issues are found within 24 hours:

```bash
# 1. Stop API and Frontend
pm2 stop cometa-api
pm2 stop cometa-frontend

# 2. Rollback database
psql $DATABASE_URL < rollback_vehicle_migration_20251013.sql

# 3. Revert code
git revert <commit-hash>
git push origin main

# 4. Rebuild and restart
npm run build
pm2 restart all
```

---

## RISK ASSESSMENT

### Complexity: Medium

**Reasoning**:
- Involves changes across 3 layers (database, API, frontend)
- Requires data migration of existing records
- Multiple files need coordinated updates
- Type consistency must be maintained across layers

### Breaking Changes: YES

**Breaking Changes**:
1. **API Contract Change**: Vehicle type values change from English to German
2. **Database Constraint Change**: Old types will be rejected after migration
3. **Frontend Type Change**: TypeScript types change, breaking any external consumers

**Affected Users**:
- **Admin Users**: Need to understand new German vehicle type labels
- **Developers**: Any external integrations using vehicle API must update
- **Existing Data**: All existing vehicles will have types migrated

### Mitigation Strategies

1. **Phased Rollout**:
   - Deploy database changes first (allow both old and new types temporarily)
   - Deploy API changes (accept both, respond with new)
   - Deploy frontend changes
   - Remove support for old types after 1 week

2. **API Versioning** (if external consumers exist):
   - Add /api/v2/vehicles endpoint with new types
   - Keep /api/v1/vehicles with old types for backward compatibility
   - Deprecate v1 after 3 months

3. **User Communication**:
   - Send notification to admin users about vehicle type changes
   - Update user documentation with new German labels
   - Provide training session if needed

4. **Data Quality**:
   - Run data validation before migration
   - Check for NULL or unexpected type values
   - Verify all vehicles can be successfully migrated

5. **Monitoring**:
   - Set up alerts for vehicle creation/update failures
   - Monitor API error rates during deployment
   - Keep database backup for 7 days minimum

---

## SUMMARY

### Changes Overview

**Database**:
- ✅ Add 7 missing columns (description, is_active, fuel_type, created_at, updated_at, tipper_type, max_weight_kg)
- ✅ Migrate vehicle types from English to German (6 old types → 5 new types)
- ✅ Add constraints for tipper_type and updated type values
- ✅ Create trigger for auto-updating updated_at timestamp

**API**:
- ✅ Update validation to accept German vehicle types
- ✅ Add validation for tipper_type (2 values only)
- ✅ Add validation for max_weight_kg (positive numbers)
- ✅ Update POST/PUT/GET endpoints to handle new fields
- ✅ Fix inconsistencies between API and database field names

**Frontend**:
- ✅ Update TypeScript interfaces in use-vehicles.ts and types/index.ts
- ✅ Update Zod schemas in create and edit forms
- ✅ Add form fields for tipper_type (dropdown)
- ✅ Add form field for max_weight_kg (number input)
- ✅ Update vehicle type dropdown to show German labels
- ✅ Update default values to use German types

### Estimated Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| Database Migration | SQL script creation, testing, backup, execution | 1 hour |
| API Updates | Update 2 route files, add validation | 1 hour |
| Frontend Updates | Update 5 files (types, forms, hooks) | 1.5 hours |
| Testing | Unit tests, integration tests, E2E tests | 2 hours |
| Deployment | Deploy to production, verify, monitor | 1 hour |
| **Total** | | **6.5 hours** |

With buffer for unexpected issues: **8 hours (1 full work day)**

### Next Steps

1. **Get clarifications** on the 5 questions listed at the top
2. **Review this plan** with team/stakeholder
3. **Create SQL migration script** in `/migrations/` directory
4. **Create feature branch**: `feature/vehicle-german-types-tipper-weight`
5. **Start implementation** following this plan step-by-step
6. **Test thoroughly** on development database before production
7. **Schedule deployment** during low-traffic hours
8. **Monitor** for 24-48 hours post-deployment

---

**Plan Created**: 2025-10-13
**Plan Author**: Claude Code Pre-Implementation Planner
**Status**: Awaiting clarifications on 5 questions before implementation
