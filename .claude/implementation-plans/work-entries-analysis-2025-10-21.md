# Work Entries System - Comprehensive Analysis
**Date**: 2025-10-21
**Status**: Complete Analysis
**System**: COMETA Fiber Optic Construction Management

---

## Executive Summary

The Work Entries system is a **hybrid implementation** with significant **database-API-frontend inconsistencies**. The database schema uses one structure (from legacy Streamlit), while the API and frontend use a different structure (from Next.js migration). This creates a critical mismatch that needs resolution.

### Critical Findings

1. **SCHEMA MISMATCH**: Database has `work_entries` table but API expects different field names
2. **DUAL TYPE DEFINITIONS**: Work Entry types defined in TWO places with conflicting structures
3. **PHOTOS RELATIONSHIP**: Photo storage uses separate `photos` table (not JSONB array)
4. **MISSING DATE FIELD**: Database has `date` field but API uses `start_time`/`end_time`
5. **STATUS FIELD MISSING**: API uses `status` field not present in database schema
6. **APPROVED FIELD**: Database uses `approved` (boolean) but also has `approved_at` (timestamp)

---

## 1. DATABASE LAYER ANALYSIS

### Current Schema: `work_entries` Table

**Location**: `/home/iacob/Documents/cometa-frontend-nextjs/schema_full.sql`

```sql
CREATE TABLE public.work_entries (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    cabinet_id uuid,
    segment_id uuid,
    cut_id uuid,
    house_id uuid,
    crew_id uuid,
    user_id uuid,
    date date NOT NULL,                    -- ⚠️ API expects start_time/end_time
    stage_code text NOT NULL,
    meters_done_m numeric(10,2) NOT NULL,
    method text,                            -- ⚠️ CHECK constraint
    width_m numeric(6,3),
    depth_m numeric(6,3),
    cables_count integer,
    has_protection_pipe boolean,
    soil_type text,
    notes text,
    approved_by uuid,
    approved_at timestamp without time zone,
    approved boolean DEFAULT false,         -- ⚠️ API doesn't use this
    -- NO status field                     -- ⚠️ API expects status
    -- NO created_at/updated_at            -- ⚠️ API expects these

    CONSTRAINT check_meters_positive CHECK (meters_done_m >= 0),
    CONSTRAINT check_work_method CHECK (method IN (
        'mole', 'hand', 'excavator', 'trencher', 'documentation'
    ))
);
```

### Constraints

```sql
-- Primary Key
ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_pkey PRIMARY KEY (id);

-- Foreign Keys
ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_cabinet_id_fkey
    FOREIGN KEY (cabinet_id) REFERENCES public.cabinets(id);

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_segment_id_fkey
    FOREIGN KEY (segment_id) REFERENCES public.segments(id);

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_cut_id_fkey
    FOREIGN KEY (cut_id) REFERENCES public.cuts(id);

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_house_id_fkey
    FOREIGN KEY (house_id) REFERENCES public.houses(id);

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_crew_id_fkey
    FOREIGN KEY (crew_id) REFERENCES public.crews(id);

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE ONLY public.work_entries
    ADD CONSTRAINT work_entries_approved_by_fkey
    FOREIGN KEY (approved_by) REFERENCES public.users(id);
```

### Related Table: `photos`

```sql
CREATE TABLE public.photos (
    id uuid NOT NULL,
    work_entry_id uuid,                    -- ⚠️ Links to work_entries
    cut_stage_id uuid,
    url text NOT NULL,
    ts timestamp without time zone NOT NULL,
    gps_lat numeric(10,6),
    gps_lon numeric(10,6),
    author_user_id uuid,
    label text,                            -- before, during, after, instrument, other

    CONSTRAINT check_photo_label CHECK (label IN (
        'before', 'during', 'after', 'instrument', 'other'
    ))
);

-- Foreign Key
ALTER TABLE ONLY public.photos
    ADD CONSTRAINT photos_work_entry_id_fkey
    FOREIGN KEY (work_entry_id) REFERENCES public.work_entries(id) ON DELETE CASCADE;
```

### Database Indexes

**TODO**: Check if indexes exist for:
- `work_entries.project_id` (performance for filtering)
- `work_entries.user_id` (performance for "My Work" view)
- `work_entries.crew_id` (performance for crew-based queries)
- `work_entries.date` (performance for date range queries)
- `work_entries.approved` (performance for pending approvals)

---

## 2. API LAYER ANALYSIS

### API Route Structure

```
/home/iacob/Documents/cometa-frontend-nextjs/src/app/api/work-entries/
├── route.ts                    # GET (list), POST (create)
├── [id]/
│   ├── route.ts               # GET (detail), PUT (update), DELETE
│   └── approve/
│       └── route.ts           # POST (approve)
```

### API Route: GET /api/work-entries (List)

**File**: `/src/app/api/work-entries/route.ts`

**Query Parameters**:
- `page` (default: 1)
- `per_page` / `limit` (default: 20)
- `project_id` (filter)
- `user_id` (filter)
- `crew_id` (filter)
- `status` (filter) ⚠️ **NOT IN DATABASE**
- `work_type` (filter) ⚠️ **NOT IN DATABASE**

**Response Structure**:
```typescript
{
  items: WorkEntry[],
  total: number,
  page: number,
  per_page: number,
  total_pages: number
}
```

**Selected Fields** (from Supabase query):
```typescript
id, project_id, user_id, crew_id,
work_type,              // ⚠️ NOT IN DATABASE (should be stage_code)
description,            // ⚠️ NOT IN DATABASE
start_time,             // ⚠️ NOT IN DATABASE (database has 'date')
end_time,               // ⚠️ NOT IN DATABASE
duration_hours,         // ⚠️ NOT IN DATABASE
latitude,               // ⚠️ NOT IN DATABASE
longitude,              // ⚠️ NOT IN DATABASE
location_accuracy,      // ⚠️ NOT IN DATABASE
status,                 // ⚠️ NOT IN DATABASE
approved,               // ✅ EXISTS
approved_by,            // ✅ EXISTS
approved_at,            // ✅ EXISTS
photos,                 // ⚠️ WRONG (should query photos table, not JSONB)
notes,                  // ✅ EXISTS
created_at,             // ⚠️ NOT IN DATABASE
updated_at              // ⚠️ NOT IN DATABASE
```

### API Route: POST /api/work-entries (Create)

**Expected Request Body**:
```typescript
{
  project_id: string,       // ✅ MATCH
  user_id: string,          // ✅ MATCH
  crew_id?: string,         // ✅ MATCH
  work_type: string,        // ⚠️ MISMATCH (database: stage_code)
  description?: string,     // ⚠️ MISSING in database
  start_time: string,       // ⚠️ MISMATCH (database: date)
  end_time?: string,        // ⚠️ MISSING in database
  duration_hours?: number,  // ⚠️ MISSING in database
  latitude?: number,        // ⚠️ MISSING in database
  longitude?: number,       // ⚠️ MISSING in database
  location_accuracy?: number, // ⚠️ MISSING in database
  photos?: string[],        // ⚠️ WRONG (should insert to photos table)
  notes?: string,           // ✅ MATCH
  status?: string           // ⚠️ MISSING in database (default: 'submitted')
}
```

**Validation Issues**:
- Missing validation for `meters_done_m` (required in database)
- Missing validation for `stage_code` (required in database)
- No validation for allowed `method` values (CHECK constraint)

### API Route: GET /api/work-entries/[id] (Detail)

**Joins** (Supabase):
```typescript
project:projects(id, name, city)
user:users!work_entries_user_id_fkey(id, first_name, last_name, email)
crew:crews(id, name)
```

**Issues**:
- Queries non-existent fields (work_type, start_time, etc.)
- Doesn't join `photos` table (expects JSONB field)

### API Route: PUT /api/work-entries/[id] (Update)

**Updateable Fields**:
```typescript
work_type,              // ⚠️ NOT IN DATABASE
description,            // ⚠️ NOT IN DATABASE
start_time,             // ⚠️ NOT IN DATABASE
end_time,               // ⚠️ NOT IN DATABASE
duration_hours,         // ⚠️ NOT IN DATABASE
latitude,               // ⚠️ NOT IN DATABASE
longitude,              // ⚠️ NOT IN DATABASE
location_accuracy,      // ⚠️ NOT IN DATABASE
photos,                 // ⚠️ WRONG APPROACH
notes,                  // ✅ EXISTS
status,                 // ⚠️ NOT IN DATABASE
updated_at              // ⚠️ NOT IN DATABASE (but API sets it)
```

### API Route: POST /api/work-entries/[id]/approve

**Hardcoded User ID**:
```typescript
// TODO: Get current user ID from authentication
const currentUserId = 'admin-user-id'; // ⚠️ SECURITY ISSUE
```

**Update Logic**:
```typescript
{
  approved: true,         // ✅ EXISTS in database
  approved_by: userId,    // ✅ EXISTS
  approved_at: timestamp, // ✅ EXISTS
  updated_at: timestamp   // ⚠️ NOT IN DATABASE
}
```

---

## 3. FRONTEND LAYER ANALYSIS

### Page Routes

```
/home/iacob/Documents/cometa-frontend-nextjs/src/app/(dashboard)/dashboard/work-entries/
├── page.tsx              # List view (All, Pending, My Work tabs)
├── new/
│   └── page.tsx         # Create new work entry form
└── [id]/
    └── page.tsx         # Detail view (read-only)
```

### List Page Analysis

**File**: `/src/app/(dashboard)/dashboard/work-entries/page.tsx`

**Features**:
- Tabs: "All Work Entries", "Pending Approval", "My Work"
- Filters: Search, Stage, Approval Status
- Actions: View Details, Approve Entry (if permissions)
- Displays: Date, Worker, Stage, Project, Location, Status, Photos count

**Data Display Issues**:
```typescript
// Displaying non-existent fields
entry.user?.full_name      // ⚠️ Database has first_name + last_name separately
entry.photos?.length       // ⚠️ Should query photos table count
```

**Stage Labels** (Hardcoded):
```typescript
const stageLabels: Record<StageCode, string> = {
  stage_1_marking: "Marking",
  stage_2_excavation: "Excavation",
  stage_3_conduit: "Conduit Installation",
  stage_4_cable_pulling: "Cable Pulling",     // ⚠️ Database: stage_4_cable
  stage_5_closure: "Closure",                  // ⚠️ Database: stage_5_splice
  stage_6_testing: "Testing",                  // ⚠️ Database: stage_6_test
  stage_7_backfill: "Backfilling",            // ⚠️ Database: stage_7_connect (?)
  stage_8_restoration: "Surface Restoration",  // ⚠️ Database: stage_8_final (?)
  stage_9_documentation: "Documentation",      // ⚠️ Database: stage_9_backfill (?)
  stage_10_quality_check: "Quality Check",     // ⚠️ Database: stage_10_surface (?)
};
```

### Create Page Analysis

**File**: `/src/app/(dashboard)/dashboard/work-entries/new/page.tsx`

**Form Structure**:
- 4 Tabs: Basic Info, Measurements, Location, Notes & Photos
- Uses `react-hook-form` + Zod validation
- Dynamic fields based on selected stage

**Zod Schema**:
```typescript
const createWorkEntrySchema = z.object({
  project_id: z.string().min(1, "Project is required"),
  stage_code: z.enum([...]),           // ✅ MATCHES database
  meters_done_m: z.coerce.number().min(0), // ✅ MATCHES database
  method: z.enum(["manual", "machine", "mixed"]), // ⚠️ MISMATCH with CHECK constraint
  width_m: z.coerce.number().min(0).optional(),
  depth_m: z.coerce.number().min(0).optional(),
  cables_count: z.coerce.number().min(0).optional(),
  has_protection_pipe: z.boolean().optional(),
  soil_type: z.string().optional(),
  notes: z.string().optional(),
  cabinet_id: z.string().optional(),
  segment_id: z.string().optional(),
  cut_id: z.string().optional(),
  house_id: z.string().optional(),
  crew_id: z.string().optional(),
});
```

**Method Values Mismatch**:
- **Form**: "manual", "machine", "mixed"
- **Database**: "mole", "hand", "excavator", "trencher", "documentation"

**Missing Required Fields**:
- `user_id` (who created it - should be from auth context)
- `date` (when work was done - not captured in form!)

**Photo Upload**:
```typescript
// Currently disabled
<div className="rounded-md border border-dashed">
  <p>Photos can be uploaded after creating the work entry</p>
</div>
```

### Detail Page Analysis

**File**: `/src/app/(dashboard)/dashboard/work-entries/[id]/page.tsx`

**Display Issues**:
```typescript
// Accessing non-existent fields
workEntry.task              // ⚠️ Should be stage_code
workEntry.project_name      // ⚠️ Not in base query
workEntry.status            // ⚠️ NOT IN DATABASE
workEntry.method            // ✅ EXISTS
workEntry.meters_done       // ⚠️ Should be meters_done_m
workEntry.worker_name       // ⚠️ Should join user table
workEntry.worker_email      // ⚠️ Should join user table
workEntry.created_at        // ⚠️ NOT IN DATABASE
workEntry.updated_at        // ⚠️ NOT IN DATABASE
```

---

## 4. TYPE DEFINITIONS ANALYSIS

### Dual Type Definitions (CRITICAL ISSUE)

#### Type Set 1: `/src/types/index.ts`

```typescript
export interface WorkEntry {
  id: UUID;
  project_id: UUID;
  cabinet_id?: UUID;
  segment_id?: UUID;
  cut_id?: UUID;
  house_id?: UUID;
  crew_id?: UUID;
  user_id: UUID;
  date: string;                    // ✅ MATCHES database
  stage_code: StageCode;           // ✅ MATCHES database
  meters_done_m: number;           // ✅ MATCHES database
  method?: WorkMethod;             // ✅ MATCHES database
  width_m?: number;                // ✅ MATCHES database
  depth_m?: number;                // ✅ MATCHES database
  cables_count?: number;           // ✅ MATCHES database
  has_protection_pipe?: boolean;   // ✅ MATCHES database
  soil_type?: string;              // ✅ MATCHES database
  notes?: string;                  // ✅ MATCHES database
  approved_by?: UUID;              // ✅ MATCHES database
  approved_at?: string;            // ✅ MATCHES database
  user?: User;
  approver?: User;
  photos?: Photo[];                // ⚠️ Relationship to photos table
}

export type StageCode =
  | 'stage_1_marking'
  | 'stage_2_excavation'
  | 'stage_3_conduit'
  | 'stage_4_cable'        // ⚠️ Form uses "stage_4_cable_pulling"
  | 'stage_5_splice'       // ⚠️ Form uses "stage_5_closure"
  | 'stage_6_test'         // ⚠️ Form uses "stage_6_testing"
  | 'stage_7_connect'      // ⚠️ Form uses "stage_7_backfill"
  | 'stage_8_final'        // ⚠️ Form uses "stage_8_restoration"
  | 'stage_9_backfill'     // ⚠️ Form uses "stage_9_documentation"
  | 'stage_10_surface';    // ⚠️ Form uses "stage_10_quality_check"

export type WorkMethod = 'mole' | 'hand' | 'excavator' | 'trencher' | 'documentation';
```

#### Type Set 2: `/src/hooks/use-work-entries.ts`

```typescript
export interface WorkEntry {
  id: string;
  project_id: string;
  cabinet_id?: string | null;
  segment_id?: string | null;
  cut_id?: string | null;
  house_id?: string | null;
  crew_id?: string | null;
  user_id?: string | null;
  date: string;                        // ✅ MATCHES database
  stage_code: string;                  // ⚠️ Less strict than StageCode enum
  meters_done_m: number;               // ✅ MATCHES database
  method?: string | null;              // ⚠️ Less strict than WorkMethod enum
  width_m?: number | null;
  depth_m?: number | null;
  cables_count?: number | null;
  has_protection_pipe: boolean;
  soil_type?: string | null;
  notes?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  project_name?: string | null;       // ⚠️ Denormalized join data
  crew_name?: string | null;          // ⚠️ Denormalized join data
  worker_name?: string | null;        // ⚠️ Denormalized join data
  approver_name?: string | null;      // ⚠️ Denormalized join data
  cabinet_name?: string | null;       // ⚠️ Denormalized join data
  segment_name?: string | null;       // ⚠️ Denormalized join data
  cut_name?: string | null;           // ⚠️ Denormalized join data
  house_address?: string | null;      // ⚠️ Denormalized join data
}
```

#### Type Set 3: `/src/types/work-stages.ts`

```typescript
export interface WorkEntry {
  id: string;
  projectId: string;                   // ⚠️ camelCase (inconsistent)
  segmentId?: string;
  houseId?: string;
  stageCode: string;
  stageName: string;
  userId: string;
  teamId?: string;
  date: Date;                          // ⚠️ Date object (not string)
  startTime?: Date;                    // ⚠️ NOT IN DATABASE
  endTime?: Date;                      // ⚠️ NOT IN DATABASE
  metersStart?: number;                // ⚠️ NOT IN DATABASE
  metersEnd?: number;                  // ⚠️ NOT IN DATABASE
  metersDone: number;
  photos: WorkPhoto[];
  // ... and many more fields
}
```

---

## 5. CONSISTENCY RECONCILIATION

### Database ↔ API ↔ Frontend Field Mapping

| Database Column | API Field (Current) | Frontend Property | Status | Recommended Action |
|----------------|-------------------|------------------|--------|-------------------|
| `id` | `id` | `id` | ✅ CONSISTENT | Keep |
| `project_id` | `project_id` | `project_id` | ✅ CONSISTENT | Keep |
| `cabinet_id` | `cabinet_id` | `cabinet_id` | ✅ CONSISTENT | Keep |
| `segment_id` | `segment_id` | `segment_id` | ✅ CONSISTENT | Keep |
| `cut_id` | `cut_id` | `cut_id` | ✅ CONSISTENT | Keep |
| `house_id` | `house_id` | `house_id` | ✅ CONSISTENT | Keep |
| `crew_id` | `crew_id` | `crew_id` | ✅ CONSISTENT | Keep |
| `user_id` | `user_id` | `user_id` | ✅ CONSISTENT | Keep |
| `date` | `start_time` | `date` | ❌ MISMATCH | **Use `date` (database standard)** |
| N/A | `end_time` | N/A | ❌ MISSING | **Remove or add to database** |
| N/A | `duration_hours` | N/A | ❌ MISSING | **Remove (can calculate)** |
| `stage_code` | `work_type` | `stage_code` | ❌ MISMATCH | **Use `stage_code` (database standard)** |
| N/A | `description` | N/A | ❌ MISSING | **Remove or add to database** |
| `meters_done_m` | `meters_done_m` | `meters_done_m` | ✅ CONSISTENT | Keep |
| `method` | `method` | `method` | ⚠️ VALUE MISMATCH | **Fix allowed values** |
| `width_m` | `width_m` | `width_m` | ✅ CONSISTENT | Keep |
| `depth_m` | `depth_m` | `depth_m` | ✅ CONSISTENT | Keep |
| `cables_count` | `cables_count` | `cables_count` | ✅ CONSISTENT | Keep |
| `has_protection_pipe` | `has_protection_pipe` | `has_protection_pipe` | ✅ CONSISTENT | Keep |
| `soil_type` | `soil_type` | `soil_type` | ✅ CONSISTENT | Keep |
| `notes` | `notes` | `notes` | ✅ CONSISTENT | Keep |
| `approved_by` | `approved_by` | `approved_by` | ✅ CONSISTENT | Keep |
| `approved_at` | `approved_at` | `approved_at` | ✅ CONSISTENT | Keep |
| `approved` | `approved` | `approved` | ✅ CONSISTENT | Keep |
| N/A | `status` | `status` | ❌ MISSING | **Add to database or remove** |
| N/A | `latitude` | N/A | ❌ MISSING | **Use photos.gps_lat** |
| N/A | `longitude` | N/A | ❌ MISSING | **Use photos.gps_lon** |
| N/A | `location_accuracy` | N/A | ❌ MISSING | **Remove** |
| N/A (photos table) | `photos` (JSONB) | `photos` | ❌ WRONG APPROACH | **Query photos table** |
| N/A | `created_at` | `created_at` | ❌ MISSING | **Add to database** |
| N/A | `updated_at` | `updated_at` | ❌ MISSING | **Add to database** |

### StageCode Values Reconciliation

| Database Value | Form Value (New Entry) | Display Label (List) | Status | Recommended |
|---------------|----------------------|-------------------|--------|------------|
| `stage_1_marking` | `stage_1_marking` | "Marking" | ✅ CONSISTENT | Keep |
| `stage_2_excavation` | `stage_2_excavation` | "Excavation" | ✅ CONSISTENT | Keep |
| `stage_3_conduit` | `stage_3_conduit` | "Conduit Installation" | ✅ CONSISTENT | Keep |
| `stage_4_cable` | `stage_4_cable_pulling` | "Cable Pulling" | ❌ MISMATCH | **Use `stage_4_cable_pulling`** |
| `stage_5_splice` | `stage_5_closure` | "Closure" | ❌ MISMATCH | **Use `stage_5_closure`** |
| `stage_6_test` | `stage_6_testing` | "Testing" | ❌ MISMATCH | **Use `stage_6_testing`** |
| `stage_7_connect` | `stage_7_backfill` | "Backfilling" | ❌ MISMATCH | **Use `stage_7_backfill`** |
| `stage_8_final` | `stage_8_restoration` | "Surface Restoration" | ❌ MISMATCH | **Use `stage_8_restoration`** |
| `stage_9_backfill` | `stage_9_documentation` | "Documentation" | ❌ MISMATCH | **Use `stage_9_documentation`** |
| `stage_10_surface` | `stage_10_quality_check` | "Quality Check" | ❌ MISMATCH | **Use `stage_10_quality_check`** |

### WorkMethod Values Reconciliation

| Database Constraint | Form Values | Status | Recommended Action |
|-------------------|------------|--------|-------------------|
| `mole` | N/A | ❌ MISSING | Add to form |
| `hand` | `manual` | ❌ MISMATCH | **Use `hand`** or update constraint to `manual` |
| `excavator` | `machine` | ❌ PARTIAL | Map `machine` → `excavator` or allow both |
| `trencher` | N/A | ❌ MISSING | Add to form |
| `documentation` | N/A | ❌ MISSING | Add to form |
| N/A | `mixed` | ❌ MISSING | Add to constraint or remove from form |

---

## 6. IMPLEMENTATION PLAN

### Phase 1: Database Schema Updates

**Priority**: HIGH
**Risk**: Medium (requires migration)

#### Migration SQL Script

```sql
-- Add missing timestamp columns
ALTER TABLE work_entries
  ADD COLUMN created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Add status column (optional - decide if needed)
ALTER TABLE work_entries
  ADD COLUMN status TEXT DEFAULT 'submitted'
  CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'));

-- Update work method constraint to match form
ALTER TABLE work_entries
  DROP CONSTRAINT check_work_method;

ALTER TABLE work_entries
  ADD CONSTRAINT check_work_method
  CHECK (method IN ('mole', 'hand', 'excavator', 'trencher', 'documentation', 'mixed'));

-- Add indexes for performance
CREATE INDEX idx_work_entries_project_id ON work_entries(project_id);
CREATE INDEX idx_work_entries_user_id ON work_entries(user_id);
CREATE INDEX idx_work_entries_crew_id ON work_entries(crew_id);
CREATE INDEX idx_work_entries_date ON work_entries(date);
CREATE INDEX idx_work_entries_approved ON work_entries(approved) WHERE approved = false;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_work_entry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_entries_updated_at
  BEFORE UPDATE ON work_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_work_entry_timestamp();
```

#### Backfill Data

```sql
-- Set created_at for existing records (use date as approximation)
UPDATE work_entries
SET created_at = date::timestamp
WHERE created_at IS NULL;

-- Set updated_at for existing records
UPDATE work_entries
SET updated_at = COALESCE(approved_at, date::timestamp)
WHERE updated_at IS NULL;

-- Set status based on approval
UPDATE work_entries
SET status = CASE
  WHEN approved = true THEN 'approved'
  ELSE 'submitted'
END
WHERE status IS NULL;
```

### Phase 2: API Layer Fixes

**Priority**: HIGH
**Risk**: Low

#### Step 2.1: Fix GET /api/work-entries (List)

**File**: `/src/app/api/work-entries/route.ts`

**Changes**:
```typescript
// BEFORE
let query = supabase
  .from('work_entries')
  .select(`
    id, project_id, user_id, crew_id,
    work_type,              // ❌ REMOVE
    description,            // ❌ REMOVE
    start_time,             // ❌ REMOVE
    end_time,               // ❌ REMOVE
    duration_hours,         // ❌ REMOVE
    latitude,               // ❌ REMOVE
    longitude,              // ❌ REMOVE
    location_accuracy,      // ❌ REMOVE
    status, approved, approved_by, approved_at,
    photos,                 // ❌ WRONG
    notes, created_at, updated_at
  `, { count: 'exact' });

// AFTER
let query = supabase
  .from('work_entries')
  .select(`
    id, project_id, cabinet_id, segment_id, cut_id, house_id,
    crew_id, user_id, date,
    stage_code, meters_done_m, method,
    width_m, depth_m, cables_count, has_protection_pipe, soil_type,
    notes, approved, approved_by, approved_at,
    status, created_at, updated_at,
    user:users!work_entries_user_id_fkey(id, first_name, last_name, email),
    crew:crews(id, name),
    project:projects(id, name, city)
  `, { count: 'exact' });
```

#### Step 2.2: Fix POST /api/work-entries (Create)

**Changes**:
```typescript
// BEFORE
const {
  project_id, user_id, crew_id,
  work_type,              // ❌ REMOVE
  description,            // ❌ REMOVE
  start_time,             // ❌ REMOVE
  end_time,               // ❌ REMOVE
  duration_hours,         // ❌ REMOVE
  latitude,               // ❌ REMOVE
  longitude,              // ❌ REMOVE
  location_accuracy,      // ❌ REMOVE
  photos = [],            // ❌ HANDLE SEPARATELY
  notes, status = 'submitted'
} = body;

// AFTER
const {
  project_id, user_id, crew_id,
  cabinet_id, segment_id, cut_id, house_id,
  date,                   // ✅ ADD
  stage_code,             // ✅ ADD (was work_type)
  meters_done_m,          // ✅ ADD
  method, width_m, depth_m, cables_count,
  has_protection_pipe, soil_type, notes,
  status = 'submitted'
} = body;

// Validation
if (!project_id || !user_id || !date || !stage_code || meters_done_m == null) {
  return NextResponse.json(
    { error: 'Missing required fields: project_id, user_id, date, stage_code, meters_done_m' },
    { status: 400 }
  );
}
```

#### Step 2.3: Fix Photo Handling

**Option A**: Keep photos in separate table (RECOMMENDED)
```typescript
// After creating work entry
const workEntry = await supabase.from('work_entries').insert(...).single();

// Handle photo uploads separately
if (photoFiles && photoFiles.length > 0) {
  const photoInserts = photoFiles.map(photo => ({
    work_entry_id: workEntry.id,
    url: photo.url,
    ts: new Date().toISOString(),
    gps_lat: photo.gps_lat,
    gps_lon: photo.gps_lon,
    author_user_id: user_id,
    label: photo.label
  }));

  await supabase.from('photos').insert(photoInserts);
}
```

**Option B**: Add JSONB column (NOT RECOMMENDED)
- Requires altering table schema
- Less flexible for photo metadata
- Harder to query individual photos

### Phase 3: Frontend Fixes

**Priority**: MEDIUM
**Risk**: Low

#### Step 3.1: Fix Type Definitions

**File**: `/src/types/index.ts`

```typescript
// UNIFIED WorkEntry type
export interface WorkEntry {
  id: UUID;
  project_id: UUID;
  cabinet_id?: UUID;
  segment_id?: UUID;
  cut_id?: UUID;
  house_id?: UUID;
  crew_id?: UUID;
  user_id: UUID;
  date: string;                    // ISO date string (YYYY-MM-DD)
  stage_code: StageCode;
  meters_done_m: number;
  method?: WorkMethod;
  width_m?: number;
  depth_m?: number;
  cables_count?: number;
  has_protection_pipe?: boolean;
  soil_type?: string;
  notes?: string;
  approved?: boolean;
  approved_by?: UUID;
  approved_at?: string;            // ISO datetime string
  status?: WorkEntryStatus;        // NEW
  created_at?: string;             // NEW
  updated_at?: string;             // NEW

  // Relations (populated by joins)
  user?: User;
  crew?: Crew;
  project?: Project;
  approver?: User;
  photos?: Photo[];
}

export type StageCode =
  | 'stage_1_marking'
  | 'stage_2_excavation'
  | 'stage_3_conduit'
  | 'stage_4_cable_pulling'        // UPDATED
  | 'stage_5_closure'              // UPDATED
  | 'stage_6_testing'              // UPDATED
  | 'stage_7_backfill'             // UPDATED
  | 'stage_8_restoration'          // UPDATED
  | 'stage_9_documentation'        // UPDATED
  | 'stage_10_quality_check';      // UPDATED

export type WorkMethod =
  | 'mole'
  | 'hand'
  | 'excavator'
  | 'trencher'
  | 'documentation'
  | 'mixed';                       // ADDED

export type WorkEntryStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected';

export interface CreateWorkEntryRequest {
  project_id: UUID;
  cabinet_id?: UUID;
  segment_id?: UUID;
  cut_id?: UUID;
  house_id?: UUID;
  crew_id?: UUID;
  date: string;                    // ISO date string
  stage_code: StageCode;
  meters_done_m: number;
  method?: WorkMethod;
  width_m?: number;
  depth_m?: number;
  cables_count?: number;
  has_protection_pipe?: boolean;
  soil_type?: string;
  notes?: string;
}
```

#### Step 3.2: Remove Duplicate Types

**File**: `/src/hooks/use-work-entries.ts`

```typescript
// BEFORE: Local interface definition
export interface WorkEntry { ... }

// AFTER: Import from central types
import type {
  WorkEntry,
  WorkEntryFilters,
  CreateWorkEntryRequest
} from '@/types';
```

#### Step 3.3: Fix Create Form

**File**: `/src/app/(dashboard)/dashboard/work-entries/new/page.tsx`

```typescript
// Update Zod schema
const createWorkEntrySchema = z.object({
  project_id: z.string().min(1, "Project is required"),
  date: z.string().min(1, "Date is required"),  // ADD
  stage_code: z.enum([
    "stage_1_marking",
    "stage_2_excavation",
    "stage_3_conduit",
    "stage_4_cable_pulling",      // UPDATED
    "stage_5_closure",            // UPDATED
    "stage_6_testing",            // UPDATED
    "stage_7_backfill",           // UPDATED
    "stage_8_restoration",        // UPDATED
    "stage_9_documentation",      // UPDATED
    "stage_10_quality_check"      // UPDATED
  ]),
  meters_done_m: z.coerce.number().min(0, "Meters must be positive"),
  method: z.enum([
    "mole",                       // ADD
    "hand",                       // CHANGED from "manual"
    "excavator",                  // CHANGED from "machine"
    "trencher",                   // ADD
    "documentation",              // ADD
    "mixed"                       // KEEP
  ]).optional(),
  // ... rest of fields
});

// Update default values
const form = useForm<CreateWorkEntryFormData>({
  resolver: zodResolver(createWorkEntrySchema),
  defaultValues: {
    project_id: "",
    date: new Date().toISOString().split('T')[0], // TODAY'S DATE
    stage_code: "stage_1_marking",
    meters_done_m: 0,
    method: undefined,
    // ... rest
  },
});

// Add date field to form
<FormField
  control={form.control}
  name="date"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Work Date *</FormLabel>
      <FormControl>
        <Input
          type="date"
          {...field}
        />
      </FormControl>
      <FormDescription>
        Date when the work was performed
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

// Update method options
const methodOptions = [
  { value: "mole", label: "Mole" },
  { value: "hand", label: "Hand / Manual" },
  { value: "excavator", label: "Excavator" },
  { value: "trencher", label: "Trencher" },
  { value: "documentation", label: "Documentation" },
  { value: "mixed", label: "Mixed Methods" },
];

// Update onSubmit to get user_id from auth
const { user } = useAuth();

const onSubmit = async (data: CreateWorkEntryFormData) => {
  try {
    const workEntryData: CreateWorkEntryRequest = {
      ...data,
      user_id: user?.id,  // ADD from auth context
      // ... rest
    };

    const newWorkEntry = await createWorkEntry.mutateAsync(workEntryData);
    router.push(`/dashboard/work-entries/${newWorkEntry.id}`);
  } catch (error) {
    console.error("Failed to create work entry:", error);
  }
};
```

#### Step 3.4: Fix List Page Display

**File**: `/src/app/(dashboard)/dashboard/work-entries/page.tsx`

```typescript
// Update stage labels
const getStageLabel = (stageCode: StageCode) => {
  const stageLabels: Record<StageCode, string> = {
    stage_1_marking: "Marking",
    stage_2_excavation: "Excavation",
    stage_3_conduit: "Conduit Installation",
    stage_4_cable_pulling: "Cable Pulling",
    stage_5_closure: "Closure",
    stage_6_testing: "Testing",
    stage_7_backfill: "Backfilling",
    stage_8_restoration: "Surface Restoration",
    stage_9_documentation: "Documentation",
    stage_10_quality_check: "Quality Check",
  };
  return stageLabels[stageCode] || stageCode;
};

// Fix user name display
<span>
  {entry.user
    ? `${entry.user.first_name} ${entry.user.last_name}`
    : "Unknown"}
</span>

// Fix photo count (need to update API to include count)
<span>{entry.photo_count || 0}</span>
```

### Phase 4: Photo Upload Implementation

**Priority**: MEDIUM
**Risk**: Low

#### Create Photo Upload API Route

**File**: `/src/app/api/work-entries/[id]/photos/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workEntryId } = await params;
    const formData = await request.formData();
    const photos = formData.getAll('photos') as File[];
    const label = formData.get('label') as string || 'other';
    const gpsLat = formData.get('gps_lat') as string;
    const gpsLon = formData.get('gps_lon') as string;

    // TODO: Get current user from auth
    const userId = 'current-user-id';

    const uploadedPhotos = [];

    for (const photo of photos) {
      // Upload to Supabase Storage
      const fileName = `${workEntryId}/${Date.now()}-${photo.name}`;
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('work-photos')
        .upload(fileName, photo);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('work-photos')
        .getPublicUrl(fileName);

      // Insert photo record
      const { data: photoRecord, error: insertError } = await supabase
        .from('photos')
        .insert({
          work_entry_id: workEntryId,
          url: publicUrl,
          ts: new Date().toISOString(),
          gps_lat: gpsLat ? parseFloat(gpsLat) : null,
          gps_lon: gpsLon ? parseFloat(gpsLon) : null,
          author_user_id: userId,
          label
        })
        .select()
        .single();

      if (insertError) throw insertError;

      uploadedPhotos.push(photoRecord);
    }

    return NextResponse.json({
      message: 'Photos uploaded successfully',
      photos: uploadedPhotos
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workEntryId } = await params;

    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .eq('work_entry_id', workEntryId)
      .order('ts', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Photo fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
```

#### Update Work Entry API to Include Photo Count

```typescript
// In GET /api/work-entries
.select(`
  *,
  photo_count:photos(count)
`)
```

### Phase 5: Testing Strategy

**Priority**: HIGH
**Risk**: N/A

#### Unit Tests (Vitest)

**File**: `/src/hooks/__tests__/use-work-entries.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkEntries, useCreateWorkEntry } from '../use-work-entries';

describe('useWorkEntries', () => {
  it('fetches work entries with filters', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(
      () => useWorkEntries({ project_id: 'test-project' }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toBeDefined();
  });
});
```

#### Integration Tests

**Test Scenarios**:
1. Create work entry with all required fields
2. Create work entry with optional fields
3. Upload photos to work entry
4. Approve work entry
5. Filter work entries by project
6. Filter work entries by user
7. Filter work entries by approval status
8. Update work entry
9. Delete work entry
10. Handle validation errors

#### E2E Tests (Playwright)

**File**: `/e2e/work-entries.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('user can create a new work entry', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid="pin-input"]', '1234');
  await page.click('[data-testid="login-button"]');

  await page.goto('/dashboard/work-entries/new');

  // Fill form
  await page.selectOption('[name="project_id"]', 'test-project-id');
  await page.fill('[name="date"]', '2025-10-21');
  await page.selectOption('[name="stage_code"]', 'stage_2_excavation');
  await page.fill('[name="meters_done_m"]', '25.5');
  await page.selectOption('[name="method"]', 'excavator');

  // Submit
  await page.click('[type="submit"]');

  // Verify redirect to detail page
  await expect(page).toHaveURL(/\/dashboard\/work-entries\/[a-f0-9-]+/);

  // Verify data displayed
  await expect(page.locator('[data-testid="stage"]')).toContainText('Excavation');
  await expect(page.locator('[data-testid="meters"]')).toContainText('25.5');
});

test('manager can approve work entry', async ({ page }) => {
  // Login as manager
  await page.goto('/login');
  await page.fill('[data-testid="pin-input"]', '5678'); // Manager PIN
  await page.click('[data-testid="login-button"]');

  // Go to pending approvals
  await page.goto('/dashboard/work-entries');
  await page.click('[data-testid="tab-pending"]');

  // Approve first entry
  await page.click('[data-testid^="approve-button"]').first();

  // Verify approval
  await expect(page.locator('[data-testid^="status-approved"]').first()).toBeVisible();
});
```

### Phase 6: Deployment Sequence

**Priority**: HIGH
**Risk**: Medium

#### Step-by-Step Deployment

1. **Database Migration** (during maintenance window)
   ```bash
   # Connect to production database
   psql $DATABASE_URL

   # Run migration script
   \i migrations/add_work_entry_timestamps.sql

   # Verify changes
   \d work_entries
   SELECT * FROM work_entries LIMIT 1;
   ```

2. **Backend Deployment** (API routes)
   ```bash
   # Deploy updated API routes
   npm run build
   npm run deploy

   # Smoke test
   curl https://api.cometa.de/api/work-entries?page=1&per_page=5
   ```

3. **Frontend Deployment**
   ```bash
   # Build Next.js app
   npm run build

   # Deploy to Vercel/hosting
   vercel deploy --prod
   ```

4. **Verification Checklist**
   - [ ] Old work entries display correctly
   - [ ] New work entries can be created
   - [ ] Photos can be uploaded
   - [ ] Work entries can be approved
   - [ ] Filtering works correctly
   - [ ] Performance is acceptable

5. **Rollback Procedure** (if needed)
   ```sql
   -- Rollback database changes
   ALTER TABLE work_entries DROP COLUMN created_at;
   ALTER TABLE work_entries DROP COLUMN updated_at;
   ALTER TABLE work_entries DROP COLUMN status;

   -- Restore old constraint
   ALTER TABLE work_entries DROP CONSTRAINT check_work_method;
   ALTER TABLE work_entries ADD CONSTRAINT check_work_method
     CHECK (method IN ('mole', 'hand', 'excavator', 'trencher', 'documentation'));
   ```

---

## 7. RISK ASSESSMENT

### Breaking Changes

#### High Risk
1. **Database Schema Changes**
   - Impact: All queries will fail if not updated simultaneously
   - Mitigation: Deploy during maintenance window, test rollback procedure
   - Affected: All work entry operations

2. **StageCode Enum Changes**
   - Impact: Existing data may have old stage codes
   - Mitigation: Data migration script, backward compatibility layer
   - Affected: All work entry display, filtering, creation

#### Medium Risk
1. **API Response Structure Changes**
   - Impact: Frontend may break if API changes before frontend update
   - Mitigation: Deploy API and frontend together in single release
   - Affected: List, detail, create pages

2. **Type Definition Changes**
   - Impact: TypeScript compilation errors
   - Mitigation: Update all usages in single commit
   - Affected: All work entry components

#### Low Risk
1. **Photo Storage Changes**
   - Impact: Minimal (new feature enhancement)
   - Mitigation: Gradual rollout, optional feature
   - Affected: New work entries only

### Affected User Workflows

1. **Creating New Work Entry**
   - Current: Broken (missing required fields)
   - After Fix: Fully functional
   - User Impact: POSITIVE

2. **Viewing Work Entries**
   - Current: Works but shows incorrect data
   - After Fix: Shows correct data
   - User Impact: POSITIVE

3. **Approving Work Entries**
   - Current: Works but hardcoded user
   - After Fix: Uses authenticated user
   - User Impact: POSITIVE

4. **Uploading Photos**
   - Current: Disabled
   - After Fix: Fully functional
   - User Impact: POSITIVE (new feature)

### Complexity Estimation

| Task | Complexity | Estimated Time | Risk Level |
|------|-----------|---------------|-----------|
| Database Migration | Medium | 2 hours | High |
| API Route Updates | Low | 4 hours | Medium |
| Type Definition Cleanup | Low | 2 hours | Medium |
| Frontend Form Fixes | Medium | 6 hours | Low |
| Photo Upload Implementation | Medium | 8 hours | Low |
| Testing | High | 12 hours | Medium |
| Documentation | Low | 4 hours | Low |
| Deployment | Medium | 3 hours | High |
| **TOTAL** | **Medium-High** | **41 hours** | **Medium** |

### Mitigation Strategies

1. **Comprehensive Testing**
   - Unit tests for all hooks
   - Integration tests for API routes
   - E2E tests for critical user flows
   - Load testing for performance

2. **Gradual Rollout**
   - Deploy to staging environment first
   - Beta test with small user group
   - Monitor error rates and performance
   - Full production deployment after validation

3. **Monitoring & Alerting**
   - Set up error tracking (Sentry)
   - Monitor API response times
   - Track database query performance
   - Alert on high error rates

4. **Communication Plan**
   - Notify users of maintenance window
   - Provide release notes
   - Training for new photo upload feature
   - Support documentation updates

---

## 8. SUMMARY

### Current State

The Work Entries system is **partially broken** due to fundamental inconsistencies between database schema and API implementation. The system appears to be in a transitional state between legacy Streamlit structure and new Next.js structure, resulting in:

- **CREATE**: Broken (missing required fields, wrong field names)
- **READ LIST**: Partially working (displays incorrect data)
- **READ DETAIL**: Partially working (displays incorrect data)
- **UPDATE**: Untested (likely broken)
- **DELETE**: Working
- **APPROVE**: Partially working (hardcoded user ID)
- **PHOTOS**: Not implemented

### Required Changes

#### Database (3 changes)
1. Add `created_at`, `updated_at` columns
2. Add `status` column (optional)
3. Update `method` constraint to include "mixed"

#### API (5 routes to update)
1. GET /api/work-entries - Fix field names, add joins
2. POST /api/work-entries - Fix validation, field mapping
3. GET /api/work-entries/[id] - Fix field names, add joins
4. PUT /api/work-entries/[id] - Fix field names
5. POST /api/work-entries/[id]/approve - Fix authentication

#### Frontend (3 files to update)
1. `/src/types/index.ts` - Unify type definitions
2. `/src/app/(dashboard)/dashboard/work-entries/new/page.tsx` - Fix form
3. `/src/app/(dashboard)/dashboard/work-entries/page.tsx` - Fix display

#### New Implementation (1 feature)
1. Photo upload functionality

### Success Metrics

After implementation, the system should:
- ✅ Allow users to create work entries with all fields
- ✅ Display work entries with correct data
- ✅ Support photo uploads with GPS coordinates
- ✅ Track approval by authenticated users
- ✅ Filter work entries by multiple criteria
- ✅ Maintain data consistency across all layers
- ✅ Provide clear error messages for validation
- ✅ Support all 10 work stages
- ✅ Track all 6 work methods

### Next Steps

1. **Review & Approval**: Stakeholder review of this analysis
2. **Priority Decision**: Confirm Phase 1-6 priorities
3. **Resource Allocation**: Assign developer(s) to implementation
4. **Timeline**: Create detailed project schedule
5. **Implementation**: Execute phases sequentially
6. **Testing**: Comprehensive QA before production
7. **Deployment**: Coordinated release with rollback plan
8. **Monitoring**: Post-deployment validation

---

**Document Created**: 2025-10-21
**Last Updated**: 2025-10-21
**Analyst**: Claude (AI Architecture Analyst)
**Status**: Ready for Review
