import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createEquipmentSchema, computeNextCalibrationDate, computeNextInspectionDate } from "@/lib/validations/equipment-categories";
import type { EquipmentCategory } from "@/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const owned = searchParams.get("owned");

    // Get equipment directly from Supabase with correct field names
    let query = supabase
      .from("equipment")
      .select(
        `
        id,
        name,
        type,
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
        updated_at
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

    if (status === "available") {
      // For "available" status, get equipment that either:
      // 1. Has status "available" OR
      // 2. Does NOT have any active assignments (even if status is "issued_to_brigade")

      // First, get all equipment IDs with active assignments
      const { data: activeAssignments } = await supabase
        .from("equipment_assignments")
        .select("equipment_id")
        .eq("is_active", true);

      const assignedEquipmentIds = activeAssignments?.map(a => a.equipment_id) || [];

      // Filter out equipment that has active assignments
      if (assignedEquipmentIds.length > 0) {
        query = query.not("id", "in", `(${assignedEquipmentIds.join(",")})`);
      }
    } else if (status) {
      // For other statuses, use direct filtering
      query = query.eq("status", status);
    }

    if (owned && owned !== "all") {
      query = query.eq("owned", owned === "true");
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,inventory_no.ilike.%${search}%,type.ilike.%${search}%,description.ilike.%${search}%,notes.ilike.%${search}%,current_location.ilike.%${search}%`
      );
    }

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod schema
    const validationResult = createEquipmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const { category, type_details, ...baseFields } = data;

    // Auto-compute dates based on category
    let processedTypeDetails = { ...type_details };

    if (category === 'fusion_splicer' && type_details.last_calibration_date) {
      const intervalDays = type_details.maintenance_interval_days || 365;
      processedTypeDetails.next_calibration_due = computeNextCalibrationDate(
        type_details.last_calibration_date,
        intervalDays
      );
    }

    if (category === 'otdr' && type_details.last_calibration_date) {
      const intervalDays = (type_details.calibration_interval_months || 12) * 30;
      processedTypeDetails.next_calibration = computeNextCalibrationDate(
        type_details.last_calibration_date,
        intervalDays
      );
    }

    if (category === 'measuring_device' && type_details.last_calibration_date) {
      const intervalDays = (type_details.calibration_interval_months || 12) * 30;
      processedTypeDetails.next_calibration = computeNextCalibrationDate(
        type_details.last_calibration_date,
        intervalDays
      );
    }

    if (category === 'power_tool' && type_details.inspection_interval_days) {
      const today = new Date().toISOString().split('T')[0];
      processedTypeDetails.next_inspection_date = computeNextInspectionDate(
        today,
        type_details.inspection_interval_days
      );
    }

    // Begin transaction: Create equipment record first
    const { data: equipment, error: equipmentError } = await supabase
      .from("equipment")
      .insert([
        {
          name: baseFields.name,
          type: baseFields.name, // fallback for legacy type field
          category: category,
          inventory_no: baseFields.inventory_no,
          serial_number: baseFields.serial_number,
          status: baseFields.status || "available",
          description: baseFields.notes || null,
          notes: baseFields.notes || null,
          owned: baseFields.ownership === 'owned',
          current_location: baseFields.location || null,
          purchase_date: baseFields.purchase_date || null,
          rental_cost_per_day: baseFields.purchase_price ? baseFields.purchase_price / 30 : null,
          supplier_name: baseFields.manufacturer || null,
        },
      ])
      .select('id, name, category, inventory_no, status, created_at')
      .single();

    if (equipmentError) {
      console.error("Error creating equipment:", equipmentError);
      return NextResponse.json(
        { error: "Failed to create equipment record", details: equipmentError },
        { status: 500 }
      );
    }

    // Create type_details record
    const { data: typeDetailsRecord, error: typeDetailsError } = await supabase
      .from("equipment_type_details")
      .insert([
        {
          equipment_id: equipment.id,
          manufacturer: baseFields.manufacturer,
          model: baseFields.model,
          serial_number: baseFields.serial_number,
          purchase_price_eur: baseFields.purchase_price,

          // Map type-specific fields to database columns
          ...processedTypeDetails,
        },
      ])
      .select()
      .single();

    if (typeDetailsError) {
      console.error("Error creating type details:", typeDetailsError);

      // Rollback: Delete equipment record if type details failed
      await supabase.from("equipment").delete().eq("id", equipment.id);

      return NextResponse.json(
        { error: "Failed to create equipment type details", details: typeDetailsError },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Equipment created successfully",
      data: {
        equipment,
        type_details: typeDetailsRecord,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Create equipment error:", error);
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    );
  }
}
