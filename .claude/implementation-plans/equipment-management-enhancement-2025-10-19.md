# Implementation Plan: Equipment Management Enhancement

**Date**: 2025-10-19
**Reference**: EQUIPMENT_SYSTEM_ANALYSIS.md
**Status**: Pre-Implementation Planning
**Complexity**: HIGH
**Estimated Timeline**: 3-4 weeks

---

## Table of Contents
1. [Requirement Analysis](#requirement-analysis)
2. [Clarifying Questions](#clarifying-questions)
3. [Current State Analysis](#current-state-analysis)
4. [Consistency Analysis](#consistency-analysis)
5. [Detailed Implementation Plan](#detailed-implementation-plan)
6. [Risk Assessment](#risk-assessment)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Sequence](#deployment-sequence)
9. [Summary](#summary)

---

## Requirement Analysis

### Core Objective
Transform the Equipment Management system from a basic asset tracking tool into a comprehensive fleet management platform with time-based reservations, typed views, preventive maintenance scheduling, usage tracking, and document management.

### Key Requirements (Restated)

**97% Confidence Statement**: This implementation enhances the Equipment Management module (separate from Materials) with six distinct features:

1. **Typed Views System**: Different table columns displayed based on equipment type (Power Tool, Fusion Splicer, OTDR, Safety Gear) - each showing type-specific attributes
2. **Time-Based Reservations**: Calendar-based reservation system preventing overlapping bookings with conflict detection
3. **Enhanced Assignment Management**: Crew-based assignments with strict "one active assignment per item" enforcement
4. **Preventive Maintenance Scheduling**: Automated scheduling based on calendar intervals, usage hours, or cycles
5. **Usage Hour Tracking**: Daily usage logs with auto-incrementing total hours and meter readings
6. **Document Management**: Multi-document support (warranties, manuals, calibration certs) with expiry tracking

### Information Architecture
The system will have **6 main tabs**:
- **Fleet Tab**: Equipment list with typed view selector (existing, enhanced)
- **Assignments Tab**: Active/history view with quick actions (existing, enhanced)
- **Maintenance Tab**: Scheduled/overdue/history with preventive scheduling (new features)
- **Usage Tab**: Daily logs, meters, CSV import (NEW)
- **Documents Tab**: Certificates, manuals, warranty tracking (NEW)
- **Analytics Tab**: Enhanced with time windows, more KPIs (enhanced)

---

## Clarifying Questions

### CRITICAL - Must Answer Before Proceeding

#### 1. Equipment Type Structure
**Question**: Should equipment types be extensible (admin can add new types) or fixed to the 4 types mentioned (Power Tool, Fusion Splicer, OTDR, Safety Gear)?

**Options**:
- A) Fixed types with predefined attributes (simpler, faster implementation)
- B) Extensible type system with admin-defined custom fields (more flexible, complex)

**Impact**: Database schema design - Option A uses `equipment_type_details` table with fixed columns, Option B requires JSONB or EAV pattern

#### 2. Reservation Conflict Resolution
**Question**: What happens when a user tries to assign equipment that has an upcoming reservation?

**Options**:
- A) Block assignment entirely if ANY reservation exists in future
- B) Allow assignment if it ends before reservation starts
- C) Warn user but allow override with confirmation

**Impact**: Business logic in assignment creation API

#### 3. Maintenance State Transitions
**Question**: When scheduled maintenance becomes "in_progress", should the system:

**Options**:
- A) Automatically end active assignments (forceful)
- B) Prevent maintenance scheduling if equipment is assigned (preventive)
- C) Warn user about active assignment but allow override

**Impact**: Maintenance creation workflow and assignment lifecycle

#### 4. Usage Hour Source of Truth
**Question**: How should usage hours be validated against assignment periods?

**Scenario**: Equipment assigned for 7 days but usage logs show only 3 days of usage.

**Options**:
- A) Require usage log for each day equipment is assigned
- B) Allow partial usage logs, calculate efficiency metrics
- C) No strict validation, usage logs are optional

**Impact**: Validation rules and analytics calculations

#### 5. Document Expiry Workflow
**Question**: What should happen when a document (e.g., calibration certificate) expires?

**Options**:
- A) Auto-change equipment status to 'maintenance' and block assignments
- B) Show warning badge but allow continued use
- C) Create notification only, no status change

**Impact**: Document expiry handling and equipment availability logic

#### 6. CSV Import Scope
**Question**: Should CSV import support be limited to usage logs or extended to other entities?

**Options**:
- A) Usage logs only (as specified)
- B) Also support equipment bulk import
- C) Also support maintenance schedule import

**Impact**: API endpoint design and validation complexity

---

## Current State Analysis

### Database Layer

#### Existing Tables (3 tables)

**Table: `equipment` (14 columns)**
```sql
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,  -- Current: 'machine', 'tool', 'measuring_device'
  inventory_no VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'available',  -- 'available', 'in_use', 'maintenance', 'broken', 'retired'
  rental_cost_per_day NUMERIC DEFAULT 0,
  purchase_date DATE,
  warranty_until DATE,
  description TEXT,
  notes TEXT,
  owned BOOLEAN NOT NULL DEFAULT true,
  current_location VARCHAR,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Issues Found**:
- ❌ No `total_usage_hours` column for tracking cumulative usage
- ❌ No `search_vector` for full-text search optimization
- ❌ Missing indexes on `inventory_no`, `owned`, `current_location`
- ❌ `type` field is VARCHAR - no enforced valid values for typed views
- ❌ No foreign key to equipment type definitions

**Table: `equipment_assignments` (15 columns)**
```sql
CREATE TABLE equipment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  from_ts TIMESTAMP NOT NULL,
  to_ts TIMESTAMP,
  is_permanent BOOLEAN NOT NULL DEFAULT false,
  rental_cost_per_day NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Issues Found**:
- ❌ No mechanism to prevent overlapping assignments
- ❌ No index on `is_active` for fast active assignment queries
- ❌ No composite index on (crew_id, project_id, is_active)

**Table: `equipment_maintenance` (18 columns)**
```sql
CREATE TABLE equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_type VARCHAR NOT NULL,  -- 'routine', 'repair', 'inspection', 'calibration', 'upgrade'
  maintenance_date DATE NOT NULL,
  next_maintenance_date DATE,
  description TEXT,
  cost NUMERIC DEFAULT 0,
  status VARCHAR NOT NULL DEFAULT 'completed',  -- 'scheduled', 'in_progress', 'completed', 'cancelled'
  performed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Issues Found**:
- ❌ No preventive maintenance scheduling (all records are one-time events)
- ❌ `next_maintenance_date` not automatically calculated
- ❌ No interval-based scheduling (every 180 days, every 100 hours, etc.)

#### Required Database Changes Summary
- **Add 5 new tables**: reservations, documents, usage_logs, maintenance_schedules, type_details
- **Add 2 new columns to `equipment`**: total_usage_hours, search_vector
- **Add 8 new indexes**: For performance optimization
- **Add 3 triggers**: For auto-calculations and search vector updates
- **Add 2 functions**: For maintenance scheduling and next due date calculation

---

### API Layer

#### Existing Endpoints (11 routes)

**Equipment CRUD**:
- `GET /api/equipment` - List with filters (type, status, owned, search)
- `GET /api/equipment/{id}` - Single item with details
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/{id}` - Update equipment
- `DELETE /api/equipment/{id}` - Soft delete

**Assignments**:
- `GET /api/resources/equipment-assignments` - List assignments
- `POST /api/resources/equipment-assignments` - Create assignment
- `PUT /api/resources/equipment-assignments/{id}` - Update assignment
- `DELETE /api/resources/equipment-assignments/{id}` - Delete assignment

**Analytics**:
- `GET /api/equipment/analytics` - Usage analytics
- `GET /api/equipment/maintenance` - Maintenance records (inferred from analysis)

**Issues Found**:
- ❌ No reservation endpoints
- ❌ No document management endpoints
- ❌ No usage log endpoints
- ❌ No maintenance schedule endpoints
- ❌ No availability check endpoint (considering reservations)
- ❌ No bulk operations support
- ❌ GET /api/equipment doesn't support typed view filtering
- ❌ Analytics endpoint lacks time window parameter

#### Required API Changes Summary
- **Add 15 new endpoints**: Reservations (4), Documents (4), Usage (3), Maintenance Schedules (3), Availability (1)
- **Enhance 4 existing endpoints**: Equipment list, analytics, assignment creation, maintenance creation
- **Add validation logic**: Reservation overlap detection, assignment conflict check, usage hour validation
- **Add business rules**: State transition enforcement, preventive maintenance auto-scheduling

---

### Frontend Layer

#### Existing Components (1 main page, 451 lines hook)

**File**: `src/app/(dashboard)/dashboard/equipment/page.tsx` (985 lines)

**Current Structure**:
```
EquipmentPage
├── Statistics Cards (4 cards)
├── Tabs (3 tabs)
│   ├── Fleet Tab (filters + table)
│   ├── Assignments Tab (table)
│   └── Usage & Analytics Tab (charts)
└── Dialogs (5 dialogs inferred)
```

**Issues Found**:
- ❌ No typed view selector in Fleet tab
- ❌ No Reservations tab
- ❌ No Usage tab (separate from Analytics)
- ❌ No Documents tab
- ❌ No Maintenance tab (maintenance is embedded, not separate)
- ❌ Analytics doesn't have time window filters
- ❌ No CSV import functionality
- ❌ No document expiry warnings

**Existing Hooks**: `src/hooks/use-equipment.ts` (451 lines)

**Current Hooks**:
```typescript
useEquipment(filters?)              // GET equipment list
useEquipmentItem(id)                // GET single equipment
useCreateEquipment()                // POST equipment
useUpdateEquipment()                // PUT equipment
useDeleteEquipment()                // DELETE equipment
useEquipmentAssignments(filters?)   // GET assignments
useCreateAssignment()               // POST assignment
useUpdateAssignment()               // PUT assignment
useDeleteAssignment()               // DELETE assignment
useEquipmentAnalytics()             // GET analytics
useCrewEquipmentAssignments(id)     // GET crew assignments
useProjectEquipmentAssignments(id)  // GET project assignments
```

**Issues Found**:
- ❌ No hooks for reservations
- ❌ No hooks for documents
- ❌ No hooks for usage logs
- ❌ No hooks for maintenance schedules
- ❌ No hooks for typed views
- ❌ No hooks for CSV import

#### Required Frontend Changes Summary
- **Add 3 new tabs**: Usage, Documents, Maintenance (separate)
- **Add 15 new hooks**: For all new API endpoints
- **Add 10 new components**: Dialogs, selectors, upload forms
- **Enhance 5 existing components**: Fleet tab, Analytics tab, Assignment dialog, Maintenance dialog, Equipment form
- **Add type definitions**: 8 new TypeScript interfaces

---

## Consistency Analysis

### Database Column → API Field → Frontend Property Mapping

| Database Column | API Field | Frontend Property | Status | Action Needed |
|----------------|-----------|-------------------|--------|---------------|
| **equipment table** |
| id | id | id | ✅ | None |
| name | name | name | ✅ | None |
| type | type | type | ⚠️ | Add type validation & typed view support |
| inventory_no | inventory_no | inventory_no | ✅ | None |
| status | status | status | ✅ | None |
| rental_cost_per_day | rental_cost_per_day | rental_cost_per_day | ✅ | None |
| owned | owned | owned | ✅ | None |
| current_location | current_location | current_location | ✅ | None |
| total_usage_hours | - | - | ❌ | ADD: New column, API field, frontend property |
| search_vector | - | - | ❌ | ADD: Internal only, not exposed to frontend |
| **equipment_reservations (NEW TABLE)** |
| id | id | id | ❌ | ADD: Full stack implementation |
| equipment_id | equipment_id | equipmentId | ❌ | ADD: Full stack implementation |
| reserved_from | reserved_from | reservedFrom | ❌ | ADD: Full stack implementation |
| reserved_until | reserved_until | reservedUntil | ❌ | ADD: Full stack implementation |
| reserved_by_user_id | reserved_by_user_id | reservedByUserId | ❌ | ADD: Full stack implementation |
| **equipment_documents (NEW TABLE)** |
| id | id | id | ❌ | ADD: Full stack implementation |
| equipment_id | equipment_id | equipmentId | ❌ | ADD: Full stack implementation |
| document_type | document_type | documentType | ❌ | ADD: Full stack implementation |
| file_path | file_path | filePath | ❌ | ADD: Full stack implementation |
| expiry_date | expiry_date | expiryDate | ❌ | ADD: Full stack implementation |
| **equipment_usage_logs (NEW TABLE)** |
| id | id | id | ❌ | ADD: Full stack implementation |
| equipment_id | equipment_id | equipmentId | ❌ | ADD: Full stack implementation |
| usage_date | usage_date | usageDate | ❌ | ADD: Full stack implementation |
| hours_used | hours_used | hoursUsed | ❌ | ADD: Full stack implementation |
| **equipment_maintenance_schedules (NEW TABLE)** |
| id | id | id | ❌ | ADD: Full stack implementation |
| equipment_id | equipment_id | equipmentId | ❌ | ADD: Full stack implementation |
| interval_type | interval_type | intervalType | ❌ | ADD: Full stack implementation |
| next_due_date | next_due_date | nextDueDate | ❌ | ADD: Full stack implementation |
| **equipment_type_details (NEW TABLE)** |
| id | id | id | ❌ | ADD: Full stack implementation |
| equipment_id | equipment_id | equipmentId | ❌ | ADD: Full stack implementation |
| power_w | power_w | powerW | ❌ | ADD: Full stack implementation (Power Tool) |
| wavelength_nm | wavelength_nm | wavelengthNm | ❌ | ADD: Full stack implementation (OTDR) |
| certification | certification | certification | ❌ | ADD: Full stack implementation (Safety Gear) |

### Naming Standard: Database Naming (snake_case)
All new entities will follow PostgreSQL naming conventions (snake_case) as the source of truth, with camelCase transformations in TypeScript interfaces.

---

## Detailed Implementation Plan

### Phase 1: Database Changes (Estimated: 3-4 days)

#### Step 1.1: Add Missing Columns to `equipment` Table

**File**: `database/migrations/001_add_equipment_columns.sql`

```sql
-- Migration: Add usage hours and search vector to equipment table
-- Date: 2025-10-19

-- Add total_usage_hours column
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS total_usage_hours NUMERIC DEFAULT 0
CHECK (total_usage_hours >= 0);

-- Add search_vector for full-text search
ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create search vector update function
CREATE OR REPLACE FUNCTION equipment_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.inventory_no, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.type, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain search vector
CREATE TRIGGER equipment_search_vector_trigger
BEFORE INSERT OR UPDATE ON equipment
FOR EACH ROW
EXECUTE FUNCTION equipment_search_vector_update();

-- Backfill search vectors for existing rows
UPDATE equipment SET updated_at = updated_at;

-- Add comments
COMMENT ON COLUMN equipment.total_usage_hours IS 'Lifetime total usage hours (auto-calculated from usage_logs)';
COMMENT ON COLUMN equipment.search_vector IS 'Full-text search index vector';
```

**Verification SQL**:
```sql
-- Check columns added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'equipment'
  AND column_name IN ('total_usage_hours', 'search_vector');

-- Check trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'equipment';

-- Test search vector
SELECT name, inventory_no, search_vector
FROM equipment
LIMIT 5;
```

---

#### Step 1.2: Create `equipment_reservations` Table

**File**: `database/migrations/002_create_equipment_reservations.sql`

```sql
-- Migration: Create equipment reservations table
-- Date: 2025-10-19
-- Purpose: Time-based equipment reservations with overlap prevention

CREATE TABLE IF NOT EXISTS equipment_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  reserved_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reserved_from TIMESTAMP NOT NULL,
  reserved_until TIMESTAMP NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CHECK (reserved_until > reserved_from),

  -- Prevent overlapping reservations using EXCLUDE constraint
  EXCLUDE USING gist (
    equipment_id WITH =,
    tsrange(reserved_from, reserved_until) WITH &&
  ) WHERE (is_active = true)
);

-- Indexes for performance
CREATE INDEX idx_equipment_reservations_equipment ON equipment_reservations(equipment_id);
CREATE INDEX idx_equipment_reservations_project ON equipment_reservations(project_id);
CREATE INDEX idx_equipment_reservations_user ON equipment_reservations(reserved_by_user_id);
CREATE INDEX idx_equipment_reservations_dates ON equipment_reservations(reserved_from, reserved_until)
WHERE is_active = true;

-- Index for finding reservations covering a specific time
CREATE INDEX idx_equipment_reservations_active_range ON equipment_reservations
USING gist (tsrange(reserved_from, reserved_until))
WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_equipment_reservations_updated_at
BEFORE UPDATE ON equipment_reservations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE equipment_reservations IS 'Time-based reservations of equipment for future use';
COMMENT ON COLUMN equipment_reservations.reserved_from IS 'Start of reservation period';
COMMENT ON COLUMN equipment_reservations.reserved_until IS 'End of reservation period (exclusive)';
COMMENT ON COLUMN equipment_reservations.notes IS 'Reservation notes or reason';
```

**Verification SQL**:
```sql
-- Test overlap prevention
-- This should succeed
INSERT INTO equipment_reservations (equipment_id, reserved_from, reserved_until)
VALUES (
  (SELECT id FROM equipment LIMIT 1),
  '2025-10-20 08:00:00',
  '2025-10-20 17:00:00'
);

-- This should fail (overlaps previous reservation)
INSERT INTO equipment_reservations (equipment_id, reserved_from, reserved_until)
VALUES (
  (SELECT id FROM equipment LIMIT 1),
  '2025-10-20 15:00:00',
  '2025-10-20 19:00:00'
);

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'equipment_reservations';
```

---

#### Step 1.3: Create `equipment_documents` Table

**File**: `database/migrations/003_create_equipment_documents.sql`

```sql
-- Migration: Create equipment documents table
-- Date: 2025-10-19
-- Purpose: Document management for equipment (warranties, manuals, calibration certs)

CREATE TABLE IF NOT EXISTS equipment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'warranty', 'manual', 'calibration', 'inspection', 'safety', 'purchase', 'other'
  )),
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size_bytes INTEGER,
  mime_type VARCHAR(100),
  issue_date DATE,
  expiry_date DATE,
  notes TEXT,
  uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CHECK (expiry_date IS NULL OR expiry_date > issue_date)
);

-- Indexes
CREATE INDEX idx_equipment_documents_equipment ON equipment_documents(equipment_id);
CREATE INDEX idx_equipment_documents_type ON equipment_documents(document_type);
CREATE INDEX idx_equipment_documents_expiry ON equipment_documents(expiry_date)
WHERE is_active = true AND expiry_date IS NOT NULL;

-- Index for finding expiring documents (within 30 days)
CREATE INDEX idx_equipment_documents_expiring_soon ON equipment_documents(expiry_date)
WHERE is_active = true
  AND expiry_date IS NOT NULL
  AND expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days');

-- Trigger for updated_at
CREATE TRIGGER update_equipment_documents_updated_at
BEFORE UPDATE ON equipment_documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE equipment_documents IS 'Documents related to equipment (warranties, manuals, certificates)';
COMMENT ON COLUMN equipment_documents.document_type IS 'Type: warranty, manual, calibration, inspection, safety, purchase, other';
COMMENT ON COLUMN equipment_documents.expiry_date IS 'Expiration date for time-sensitive documents';
COMMENT ON COLUMN equipment_documents.file_path IS 'Path in Supabase Storage bucket';
```

**Verification SQL**:
```sql
-- Check table and indexes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'equipment_documents'
ORDER BY ordinal_position;

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'equipment_documents';
```

---

#### Step 1.4: Create `equipment_usage_logs` Table

**File**: `database/migrations/004_create_equipment_usage_logs.sql`

```sql
-- Migration: Create equipment usage logs table
-- Date: 2025-10-19
-- Purpose: Track daily equipment usage hours with auto-increment total

CREATE TABLE IF NOT EXISTS equipment_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES equipment_assignments(id) ON DELETE SET NULL,
  work_entry_id UUID REFERENCES work_entries(id) ON DELETE SET NULL,
  usage_date DATE NOT NULL,
  hours_used NUMERIC NOT NULL CHECK (hours_used > 0 AND hours_used <= 24),
  meter_reading_km NUMERIC CHECK (meter_reading_km >= 0),
  meter_reading_gps NUMERIC CHECK (meter_reading_gps >= 0),
  condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 5),
  notes TEXT,
  logged_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Prevent duplicate logs for same equipment on same day/work entry
  UNIQUE NULLS NOT DISTINCT (equipment_id, usage_date, work_entry_id)
);

-- Indexes
CREATE INDEX idx_equipment_usage_logs_equipment ON equipment_usage_logs(equipment_id, usage_date DESC);
CREATE INDEX idx_equipment_usage_logs_assignment ON equipment_usage_logs(assignment_id);
CREATE INDEX idx_equipment_usage_logs_work_entry ON equipment_usage_logs(work_entry_id);
CREATE INDEX idx_equipment_usage_logs_date ON equipment_usage_logs(usage_date DESC);

-- Trigger to auto-increment total_usage_hours on equipment
CREATE OR REPLACE FUNCTION update_equipment_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE equipment
  SET total_usage_hours = COALESCE(total_usage_hours, 0) + NEW.hours_used,
      updated_at = NOW()
  WHERE id = NEW.equipment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_equipment_hours
AFTER INSERT ON equipment_usage_logs
FOR EACH ROW
EXECUTE FUNCTION update_equipment_total_hours();

-- Comments
COMMENT ON TABLE equipment_usage_logs IS 'Daily usage logs for equipment with actual hours used';
COMMENT ON COLUMN equipment_usage_logs.hours_used IS 'Actual hours used (0-24 per day)';
COMMENT ON COLUMN equipment_usage_logs.meter_reading_km IS 'Odometer/distance meter reading';
COMMENT ON COLUMN equipment_usage_logs.meter_reading_gps IS 'GPS-based distance traveled';
COMMENT ON COLUMN equipment_usage_logs.condition_rating IS 'Equipment condition: 1=Poor, 5=Excellent';
```

**Verification SQL**:
```sql
-- Test trigger for auto-incrementing total_usage_hours
-- Insert test log
INSERT INTO equipment_usage_logs (equipment_id, usage_date, hours_used)
VALUES (
  (SELECT id FROM equipment LIMIT 1),
  CURRENT_DATE,
  8.5
);

-- Check equipment total_usage_hours updated
SELECT id, name, total_usage_hours
FROM equipment
WHERE id = (SELECT equipment_id FROM equipment_usage_logs ORDER BY created_at DESC LIMIT 1);

-- Clean up test data
DELETE FROM equipment_usage_logs WHERE usage_date = CURRENT_DATE;
UPDATE equipment SET total_usage_hours = 0 WHERE id IN (
  SELECT DISTINCT equipment_id FROM equipment_usage_logs WHERE usage_date = CURRENT_DATE
);
```

---

#### Step 1.5: Create `equipment_maintenance_schedules` Table

**File**: `database/migrations/005_create_equipment_maintenance_schedules.sql`

```sql
-- Migration: Create equipment maintenance schedules table
-- Date: 2025-10-19
-- Purpose: Preventive maintenance scheduling with auto-calculation of next due dates

CREATE TABLE IF NOT EXISTS equipment_maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN (
    'routine', 'repair', 'inspection', 'calibration', 'upgrade'
  )),
  interval_type VARCHAR(20) NOT NULL CHECK (interval_type IN (
    'calendar', 'usage_hours', 'cycles'
  )),
  interval_value INTEGER NOT NULL CHECK (interval_value > 0),
  last_performed_date DATE,
  last_performed_hours NUMERIC,
  next_due_date DATE,
  next_due_hours NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Unique constraint: one schedule per equipment per maintenance type
  UNIQUE (equipment_id, maintenance_type)
);

-- Indexes
CREATE INDEX idx_equipment_maintenance_schedules_equipment ON equipment_maintenance_schedules(equipment_id);
CREATE INDEX idx_equipment_maintenance_schedules_due ON equipment_maintenance_schedules(next_due_date)
WHERE is_active = true AND next_due_date IS NOT NULL;

-- Index for finding overdue maintenance
CREATE INDEX idx_equipment_maintenance_schedules_overdue ON equipment_maintenance_schedules(next_due_date)
WHERE is_active = true AND next_due_date < CURRENT_DATE;

-- Function to calculate next due date
CREATE OR REPLACE FUNCTION calculate_next_maintenance_due(
  p_last_date DATE,
  p_last_hours NUMERIC,
  p_interval_type VARCHAR,
  p_interval_value INTEGER,
  p_current_hours NUMERIC
) RETURNS TABLE(next_date DATE, next_hours NUMERIC) AS $$
BEGIN
  IF p_interval_type = 'calendar' THEN
    RETURN QUERY SELECT
      (p_last_date + (p_interval_value || ' days')::INTERVAL)::DATE,
      NULL::NUMERIC;
  ELSIF p_interval_type = 'usage_hours' THEN
    RETURN QUERY SELECT
      NULL::DATE,
      COALESCE(p_last_hours, p_current_hours, 0) + p_interval_value;
  ELSIF p_interval_type = 'cycles' THEN
    -- Cycles approximated as days for now
    RETURN QUERY SELECT
      (p_last_date + (p_interval_value || ' days')::INTERVAL)::DATE,
      NULL::NUMERIC;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update schedule after maintenance completion
CREATE OR REPLACE FUNCTION update_maintenance_schedule_after_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_equipment_hours NUMERIC;
  v_next_due RECORD;
  v_schedule RECORD;
BEGIN
  -- Only process when maintenance is marked complete
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Get current equipment hours
    SELECT total_usage_hours INTO v_equipment_hours
    FROM equipment
    WHERE id = NEW.equipment_id;

    -- Get schedule for this maintenance type
    SELECT * INTO v_schedule
    FROM equipment_maintenance_schedules
    WHERE equipment_id = NEW.equipment_id
      AND maintenance_type = NEW.maintenance_type
    LIMIT 1;

    -- If schedule exists, calculate next due
    IF FOUND THEN
      SELECT * INTO v_next_due
      FROM calculate_next_maintenance_due(
        NEW.maintenance_date,
        v_equipment_hours,
        v_schedule.interval_type,
        v_schedule.interval_value,
        v_equipment_hours
      );

      -- Update schedule
      UPDATE equipment_maintenance_schedules
      SET
        last_performed_date = NEW.maintenance_date,
        last_performed_hours = v_equipment_hours,
        next_due_date = v_next_due.next_date,
        next_due_hours = v_next_due.next_hours,
        updated_at = NOW()
      WHERE equipment_id = NEW.equipment_id
        AND maintenance_type = NEW.maintenance_type;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_maintenance_schedule
AFTER INSERT OR UPDATE ON equipment_maintenance
FOR EACH ROW
EXECUTE FUNCTION update_maintenance_schedule_after_completion();

-- Trigger for updated_at
CREATE TRIGGER update_equipment_maintenance_schedules_updated_at
BEFORE UPDATE ON equipment_maintenance_schedules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE equipment_maintenance_schedules IS 'Preventive maintenance schedules per equipment';
COMMENT ON COLUMN equipment_maintenance_schedules.interval_type IS 'calendar (days), usage_hours, or cycles';
COMMENT ON COLUMN equipment_maintenance_schedules.interval_value IS 'Interval value (e.g., 180 days, 100 hours)';
COMMENT ON COLUMN equipment_maintenance_schedules.next_due_date IS 'Next scheduled maintenance date (for calendar intervals)';
COMMENT ON COLUMN equipment_maintenance_schedules.next_due_hours IS 'Next scheduled maintenance at X hours (for usage-based intervals)';
```

**Verification SQL**:
```sql
-- Test schedule creation and auto-calculation
INSERT INTO equipment_maintenance_schedules (
  equipment_id, maintenance_type, interval_type, interval_value
)
VALUES (
  (SELECT id FROM equipment LIMIT 1),
  'routine',
  'calendar',
  180  -- Every 180 days
);

-- Create completed maintenance to trigger schedule update
INSERT INTO equipment_maintenance (
  equipment_id, maintenance_type, maintenance_date, status
)
VALUES (
  (SELECT equipment_id FROM equipment_maintenance_schedules ORDER BY created_at DESC LIMIT 1),
  'routine',
  CURRENT_DATE,
  'completed'
);

-- Check schedule updated with next due date
SELECT
  equipment_id,
  maintenance_type,
  last_performed_date,
  next_due_date,
  next_due_date - last_performed_date AS days_interval
FROM equipment_maintenance_schedules
WHERE maintenance_type = 'routine'
ORDER BY created_at DESC
LIMIT 1;
```

---

#### Step 1.6: Create `equipment_type_details` Table

**File**: `database/migrations/006_create_equipment_type_details.sql`

```sql
-- Migration: Create equipment type-specific details table
-- Date: 2025-10-19
-- Purpose: Store typed attributes per equipment type (Power Tool, OTDR, etc.)

CREATE TABLE IF NOT EXISTS equipment_type_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL UNIQUE REFERENCES equipment(id) ON DELETE CASCADE,

  -- Power Tool attributes
  power_w NUMERIC,
  voltage_v NUMERIC,
  battery_type VARCHAR(50),
  battery_capacity_ah NUMERIC,
  ip_rating VARCHAR(10),

  -- Fusion Splicer attributes
  brand VARCHAR(100),
  model VARCHAR(100),
  arc_calibration_date DATE,
  firmware_version VARCHAR(50),

  -- OTDR attributes
  wavelength_nm INTEGER,
  dynamic_range_db NUMERIC,
  fiber_type VARCHAR(50),
  connector_type VARCHAR(50),

  -- Safety Gear attributes
  size VARCHAR(20),
  certification VARCHAR(100),
  inspection_due DATE,

  -- Common attributes
  manufacturer VARCHAR(100),
  serial_number VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_equipment_type_details_equipment ON equipment_type_details(equipment_id);
CREATE INDEX idx_equipment_type_details_manufacturer ON equipment_type_details(manufacturer);
CREATE INDEX idx_equipment_type_details_serial ON equipment_type_details(serial_number);

-- Trigger for updated_at
CREATE TRIGGER update_equipment_type_details_updated_at
BEFORE UPDATE ON equipment_type_details
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE equipment_type_details IS 'Type-specific attributes for equipment (Power Tool, OTDR, Fusion Splicer, Safety Gear)';
COMMENT ON COLUMN equipment_type_details.power_w IS 'Power consumption in watts (Power Tool)';
COMMENT ON COLUMN equipment_type_details.wavelength_nm IS 'Wavelength in nanometers (OTDR)';
COMMENT ON COLUMN equipment_type_details.certification IS 'Safety certification standard (Safety Gear)';
COMMENT ON COLUMN equipment_type_details.arc_calibration_date IS 'Last arc calibration (Fusion Splicer)';
```

**Verification SQL**:
```sql
-- Insert test data for different equipment types
-- Power Tool
INSERT INTO equipment_type_details (equipment_id, power_w, voltage_v, battery_type, ip_rating)
VALUES (
  (SELECT id FROM equipment WHERE type = 'tool' LIMIT 1),
  1200, 18, 'Li-Ion', 'IP65'
);

-- Check inserted
SELECT e.name, e.type, d.power_w, d.voltage_v, d.battery_type
FROM equipment e
JOIN equipment_type_details d ON d.equipment_id = e.id
WHERE e.type = 'tool';
```

---

#### Step 1.7: Add Performance Indexes

**File**: `database/migrations/007_add_equipment_indexes.sql`

```sql
-- Migration: Add performance indexes for equipment system
-- Date: 2025-10-19

-- Equipment table indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_equipment_inventory_no
ON equipment(inventory_no)
WHERE inventory_no IS NOT NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_equipment_owned
ON equipment(owned, is_active)
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_equipment_location
ON equipment(current_location)
WHERE current_location IS NOT NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_equipment_search
ON equipment USING gin(search_vector);

-- Equipment assignments indexes
CREATE INDEX IF NOT EXISTS idx_equipment_assignments_active
ON equipment_assignments(is_active, from_ts DESC);

CREATE INDEX IF NOT EXISTS idx_equipment_assignments_composite
ON equipment_assignments(crew_id, project_id, is_active)
WHERE is_active = true;

-- Equipment maintenance indexes
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_status
ON equipment_maintenance(status, maintenance_date DESC)
WHERE is_active = true;

-- Analyze tables for query planner
ANALYZE equipment;
ANALYZE equipment_assignments;
ANALYZE equipment_maintenance;
ANALYZE equipment_reservations;
ANALYZE equipment_documents;
ANALYZE equipment_usage_logs;
ANALYZE equipment_maintenance_schedules;
ANALYZE equipment_type_details;
```

**Verification SQL**:
```sql
-- Check all indexes created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename LIKE 'equipment%'
ORDER BY tablename, indexname;

-- Check statistics updated
SELECT
  schemaname,
  tablename,
  last_analyze,
  n_live_tup
FROM pg_stat_user_tables
WHERE tablename LIKE 'equipment%'
ORDER BY tablename;
```

---

### Phase 2: API Layer Updates (Estimated: 5-6 days)

#### Step 2.1: Create Reservation Endpoints

**File**: `src/app/api/equipment/reservations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';

// GET /api/equipment/reservations - List reservations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const equipment_id = searchParams.get('equipment_id');
    const project_id = searchParams.get('project_id');
    const active_only = searchParams.get('active_only') === 'true';
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    let sql = `
      SELECT
        r.id,
        r.equipment_id,
        r.project_id,
        r.reserved_by_user_id,
        r.reserved_from,
        r.reserved_until,
        r.notes,
        r.is_active,
        r.created_at,
        e.name as equipment_name,
        e.type as equipment_type,
        e.inventory_no,
        p.name as project_name,
        u.first_name || ' ' || u.last_name as reserved_by_name
      FROM equipment_reservations r
      LEFT JOIN equipment e ON e.id = r.equipment_id
      LEFT JOIN projects p ON p.id = r.project_id
      LEFT JOIN users u ON u.id = r.reserved_by_user_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (equipment_id) {
      sql += ` AND r.equipment_id = $${paramIndex++}`;
      params.push(equipment_id);
    }

    if (project_id) {
      sql += ` AND r.project_id = $${paramIndex++}`;
      params.push(project_id);
    }

    if (active_only) {
      sql += ` AND r.is_active = true`;
    }

    if (from_date) {
      sql += ` AND r.reserved_until >= $${paramIndex++}`;
      params.push(from_date);
    }

    if (to_date) {
      sql += ` AND r.reserved_from <= $${paramIndex++}`;
      params.push(to_date);
    }

    sql += ` ORDER BY r.reserved_from DESC`;

    const result = await query(sql, params);

    return NextResponse.json({
      items: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

// POST /api/equipment/reservations - Create reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      equipment_id,
      project_id,
      reserved_by_user_id,
      reserved_from,
      reserved_until,
      notes
    } = body;

    // Validation
    if (!equipment_id || !reserved_from || !reserved_until) {
      return NextResponse.json(
        { error: 'Missing required fields: equipment_id, reserved_from, reserved_until' },
        { status: 400 }
      );
    }

    // Check for overlapping reservations (handled by DB constraint, but we provide better error message)
    const overlapCheck = await query(
      `SELECT
        r.id,
        r.reserved_from,
        r.reserved_until,
        u.first_name || ' ' || u.last_name as reserved_by_name,
        p.name as project_name
      FROM equipment_reservations r
      LEFT JOIN users u ON u.id = r.reserved_by_user_id
      LEFT JOIN projects p ON p.id = r.project_id
      WHERE r.equipment_id = $1
        AND r.is_active = true
        AND tsrange($2::timestamp, $3::timestamp) && tsrange(r.reserved_from, r.reserved_until)`,
      [equipment_id, reserved_from, reserved_until]
    );

    if (overlapCheck.rows.length > 0) {
      const conflict = overlapCheck.rows[0];
      return NextResponse.json(
        {
          error: 'Reservation conflict',
          details: `Equipment already reserved ${conflict.reserved_from} to ${conflict.reserved_until}`,
          reserved_by: conflict.reserved_by_name,
          project: conflict.project_name,
          conflict_id: conflict.id
        },
        { status: 409 }
      );
    }

    // Check equipment exists and is not broken/retired
    const equipmentCheck = await query(
      `SELECT id, name, status FROM equipment WHERE id = $1 AND is_active = true`,
      [equipment_id]
    );

    if (equipmentCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Equipment not found or inactive' },
        { status: 404 }
      );
    }

    if (['broken', 'retired'].includes(equipmentCheck.rows[0].status)) {
      return NextResponse.json(
        {
          error: `Cannot reserve equipment with status: ${equipmentCheck.rows[0].status}`,
          current_status: equipmentCheck.rows[0].status
        },
        { status: 400 }
      );
    }

    // Create reservation
    const result = await query(
      `INSERT INTO equipment_reservations
        (equipment_id, project_id, reserved_by_user_id, reserved_from, reserved_until, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [equipment_id, project_id, reserved_by_user_id, reserved_from, reserved_until, notes]
    );

    return NextResponse.json({
      success: true,
      reservation: result.rows[0],
      message: 'Reservation created successfully'
    });
  } catch (error: any) {
    console.error('Create reservation error:', error);

    // Handle DB constraint violations
    if (error.code === '23P01') {  // Exclusion constraint violation
      return NextResponse.json(
        { error: 'Reservation conflicts with existing reservation' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
```

**File**: `src/app/api/equipment/reservations/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';

// DELETE /api/equipment/reservations/{id} - Cancel reservation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Soft delete (set is_active = false)
    const result = await query(
      `UPDATE equipment_reservations
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
}
```

---

#### Step 2.2: Create Document Management Endpoints

**File**: `src/app/api/equipment/[id]/documents/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';
import { createClient } from '@/lib/supabase';

const SUPABASE_BUCKET = 'equipment-documents';

// GET /api/equipment/{id}/documents - List documents
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT
        d.id,
        d.equipment_id,
        d.document_type,
        d.document_name,
        d.file_path,
        d.file_size_bytes,
        d.mime_type,
        d.issue_date,
        d.expiry_date,
        d.notes,
        d.uploaded_by_user_id,
        d.created_at,
        u.first_name || ' ' || u.last_name as uploaded_by_name,
        CASE
          WHEN d.expiry_date IS NOT NULL AND d.expiry_date < CURRENT_DATE THEN 'expired'
          WHEN d.expiry_date IS NOT NULL AND d.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
          ELSE 'valid'
        END as expiry_status
      FROM equipment_documents d
      LEFT JOIN users u ON u.id = d.uploaded_by_user_id
      WHERE d.equipment_id = $1 AND d.is_active = true
      ORDER BY d.created_at DESC`,
      [id]
    );

    return NextResponse.json({
      items: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/equipment/{id}/documents - Upload document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: equipment_id } = params;

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const document_type = formData.get('document_type') as string;
    const document_name = formData.get('document_name') as string;
    const issue_date = formData.get('issue_date') as string;
    const expiry_date = formData.get('expiry_date') as string;
    const notes = formData.get('notes') as string;
    const uploaded_by_user_id = formData.get('uploaded_by_user_id') as string;

    if (!file || !document_type) {
      return NextResponse.json(
        { error: 'Missing required fields: file, document_type' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${equipment_id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(fileName);

    // Insert document record
    const result = await query(
      `INSERT INTO equipment_documents
        (equipment_id, document_type, document_name, file_path, file_size_bytes, mime_type, issue_date, expiry_date, notes, uploaded_by_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        equipment_id,
        document_type,
        document_name || file.name,
        fileName,
        file.size,
        file.type,
        issue_date || null,
        expiry_date || null,
        notes || null,
        uploaded_by_user_id || null
      ]
    );

    return NextResponse.json({
      success: true,
      document: {
        ...result.rows[0],
        public_url: publicUrl
      },
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Upload document error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
```

**File**: `src/app/api/equipment/[id]/documents/[doc_id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';
import { createClient } from '@/lib/supabase';

// DELETE /api/equipment/{id}/documents/{doc_id} - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; doc_id: string } }
) {
  try {
    const { doc_id } = params;

    // Get document details before deleting
    const docResult = await query(
      `SELECT file_path FROM equipment_documents WHERE id = $1`,
      [doc_id]
    );

    if (docResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const filePath = docResult.rows[0].file_path;

    // Delete from Supabase Storage
    const supabase = createClient();
    const { error: deleteError } = await supabase.storage
      .from('equipment-documents')
      .remove([filePath]);

    if (deleteError) {
      console.error('Storage delete error:', deleteError);
    }

    // Soft delete from database
    await query(
      `UPDATE equipment_documents
      SET is_active = false, updated_at = NOW()
      WHERE id = $1`,
      [doc_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
```

---

**Due to length constraints, I'll continue with the remaining phases in a summary format:**

#### Step 2.3-2.5: Additional API Endpoints (Implementation details available upon request)

- **Usage Logs**: POST/GET `/api/equipment/usage` (with CSV import support)
- **Maintenance Schedules**: POST/GET `/api/equipment/maintenance/schedules`
- **Availability Check**: GET `/api/equipment/available` (enhanced with reservation check)
- **Bulk Operations**: POST `/api/equipment/bulk-assign`, `/api/equipment/bulk-status`

---

### Phase 3: Frontend Updates (Estimated: 7-8 days)

#### Step 3.1: Update Type Definitions

**File**: `src/types/equipment.ts` (NEW)

```typescript
export interface EquipmentReservation {
  id: string;
  equipment_id: string;
  project_id?: string;
  reserved_by_user_id?: string;
  reserved_from: string;
  reserved_until: string;
  notes?: string;
  is_active: boolean;
  equipment_name?: string;
  project_name?: string;
  reserved_by_name?: string;
}

export interface EquipmentDocument {
  id: string;
  equipment_id: string;
  document_type: 'warranty' | 'manual' | 'calibration' | 'inspection' | 'safety' | 'purchase' | 'other';
  document_name: string;
  file_path: string;
  file_size_bytes?: number;
  mime_type?: string;
  issue_date?: string;
  expiry_date?: string;
  notes?: string;
  uploaded_by_user_id?: string;
  expiry_status?: 'valid' | 'expiring_soon' | 'expired';
  public_url?: string;
}

export interface EquipmentUsageLog {
  id: string;
  equipment_id: string;
  assignment_id?: string;
  work_entry_id?: string;
  usage_date: string;
  hours_used: number;
  meter_reading_km?: number;
  meter_reading_gps?: number;
  condition_rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  logged_by_user_id?: string;
}

export interface EquipmentMaintenanceSchedule {
  id: string;
  equipment_id: string;
  maintenance_type: 'routine' | 'repair' | 'inspection' | 'calibration' | 'upgrade';
  interval_type: 'calendar' | 'usage_hours' | 'cycles';
  interval_value: number;
  last_performed_date?: string;
  next_due_date?: string;
  next_due_hours?: number;
  is_overdue?: boolean;
}

export interface EquipmentTypeDetails {
  id: string;
  equipment_id: string;
  // Power Tool
  power_w?: number;
  voltage_v?: number;
  battery_type?: string;
  ip_rating?: string;
  // Fusion Splicer
  brand?: string;
  model?: string;
  arc_calibration_date?: string;
  firmware_version?: string;
  // OTDR
  wavelength_nm?: number;
  dynamic_range_db?: number;
  fiber_type?: string;
  connector_type?: string;
  // Safety Gear
  size?: string;
  certification?: string;
  inspection_due?: string;
}

export type EquipmentTypedView = 'all' | 'power_tool' | 'fusion_splicer' | 'otdr' | 'safety_gear';
```

#### Step 3.2-3.6: React Components (Summary)

**New Components to Create**:
1. `EquipmentReservationsTab.tsx` - Reservation management UI
2. `EquipmentUsageTab.tsx` - Usage logging and meter tracking
3. `EquipmentDocumentsTab.tsx` - Document upload/viewer with expiry badges
4. `ReservationDialog.tsx` - Create/edit reservation form
5. `UsageLogDialog.tsx` - Daily usage logging form
6. `DocumentUploadDialog.tsx` - Multi-file upload with metadata
7. `TypedViewSelector.tsx` - Dropdown to switch between typed views
8. `MaintenanceScheduleDialog.tsx` - Preventive maintenance scheduling
9. `ConflictWarning.tsx` - Reservation/assignment conflict alerts
10. `CSVImportDialog.tsx` - CSV upload for usage logs

**Enhanced Components**:
1. `EquipmentPage.tsx` - Add 3 new tabs (Usage, Documents, Maintenance separate)
2. `EquipmentFleetTab.tsx` - Add typed view selector and columns
3. `AssignmentDialog.tsx` - Add reservation conflict check
4. `EquipmentAnalyticsTab.tsx` - Add time window filters

#### Step 3.7: Custom Hooks (Summary)

**New Hooks** (`src/hooks/use-equipment.ts` enhancements):
```typescript
export function useEquipmentReservations(filters?) { ... }
export function useCreateReservation() { ... }
export function useCancelReservation() { ... }
export function useEquipmentDocuments(equipment_id) { ... }
export function useUploadDocument() { ... }
export function useDeleteDocument() { ... }
export function useEquipmentUsage(equipment_id) { ... }
export function useLogUsage() { ... }
export function useImportUsageCSV() { ... }
export function useMaintenanceSchedules(equipment_id?) { ... }
export function useCreateMaintenanceSchedule() { ... }
export function useTypedViewColumns(type: EquipmentTypedView) { ... }
```

---

### Phase 4: Testing Strategy (Estimated: 4-5 days)

#### Unit Tests

**Database Layer** (`__tests__/database/equipment.test.ts`):
- [ ] Reservation overlap prevention (EXCLUDE constraint)
- [ ] Usage log auto-increments total_usage_hours
- [ ] Maintenance schedule auto-calculates next due date
- [ ] Document expiry status calculation
- [ ] Search vector updates on equipment name change

**API Layer** (`__tests__/api/equipment.test.ts`):
- [ ] POST /api/equipment/reservations validates date ranges
- [ ] POST /api/equipment/reservations returns 409 on conflict
- [ ] POST /api/equipment/[id]/documents uploads to Supabase Storage
- [ ] POST /api/equipment/usage validates hours_used (0-24)
- [ ] GET /api/equipment supports typed view filtering

**React Hooks** (`__tests__/hooks/use-equipment.test.ts`):
- [ ] useEquipmentReservations fetches and caches data
- [ ] useCreateReservation invalidates cache on success
- [ ] useUploadDocument handles file upload with progress
- [ ] useLogUsage optimistically updates total hours

#### Integration Tests

**Reservation Flow**:
- [ ] Create reservation → Equipment unavailable for that time window
- [ ] Attempt overlapping reservation → Error with conflict details
- [ ] Cancel reservation → Equipment becomes available again

**Usage Tracking Flow**:
- [ ] Log 8 hours usage → equipment.total_usage_hours increments by 8
- [ ] Usage-based maintenance schedule → next_due_hours calculated correctly
- [ ] CSV import → Multiple usage logs created, hours accumulated

**Document Management Flow**:
- [ ] Upload calibration cert with expiry → Document visible in list
- [ ] 29 days pass → Document shows "expiring_soon" badge
- [ ] 31 days pass → Document shows "expired" badge
- [ ] Delete document → Removed from Supabase Storage and DB

#### E2E Tests (Playwright)

**User Workflows**:
- [ ] User creates reservation, sees calendar block
- [ ] User tries to assign reserved equipment, sees conflict warning
- [ ] User uploads warranty document, views in Documents tab
- [ ] User logs daily usage, sees total hours update
- [ ] User schedules preventive maintenance, sees next due date

---

### Phase 5: Deployment Sequence (Estimated: 1-2 days)

#### Pre-Deployment Checklist
- [ ] All migrations tested in staging environment
- [ ] Backup production database
- [ ] Review Supabase Storage bucket permissions
- [ ] Verify API rate limits for file uploads

#### Deployment Steps

**Step 1: Database Migrations** (5-10 minutes)
```bash
# Run migrations in order
psql $DATABASE_URL -f database/migrations/001_add_equipment_columns.sql
psql $DATABASE_URL -f database/migrations/002_create_equipment_reservations.sql
psql $DATABASE_URL -f database/migrations/003_create_equipment_documents.sql
psql $DATABASE_URL -f database/migrations/004_create_equipment_usage_logs.sql
psql $DATABASE_URL -f database/migrations/005_create_equipment_maintenance_schedules.sql
psql $DATABASE_URL -f database/migrations/006_create_equipment_type_details.sql
psql $DATABASE_URL -f database/migrations/007_add_equipment_indexes.sql
```

**Step 2: Backend Deployment** (10-15 minutes)
```bash
# Deploy API changes
git checkout main
git merge dev
npm run build
# Deploy to production (Vercel, etc.)
```

**Step 3: Frontend Deployment** (15-20 minutes)
```bash
# Deploy Next.js app
npm run build --turbopack
# Verify build success
# Deploy static assets
```

**Step 4: Verification** (15-20 minutes)
- [ ] Test reservation creation
- [ ] Test document upload
- [ ] Test usage logging
- [ ] Test maintenance scheduling
- [ ] Check Supabase Storage bucket access
- [ ] Monitor error logs for 24 hours

#### Rollback Procedures

**Database Rollback**:
```sql
-- Revert migrations in reverse order
DROP TABLE IF EXISTS equipment_type_details CASCADE;
DROP TABLE IF EXISTS equipment_maintenance_schedules CASCADE;
DROP TABLE IF EXISTS equipment_usage_logs CASCADE;
DROP TABLE IF EXISTS equipment_documents CASCADE;
DROP TABLE IF EXISTS equipment_reservations CASCADE;
ALTER TABLE equipment DROP COLUMN IF EXISTS total_usage_hours;
ALTER TABLE equipment DROP COLUMN IF EXISTS search_vector;
-- Drop triggers and functions
DROP TRIGGER IF EXISTS equipment_search_vector_trigger ON equipment;
DROP FUNCTION IF EXISTS equipment_search_vector_update();
-- ... (continue for all functions/triggers)
```

**Application Rollback**:
```bash
# Revert to previous deployment
git revert HEAD
npm run build
# Redeploy
```

---

## Risk Assessment

### High Risk Items

**1. Database Migration Downtime**
- **Risk**: 5 new tables + triggers may take 10-15 minutes in production
- **Impact**: Equipment management unavailable during migration
- **Mitigation**: Schedule during low-traffic window (2-4 AM), notify users 48h advance
- **Rollback**: Keep previous version deployed, revert migrations if issues

**2. Reservation Overlap Detection**
- **Risk**: EXCLUDE constraint may not prevent all edge cases (timezone issues, concurrent requests)
- **Impact**: Double-booking equipment, user frustration
- **Mitigation**: Additional application-level check before DB insert, timezone normalization
- **Testing**: Concurrent request simulation (100 simultaneous reservations for same equipment)

**3. Supabase Storage Quota**
- **Risk**: Document uploads may exceed storage limits, especially for large manuals
- **Impact**: Upload failures, user unable to attach documents
- **Mitigation**: File size validation (max 10MB), monitor storage usage, implement cleanup for deleted docs
- **Monitoring**: Alert when bucket reaches 80% capacity

**4. Usage Hour Calculation Accuracy**
- **Risk**: Trigger failures may cause total_usage_hours to desync from actual logs
- **Impact**: Incorrect maintenance schedules, analytics data corruption
- **Mitigation**: Daily reconciliation job, manual recalculation endpoint for admins
- **Verification**: Weekly audit comparing SUM(hours_used) vs equipment.total_usage_hours

### Medium Risk Items

**5. Typed View Performance**
- **Risk**: JOIN to equipment_type_details may slow down equipment list queries
- **Impact**: Slow page loads when viewing typed views
- **Mitigation**: Eager loading, pagination, caching typed view data
- **Monitoring**: Query execution time alerts (> 500ms)

**6. CSV Import Validation**
- **Risk**: Malformed CSV files may cause import failures or data corruption
- **Impact**: Frustrated users, incorrect usage data
- **Mitigation**: Strict validation, preview before import, rollback capability
- **Testing**: Edge case CSV files (empty rows, wrong date formats, negative hours)

### Breaking Changes

**None** - All changes are additive:
- New tables don't affect existing functionality
- New columns have defaults
- Existing API endpoints unchanged (only enhanced with optional parameters)
- Frontend tabs are additions, not replacements

---

## Summary

### Implementation Scope

**Database Changes**:
- 5 new tables (reservations, documents, usage_logs, maintenance_schedules, type_details)
- 2 new columns (total_usage_hours, search_vector)
- 8 new indexes
- 3 triggers
- 2 functions

**API Changes**:
- 15 new endpoints
- 4 enhanced endpoints
- Comprehensive validation and conflict detection

**Frontend Changes**:
- 3 new tabs
- 10 new components
- 15 new hooks
- Enhanced existing components

**Testing**:
- 25+ unit tests
- 15+ integration tests
- 10+ E2E tests

### Complexity Breakdown

| Component | Complexity | Estimated Time |
|-----------|-----------|----------------|
| Database Migrations | HIGH | 3-4 days |
| API Development | HIGH | 5-6 days |
| Frontend Components | MEDIUM-HIGH | 7-8 days |
| Testing | MEDIUM | 4-5 days |
| Deployment | LOW | 1-2 days |
| **TOTAL** | **HIGH** | **3-4 weeks** |

### Success Criteria

✅ **All features implemented**:
1. Typed views show different columns per equipment type
2. Reservations prevent overlapping bookings with clear conflict messages
3. Assignments enforce "one active per item" rule
4. Maintenance schedules auto-calculate next due dates
5. Usage logs auto-increment total hours
6. Documents track expiry with visual warnings
7. No mixing with Materials logic
8. Role-based permissions enforced
9. Fast, responsive UI (< 1s table render, < 150ms filters)
10. Comprehensive test coverage (>80%)

### Next Steps

**Immediate Actions**:
1. ✅ Answer clarifying questions (6 questions above)
2. Review and approve this implementation plan
3. Set up development branch: `feature/equipment-enhancement`
4. Create Supabase Storage bucket: `equipment-documents`
5. Schedule migration window for production

**Development Order**:
1. Week 1: Database migrations + verification
2. Week 2: API endpoints + unit tests
3. Week 3: Frontend components + hooks
4. Week 4: Integration/E2E tests + deployment

---

**Plan Created**: 2025-10-19
**Plan Version**: 1.0
**Estimated Completion**: 2025-11-15 (4 weeks from start)
**References**: EQUIPMENT_SYSTEM_ANALYSIS.md (2023 lines)

