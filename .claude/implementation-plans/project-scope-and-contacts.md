# Implementation Plan: Project Scope (Soil Types) and Contacts

## Overview
Add two major features to project creation and project details pages:
1. **Project Scope (Soil Types)**: Select soil types with price per meter (multiple entries)
2. **Project Contacts**: Add contacts with department, name, phone (multiple entries)

## Current Status
- ✅ Database investigation completed
- ⚠️ **CRITICAL ISSUE IDENTIFIED**: Constraints table structure doesn't match soil type requirements
- ✅ Project contacts table structure verified (perfect match)
- 🔄 Awaiting clarification on database structure for soil types

---

## Database Analysis

### ✅ Project Contacts Table (READY TO USE)
**Table:** `project_contacts`

**Schema:**
```sql
id          | uuid                     | NOT NULL | gen_random_uuid()
project_id  | uuid                     | NOT NULL |
first_name  | character varying        | NOT NULL |
last_name   | character varying        | NOT NULL |
department  | character varying        | NULL     |
phone       | character varying        | NULL     |
email       | character varying        | NULL     |
position    | character varying        | NULL     |
is_primary  | boolean                  | NULL     | false
notes       | text                     | NULL     |
created_at  | timestamp with time zone | NULL     | now()
updated_at  | timestamp with time zone | NULL     | now()
```

**Status:** ✅ Perfect match for requirements
- Has department field ✓
- Has first_name field ✓
- Has last_name field ✓
- Has phone field ✓
- Can handle multiple contacts per project ✓

### ⚠️ Soil Types Storage (NEEDS CLARIFICATION)

**Current Table:** `constraints`

**Schema:**
```sql
id               | uuid                     | NOT NULL | gen_random_uuid()
project_id       | uuid                     | NOT NULL |
constraint_type  | text                     | NOT NULL |
description      | text                     | NOT NULL |
severity         | text                     | NULL     | 'medium'::text
status           | text                     | NULL     | 'active'::text
identified_date  | date                     | NULL     | CURRENT_DATE
resolved_date    | date                     | NULL     |
assigned_to      | uuid                     | NULL     |
resolution_notes | text                     | NULL     |
created_at       | timestamp with time zone | NULL     | now()
updated_at       | timestamp with time zone | NULL     | now()
```

**Issues:**
1. ❌ Missing `price_per_meter` field (required for soil types)
2. ❌ Has irrelevant fields for soil types:
   - `severity` - makes sense for constraints/issues, not soil types
   - `status` - makes sense for issues (active/resolved), not soil types
   - `resolved_date` - not applicable to soil types
   - `assigned_to` - not applicable to soil types
   - `resolution_notes` - not applicable to soil types

**Possible Solutions:**

**Option A: Create New Table** (RECOMMENDED)
```sql
CREATE TABLE project_soil_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  soil_type_name TEXT NOT NULL,
  price_per_meter DECIMAL(10,2) NOT NULL,
  quantity_meters DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Option B: Repurpose Constraints Table**
```sql
ALTER TABLE constraints
  ADD COLUMN price_per_meter DECIMAL(10,2);

-- Use constraint_type field for soil type name
-- Ignore severity, status, resolved_date fields
```

**Option C: Use Constraints Table As-Is**
- Store soil type in `constraint_type` field
- Store price in `description` field (parse as JSON or string)
- Ignore all other fields

---

## Critical Questions (97% Confidence Check)

### 🚨 MUST ANSWER BEFORE PROCEEDING:

1. **Soil Types Database:**
   - Should we create a NEW table `project_soil_types`? (Option A - RECOMMENDED)
   - Or modify existing `constraints` table to add `price_per_meter`? (Option B)
   - Or use `constraints` table as-is with workarounds? (Option C)

2. **Soil Types Data Source:**
   - Are soil types predefined (dropdown from master list)?
   - Or free text input (users can type any soil type)?
   - If predefined, where is the master list stored?

3. **Price Per Meter:**
   - Is price specific to each project-soil combination?
   - Should we track quantity of meters for each soil type?

4. **Existing Data:**
   - Are there already records in the `constraints` table being used for soil types?
   - If yes, need to migrate data to new structure

---

## Implementation Steps (After Clarification)

### Phase 1: Database & API
- [ ] **Step 1.1:** Finalize database structure for soil types
- [ ] **Step 1.2:** Create/modify database table (if needed)
- [ ] **Step 1.3:** Check existing API routes:
  - `/api/projects/[id]/contacts` (GET, POST, PUT, DELETE)
  - `/api/projects/[id]/constraints` or `/api/projects/[id]/soil-types` (GET, POST, PUT, DELETE)
- [ ] **Step 1.4:** Create missing API routes
- [ ] **Step 1.5:** Test API endpoints with Postman/curl

### Phase 2: Frontend - Project Creation Form
- [ ] **Step 2.1:** Add soil types section to project creation form
  - Multi-item form with add/remove functionality
  - Fields: soil type, price per meter
  - Validation with Zod
- [ ] **Step 2.2:** Add contacts section to project creation form
  - Multi-item form with add/remove functionality
  - Fields: department, first_name, last_name, phone
  - Validation with Zod
- [ ] **Step 2.3:** Update form submission to include soil types and contacts
- [ ] **Step 2.4:** Test project creation with multiple soil types and contacts

### Phase 3: Frontend - Project Details Page
- [ ] **Step 3.1:** Add soil types display section
  - Show list of soil types with prices
  - Calculate total cost if quantity available
- [ ] **Step 3.2:** Add contacts display section
  - Show list of contacts in card/table format
  - Show department, name, phone
- [ ] **Step 3.3:** Add edit functionality for soil types
- [ ] **Step 3.4:** Add edit functionality for contacts
- [ ] **Step 3.5:** Test viewing and editing

### Phase 4: Testing & Validation
- [ ] **Step 4.1:** Test creating project with 0 soil types (should work)
- [ ] **Step 4.2:** Test creating project with 3+ soil types
- [ ] **Step 4.3:** Test creating project with 0 contacts (should work)
- [ ] **Step 4.4:** Test creating project with 5+ contacts
- [ ] **Step 4.5:** Test editing soil types in project details
- [ ] **Step 4.6:** Test editing contacts in project details
- [ ] **Step 4.7:** Test deleting soil types and contacts
- [ ] **Step 4.8:** Verify data persistence in database

### Phase 5: Git Commits
- [ ] **Step 5.1:** Commit database changes
- [ ] **Step 5.2:** Commit API routes
- [ ] **Step 5.3:** Commit project creation form changes
- [ ] **Step 5.4:** Commit project details page changes
- [ ] **Step 5.5:** Pull and push after each phase

---

## Technical Details

### Expected API Endpoints

**Soil Types:**
```typescript
GET    /api/projects/[id]/soil-types      // Get all soil types for project
POST   /api/projects/[id]/soil-types      // Add soil type
PUT    /api/projects/[id]/soil-types/[id] // Update soil type
DELETE /api/projects/[id]/soil-types/[id] // Delete soil type
```

**Contacts:**
```typescript
GET    /api/projects/[id]/contacts      // Get all contacts for project
POST   /api/projects/[id]/contacts      // Add contact
PUT    /api/projects/[id]/contacts/[id] // Update contact
DELETE /api/projects/[id]/contacts/[id] // Delete contact
```

### Expected Form Structure

**Project Creation Form Addition:**
```typescript
interface ProjectFormData {
  // ... existing fields
  soil_types: {
    soil_type_name: string;
    price_per_meter: number;
  }[];
  contacts: {
    department: string;
    first_name: string;
    last_name: string;
    phone: string;
  }[];
}
```

### Zod Validation Schema
```typescript
const soilTypeSchema = z.object({
  soil_type_name: z.string().min(1, 'Soil type is required'),
  price_per_meter: z.number().positive('Price must be positive'),
});

const contactSchema = z.object({
  department: z.string().optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
});

const projectFormSchema = z.object({
  // ... existing fields
  soil_types: z.array(soilTypeSchema).default([]),
  contacts: z.array(contactSchema).default([]),
});
```

---

## Files to Modify

### New API Routes (Create)
1. `/src/app/api/projects/[id]/soil-types/route.ts`
2. `/src/app/api/projects/[id]/contacts/route.ts`

### Existing Files (Modify)
1. `/src/app/(dashboard)/dashboard/projects/new/page.tsx` - Add soil types and contacts sections
2. `/src/app/(dashboard)/dashboard/projects/[id]/page.tsx` - Display and edit soil types and contacts
3. `/src/components/project-preparation/*` - May need new components for multi-item forms

### Types (Update)
1. `/src/types/project.ts` - Add soil types and contacts to Project type

---

## Current Blocker

⚠️ **WAITING FOR CLARIFICATION** on database structure for soil types before proceeding with implementation.

**Confidence Level:** 70% (need answers to critical questions to reach 97%)

**Recommended Next Step:** Get user clarification on Questions 1-4 above, then proceed with Phase 1.

---

**Created:** 2025-10-07
**Last Updated:** 2025-10-07
**Status:** 🔄 Planning - Awaiting Clarification
