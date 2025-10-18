# Implementation Plan: Housing Functionality Fix & Connection Plan Upload

## Target Confidence: 97%

## Requirement Analysis

**User Request**: Fix POST /api/houses returning 404 error and add connection plan upload functionality for the Housing (Houses) step in Project Preparation.

**Current Issue Identified**:
- Frontend component (`houses.tsx`) calls `housesApi.createHouse()` which posts to `/api/houses`
- BUT there is NO `/api/houses/route.ts` file - only `/api/houses/[id]/route.ts` exists
- This causes POST requests to `/api/houses` to return 404 Not Found
- Additionally, connection plan upload functionality is missing

**System Architecture Context**:
- Two distinct housing systems exist in parallel:
  1. **Project Preparation Housing** (`/api/project-preparation/housing`) - for rental accommodations (housing_units table)
  2. **Houses System** (`/api/houses`) - for fiber connection tracking (houses table)
- The user's issue is with #2 (Houses System for fiber connections)

## Clarifying Questions

**BEFORE PROCEEDING, I need confirmation on these critical points:**

1. **Table Selection**: Should the Houses component use the `houses` table (fiber connections) or `housing_units` table (rental accommodations)? The component UI suggests fiber connections (connection types, installation methods), which matches the `houses` table.

2. **Connection Plan Storage**: Where should connection plan documents be stored?
   - Option A: `house_documents` table with Supabase bucket `house-documents`
   - Option B: Generic `documents` table with project association
   - **Recommended**: Option A (dedicated table and bucket already exist)

3. **API Endpoint**: Should we create `/api/houses/route.ts` OR modify the component to use `/api/project-preparation/housing`?
   - **Recommended**: Create `/api/houses/route.ts` since the component is specifically for fiber house connections, not rental housing

4. **Field Mapping**: The frontend form has fields not in the database schema:
   - Form has: `apartment_count`, `floor_count`, `house_type`, `coordinates_lat`, `coordinates_lng`
   - Database has: `planned_length_m`, `appointment_date`, `appointment_time`, `geom_point`
   - **Recommended**: Add missing columns to `houses` table via migration

**WAITING FOR CONFIRMATION BEFORE IMPLEMENTATION**

---

## Current State Analysis

### Database Layer - Houses Table

**Schema** (from `init.sql`):
```sql
CREATE TABLE houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    cabinet_id UUID REFERENCES cabinets(id),
    address TEXT NOT NULL,
    house_number TEXT,
    connection_type TEXT NOT NULL,
    method TEXT NOT NULL,
    status TEXT,
    planned_length_m NUMERIC(10, 2),
    contact_name TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    appointment_date DATE,
    appointment_time TEXT,
    notes TEXT,
    geom_point JSONB
);
```

**Issues Found**:
- Missing columns: `apartment_count`, `floor_count`, `house_type`, `planned_connection_date`, `actual_connection_date`, `coordinates_lat`, `coordinates_lng`, `created_at`, `updated_at`
- Has columns not used by frontend: `planned_length_m`, `appointment_date`, `appointment_time`, `geom_point`, `cabinet_id`

### Database Layer - House Documents Table

**Schema** (from `init.sql`):
```sql
CREATE TABLE house_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    upload_date TIMESTAMP DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id)
);
```

**Status**: Table exists and is ready for use ✅

**Supabase Bucket**: `house-documents` bucket exists (configured in `supabase-buckets.ts`)

### API Layer Analysis

**Existing Files**:
1. `/api/houses/[id]/route.ts` - GET, PUT, DELETE for individual house ✅
2. `/api/project-preparation/housing/route.ts` - GET, POST for housing_units (different table) ❌
3. `/api/project-preparation/housing/[id]/route.ts` - PUT, DELETE for housing_units ❌

**Missing File**:
- `/api/houses/route.ts` - POST (create) endpoint is MISSING ❌

**API Client** (`api-client.ts`):
```typescript
export class HousesApiClient extends BaseApiClient {
  constructor() {
    super(`${getApiBaseUrl()}/api/houses`); // Base path: /api/houses
  }

  async createHouse(data: CreateHouseRequest): Promise<House> {
    return this.post<House>("/", data); // POST to /api/houses
  }

  async getProjectHouses(projectId: string): Promise<House[]> {
    // Currently fetches from housing-units API (WRONG!)
    const response = await fetch(`/api/housing-units?project_id=${projectId}`);
    // ...
  }
}
```

**Issues Found**:
- `createHouse()` posts to `/api/houses` which doesn't exist (404 error)
- `getProjectHouses()` fetches from `/api/housing-units` (wrong table)
- No file upload methods for connection plans

### Frontend Layer Analysis

**Component**: `src/components/project-preparation/houses.tsx`

**Form Fields** (CreateHouseForm):
```typescript
interface CreateHouseForm {
  address: string;
  house_number?: string;
  apartment_count: number;
  floor_count: number;
  connection_type: string;
  method: string;
  house_type: string;
  planned_connection_date?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  coordinates_lat?: number;
  coordinates_lng?: number;
  notes?: string;
}
```

**Issues Found**:
- Form collects `apartment_count`, `floor_count`, `house_type` but database doesn't have these columns
- No file upload UI for connection plans (TODOs in code)
- Document management tab is incomplete (lines 670-787)

**Hooks** (`use-houses.ts`):
- `useProjectHouses(projectId)` - Queries via `housesApi.getProjectHouses()`
- `useCreateHouse()` - Calls `housesApi.createHouse()`
- Document hooks are missing (lines 96, 100)

---

## Consistency Analysis

| Database Column | API Field | Frontend Property | Status | Action Required |
|----------------|-----------|-------------------|--------|-----------------|
| id | id | id | ✅ | None |
| project_id | project_id | project_id | ✅ | None |
| address | address | address | ✅ | None |
| house_number | house_number | house_number | ✅ | None |
| connection_type | connection_type | connection_type | ✅ | None |
| method | method | method | ✅ | None |
| status | status | status | ✅ | None |
| contact_name | contact_name | contact_name | ✅ | None |
| contact_phone | contact_phone | contact_phone | ✅ | None |
| contact_email | contact_email | contact_email | ✅ | None |
| notes | notes | notes | ✅ | None |
| - | - | apartment_count | ❌ | Add to database |
| - | - | floor_count | ❌ | Add to database |
| - | - | house_type | ❌ | Add to database |
| - | - | planned_connection_date | ❌ | Add to database |
| - | - | actual_connection_date | ❌ | Add to database (for future) |
| - | - | coordinates_lat | ❌ | Add to database |
| - | - | coordinates_lng | ❌ | Add to database |
| planned_length_m | - | - | ⚠️ | Keep (useful for future) |
| appointment_date | - | - | ⚠️ | Keep (appointments feature) |
| appointment_time | - | - | ⚠️ | Keep (appointments feature) |
| geom_point | - | - | ⚠️ | Keep (GIS feature) |
| cabinet_id | - | - | ⚠️ | Keep (zone layout integration) |
| created_at | created_at | created_at | ❌ | Add to database |
| updated_at | updated_at | updated_at | ❌ | Add to database |

**Connection Plans Storage**:
| Storage Method | Status | Recommendation |
|---------------|--------|----------------|
| house_documents table | ✅ Exists | Use this |
| house-documents bucket | ✅ Configured | Use this |
| Upload API endpoint | ❌ Missing | Create |
| Frontend upload UI | ❌ Incomplete | Complete |

---

## Detailed Implementation Plan

### Phase 1: Database Schema Migration

**File**: Create `sql/migrations/add-houses-missing-columns.sql`

```sql
-- Add missing columns to houses table
ALTER TABLE houses
  ADD COLUMN IF NOT EXISTS apartment_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS floor_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS house_type TEXT DEFAULT 'residential',
  ADD COLUMN IF NOT EXISTS planned_connection_date DATE,
  ADD COLUMN IF NOT EXISTS actual_connection_date DATE,
  ADD COLUMN IF NOT EXISTS coordinates_lat NUMERIC(10, 8),
  ADD COLUMN IF NOT EXISTS coordinates_lng NUMERIC(11, 8),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add check constraints
ALTER TABLE houses
  ADD CONSTRAINT check_apartment_count CHECK (apartment_count > 0),
  ADD CONSTRAINT check_floor_count CHECK (floor_count > 0),
  ADD CONSTRAINT check_house_type CHECK (house_type IN ('residential', 'commercial', 'mixed', 'industrial')),
  ADD CONSTRAINT check_connection_type CHECK (connection_type IN ('full', 'property', 'in_home', 'other')),
  ADD CONSTRAINT check_method CHECK (method IN ('trench', 'aerial', 'underground', 'building')),
  ADD CONSTRAINT check_status CHECK (status IN ('not_assigned', 'assigned', 'connected', 'completed', 'cancelled'));

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_houses_project_id ON houses(project_id);
CREATE INDEX IF NOT EXISTS idx_houses_status ON houses(status);
CREATE INDEX IF NOT EXISTS idx_houses_planned_date ON houses(planned_connection_date);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_houses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER houses_updated_at_trigger
  BEFORE UPDATE ON houses
  FOR EACH ROW
  EXECUTE FUNCTION update_houses_updated_at();

-- Verify house_documents table exists (should already exist)
-- If not, create it:
CREATE TABLE IF NOT EXISTS house_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('plan', 'permit', 'contract', 'photo_before', 'photo_during', 'photo_after', 'other')),
    file_path TEXT NOT NULL,
    filename TEXT NOT NULL,
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_house_documents_house_id ON house_documents(house_id);
CREATE INDEX IF NOT EXISTS idx_house_documents_doc_type ON house_documents(doc_type);
```

**Rollback Script** (`sql/migrations/rollback-houses-missing-columns.sql`):
```sql
-- Remove added columns (CAUTION: This will delete data)
ALTER TABLE houses
  DROP COLUMN IF EXISTS apartment_count,
  DROP COLUMN IF EXISTS floor_count,
  DROP COLUMN IF EXISTS house_type,
  DROP COLUMN IF EXISTS planned_connection_date,
  DROP COLUMN IF EXISTS actual_connection_date,
  DROP COLUMN IF EXISTS coordinates_lat,
  DROP COLUMN IF EXISTS coordinates_lng,
  DROP COLUMN IF EXISTS created_at,
  DROP COLUMN IF EXISTS updated_at;

-- Remove constraints
ALTER TABLE houses
  DROP CONSTRAINT IF EXISTS check_apartment_count,
  DROP CONSTRAINT IF EXISTS check_floor_count,
  DROP CONSTRAINT IF EXISTS check_house_type,
  DROP CONSTRAINT IF EXISTS check_connection_type,
  DROP CONSTRAINT IF EXISTS check_method,
  DROP CONSTRAINT IF EXISTS check_status;

-- Remove trigger
DROP TRIGGER IF EXISTS houses_updated_at_trigger ON houses;
DROP FUNCTION IF EXISTS update_houses_updated_at();

-- Remove indexes
DROP INDEX IF EXISTS idx_houses_project_id;
DROP INDEX IF EXISTS idx_houses_status;
DROP INDEX IF EXISTS idx_houses_planned_date;
```

**Migration Execution**:
```bash
# Apply migration
psql $DATABASE_URL -f sql/migrations/add-houses-missing-columns.sql

# Verify changes
psql $DATABASE_URL -c "\d houses"
psql $DATABASE_URL -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'houses' ORDER BY ordinal_position;"
```

### Phase 2: API Layer - Create Houses Endpoint

**File**: Create `src/app/api/houses/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schema
const CreateHouseSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
  address: z.string().min(1, 'Address is required'),
  house_number: z.string().optional(),
  apartment_count: z.number().int().positive('Apartment count must be positive').default(1),
  floor_count: z.number().int().positive('Floor count must be positive').default(1),
  connection_type: z.enum(['full', 'property', 'in_home', 'other'], {
    errorMap: () => ({ message: 'Invalid connection type' })
  }),
  method: z.enum(['trench', 'aerial', 'underground', 'building'], {
    errorMap: () => ({ message: 'Invalid installation method' })
  }),
  house_type: z.enum(['residential', 'commercial', 'mixed', 'industrial']).default('residential'),
  status: z.enum(['not_assigned', 'assigned', 'connected', 'completed', 'cancelled']).default('not_assigned'),
  planned_connection_date: z.string().optional(), // ISO date string
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  coordinates_lat: z.number().min(-90).max(90).optional(),
  coordinates_lng: z.number().min(-180).max(180).optional(),
  notes: z.string().optional(),
});

const HouseFiltersSchema = z.object({
  project_id: z.string().uuid().optional(),
  status: z.string().optional(),
  connection_type: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * GET /api/houses - List houses with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate filters
    const filtersResult = HouseFiltersSchema.safeParse({
      project_id: searchParams.get('project_id'),
      status: searchParams.get('status'),
      connection_type: searchParams.get('connection_type'),
      page: searchParams.get('page'),
      per_page: searchParams.get('per_page'),
    });

    if (!filtersResult.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: filtersResult.error.issues },
        { status: 400 }
      );
    }

    const filters = filtersResult.data;
    const { page, per_page, ...queryFilters } = filters;

    // Build query
    let query = supabase
      .from('houses')
      .select(`
        id,
        project_id,
        cabinet_id,
        address,
        house_number,
        apartment_count,
        floor_count,
        connection_type,
        method,
        house_type,
        status,
        planned_connection_date,
        actual_connection_date,
        contact_name,
        contact_phone,
        contact_email,
        coordinates_lat,
        coordinates_lng,
        notes,
        created_at,
        updated_at,
        project:projects!houses_project_id_fkey(id, name, customer)
      `, { count: 'exact' });

    // Apply filters
    if (queryFilters.project_id) {
      query = query.eq('project_id', queryFilters.project_id);
    }
    if (queryFilters.status) {
      query = query.eq('status', queryFilters.status);
    }
    if (queryFilters.connection_type) {
      query = query.eq('connection_type', queryFilters.connection_type);
    }

    // Apply pagination
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: houses, error, count } = await query;

    if (error) {
      console.error('Database error fetching houses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch houses from database', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      houses: houses || [],
      pagination: {
        page,
        per_page,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / per_page),
      },
    });

  } catch (error) {
    console.error('Houses GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch houses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/houses - Create a new house
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = CreateHouseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', validatedData.project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create house in database
    const { data: house, error } = await supabase
      .from('houses')
      .insert([{
        project_id: validatedData.project_id,
        address: validatedData.address,
        house_number: validatedData.house_number,
        apartment_count: validatedData.apartment_count,
        floor_count: validatedData.floor_count,
        connection_type: validatedData.connection_type,
        method: validatedData.method,
        house_type: validatedData.house_type,
        status: validatedData.status,
        planned_connection_date: validatedData.planned_connection_date,
        contact_name: validatedData.contact_name,
        contact_phone: validatedData.contact_phone,
        contact_email: validatedData.contact_email,
        coordinates_lat: validatedData.coordinates_lat,
        coordinates_lng: validatedData.coordinates_lng,
        notes: validatedData.notes,
      }])
      .select(`
        id,
        project_id,
        cabinet_id,
        address,
        house_number,
        apartment_count,
        floor_count,
        connection_type,
        method,
        house_type,
        status,
        planned_connection_date,
        actual_connection_date,
        contact_name,
        contact_phone,
        contact_email,
        coordinates_lat,
        coordinates_lng,
        notes,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Database error creating house:', error);
      return NextResponse.json(
        { error: 'Failed to create house in database', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'House created successfully',
        house,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Houses POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create house', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

### Phase 3: API Layer - House Documents Upload

**File**: Create `src/app/api/houses/[id]/documents/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ALLOWED_DOC_TYPES = ['plan', 'permit', 'contract', 'photo_before', 'photo_during', 'photo_after', 'other'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

/**
 * GET /api/houses/[id]/documents - Get all documents for a house
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: houseId } = await params;

    if (!houseId) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      );
    }

    // Verify house exists
    const { data: house, error: houseError } = await supabase
      .from('houses')
      .select('id')
      .eq('id', houseId)
      .single();

    if (houseError || !house) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      );
    }

    // Fetch documents
    const { data: documents, error } = await supabase
      .from('house_documents')
      .select(`
        id,
        house_id,
        doc_type,
        file_path,
        filename,
        upload_date,
        uploaded_by,
        uploader:users!house_documents_uploaded_by_fkey(id, full_name, email)
      `)
      .eq('house_id', houseId)
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('Database error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents: documents || [] });

  } catch (error) {
    console.error('House documents GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch house documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/houses/[id]/documents - Upload a document for a house
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: houseId } = await params;

    if (!houseId) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      );
    }

    // Verify house exists
    const { data: house, error: houseError } = await supabase
      .from('houses')
      .select('id, project_id, address')
      .eq('id', houseId)
      .single();

    if (houseError || !house) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const docType = formData.get('doc_type') as string | null;
    const uploadedBy = formData.get('uploaded_by') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!docType || !ALLOWED_DOC_TYPES.includes(docType)) {
      return NextResponse.json(
        { error: 'Invalid or missing doc_type', allowed: ALLOWED_DOC_TYPES },
        { status: 400 }
      );
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type', allowed: ALLOWED_MIME_TYPES },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = new Date().getTime();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `houses/${houseId}/${docType}/${timestamp}_${sanitizedFilename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('house-documents')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage', details: uploadError.message },
        { status: 500 }
      );
    }

    // Create document record in database
    const { data: document, error: dbError } = await supabase
      .from('house_documents')
      .insert([{
        house_id: houseId,
        doc_type: docType,
        file_path: filePath,
        filename: file.name,
        uploaded_by: uploadedBy,
      }])
      .select(`
        id,
        house_id,
        doc_type,
        file_path,
        filename,
        upload_date,
        uploaded_by
      `)
      .single();

    if (dbError) {
      // Rollback: delete uploaded file
      await supabase.storage.from('house-documents').remove([filePath]);

      console.error('Database error creating document record:', dbError);
      return NextResponse.json(
        { error: 'Failed to create document record in database' },
        { status: 500 }
      );
    }

    // Get signed URL for the uploaded file
    const { data: urlData } = await supabase.storage
      .from('house-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return NextResponse.json(
      {
        success: true,
        message: 'Document uploaded successfully',
        document: {
          ...document,
          download_url: urlData?.signedUrl,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('House document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
```

**File**: Create `src/app/api/houses/[id]/documents/[documentId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/houses/[id]/documents/[documentId] - Get signed URL for document download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: houseId, documentId } = await params;

    // Fetch document record
    const { data: document, error } = await supabase
      .from('house_documents')
      .select('id, house_id, file_path, filename')
      .eq('id', documentId)
      .eq('house_id', houseId)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Generate signed URL (24 hour expiry)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('house-documents')
      .createSignedUrl(document.file_path, 86400);

    if (urlError || !urlData) {
      console.error('Error generating signed URL:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      document: {
        ...document,
        download_url: urlData.signedUrl,
      },
    });

  } catch (error) {
    console.error('Document download error:', error);
    return NextResponse.json(
      { error: 'Failed to get document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/houses/[id]/documents/[documentId] - Delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id: houseId, documentId } = await params;

    // Fetch document record
    const { data: document, error: fetchError } = await supabase
      .from('house_documents')
      .select('id, house_id, file_path')
      .eq('id', documentId)
      .eq('house_id', houseId)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('house-documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue anyway - DB record should be removed
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('house_documents')
      .delete()
      .eq('id', documentId)
      .eq('house_id', houseId);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete document from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      deleted_id: documentId,
    });

  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
```

### Phase 4: Frontend Updates - API Client

**File**: Update `src/lib/api-client.ts`

**Changes needed**:
1. Fix `getProjectHouses()` to use correct endpoint
2. Add document management methods

```typescript
// In HousesApiClient class, update getProjectHouses method:

async getProjectHouses(projectId: string): Promise<House[]> {
  // FIX: Use /api/houses endpoint, not /api/housing-units
  return this.get<House[]>(`/?project_id=${projectId}`);
}

// Add document management methods:

async getHouseDocuments(houseId: string): Promise<HouseDocument[]> {
  return this.get<{ documents: HouseDocument[] }>(`/${houseId}/documents`)
    .then(res => res.documents);
}

async uploadHouseDocument(
  houseId: string,
  file: File,
  docType: string,
  uploadedBy: string
): Promise<HouseDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);
  formData.append('uploaded_by', uploadedBy);

  const response = await fetch(`${this.baseUrl}/${houseId}/documents`, {
    method: 'POST',
    headers: this.getHeaders(true), // Skip Content-Type for FormData
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload document');
  }

  const data = await response.json();
  return data.document;
}

async deleteHouseDocument(houseId: string, documentId: string): Promise<void> {
  return this.delete(`/${houseId}/documents/${documentId}`);
}

async getHouseDocumentDownloadUrl(houseId: string, documentId: string): Promise<string> {
  const data = await this.get<{ document: { download_url: string } }>(
    `/${houseId}/documents/${documentId}`
  );
  return data.document.download_url;
}
```

**Type Definitions** (add to api-client.ts):
```typescript
export interface HouseDocument {
  id: string;
  house_id: string;
  doc_type: 'plan' | 'permit' | 'contract' | 'photo_before' | 'photo_during' | 'photo_after' | 'other';
  file_path: string;
  filename: string;
  upload_date: string;
  uploaded_by?: string;
  download_url?: string;
}
```

### Phase 5: Frontend Updates - Hooks

**File**: Update `src/hooks/use-houses.ts`

Add document management hooks at the end of the file:

```typescript
// House Document Hooks

export function useHouseDocuments(houseId: string) {
  return useQuery({
    queryKey: ['house-documents', houseId],
    queryFn: () => housesApi.getHouseDocuments(houseId),
    enabled: !!houseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUploadHouseDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      houseId,
      file,
      docType,
      uploadedBy,
    }: {
      houseId: string;
      file: File;
      docType: string;
      uploadedBy: string;
    }) => housesApi.uploadHouseDocument(houseId, file, docType, uploadedBy),
    onSuccess: (_, { houseId }) => {
      queryClient.invalidateQueries({ queryKey: ['house-documents', houseId] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      toast.error(`Failed to upload document: ${error.message}`);
    },
  });
}

export function useDeleteHouseDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ houseId, documentId }: { houseId: string; documentId: string }) =>
      housesApi.deleteHouseDocument(houseId, documentId),
    onSuccess: (_, { houseId }) => {
      queryClient.invalidateQueries({ queryKey: ['house-documents', houseId] });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });
}

export function useHouseDocumentDownloadUrl(houseId: string, documentId: string) {
  return useQuery({
    queryKey: ['house-document-url', houseId, documentId],
    queryFn: () => housesApi.getHouseDocumentDownloadUrl(houseId, documentId),
    enabled: !!houseId && !!documentId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

### Phase 6: Frontend Updates - Component

**File**: Update `src/components/project-preparation/houses.tsx`

**Changes**:

1. Replace TODO hooks (lines 96, 100):
```typescript
// Replace line 96:
const { data: houseDocumentsData } = useHouseDocuments(selectedHouseForDocs || '');
const houseDocuments = houseDocumentsData || [];

// Replace line 100:
const uploadDocument = useUploadHouseDocument();
const deleteDocument = useDeleteHouseDocument();
```

2. Add file upload state (after line 93):
```typescript
const [uploadingFile, setUploadingFile] = useState<File | null>(null);
const [selectedDocType, setSelectedDocType] = useState<string>('plan');
const fileInputRef = useRef<HTMLInputElement>(null);
```

3. Add document upload handler (after line 174):
```typescript
const handleUploadDocument = async () => {
  if (!uploadingFile || !selectedHouseForDocs) {
    toast.error('Please select a file and document type');
    return;
  }

  try {
    // Get current user ID from session (you may need to adjust this)
    const userId = 'current-user-id'; // TODO: Get from auth context

    await uploadDocument.mutateAsync({
      houseId: selectedHouseForDocs,
      file: uploadingFile,
      docType: selectedDocType,
      uploadedBy: userId,
    });

    setUploadingFile(null);
    setSelectedDocType('plan');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
};

const handleDeleteDocument = async (documentId: string) => {
  if (!selectedHouseForDocs) return;

  if (window.confirm('Are you sure you want to delete this document?')) {
    try {
      await deleteDocument.mutateAsync({
        houseId: selectedHouseForDocs,
        documentId,
      });
    } catch (error) {
      console.error('Delete error:', error);
    }
  }
};

const handleDownloadDocument = async (documentId: string) => {
  if (!selectedHouseForDocs) return;

  try {
    const url = await housesApi.getHouseDocumentDownloadUrl(selectedHouseForDocs, documentId);
    window.open(url, '_blank');
  } catch (error) {
    toast.error('Failed to download document');
    console.error('Download error:', error);
  }
};
```

4. Update document upload UI (replace lines 706-731):
```typescript
<div className="grid grid-cols-2 gap-4">
  <div>
    <Label htmlFor="doc_type">Document Type</Label>
    <Select value={selectedDocType} onValueChange={setSelectedDocType}>
      <SelectTrigger>
        <SelectValue placeholder="Select document type" />
      </SelectTrigger>
      <SelectContent>
        {DOCUMENT_TYPES.map(type => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
  <div>
    <Label htmlFor="file">File</Label>
    <div className="flex items-center space-x-2">
      <Input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
        onChange={(e) => setUploadingFile(e.target.files?.[0] || null)}
      />
      <Button
        type="button"
        onClick={handleUploadDocument}
        disabled={uploadDocument.isPending || !uploadingFile}
      >
        <Upload className="w-4 h-4 mr-2" />
        {uploadDocument.isPending ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
    {uploadingFile && (
      <p className="text-sm text-gray-600 mt-1">
        Selected: {uploadingFile.name} ({(uploadingFile.size / 1024 / 1024).toFixed(2)} MB)
      </p>
    )}
  </div>
</div>
```

5. Update document list UI (replace lines 737-765):
```typescript
{houseDocuments && houseDocuments.length > 0 ? (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">Existing Documents</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {houseDocuments.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-500" />
              <div>
                <p className="font-medium">{doc.filename}</p>
                <p className="text-sm text-gray-600">
                  {DOCUMENT_TYPES.find(t => t.value === doc.doc_type)?.label || doc.doc_type} •
                  Uploaded {new Date(doc.upload_date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadDocument(doc.id)}
              >
                View
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteDocument(doc.id)}
                disabled={deleteDocument.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
) : (
  <div className="text-center py-8">
    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
    <p className="text-gray-600">No documents uploaded for this house</p>
  </div>
)}
```

### Phase 7: Testing Strategy

#### Unit Tests

**Database Tests**:
```bash
# Test migration
psql $DATABASE_URL -f sql/migrations/add-houses-missing-columns.sql
psql $DATABASE_URL -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'houses' ORDER BY ordinal_position;"

# Test constraints
psql $DATABASE_URL -c "INSERT INTO houses (project_id, address, connection_type, method, apartment_count) VALUES ('invalid-uuid', 'Test St', 'full', 'trench', -5);" # Should fail
psql $DATABASE_URL -c "INSERT INTO houses (project_id, address, connection_type, method, house_type) VALUES ('valid-uuid', 'Test St', 'full', 'trench', 'invalid');" # Should fail
```

**API Tests**:
```typescript
// Create test file: src/app/api/houses/__tests__/houses.test.ts

import { POST, GET } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/houses', () => {
  it('should create a house with valid data', async () => {
    const request = new NextRequest('http://localhost/api/houses', {
      method: 'POST',
      body: JSON.stringify({
        project_id: 'valid-uuid',
        address: '123 Main St',
        connection_type: 'full',
        method: 'trench',
        apartment_count: 10,
        floor_count: 3,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.house).toBeDefined();
  });

  it('should reject invalid connection type', async () => {
    const request = new NextRequest('http://localhost/api/houses', {
      method: 'POST',
      body: JSON.stringify({
        project_id: 'valid-uuid',
        address: '123 Main St',
        connection_type: 'invalid',
        method: 'trench',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('should reject missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/houses', {
      method: 'POST',
      body: JSON.stringify({
        project_id: 'valid-uuid',
        // Missing address, connection_type, method
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe('GET /api/houses', () => {
  it('should return houses for a project', async () => {
    const request = new NextRequest('http://localhost/api/houses?project_id=valid-uuid');
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.houses).toBeInstanceOf(Array);
  });

  it('should filter by status', async () => {
    const request = new NextRequest('http://localhost/api/houses?status=connected');
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
```

#### Integration Tests

**End-to-End Test** (create `tests/e2e/houses.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Houses Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/projects/test-project-id');
  });

  test('should create a new house', async ({ page }) => {
    // Navigate to housing tab
    await page.click('text=Vorbereitung');
    await page.click('text=Housing');
    await page.click('text=Haus hinzufügen');

    // Fill form
    await page.fill('input[name="address"]', '123 Test Street, Berlin');
    await page.fill('input[name="house_number"]', '123A');
    await page.fill('input[name="apartment_count"]', '10');
    await page.fill('input[name="floor_count"]', '3');
    await page.selectOption('select[name="connection_type"]', 'full');
    await page.selectOption('select[name="method"]', 'trench');
    await page.selectOption('select[name="house_type"]', 'residential');

    // Submit
    await page.click('button:has-text("Haus hinzufügen")');

    // Verify success
    await expect(page.locator('text=House created successfully')).toBeVisible();
    await expect(page.locator('text=123 Test Street')).toBeVisible();
  });

  test('should upload connection plan', async ({ page }) => {
    // Navigate to documents tab
    await page.click('text=Hausdokumente');

    // Select house
    await page.selectOption('select', { label: '123 Test Street (123A)' });

    // Upload file
    await page.selectOption('select[name="doc_type"]', 'plan');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/connection-plan.pdf');
    await page.click('button:has-text("Upload")');

    // Verify upload
    await expect(page.locator('text=Document uploaded successfully')).toBeVisible();
    await expect(page.locator('text=connection-plan.pdf')).toBeVisible();
  });

  test('should edit house details', async ({ page }) => {
    await page.click('button[aria-label="Edit house"]');
    await page.fill('input[name="notes"]', 'Updated notes for house');
    await page.click('button:has-text("Update")');

    await expect(page.locator('text=House updated successfully')).toBeVisible();
    await expect(page.locator('text=Updated notes')).toBeVisible();
  });

  test('should delete house', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.click('button[aria-label="Delete house"]');

    await expect(page.locator('text=House deleted successfully')).toBeVisible();
    await expect(page.locator('text=123 Test Street')).not.toBeVisible();
  });
});
```

#### Manual Testing Checklist

**House Creation**:
- [ ] Create house with minimum required fields
- [ ] Create house with all optional fields
- [ ] Verify validation errors for invalid data
- [ ] Check house appears in project houses list
- [ ] Verify summary statistics update

**House Editing**:
- [ ] Edit house address
- [ ] Update connection type and method
- [ ] Change status
- [ ] Update contact information
- [ ] Save and verify changes persist

**House Deletion**:
- [ ] Delete house with confirmation
- [ ] Verify house removed from list
- [ ] Check summary statistics update
- [ ] Verify deletion prevented if facilities exist

**Document Upload**:
- [ ] Upload connection plan (PDF)
- [ ] Upload permit (PDF)
- [ ] Upload photos (JPEG, PNG)
- [ ] Verify file size validation (50MB max)
- [ ] Check file type validation
- [ ] Verify document appears in list

**Document Management**:
- [ ] View/download uploaded document
- [ ] Delete document with confirmation
- [ ] Verify document removed from storage
- [ ] Upload multiple documents of different types

**Edge Cases**:
- [ ] Create house without optional fields
- [ ] Upload 50MB document (boundary test)
- [ ] Upload 51MB document (should fail)
- [ ] Upload invalid file type (should fail)
- [ ] Delete house with associated documents
- [ ] Concurrent house edits

### Phase 8: Deployment Sequence

**Step 1: Backup** (CRITICAL)
```bash
# Backup houses table before migration
pg_dump $DATABASE_URL -t houses --data-only > backups/houses_data_$(date +%Y%m%d_%H%M%S).sql
pg_dump $DATABASE_URL -t house_documents --data-only > backups/house_documents_data_$(date +%Y%m%d_%H%M%S).sql

# Backup entire database schema
pg_dump $DATABASE_URL --schema-only > backups/schema_backup_$(date +%Y%m%d_%H%M%S).sql
```

**Step 2: Apply Database Migration**
```bash
# Connect to database
psql $DATABASE_URL

# Run migration
\i sql/migrations/add-houses-missing-columns.sql

# Verify migration
\d houses
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'houses';

# Test constraints
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'houses'::regclass;
```

**Step 3: Verify Supabase Storage Bucket**
```bash
# Check if house-documents bucket exists
curl -X GET "https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/bucket/house-documents" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}"

# If not exists, create it via Supabase dashboard or SQL:
# Dashboard: Storage > Create new bucket > name: "house-documents", public: false
```

**Step 4: Deploy API Routes**
```bash
# Copy new API route files
cp src/app/api/houses/route.ts <deployment>
cp src/app/api/houses/[id]/documents/route.ts <deployment>
cp src/app/api/houses/[id]/documents/[documentId]/route.ts <deployment>

# Build and deploy
npm run build
# OR
docker-compose up -d --build
```

**Step 5: Deploy Frontend Updates**
```bash
# Update API client and hooks
git add src/lib/api-client.ts
git add src/hooks/use-houses.ts
git add src/components/project-preparation/houses.tsx

# Build frontend
npm run build

# Verify no TypeScript errors
npm run type-check
```

**Step 6: Smoke Tests**
```bash
# Test POST /api/houses
curl -X POST "http://localhost:3000/api/houses" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "valid-uuid",
    "address": "Test Address",
    "connection_type": "full",
    "method": "trench",
    "apartment_count": 1,
    "floor_count": 1
  }'

# Test GET /api/houses
curl "http://localhost:3000/api/houses?project_id=valid-uuid"

# Test document upload
curl -X POST "http://localhost:3000/api/houses/{house-id}/documents" \
  -F "file=@test-document.pdf" \
  -F "doc_type=plan" \
  -F "uploaded_by=user-uuid"
```

**Step 7: Monitor & Rollback Plan**
```bash
# Monitor logs
docker-compose logs -f nextjs-app

# If issues occur, rollback:
# 1. Restore database from backup
psql $DATABASE_URL < backups/houses_data_TIMESTAMP.sql

# 2. Rollback migration
psql $DATABASE_URL -f sql/migrations/rollback-houses-missing-columns.sql

# 3. Revert code changes
git revert <commit-hash>
npm run build
```

---

## Risk Assessment

### Complexity: **MEDIUM**

**Justification**:
- Database migration is straightforward (adding columns)
- API endpoints follow existing patterns
- File upload is well-established pattern
- No complex business logic

### Breaking Changes: **NO**

**Existing functionality preserved**:
- `/api/houses/[id]` routes unchanged
- Existing houses table data intact (only adding columns)
- No changes to related tables

**New functionality**:
- `/api/houses` POST endpoint (new)
- `/api/houses/[id]/documents` endpoints (new)
- Document upload UI (new)

### Affected Users: **LOW IMPACT**

**Who is affected**:
- Project managers creating project preparation plans
- Field teams viewing house connection details
- Users uploading connection plan documents

**User workflows affected**:
1. **House Creation** - Currently broken (404), will be FIXED
2. **House Listing** - Currently works, will be IMPROVED (correct data source)
3. **Document Upload** - Currently non-functional UI, will be ENABLED

### Mitigation Strategies

**1. Database Migration Risks**
- **Risk**: Migration fails mid-execution
- **Mitigation**: Use transactions, test on staging first
- **Rollback**: Backup before migration, rollback script ready

**2. API Endpoint Conflicts**
- **Risk**: New `/api/houses` conflicts with routing
- **Mitigation**: Test routing hierarchy, ensure [id] doesn't match literal "route"
- **Rollback**: Remove route.ts file, restart server

**3. File Upload Failures**
- **Risk**: Storage bucket not configured
- **Mitigation**: Verify bucket exists before deployment
- **Rollback**: Disable upload UI, show "coming soon" message

**4. Type Mismatches**
- **Risk**: Frontend types don't match API responses
- **Mitigation**: Run TypeScript compiler, add integration tests
- **Rollback**: Revert type changes, use `any` temporarily

**5. Performance Impact**
- **Risk**: Large file uploads slow down server
- **Mitigation**: 50MB file size limit, async processing
- **Monitoring**: Track upload durations, bucket size

---

## Summary

### Changes Required

**Database (1 migration)**:
- Add 9 columns to `houses` table
- Add constraints and indexes
- Add updated_at trigger
- Verify `house_documents` table exists

**API Layer (3 new files)**:
- `src/app/api/houses/route.ts` - POST /api/houses (create house)
- `src/app/api/houses/[id]/documents/route.ts` - GET, POST (list/upload documents)
- `src/app/api/houses/[id]/documents/[documentId]/route.ts` - GET, DELETE (download/delete document)

**Frontend (3 file updates)**:
- `src/lib/api-client.ts` - Fix `getProjectHouses()`, add document methods
- `src/hooks/use-houses.ts` - Add document management hooks
- `src/components/project-preparation/houses.tsx` - Complete document upload UI

### Estimated Timeline

- **Database Migration**: 30 minutes (includes testing)
- **API Development**: 3 hours (3 route files + validation)
- **Frontend Updates**: 2 hours (API client + hooks + UI)
- **Testing**: 2 hours (unit + integration + manual)
- **Deployment**: 1 hour (backup + deploy + verify)
- **TOTAL**: ~8.5 hours

### Success Criteria

1. POST /api/houses returns 201 (not 404) ✅
2. House creation form submits successfully ✅
3. Houses appear in project houses list ✅
4. Connection plan upload works ✅
5. Uploaded documents are viewable/downloadable ✅
6. All existing houses functionality unchanged ✅
7. No TypeScript errors ✅
8. All tests pass ✅

---

**PLAN COMPLETE - AWAITING CONFIRMATION ON CLARIFYING QUESTIONS BEFORE IMPLEMENTATION**
