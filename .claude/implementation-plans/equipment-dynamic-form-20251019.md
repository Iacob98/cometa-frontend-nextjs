# Implementation Plan: Equipment Dynamic Category-Specific Fields

**Date**: 2025-10-19
**Status**: Ready for Implementation
**Complexity**: High
**Estimated Effort**: 3-4 days

---

## Executive Summary

This implementation plan transforms the equipment creation form from a basic flat structure into a **dynamic, category-aware form** that displays specialized fields based on the selected equipment category. The system leverages the existing `equipment_type_details` table (currently unused with 0 rows) and introduces a standardized equipment categorization system.

**Key Architecture Decision**: Use **Option B - Separate Typed Table** (equipment_type_details) with enhanced category management. This approach provides:
- Strong typing and validation per category
- Database-level constraints for data integrity
- Easy querying and reporting by category
- Future extensibility with custom_attributes JSONB field
- Already implemented in the database schema

**Critical Finding**: The `equipment_type_details` table already exists with comprehensive fields covering most requested categories, but:
- Table is currently empty (0 rows)
- No category/type classification system in place
- Form doesn't utilize this table
- Need to add missing fields for complete category coverage

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Database Changes](#2-database-changes)
3. [API Layer Changes](#3-api-layer-changes)
4. [Frontend Implementation](#4-frontend-implementation)
5. [Type Definitions](#5-type-definitions)
6. [Implementation Steps](#6-implementation-steps)
7. [Testing Strategy](#7-testing-strategy)
8. [Risk Analysis](#8-risk-analysis)
9. [Rollout Plan](#9-rollout-plan)
10. [Edge Cases](#10-edge-cases)

---

## 1. Current State Analysis

### 1.1 Database Layer

**equipment table** (49 active tables in system):
- Basic fields: id, name, type, inventory_no, status, owned, current_location
- Financial: rental_cost_per_day, purchase_date, warranty_until
- Metadata: description, notes, is_active, created_at, updated_at
- **Current type field**: VARCHAR(100) - freeform text, no constraints
- **Current status values**: 'available', 'issued_to_brigade', 'assigned_to_project', 'maintenance', 'retired', 'lost'

**equipment_type_details table** (EXISTING, UNUSED):
- **Status**: Table exists, 0 rows, fully indexed
- **Coverage**: Has 80% of requested fields already defined
- **Missing fields**:
  - Power Tool: tool_type, accessories_included, inspection_interval_days, next_inspection_date
  - Fusion Splicer: next_calibration_due, battery_health_percent, maintenance_interval_days, core_alignment
  - OTDR: wavelengths (multi-select), gps_enabled, calibration_interval_days
  - Safety Gear: assigned_user_id, expiration_date, color
  - Vehicle: mileage_km, emission_class, service_interval_km, insurance_expiry, inspection_date, gps_tracker_id
  - Measuring Device: measurement_type, range, compatible_models, quantity_in_set, replacement_cycle_months
- **Strengths**:
  - Has custom_attributes JSONB for flexibility
  - Comprehensive indexing (brand, model, serial, calibration dates)
  - Check constraints for data validation
  - Cascading delete to equipment

### 1.2 API Layer

**Current Endpoint**: `/api/equipment` (POST)
- Location: `/home/iacob/Documents/cometa-frontend-nextjs/src/app/api/equipment/route.ts`
- Lines: 183 total
- Uses: Direct Supabase client
- Validation: Minimal (type and name required)
- **Does NOT write to equipment_type_details**

### 1.3 Frontend Layer

**Current Form**: `/dashboard/equipment/new/page.tsx`
- Lines: 446 total
- Framework: React Hook Form + Zod
- Fields: 8 basic fields across 2 tabs
- Tabs: Basic Information, Financial Details
- **No category-specific fields**
- **No integration with equipment_type_details**

**Current Hook**: `use-equipment.ts`
- Lines: 451 total
- State: TanStack Query
- Interface: Equipment (basic fields only)
- **No TypeDetails interface integration**

**Current Types**: `src/types/equipment-enhanced.ts`
- **Already defines EquipmentTypeDetails interface** (lines 284-347)
- **Already defines typed views**: PowerToolView, FusionSplicerView, OTDRView, SafetyGearView
- **Missing**: Category enum, complete field mappings

---

## 2. Database Changes

### 2.1 New Equipment Category Enum

**Recommendation**: Add equipment category system separate from generic 'type' field.

```sql
-- Migration: 001_add_equipment_categories.sql

-- Create equipment category enum
CREATE TYPE equipment_category AS ENUM (
  'power_tool',
  'fusion_splicer',
  'otdr',
  'safety_gear',
  'vehicle',
  'measuring_device',
  'accessory'
);

-- Add category column to equipment table
ALTER TABLE equipment
ADD COLUMN category equipment_category;

-- Create index for category queries
CREATE INDEX idx_equipment_category
ON equipment(category)
WHERE is_active = true;

-- Update existing equipment to default category (if any exist)
-- This is safe because current data shows only 'tool' type
UPDATE equipment
SET category = 'power_tool'
WHERE type = 'tool' AND is_active = true;

-- Add comment for documentation
COMMENT ON COLUMN equipment.category IS 'Equipment category determines which type-specific fields are required in equipment_type_details';
```

### 2.2 Add Missing Fields to equipment_type_details

```sql
-- Migration: 002_extend_equipment_type_details.sql

-- Power Tool additions
ALTER TABLE equipment_type_details
ADD COLUMN tool_type VARCHAR(100),
ADD COLUMN accessories_included TEXT[], -- Array of accessory names
ADD COLUMN inspection_interval_days INTEGER,
ADD COLUMN next_inspection_date DATE,
ADD COLUMN weight_kg NUMERIC(8,2);

-- Fusion Splicer additions
ALTER TABLE equipment_type_details
ADD COLUMN next_calibration_due DATE,
ADD COLUMN battery_health_percent NUMERIC(5,2),
ADD COLUMN maintenance_interval_days INTEGER,
ADD COLUMN core_alignment BOOLEAN DEFAULT false;

-- OTDR additions
ALTER TABLE equipment_type_details
ADD COLUMN wavelengths_nm INTEGER[], -- Array: [1310, 1550, 1625]
ADD COLUMN gps_enabled BOOLEAN DEFAULT false,
ADD COLUMN calibration_interval_days INTEGER DEFAULT 365;

-- Safety Gear additions
ALTER TABLE equipment_type_details
ADD COLUMN assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN expiration_date DATE,
ADD COLUMN color VARCHAR(50);

-- Vehicle additions
ALTER TABLE equipment_type_details
ADD COLUMN mileage_km INTEGER,
ADD COLUMN emission_class VARCHAR(20),
ADD COLUMN service_interval_km INTEGER,
ADD COLUMN insurance_expiry DATE,
ADD COLUMN inspection_date DATE,
ADD COLUMN gps_tracker_id VARCHAR(100);

-- Measuring Device additions
ALTER TABLE equipment_type_details
ADD COLUMN measurement_type VARCHAR(100),
ADD COLUMN range VARCHAR(100), -- e.g., "0-100m", "0-600V"
ADD COLUMN compatible_models TEXT[], -- Array of compatible equipment models
ADD COLUMN quantity_in_set INTEGER,
ADD COLUMN replacement_cycle_months INTEGER;

-- Add check constraints
ALTER TABLE equipment_type_details
ADD CONSTRAINT check_weight_positive
  CHECK (weight_kg IS NULL OR weight_kg > 0),
ADD CONSTRAINT check_battery_health_range
  CHECK (battery_health_percent IS NULL OR (battery_health_percent >= 0 AND battery_health_percent <= 100)),
ADD CONSTRAINT check_mileage_positive
  CHECK (mileage_km IS NULL OR mileage_km >= 0),
ADD CONSTRAINT check_quantity_positive
  CHECK (quantity_in_set IS NULL OR quantity_in_set > 0);

-- Create additional indexes
CREATE INDEX idx_equipment_type_details_assigned_user
ON equipment_type_details(assigned_user_id)
WHERE assigned_user_id IS NOT NULL;

CREATE INDEX idx_equipment_type_details_next_inspection
ON equipment_type_details(next_inspection_date)
WHERE next_inspection_date IS NOT NULL;

CREATE INDEX idx_equipment_type_details_insurance_expiry
ON equipment_type_details(insurance_expiry)
WHERE insurance_expiry IS NOT NULL;

CREATE INDEX idx_equipment_type_details_next_calibration
ON equipment_type_details(next_calibration_due)
WHERE next_calibration_due IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN equipment_type_details.wavelengths_nm IS 'Array of supported wavelengths for OTDR equipment (e.g., [1310, 1550, 1625])';
COMMENT ON COLUMN equipment_type_details.accessories_included IS 'Array of accessory names included with power tools';
COMMENT ON COLUMN equipment_type_details.compatible_models IS 'Array of compatible equipment model names for accessories';
```

### 2.3 Create Category-Specific Views (Optional but Recommended)

```sql
-- Migration: 003_create_equipment_category_views.sql

-- Power Tool View
CREATE OR REPLACE VIEW v_equipment_power_tools AS
SELECT
  e.id, e.name, e.type, e.inventory_no, e.status, e.current_location, e.owned,
  e.rental_cost_per_day, e.description, e.notes, e.created_at, e.updated_at,
  d.power_watts, d.voltage_volts, d.battery_type, d.battery_capacity_ah,
  d.ip_rating, d.rpm, d.weight_kg, d.tool_type, d.accessories_included,
  d.inspection_interval_days, d.next_inspection_date,
  d.brand, d.model, d.serial_number
FROM equipment e
LEFT JOIN equipment_type_details d ON e.id = d.equipment_id
WHERE e.category = 'power_tool' AND e.is_active = true;

-- Fusion Splicer View
CREATE OR REPLACE VIEW v_equipment_fusion_splicers AS
SELECT
  e.id, e.name, e.inventory_no, e.status, e.current_location,
  d.brand, d.model, d.firmware_version, d.splice_count,
  d.arc_calibration_date, d.next_calibration_due,
  d.battery_health_percent, d.core_alignment,
  d.maintenance_interval_days, d.serial_number,
  -- Computed calibration status
  CASE
    WHEN d.arc_calibration_date IS NULL THEN 'never_calibrated'
    WHEN d.next_calibration_due < CURRENT_DATE THEN 'calibration_overdue'
    WHEN d.next_calibration_due < CURRENT_DATE + INTERVAL '30 days' THEN 'calibration_soon'
    ELSE 'calibration_ok'
  END AS calibration_status
FROM equipment e
LEFT JOIN equipment_type_details d ON e.id = d.equipment_id
WHERE e.category = 'fusion_splicer' AND e.is_active = true;

-- OTDR View
CREATE OR REPLACE VIEW v_equipment_otdrs AS
SELECT
  e.id, e.name, e.inventory_no, e.status, e.current_location,
  d.brand, d.model, d.wavelengths_nm, d.dynamic_range_db,
  d.fiber_type, d.connector_type, d.last_calibration_date,
  d.calibration_interval_days, d.calibration_certificate_no,
  d.firmware_version, d.gps_enabled, d.serial_number,
  -- Computed next calibration
  (d.last_calibration_date + (d.calibration_interval_days || ' days')::INTERVAL)::DATE AS next_calibration_date,
  -- Computed calibration status
  CASE
    WHEN d.last_calibration_date IS NULL THEN 'never_calibrated'
    WHEN (d.last_calibration_date + (d.calibration_interval_days || ' days')::INTERVAL)::DATE < CURRENT_DATE THEN 'calibration_overdue'
    WHEN (d.last_calibration_date + (d.calibration_interval_days || ' days')::INTERVAL)::DATE < CURRENT_DATE + INTERVAL '30 days' THEN 'calibration_soon'
    ELSE 'calibration_ok'
  END AS calibration_status
FROM equipment e
LEFT JOIN equipment_type_details d ON e.id = d.equipment_id
WHERE e.category = 'otdr' AND e.is_active = true;

-- Safety Gear View
CREATE OR REPLACE VIEW v_equipment_safety_gear AS
SELECT
  e.id, e.name, e.inventory_no, e.status, e.current_location,
  d.size, d.certification, d.inspection_due_date,
  d.certification_expiry_date, d.expiration_date,
  d.manufacturer, d.color, d.serial_number,
  d.assigned_user_id,
  u.first_name || ' ' || u.last_name AS assigned_user_name,
  -- Computed compliance status
  CASE
    WHEN d.inspection_due_date < CURRENT_DATE THEN 'inspection_overdue'
    WHEN d.inspection_due_date < CURRENT_DATE + INTERVAL '30 days' THEN 'inspection_soon'
    WHEN d.certification_expiry_date < CURRENT_DATE THEN 'certification_expired'
    WHEN d.certification_expiry_date < CURRENT_DATE + INTERVAL '90 days' THEN 'certification_expiring'
    ELSE 'ok'
  END AS compliance_status
FROM equipment e
LEFT JOIN equipment_type_details d ON e.id = d.equipment_id
LEFT JOIN users u ON d.assigned_user_id = u.id
WHERE e.category = 'safety_gear' AND e.is_active = true;

-- Vehicle View
CREATE OR REPLACE VIEW v_equipment_vehicles AS
SELECT
  e.id, e.name, e.inventory_no, e.status, e.current_location,
  d.license_plate, d.vin, d.mileage_km, d.fuel_type,
  d.emission_class, d.service_interval_km,
  d.insurance_expiry, d.inspection_date,
  d.gps_tracker_id, d.brand, d.model,
  d.tank_capacity_liters, d.load_capacity_kg,
  -- Service due calculation
  CASE
    WHEN d.service_interval_km IS NOT NULL AND d.mileage_km IS NOT NULL
    THEN d.mileage_km + d.service_interval_km - (d.mileage_km % d.service_interval_km)
    ELSE NULL
  END AS next_service_km
FROM equipment e
LEFT JOIN equipment_type_details d ON e.id = d.equipment_id
WHERE e.category = 'vehicle' AND e.is_active = true;

-- Measuring Device View
CREATE OR REPLACE VIEW v_equipment_measuring_devices AS
SELECT
  e.id, e.name, e.inventory_no, e.status, e.current_location,
  d.measurement_type, d.range, d.accuracy_rating,
  d.last_calibration_date, d.calibration_interval_months,
  d.calibration_certificate_no, d.battery_type,
  d.compatible_models, d.quantity_in_set,
  d.replacement_cycle_months, d.brand, d.model,
  -- Computed next calibration
  (d.last_calibration_date + (d.calibration_interval_months || ' months')::INTERVAL)::DATE AS next_calibration_date
FROM equipment e
LEFT JOIN equipment_type_details d ON e.id = d.equipment_id
WHERE e.category = 'measuring_device' AND e.is_active = true;

-- Grant read access to views (adjust role as needed)
GRANT SELECT ON v_equipment_power_tools TO authenticated;
GRANT SELECT ON v_equipment_fusion_splicers TO authenticated;
GRANT SELECT ON v_equipment_otdrs TO authenticated;
GRANT SELECT ON v_equipment_safety_gear TO authenticated;
GRANT SELECT ON v_equipment_vehicles TO authenticated;
GRANT SELECT ON v_equipment_measuring_devices TO authenticated;
```

### 2.4 Migration Rollback Strategy

```sql
-- Rollback: 003_create_equipment_category_views.sql
DROP VIEW IF EXISTS v_equipment_power_tools;
DROP VIEW IF EXISTS v_equipment_fusion_splicers;
DROP VIEW IF EXISTS v_equipment_otdrs;
DROP VIEW IF EXISTS v_equipment_safety_gear;
DROP VIEW IF EXISTS v_equipment_vehicles;
DROP VIEW IF EXISTS v_equipment_measuring_devices;

-- Rollback: 002_extend_equipment_type_details.sql
ALTER TABLE equipment_type_details
DROP COLUMN IF EXISTS tool_type,
DROP COLUMN IF EXISTS accessories_included,
DROP COLUMN IF EXISTS inspection_interval_days,
DROP COLUMN IF EXISTS next_inspection_date,
DROP COLUMN IF EXISTS weight_kg,
DROP COLUMN IF EXISTS next_calibration_due,
DROP COLUMN IF EXISTS battery_health_percent,
DROP COLUMN IF EXISTS maintenance_interval_days,
DROP COLUMN IF EXISTS core_alignment,
DROP COLUMN IF EXISTS wavelengths_nm,
DROP COLUMN IF EXISTS gps_enabled,
DROP COLUMN IF EXISTS calibration_interval_days,
DROP COLUMN IF EXISTS assigned_user_id,
DROP COLUMN IF EXISTS expiration_date,
DROP COLUMN IF EXISTS color,
DROP COLUMN IF EXISTS mileage_km,
DROP COLUMN IF EXISTS emission_class,
DROP COLUMN IF EXISTS service_interval_km,
DROP COLUMN IF EXISTS insurance_expiry,
DROP COLUMN IF EXISTS inspection_date,
DROP COLUMN IF EXISTS gps_tracker_id,
DROP COLUMN IF EXISTS measurement_type,
DROP COLUMN IF EXISTS range,
DROP COLUMN IF EXISTS compatible_models,
DROP COLUMN IF EXISTS quantity_in_set,
DROP COLUMN IF EXISTS replacement_cycle_months;

-- Rollback: 001_add_equipment_categories.sql
ALTER TABLE equipment DROP COLUMN IF EXISTS category;
DROP TYPE IF EXISTS equipment_category;
```

### 2.5 Data Validation Queries

```sql
-- Verify category distribution
SELECT category, COUNT(*)
FROM equipment
WHERE is_active = true
GROUP BY category;

-- Check for equipment missing type details
SELECT e.id, e.name, e.category
FROM equipment e
LEFT JOIN equipment_type_details d ON e.id = d.equipment_id
WHERE e.is_active = true AND d.id IS NULL;

-- Check calibration status for fusion splicers
SELECT * FROM v_equipment_fusion_splicers
WHERE calibration_status IN ('never_calibrated', 'calibration_overdue');

-- Check compliance for safety gear
SELECT * FROM v_equipment_safety_gear
WHERE compliance_status IN ('inspection_overdue', 'certification_expired');
```

---

## 3. API Layer Changes

### 3.1 Enhanced POST /api/equipment

**File**: `/home/iacob/Documents/cometa-frontend-nextjs/src/app/api/equipment/route.ts`

**Changes**:
1. Accept category-specific fields in request body
2. Create equipment record in `equipment` table
3. Create corresponding record in `equipment_type_details` table
4. Transaction handling for atomicity
5. Enhanced validation per category

```typescript
// Updated POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Base equipment fields
      type,
      name,
      category, // NEW: Required category
      inventory_no,
      status = "available",
      rental_cost_per_day,
      description,
      notes,
      owned = true,
      current_location,

      // Category-specific fields (NEW)
      typeDetails, // Object containing all category-specific fields
    } = body;

    // Validation
    if (!type || !name || !category) {
      return NextResponse.json(
        { error: "Type, name, and category are required" },
        { status: 400 }
      );
    }

    // Validate category against allowed values
    const allowedCategories = [
      'power_tool', 'fusion_splicer', 'otdr',
      'safety_gear', 'vehicle', 'measuring_device', 'accessory'
    ];
    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${allowedCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Start transaction by creating equipment first
    const { data: equipment, error: equipmentError } = await supabase
      .from("equipment")
      .insert([
        {
          type,
          name,
          category, // NEW
          inventory_no,
          status: status || "available",
          rental_cost_per_day: rental_cost_per_day || null,
          description: description || null,
          notes: notes || null,
          owned: owned,
          current_location: current_location || null,
        },
      ])
      .select(
        `
        id,
        type,
        category,
        name,
        inventory_no,
        status,
        rental_cost_per_day,
        description,
        notes,
        owned,
        current_location,
        created_at
      `
      )
      .single();

    if (equipmentError) {
      console.error("Supabase error creating equipment:", equipmentError);
      return NextResponse.json(
        { error: "Failed to create equipment in database" },
        { status: 500 }
      );
    }

    // If category-specific fields provided, create type details record
    if (typeDetails && Object.keys(typeDetails).length > 0) {
      const { data: typeDetailsRecord, error: typeDetailsError } = await supabase
        .from("equipment_type_details")
        .insert([
          {
            equipment_id: equipment.id,
            ...typeDetails, // Spread all category-specific fields
          },
        ])
        .select()
        .single();

      if (typeDetailsError) {
        console.error("Error creating equipment type details:", typeDetailsError);

        // Rollback: Delete the equipment record
        await supabase
          .from("equipment")
          .delete()
          .eq("id", equipment.id);

        return NextResponse.json(
          { error: "Failed to create equipment type details" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        ...equipment,
        typeDetails: typeDetails || null
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create equipment error:", error);
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    );
  }
}
```

### 3.2 Enhanced GET /api/equipment (List)

**Changes**: Include type details in equipment list response

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;
    const type = searchParams.get("type");
    const category = searchParams.get("category"); // NEW filter
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const owned = searchParams.get("owned");

    // Enhanced query with type details join
    let query = supabase
      .from("equipment")
      .select(
        `
        id,
        name,
        type,
        category,
        inventory_no,
        status,
        rental_cost_per_day,
        purchase_date,
        warranty_until,
        description,
        notes,
        owned,
        current_location,
        is_active,
        created_at,
        updated_at,
        equipment_type_details (
          id,
          power_watts,
          voltage_volts,
          battery_type,
          brand,
          model,
          serial_number,
          last_calibration_date,
          next_calibration_due,
          calibration_interval_days,
          inspection_due_date,
          certification_expiry_date,
          license_plate,
          vin,
          mileage_km
        )
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .order("name", { ascending: true })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (type) {
      query = query.eq("type", type);
    }

    if (category) { // NEW filter
      query = query.eq("category", category);
    }

    // ... rest of existing filters ...

    const { data: equipment, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch equipment from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: equipment || [],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    });
  } catch (error) {
    console.error("Equipment API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}
```

### 3.3 New Endpoint: GET /api/equipment/[id]

**File**: `/home/iacob/Documents/cometa-frontend-nextjs/src/app/api/equipment/[id]/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: equipment, error } = await supabase
      .from("equipment")
      .select(
        `
        *,
        equipment_type_details (*)
      `
      )
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Get equipment error:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      // Extract base fields
      type,
      name,
      category,
      inventory_no,
      status,
      rental_cost_per_day,
      description,
      notes,
      owned,
      current_location,

      // Extract type details
      typeDetails,
    } = body;

    // Update equipment base record
    const { data: equipment, error: equipmentError } = await supabase
      .from("equipment")
      .update({
        type,
        name,
        category,
        inventory_no,
        status,
        rental_cost_per_day,
        description,
        notes,
        owned,
        current_location,
      })
      .eq("id", id)
      .select()
      .single();

    if (equipmentError) {
      console.error("Error updating equipment:", equipmentError);
      return NextResponse.json(
        { error: "Failed to update equipment" },
        { status: 500 }
      );
    }

    // Update or create type details if provided
    if (typeDetails) {
      // Check if type details exist
      const { data: existingDetails } = await supabase
        .from("equipment_type_details")
        .select("id")
        .eq("equipment_id", id)
        .single();

      if (existingDetails) {
        // Update existing
        await supabase
          .from("equipment_type_details")
          .update(typeDetails)
          .eq("equipment_id", id);
      } else {
        // Create new
        await supabase
          .from("equipment_type_details")
          .insert([
            {
              equipment_id: id,
              ...typeDetails,
            },
          ]);
      }
    }

    return NextResponse.json({ success: true, equipment });
  } catch (error) {
    console.error("Update equipment error:", error);
    return NextResponse.json(
      { error: "Failed to update equipment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Soft delete (set is_active = false)
    const { error } = await supabase
      .from("equipment")
      .update({ is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Error deleting equipment:", error);
      return NextResponse.json(
        { error: "Failed to delete equipment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete equipment error:", error);
    return NextResponse.json(
      { error: "Failed to delete equipment" },
      { status: 500 }
    );
  }
}
```

### 3.4 Validation Schemas (Zod)

**File**: `/home/iacob/Documents/cometa-frontend-nextjs/src/lib/validations/equipment-schemas.ts` (NEW)

```typescript
import { z } from "zod";

// Equipment category enum
export const equipmentCategorySchema = z.enum([
  'power_tool',
  'fusion_splicer',
  'otdr',
  'safety_gear',
  'vehicle',
  'measuring_device',
  'accessory',
]);

// Base equipment schema
export const baseEquipmentSchema = z.object({
  name: z.string().min(2).max(255),
  type: z.string().min(1).max(100),
  category: equipmentCategorySchema,
  inventory_no: z.string().max(100).optional(),
  status: z.enum(['available', 'in_use', 'maintenance', 'broken']).default('available'),
  rental_cost_per_day: z.number().min(0).optional(),
  description: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
  owned: z.boolean().default(true),
  current_location: z.string().max(200).optional(),
});

// Power Tool type details
export const powerToolDetailsSchema = z.object({
  power_watts: z.number().positive().optional(),
  voltage_volts: z.number().positive().optional(),
  battery_type: z.enum(['Li-ion', 'NiMH', 'NiCd', 'Corded']).optional(),
  rpm: z.number().positive().optional(),
  ip_rating: z.enum(['IP20', 'IP54', 'IP65', 'IP67', 'IP68']).optional(),
  weight_kg: z.number().positive().optional(),
  tool_type: z.enum(['Drill', 'Grinder', 'Saw', 'Compressor', 'Impact Driver', 'Other']).optional(),
  accessories_included: z.array(z.string()).optional(),
  inspection_interval_days: z.number().positive().optional(),
  next_inspection_date: z.string().date().optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
});

// Fusion Splicer type details
export const fusionSplicerDetailsSchema = z.object({
  splice_count: z.number().int().min(0).optional(),
  arc_calibration_date: z.string().date(),
  next_calibration_due: z.string().date().optional(),
  firmware_version: z.string().max(50).optional(),
  core_alignment: z.boolean().default(false),
  battery_health_percent: z.number().min(0).max(100).optional(),
  maintenance_interval_days: z.number().positive().optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
});

// OTDR type details
export const otdrDetailsSchema = z.object({
  wavelengths_nm: z.array(z.enum(['1310', '1550', '1625'])).min(1),
  dynamic_range_db: z.number().positive().optional(),
  fiber_type: z.enum(['Singlemode', 'Multimode', 'OM3', 'OM4']).optional(),
  connector_type: z.enum(['SC', 'LC', 'FC', 'ST']).optional(),
  last_calibration_date: z.string().date(),
  calibration_interval_days: z.number().positive().default(365),
  firmware_version: z.string().max(50).optional(),
  gps_enabled: z.boolean().default(false),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
});

// Safety Gear type details
export const safetyGearDetailsSchema = z.object({
  size: z.string().max(20).optional(),
  certification: z.string().max(100).optional(),
  inspection_interval_months: z.number().positive().optional(),
  inspection_due_date: z.string().date(),
  expiration_date: z.string().date().optional(),
  assigned_user_id: z.string().uuid().optional(),
  color: z.string().max(50).optional(),
  manufacturer: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
});

// Vehicle type details
export const vehicleDetailsSchema = z.object({
  license_plate: z.string().max(50),
  vin: z.string().max(50).optional(),
  mileage_km: z.number().int().min(0).optional(),
  fuel_type: z.enum(['Diesel', 'Gasoline', 'Electric', 'Hybrid']).optional(),
  emission_class: z.string().max(20).optional(),
  service_interval_km: z.number().positive().optional(),
  insurance_expiry: z.string().date().optional(),
  inspection_date: z.string().date().optional(),
  gps_tracker_id: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
});

// Measuring Device type details
export const measuringDeviceDetailsSchema = z.object({
  measurement_type: z.enum(['Length', 'Voltage', 'Temperature', 'Current', 'Resistance', 'Other']).optional(),
  range: z.string().max(100).optional(), // e.g., "0-100m", "0-600V"
  accuracy_rating: z.string().max(50).optional(), // e.g., "±2%"
  last_calibration_date: z.string().date(),
  calibration_interval_months: z.number().positive().default(12),
  battery_type: z.string().max(50).optional(),
  compatible_models: z.array(z.string()).optional(),
  quantity_in_set: z.number().positive().optional(),
  replacement_cycle_months: z.number().positive().optional(),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  serial_number: z.string().max(100).optional(),
});

// Accessory type details
export const accessoryDetailsSchema = z.object({
  compatible_models: z.array(z.string()).optional(),
  part_number: z.string().max(100).optional(),
  quantity_in_set: z.number().positive().optional(),
  replacement_cycle_months: z.number().positive().optional(),
  serial_number: z.string().max(100).optional(),
});

// Category to schema mapping
export const categoryDetailsSchemaMap = {
  power_tool: powerToolDetailsSchema,
  fusion_splicer: fusionSplicerDetailsSchema,
  otdr: otdrDetailsSchema,
  safety_gear: safetyGearDetailsSchema,
  vehicle: vehicleDetailsSchema,
  measuring_device: measuringDeviceDetailsSchema,
  accessory: accessoryDetailsSchema,
};

// Full equipment creation schema
export const createEquipmentSchema = baseEquipmentSchema.extend({
  typeDetails: z.record(z.any()).optional(), // Will be validated based on category
});

// Validation helper
export function validateEquipmentTypeDetails(
  category: string,
  typeDetails: any
): { success: boolean; error?: string; data?: any } {
  const schema = categoryDetailsSchemaMap[category as keyof typeof categoryDetailsSchemaMap];

  if (!schema) {
    return { success: false, error: `Unknown category: ${category}` };
  }

  try {
    const validated = schema.parse(typeDetails);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}
```

---

## 4. Frontend Implementation

### 4.1 Enhanced Equipment Form Component

**File**: `/home/iacob/Documents/cometa-frontend-nextjs/src/app/(dashboard)/dashboard/equipment/new/page.tsx`

**Architecture**: Multi-step form with category selection triggering dynamic field rendering

```typescript
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Wrench, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Import category-specific field components
import { CategorySelector } from "@/components/equipment/category-selector"
import { BaseEquipmentFields } from "@/components/equipment/base-equipment-fields"
import { PowerToolFields } from "@/components/equipment/power-tool-fields"
import { FusionSplicerFields } from "@/components/equipment/fusion-splicer-fields"
import { OTDRFields } from "@/components/equipment/otdr-fields"
import { SafetyGearFields } from "@/components/equipment/safety-gear-fields"
import { VehicleFields } from "@/components/equipment/vehicle-fields"
import { MeasuringDeviceFields } from "@/components/equipment/measuring-device-fields"
import { AccessoryFields } from "@/components/equipment/accessory-fields"

// Import validation schemas
import {
  baseEquipmentSchema,
  equipmentCategorySchema,
  categoryDetailsSchemaMap,
} from "@/lib/validations/equipment-schemas"

// Dynamic form schema that changes based on category
const createDynamicSchema = (category: string | null) => {
  if (!category) {
    return baseEquipmentSchema;
  }

  const typeDetailsSchema = categoryDetailsSchemaMap[category as keyof typeof categoryDetailsSchemaMap];

  if (!typeDetailsSchema) {
    return baseEquipmentSchema;
  }

  return baseEquipmentSchema.extend({
    typeDetails: typeDetailsSchema,
  });
};

export default function NewEquipmentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCategoryWarning, setShowCategoryWarning] = useState(false)

  // Initialize form with dynamic schema
  const form = useForm({
    resolver: zodResolver(createDynamicSchema(selectedCategory)),
    defaultValues: {
      name: "",
      type: "",
      category: undefined,
      inventory_no: "",
      owned: true,
      status: "available",
      current_location: "",
      description: "",
      notes: "",
      typeDetails: {},
    },
  })

  // Watch category changes
  const watchedCategory = form.watch("category")

  // Update selected category when form value changes
  useEffect(() => {
    if (watchedCategory !== selectedCategory) {
      // Show warning if user has filled category-specific fields
      const typeDetails = form.getValues("typeDetails")
      if (selectedCategory && typeDetails && Object.keys(typeDetails).length > 0) {
        setShowCategoryWarning(true)
      }

      setSelectedCategory(watchedCategory)

      // Reset type details when category changes
      form.setValue("typeDetails", {})
    }
  }, [watchedCategory, selectedCategory, form])

  // Form submission handler
  async function onSubmit(values: any) {
    setIsSubmitting(true)

    try {
      // Prepare equipment data
      const equipmentData = {
        name: values.name,
        type: values.type,
        category: values.category,
        inventory_no: values.inventory_no || undefined,
        owned: values.owned,
        status: values.status,
        current_location: values.current_location || undefined,
        rental_cost_per_day: values.rental_cost_per_day,
        description: values.description || undefined,
        notes: values.notes || undefined,
        typeDetails: values.typeDetails || {},
      }

      // Submit to API
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create equipment')
      }

      const result = await response.json()

      toast.success("Equipment created successfully!")
      router.push('/dashboard/equipment')

    } catch (error) {
      console.error('Equipment creation error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create equipment")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render category-specific fields
  const renderCategoryFields = () => {
    if (!selectedCategory) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a category above to display category-specific fields
          </AlertDescription>
        </Alert>
      )
    }

    switch (selectedCategory) {
      case 'power_tool':
        return <PowerToolFields form={form} />
      case 'fusion_splicer':
        return <FusionSplicerFields form={form} />
      case 'otdr':
        return <OTDRFields form={form} />
      case 'safety_gear':
        return <SafetyGearFields form={form} />
      case 'vehicle':
        return <VehicleFields form={form} />
      case 'measuring_device':
        return <MeasuringDeviceFields form={form} />
      case 'accessory':
        return <AccessoryFields form={form} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Equipment</h1>
            <p className="text-muted-foreground">
              Create a new equipment entry with category-specific details
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <div className="max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* Category Warning */}
            {showCategoryWarning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Changing category will reset all category-specific fields. Are you sure?
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => setShowCategoryWarning(false)}
                  >
                    Continue
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Step 1: Category Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Select Equipment Category</CardTitle>
                <CardDescription>
                  Choose the category that best describes this equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategorySelector form={form} />
              </CardContent>
            </Card>

            {/* Step 2: Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Step 2: Basic Equipment Details
                </CardTitle>
                <CardDescription>
                  Enter the general information about the equipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BaseEquipmentFields form={form} />
              </CardContent>
            </Card>

            {/* Step 3: Category-Specific Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Category-Specific Details</CardTitle>
                <CardDescription>
                  {selectedCategory
                    ? `Enter details specific to ${selectedCategory.replace('_', ' ')}`
                    : 'Select a category to view specific fields'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderCategoryFields()}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedCategory}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Equipment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
```

### 4.2 Category Selector Component

**File**: `/home/iacob/Documents/cometa-frontend-nextjs/src/components/equipment/category-selector.tsx` (NEW)

```typescript
"use client"

import { UseFormReturn } from "react-hook-form"
import {
  Wrench, Zap, Radio, Shield, Truck, Ruler, Package
} from "lucide-react"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const categories = [
  {
    value: 'power_tool',
    label: 'Power Tool',
    icon: Wrench,
    description: 'Drills, grinders, saws, compressors',
    color: 'text-blue-500',
  },
  {
    value: 'fusion_splicer',
    label: 'Fusion Splicer',
    icon: Zap,
    description: 'Fiber optic fusion splicing machines',
    color: 'text-yellow-500',
  },
  {
    value: 'otdr',
    label: 'OTDR',
    icon: Radio,
    description: 'Optical Time Domain Reflectometer',
    color: 'text-purple-500',
  },
  {
    value: 'safety_gear',
    label: 'Safety Gear',
    icon: Shield,
    description: 'PPE, helmets, vests, harnesses',
    color: 'text-green-500',
  },
  {
    value: 'vehicle',
    label: 'Vehicle',
    icon: Truck,
    description: 'Trucks, vans, transport equipment',
    color: 'text-red-500',
  },
  {
    value: 'measuring_device',
    label: 'Measuring Device',
    icon: Ruler,
    description: 'Meters, gauges, calibration tools',
    color: 'text-indigo-500',
  },
  {
    value: 'accessory',
    label: 'Accessory / Component',
    icon: Package,
    description: 'Compatible parts and accessories',
    color: 'text-gray-500',
  },
]

interface CategorySelectorProps {
  form: UseFormReturn<any>
}

export function CategorySelector({ form }: CategorySelectorProps) {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Equipment Category *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <div className="flex items-center">
                    <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />
                    <div>
                      <div className="font-medium">{category.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {category.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            This determines which specific fields you need to fill
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

### 4.3 Power Tool Fields Component

**File**: `/home/iacob/Documents/cometa-frontend-nextjs/src/components/equipment/power-tool-fields.tsx` (NEW)

```typescript
"use client"

import { UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"

interface PowerToolFieldsProps {
  form: UseFormReturn<any>
}

export function PowerToolFields({ form }: PowerToolFieldsProps) {
  const accessoryOptions = [
    { value: 'battery', label: 'Spare Battery' },
    { value: 'charger', label: 'Charger' },
    { value: 'case', label: 'Carrying Case' },
    { value: 'bits', label: 'Drill Bits Set' },
    { value: 'blades', label: 'Saw Blades' },
    { value: 'manual', label: 'User Manual' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Power (W) */}
        <FormField
          control={form.control}
          name="typeDetails.power_watts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Power (W) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 750"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                />
              </FormControl>
              <FormDescription>Power rating in watts</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Voltage (V) */}
        <FormField
          control={form.control}
          name="typeDetails.voltage_volts"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voltage (V)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 18, 20, 220"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                />
              </FormControl>
              <FormDescription>Operating voltage</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Battery Type */}
        <FormField
          control={form.control}
          name="typeDetails.battery_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Battery Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select battery type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Li-ion">Li-ion (Lithium-ion)</SelectItem>
                  <SelectItem value="NiMH">NiMH (Nickel-Metal Hydride)</SelectItem>
                  <SelectItem value="NiCd">NiCd (Nickel-Cadmium)</SelectItem>
                  <SelectItem value="Corded">Corded (No Battery)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* RPM */}
        <FormField
          control={form.control}
          name="typeDetails.rpm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RPM (Revolutions Per Minute)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 3000"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                />
              </FormControl>
              <FormDescription>Max RPM rating</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* IP Rating */}
        <FormField
          control={form.control}
          name="typeDetails.ip_rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IP Rating</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select IP rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="IP20">IP20 - Indoor use</SelectItem>
                  <SelectItem value="IP54">IP54 - Dust/splash resistant</SelectItem>
                  <SelectItem value="IP65">IP65 - Dust tight, water jet</SelectItem>
                  <SelectItem value="IP67">IP67 - Waterproof</SelectItem>
                  <SelectItem value="IP68">IP68 - Submersible</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Ingress Protection rating</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Weight (kg) */}
        <FormField
          control={form.control}
          name="typeDetails.weight_kg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 2.5"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tool Type */}
        <FormField
          control={form.control}
          name="typeDetails.tool_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tool Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tool type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Drill">Drill</SelectItem>
                  <SelectItem value="Grinder">Grinder</SelectItem>
                  <SelectItem value="Saw">Saw</SelectItem>
                  <SelectItem value="Compressor">Compressor</SelectItem>
                  <SelectItem value="Impact Driver">Impact Driver</SelectItem>
                  <SelectItem value="Sander">Sander</SelectItem>
                  <SelectItem value="Rotary Hammer">Rotary Hammer</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Brand */}
        <FormField
          control={form.control}
          name="typeDetails.brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Bosch, Makita, DeWalt" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Model */}
        <FormField
          control={form.control}
          name="typeDetails.model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g. GSB 18V-55" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Serial Number */}
        <FormField
          control={form.control}
          name="typeDetails.serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input placeholder="Manufacturer serial number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Accessories Included (Multi-select) */}
      <FormField
        control={form.control}
        name="typeDetails.accessories_included"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Accessories Included</FormLabel>
            <FormControl>
              <MultiSelect
                options={accessoryOptions}
                value={field.value || []}
                onChange={field.onChange}
                placeholder="Select included accessories"
              />
            </FormControl>
            <FormDescription>
              Select all accessories that come with this tool
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inspection Interval (days) */}
        <FormField
          control={form.control}
          name="typeDetails.inspection_interval_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inspection Interval (days)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 365"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                />
              </FormControl>
              <FormDescription>
                How often this tool needs inspection
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Next Inspection Date */}
        <FormField
          control={form.control}
          name="typeDetails.next_inspection_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Inspection Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
```

### 4.4 Additional Category Field Components

Due to length constraints, the following components follow the same pattern as PowerToolFields:

1. **FusionSplicerFields** - splice_count, arc_calibration_date, next_calibration_due, firmware_version, core_alignment, battery_health_percent, maintenance_interval_days
2. **OTDRFields** - wavelengths_nm (multiselect), dynamic_range_db, fiber_type, connector_type, last_calibration_date, calibration_interval_days, firmware_version, gps_enabled
3. **SafetyGearFields** - size, certification, inspection_interval_months, inspection_due_date, expiration_date, assigned_user_id (user select), color
4. **VehicleFields** - license_plate, vin, mileage_km, fuel_type, emission_class, service_interval_km, insurance_expiry, inspection_date, gps_tracker_id
5. **MeasuringDeviceFields** - measurement_type, range, accuracy_rating, last_calibration_date, calibration_interval_months, battery_type
6. **AccessoryFields** - compatible_models (multiselect), part_number, quantity_in_set, replacement_cycle_months

**Implementation Note**: Each component file should be created following the same structure as PowerToolFields.tsx with category-specific fields.

---

## 5. Type Definitions

### 5.1 Enhanced Equipment Types

**File**: `/home/iacob/Documents/cometa-frontend-nextjs/src/types/index.ts` (UPDATE)

```typescript
// Add to existing types

export type EquipmentCategory =
  | 'power_tool'
  | 'fusion_splicer'
  | 'otdr'
  | 'safety_gear'
  | 'vehicle'
  | 'measuring_device'
  | 'accessory';

// Update Equipment interface
export interface Equipment {
  id: UUID;
  type: string;
  category: EquipmentCategory; // NEW
  name: string;
  inventory_no?: string;
  owned: boolean;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  rental_cost_per_day?: number;
  purchase_date?: string;
  warranty_until?: string;
  description?: string;
  notes?: string;
  current_location?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;

  // NEW: Nested type details
  equipment_type_details?: EquipmentTypeDetails;
}

// Import from equipment-enhanced.ts (already exists)
export interface EquipmentTypeDetails {
  id: UUID;
  equipment_id: UUID;

  // Power Tool
  power_watts?: number;
  voltage_volts?: number;
  battery_type?: string;
  rpm?: number;
  ip_rating?: string;
  weight_kg?: number;
  tool_type?: string;
  accessories_included?: string[];
  inspection_interval_days?: number;
  next_inspection_date?: string;

  // Fusion Splicer
  splice_count?: number;
  arc_calibration_date?: string;
  next_calibration_due?: string;
  firmware_version?: string;
  core_alignment?: boolean;
  battery_health_percent?: number;
  maintenance_interval_days?: number;

  // OTDR
  wavelengths_nm?: number[];
  dynamic_range_db?: number;
  fiber_type?: string;
  connector_type?: string;
  last_calibration_date?: string;
  calibration_interval_days?: number;
  gps_enabled?: boolean;

  // Safety Gear
  size?: string;
  certification?: string;
  inspection_due_date?: string;
  certification_expiry_date?: string;
  expiration_date?: string;
  assigned_user_id?: UUID;
  color?: string;

  // Vehicle
  license_plate?: string;
  vin?: string;
  mileage_km?: number;
  fuel_type?: string;
  emission_class?: string;
  service_interval_km?: number;
  insurance_expiry?: string;
  inspection_date?: string;
  gps_tracker_id?: string;

  // Measuring Device
  measurement_type?: string;
  range?: string;
  accuracy_rating?: string;
  calibration_interval_months?: number;
  calibration_certificate_no?: string;
  battery_type?: string;
  compatible_models?: string[];
  quantity_in_set?: number;
  replacement_cycle_months?: number;

  // Common
  brand?: string;
  model?: string;
  serial_number?: string;
  manufacturer?: string;
  purchase_price_eur?: number;
  depreciation_rate_percent?: number;
  residual_value_eur?: number;

  // Flexible
  custom_attributes?: Record<string, any>;

  created_at: string;
  updated_at: string;
}
```

### 5.2 Form Type Definitions

**File**: `/home/iacob/Documents/cometa-frontend-nextjs/src/types/equipment-forms.ts` (NEW)

```typescript
import { EquipmentCategory, EquipmentTypeDetails } from './index';

export interface BaseEquipmentFormData {
  name: string;
  type: string;
  category: EquipmentCategory;
  inventory_no?: string;
  owned: boolean;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  current_location?: string;
  rental_cost_per_day?: number;
  description?: string;
  notes?: string;
}

export interface EquipmentFormData extends BaseEquipmentFormData {
  typeDetails?: Partial<EquipmentTypeDetails>;
}

export type CategoryFieldConfig = {
  category: EquipmentCategory;
  requiredFields: (keyof EquipmentTypeDetails)[];
  optionalFields: (keyof EquipmentTypeDetails)[];
  displayName: string;
  icon: string;
  description: string;
}

export const CATEGORY_CONFIGS: Record<EquipmentCategory, CategoryFieldConfig> = {
  power_tool: {
    category: 'power_tool',
    displayName: 'Power Tool',
    icon: 'Wrench',
    description: 'Electric or battery-powered tools',
    requiredFields: ['power_watts'],
    optionalFields: [
      'voltage_volts', 'battery_type', 'rpm', 'ip_rating',
      'weight_kg', 'tool_type', 'accessories_included',
      'inspection_interval_days', 'next_inspection_date',
      'brand', 'model', 'serial_number'
    ],
  },
  fusion_splicer: {
    category: 'fusion_splicer',
    displayName: 'Fusion Splicer',
    icon: 'Zap',
    description: 'Fiber optic fusion splicing equipment',
    requiredFields: ['arc_calibration_date'],
    optionalFields: [
      'splice_count', 'next_calibration_due', 'firmware_version',
      'core_alignment', 'battery_health_percent', 'maintenance_interval_days',
      'brand', 'model', 'serial_number'
    ],
  },
  otdr: {
    category: 'otdr',
    displayName: 'OTDR',
    icon: 'Radio',
    description: 'Optical Time Domain Reflectometer',
    requiredFields: ['wavelengths_nm', 'last_calibration_date'],
    optionalFields: [
      'dynamic_range_db', 'fiber_type', 'connector_type',
      'calibration_interval_days', 'firmware_version', 'gps_enabled',
      'calibration_certificate_no', 'brand', 'model', 'serial_number'
    ],
  },
  safety_gear: {
    category: 'safety_gear',
    displayName: 'Safety Gear',
    icon: 'Shield',
    description: 'Personal Protective Equipment',
    requiredFields: ['inspection_due_date'],
    optionalFields: [
      'size', 'certification', 'certification_expiry_date',
      'expiration_date', 'assigned_user_id', 'color',
      'manufacturer', 'serial_number'
    ],
  },
  vehicle: {
    category: 'vehicle',
    displayName: 'Vehicle',
    icon: 'Truck',
    description: 'Fleet vehicles and transport',
    requiredFields: ['license_plate'],
    optionalFields: [
      'vin', 'mileage_km', 'fuel_type', 'emission_class',
      'service_interval_km', 'insurance_expiry', 'inspection_date',
      'gps_tracker_id', 'brand', 'model', 'serial_number'
    ],
  },
  measuring_device: {
    category: 'measuring_device',
    displayName: 'Measuring Device',
    icon: 'Ruler',
    description: 'Measurement and calibration tools',
    requiredFields: ['last_calibration_date'],
    optionalFields: [
      'measurement_type', 'range', 'accuracy_rating',
      'calibration_interval_months', 'battery_type',
      'compatible_models', 'quantity_in_set', 'replacement_cycle_months',
      'calibration_certificate_no', 'brand', 'model', 'serial_number'
    ],
  },
  accessory: {
    category: 'accessory',
    displayName: 'Accessory',
    icon: 'Package',
    description: 'Accessories and components',
    requiredFields: [],
    optionalFields: [
      'compatible_models', 'quantity_in_set', 'replacement_cycle_months',
      'serial_number'
    ],
  },
};
```

---

## 6. Implementation Steps

### Phase 1: Database Schema Changes (Day 1 - Morning)

1. Create backup of current equipment and equipment_type_details tables
   ```bash
   PGPASSWORD="${PGPASSWORD}" pg_dump -h "${PGHOST}" -p "${PGPORT}" -U "${PGUSER}" -d "${PGDATABASE}" -t equipment -t equipment_type_details > backup_equipment_$(date +%Y%m%d).sql
   ```

2. Run migration 001_add_equipment_categories.sql
   - Add equipment_category enum
   - Add category column to equipment table
   - Create index
   - Update existing records

3. Run migration 002_extend_equipment_type_details.sql
   - Add all missing category-specific fields
   - Add check constraints
   - Create indexes

4. Run migration 003_create_equipment_category_views.sql
   - Create typed views for each category
   - Grant permissions

5. Verify migrations
   - Run data validation queries
   - Check indexes created
   - Test view queries

### Phase 2: Type Definitions & Validation (Day 1 - Afternoon)

1. Update `/src/types/index.ts`
   - Add EquipmentCategory type
   - Update Equipment interface
   - Add EquipmentTypeDetails import

2. Create `/src/types/equipment-forms.ts`
   - Define form types
   - Create CATEGORY_CONFIGS constant

3. Create `/src/lib/validations/equipment-schemas.ts`
   - Implement all Zod schemas
   - Create validation helper functions

4. Test validation schemas
   - Unit tests for each category schema
   - Test edge cases (optional vs required)

### Phase 3: API Layer (Day 2 - Morning)

1. Update `/src/app/api/equipment/route.ts`
   - Enhance POST handler with category support
   - Add typeDetails transaction handling
   - Update GET handler with type details join
   - Add category filter

2. Create `/src/app/api/equipment/[id]/route.ts`
   - Implement GET (with type details)
   - Implement PUT (update both tables)
   - Implement DELETE (soft delete)

3. Test API endpoints
   - Test POST with each category
   - Test GET list with category filter
   - Test GET by ID
   - Test PUT update
   - Test transaction rollback on error

### Phase 4: UI Components - Base (Day 2 - Afternoon)

1. Create `/src/components/equipment/category-selector.tsx`
   - Implement category dropdown with icons
   - Add descriptions

2. Create `/src/components/equipment/base-equipment-fields.tsx`
   - Extract base fields from current form
   - Reusable component

3. Create `/src/components/ui/multi-select.tsx` (if not exists)
   - Multi-select component for arrays
   - Used for accessories, wavelengths, compatible models

### Phase 5: UI Components - Category Fields (Day 3)

1. Create category-specific field components:
   - `/src/components/equipment/power-tool-fields.tsx`
   - `/src/components/equipment/fusion-splicer-fields.tsx`
   - `/src/components/equipment/otdr-fields.tsx`
   - `/src/components/equipment/safety-gear-fields.tsx`
   - `/src/components/equipment/vehicle-fields.tsx`
   - `/src/components/equipment/measuring-device-fields.tsx`
   - `/src/components/equipment/accessory-fields.tsx`

2. Implement auto-computation logic:
   - Next calibration date calculator
   - Next inspection date calculator
   - Service due calculator

### Phase 6: Main Form Integration (Day 3 - Afternoon)

1. Update `/src/app/(dashboard)/dashboard/equipment/new/page.tsx`
   - Implement multi-step form structure
   - Add category change warning
   - Integrate all category components
   - Add form validation per category

2. Update `/src/hooks/use-equipment.ts`
   - Update Equipment interface references
   - Add typeDetails to API calls

### Phase 7: Testing (Day 4 - Morning)

1. Unit tests
   - Validation schemas
   - Category configs
   - Auto-computation functions

2. Integration tests
   - API endpoints (create, read, update, delete)
   - Database constraints
   - Transaction rollback

3. E2E tests (Playwright)
   - Create equipment for each category
   - Edit equipment with category change
   - Delete equipment
   - Form validation errors

### Phase 8: UI Polish & Documentation (Day 4 - Afternoon)

1. Add loading states
2. Add success/error toast messages
3. Add field help tooltips
4. Create user documentation
5. Update CLAUDE.md with new patterns

### Phase 9: Deployment & Monitoring

1. Deploy database migrations to staging
2. Deploy frontend to staging
3. Manual QA testing
4. Deploy to production
5. Monitor error logs for 24 hours

---

## 7. Testing Strategy

### 7.1 Unit Tests

**File**: `/src/lib/validations/__tests__/equipment-schemas.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  powerToolDetailsSchema,
  fusionSplicerDetailsSchema,
  validateEquipmentTypeDetails,
} from '../equipment-schemas';

describe('Equipment Validation Schemas', () => {
  describe('powerToolDetailsSchema', () => {
    it('should validate valid power tool data', () => {
      const validData = {
        power_watts: 750,
        voltage_volts: 18,
        battery_type: 'Li-ion',
        rpm: 3000,
        tool_type: 'Drill',
      };

      const result = powerToolDetailsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative power watts', () => {
      const invalidData = {
        power_watts: -100,
      };

      const result = powerToolDetailsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields', () => {
      const minimalData = {
        power_watts: 750,
      };

      const result = powerToolDetailsSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });
  });

  describe('fusionSplicerDetailsSchema', () => {
    it('should require arc_calibration_date', () => {
      const invalidData = {
        splice_count: 100,
      };

      const result = fusionSplicerDetailsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate battery_health_percent range', () => {
      const invalidData = {
        arc_calibration_date: '2025-01-01',
        battery_health_percent: 150, // Invalid: > 100
      };

      const result = fusionSplicerDetailsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('validateEquipmentTypeDetails', () => {
    it('should validate power tool category', () => {
      const data = {
        power_watts: 750,
        tool_type: 'Drill',
      };

      const result = validateEquipmentTypeDetails('power_tool', data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid category', () => {
      const result = validateEquipmentTypeDetails('invalid_category', {});
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown category');
    });
  });
});
```

### 7.2 Integration Tests

**File**: `/src/app/api/equipment/__tests__/route.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe('Equipment API', () => {
  let createdEquipmentId: string;

  afterEach(async () => {
    // Cleanup
    if (createdEquipmentId) {
      await supabase
        .from('equipment')
        .delete()
        .eq('id', createdEquipmentId);
    }
  });

  describe('POST /api/equipment', () => {
    it('should create equipment with power tool category', async () => {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Drill',
          type: 'tool',
          category: 'power_tool',
          owned: true,
          status: 'available',
          typeDetails: {
            power_watts: 750,
            voltage_volts: 18,
            battery_type: 'Li-ion',
            tool_type: 'Drill',
          },
        }),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.id).toBeDefined();
      expect(data.category).toBe('power_tool');

      createdEquipmentId = data.id;

      // Verify type details were created
      const { data: typeDetails } = await supabase
        .from('equipment_type_details')
        .select('*')
        .eq('equipment_id', data.id)
        .single();

      expect(typeDetails).toBeDefined();
      expect(typeDetails.power_watts).toBe(750);
      expect(typeDetails.tool_type).toBe('Drill');
    });

    it('should rollback on type details error', async () => {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Equipment',
          type: 'tool',
          category: 'power_tool',
          owned: true,
          typeDetails: {
            power_watts: -100, // Invalid: negative
          },
        }),
      });

      expect(response.status).toBe(500);

      // Verify equipment was not created
      const { data: equipment } = await supabase
        .from('equipment')
        .select('*')
        .eq('name', 'Test Equipment');

      expect(equipment).toHaveLength(0);
    });
  });

  describe('GET /api/equipment', () => {
    it('should filter by category', async () => {
      const response = await fetch('/api/equipment?category=power_tool');
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.items).toBeDefined();
      data.items.forEach((item: any) => {
        expect(item.category).toBe('power_tool');
      });
    });
  });
});
```

### 7.3 E2E Tests (Playwright)

**File**: `/e2e/equipment-dynamic-form.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Equipment Dynamic Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/equipment/new');
  });

  test('should show category-specific fields for power tool', async ({ page }) => {
    // Select category
    await page.click('[data-testid="category-select"]');
    await page.click('text=Power Tool');

    // Verify power tool fields appear
    await expect(page.locator('label:has-text("Power (W)")')).toBeVisible();
    await expect(page.locator('label:has-text("Voltage (V)")')).toBeVisible();
    await expect(page.locator('label:has-text("Battery Type")')).toBeVisible();
    await expect(page.locator('label:has-text("Tool Type")')).toBeVisible();
  });

  test('should create power tool equipment successfully', async ({ page }) => {
    // Fill category
    await page.click('[data-testid="category-select"]');
    await page.click('text=Power Tool');

    // Fill base fields
    await page.fill('input[name="name"]', 'Test Drill XYZ');
    await page.fill('input[name="type"]', 'drill');
    await page.fill('input[name="inventory_no"]', 'DRILL-001');

    // Fill power tool fields
    await page.fill('input[name="typeDetails.power_watts"]', '750');
    await page.fill('input[name="typeDetails.voltage_volts"]', '18');
    await page.click('[data-testid="battery-type-select"]');
    await page.click('text=Li-ion');
    await page.fill('input[name="typeDetails.rpm"]', '3000');

    // Submit form
    await page.click('button:has-text("Create Equipment")');

    // Verify success
    await expect(page.locator('text=Equipment created successfully')).toBeVisible();
    await expect(page).toHaveURL('/dashboard/equipment');
  });

  test('should show warning when changing category with filled fields', async ({ page }) => {
    // Select initial category and fill fields
    await page.click('[data-testid="category-select"]');
    await page.click('text=Power Tool');
    await page.fill('input[name="typeDetails.power_watts"]', '750');

    // Change category
    await page.click('[data-testid="category-select"]');
    await page.click('text=Fusion Splicer');

    // Verify warning appears
    await expect(page.locator('text=Changing category will reset all category-specific fields')).toBeVisible();
  });

  test('should validate required fields per category', async ({ page }) => {
    // Select fusion splicer (requires arc_calibration_date)
    await page.click('[data-testid="category-select"]');
    await page.click('text=Fusion Splicer');

    // Fill base fields only
    await page.fill('input[name="name"]', 'Test Splicer');
    await page.fill('input[name="type"]', 'splicer');

    // Try to submit without required arc_calibration_date
    await page.click('button:has-text("Create Equipment")');

    // Verify validation error
    await expect(page.locator('text=Arc calibration date is required')).toBeVisible();
  });

  test('should auto-compute next calibration date', async ({ page }) => {
    await page.click('[data-testid="category-select"]');
    await page.click('text=OTDR');

    // Fill last calibration date and interval
    await page.fill('input[name="typeDetails.last_calibration_date"]', '2025-01-01');
    await page.fill('input[name="typeDetails.calibration_interval_days"]', '365');

    // Verify next calibration computed (should be 2026-01-01)
    const computedDate = await page.inputValue('input[name="typeDetails.next_calibration_date"]');
    expect(computedDate).toBe('2026-01-01');
  });
});
```

### 7.4 Test Coverage Goals

- **Unit Tests**: >80% coverage for validation logic
- **Integration Tests**: 100% API endpoint coverage
- **E2E Tests**: Critical user flows for each category
- **Manual QA**: Edge cases, accessibility, mobile responsiveness

---

## 8. Risk Analysis

### 8.1 High Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Database migration failure on production | Low | Critical | - Test migrations on staging<br>- Have rollback scripts ready<br>- Backup before migration<br>- Run during low-traffic window |
| Category change causes data loss | Medium | High | - Warning dialog before category change<br>- Keep typeDetails in session storage<br>- Allow "undo" within form session |
| Complex validation errors confuse users | Medium | Medium | - Clear error messages<br>- Field-level validation hints<br>- Progressive disclosure of requirements |
| Performance degradation with complex joins | Low | Medium | - Use database views for complex queries<br>- Add appropriate indexes<br>- Monitor query performance |

### 8.2 Medium Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| User selects wrong category | High | Low | - Clear category descriptions<br>- Allow category change in edit mode<br>- Visual category indicators |
| Missing required fields not obvious | Medium | Medium | - Mark required fields with asterisk<br>- Summary of requirements before submit<br>- Real-time validation feedback |
| Multiselect components UX issues | Medium | Low | - Use well-tested library (shadcn/ui)<br>- Provide clear instructions<br>- Allow keyboard navigation |
| Auto-computed dates incorrect | Low | Medium | - Thorough unit tests for date logic<br>- Allow manual override<br>- Validate computed values |

### 8.3 Low Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Browser compatibility issues | Low | Low | - Test on major browsers<br>- Use polyfills if needed<br>- Progressive enhancement |
| Type definition mismatches | Low | Medium | - Strict TypeScript checks<br>- Runtime validation with Zod<br>- Integration tests |

---

## 9. Rollout Plan

### 9.1 Phased Deployment Strategy

**Phase 1: Database-Only (Week 1, Day 1)**
- Deploy database migrations to staging
- Run validation queries
- Monitor for 24 hours
- Deploy to production (off-peak hours)
- Keep old form active

**Phase 2: API Layer (Week 1, Day 2-3)**
- Deploy updated API endpoints to staging
- Run integration tests
- Monitor API performance
- Deploy to production
- Old form still works with new API

**Phase 3: Frontend Feature Flag (Week 1, Day 4-5)**
- Deploy new form behind feature flag
- Enable for admin users only
- Gather feedback
- Fix critical bugs

**Phase 4: Beta Rollout (Week 2)**
- Enable for 10% of users
- Monitor error rates
- Collect user feedback
- Iterate on UX issues

**Phase 5: Full Rollout (Week 3)**
- Enable for 50% of users
- Monitor metrics (form completion rate, error rate)
- Enable for 100% of users
- Deprecate old form

### 9.2 Rollback Triggers

Immediately rollback if:
- Error rate > 5% on equipment creation
- Database migration causes data corruption
- Critical UI bug prevents form submission
- Performance degradation > 50%

### 9.3 Success Metrics

**Pre-Launch Baseline**:
- Current equipment creation time: ~2 minutes
- Current error rate: ~3%
- Current form completion rate: ~85%

**Post-Launch Targets (Week 4)**:
- Equipment creation time: <3 minutes (acceptable increase due to more fields)
- Error rate: <2% (improved validation)
- Form completion rate: >80% (acceptable slight decrease)
- Category-specific data completeness: >70%

### 9.4 Monitoring & Alerts

**Key Metrics to Track**:
1. Form submission success rate by category
2. API response times for POST /api/equipment
3. Database query performance on equipment_type_details
4. JavaScript errors in browser console
5. User feedback via support tickets

**Alerts**:
- Error rate > 5%: Page engineering team immediately
- API latency > 3s: Investigate database indexes
- Form abandonment > 30%: Review UX flow

---

## 10. Edge Cases

### 10.1 Category Change Scenarios

**Edge Case 1**: User fills extensive power tool fields, then changes to fusion splicer
- **Behavior**: Show warning dialog
- **Data**: Reset typeDetails fields
- **UX**: Offer to save as draft before changing

**Edge Case 2**: User starts form, leaves page, returns
- **Behavior**: Restore form state from localStorage
- **Data**: Preserve category and all fields
- **UX**: Show "Draft restored" notification

**Edge Case 3**: API returns error after category-specific validation passes
- **Behavior**: Display server error message
- **Data**: Preserve all form data
- **UX**: Allow user to retry without re-entering

### 10.2 Validation Edge Cases

**Edge Case 4**: Optional field with dependent required field (e.g., calibration interval requires calibration date)
- **Behavior**: Cross-field validation
- **Implementation**: Zod refine() method
- **Error Message**: "Calibration date required when interval is set"

**Edge Case 5**: Date field in the past (e.g., next inspection date < today)
- **Behavior**: Allow but show warning
- **Implementation**: Non-blocking validation
- **Warning**: "This date is in the past"

**Edge Case 6**: Multiselect with no items selected for required field
- **Behavior**: Block submission
- **Error Message**: "At least one wavelength must be selected"

### 10.3 Data Integrity Edge Cases

**Edge Case 7**: Equipment exists without type details (legacy data)
- **Behavior**: Allow editing, prompt to add category
- **Implementation**: Check for null equipment_type_details in GET
- **UX**: Show banner "Add category-specific details"

**Edge Case 8**: Database type details create fails but equipment created
- **Behavior**: Rollback equipment record
- **Implementation**: Transaction handling in API
- **Error**: "Failed to save details, please try again"

**Edge Case 9**: Two users edit same equipment simultaneously
- **Behavior**: Last write wins, show warning
- **Implementation**: Check updated_at timestamp
- **Warning**: "This equipment was recently modified"

### 10.4 UX Edge Cases

**Edge Case 10**: Very long equipment name (>100 characters)
- **Behavior**: Truncate at 100, show character counter
- **Validation**: Zod max(100)
- **Error**: "Name must be less than 100 characters"

**Edge Case 11**: User tries to create duplicate inventory number
- **Behavior**: Backend validation, unique constraint error
- **Error Message**: "Inventory number already exists"
- **UX**: Highlight inventory_no field

**Edge Case 12**: Mobile user with small screen
- **Behavior**: Responsive layout, single column
- **Implementation**: Tailwind responsive classes
- **Testing**: Test on iPhone SE (smallest screen)

### 10.5 Performance Edge Cases

**Edge Case 13**: User has very large accessories list (100+ items)
- **Behavior**: Pagination or search in multiselect
- **Implementation**: Virtualized list component
- **Fallback**: Text input for custom accessories

**Edge Case 14**: Slow database query for equipment list with type details
- **Behavior**: Use database views, add indexes
- **Implementation**: Indexed joins on equipment_id
- **Monitoring**: Alert if query > 1s

---

## Summary

This implementation plan provides a comprehensive roadmap for transforming the equipment creation form into a dynamic, category-aware system. The approach leverages the existing `equipment_type_details` table (currently unused) and introduces a robust categorization system with specialized fields for each equipment type.

**Key Success Factors**:
1. Existing database infrastructure ready (equipment_type_details table)
2. Phased rollout minimizes risk
3. Comprehensive validation at all layers (database, API, frontend)
4. Clear user experience with progressive disclosure
5. Extensive testing coverage
6. Well-defined rollback procedures

**Timeline Summary**:
- Day 1: Database migrations + Type definitions
- Day 2: API implementation
- Day 3: UI components
- Day 4: Testing + polish
- Week 2-3: Phased rollout

**Next Steps**:
1. Review and approve this plan
2. Create feature branch: `feature/equipment-dynamic-categories`
3. Begin Phase 1: Database migrations
4. Follow implementation steps sequentially
5. Commit after each completed phase with reference to this plan

**Plan Location**: `/home/iacob/Documents/cometa-frontend-nextjs/.claude/implementation-plans/equipment-dynamic-form-20251019.md`
