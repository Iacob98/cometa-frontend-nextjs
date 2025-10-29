import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { requireEquipmentPermission } from "@/lib/auth-middleware";
import { createEquipmentSchema, computeNextCalibrationDate, computeNextInspectionDate } from "@/lib/validations/equipment-categories";

export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require authentication
  const authResult = await requireEquipmentPermission(request, 'view');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;
    const type = searchParams.get("type");
    const category = searchParams.get("category"); // NEW: category filter
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const owned = searchParams.get("owned");

    // Get equipment directly from Supabase with type_details JOIN
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
          brand,
          model,
          serial_number,
          manufacturer,
          power_watts,
          voltage_volts,
          battery_type,
          battery_capacity_ah,
          ip_rating,
          rpm,
          splice_count,
          arc_calibration_date,
          avg_splice_loss_db,
          firmware_version,
          wavelength_nm,
          dynamic_range_db,
          fiber_type,
          connector_type,
          size,
          certification,
          inspection_due_date,
          certification_expiry_date,
          last_calibration_date,
          calibration_interval_months,
          calibration_certificate_no,
          accuracy_rating,
          measurement_unit
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

    // NEW: Category filter
    if (category) {
      if (category === 'uncategorized') {
        query = query.is("category", null);
      } else {
        query = query.eq("category", category);
      }
    }

    // ⚡ PERFORMANCE FIX: Use pre-computed view for available equipment
    if (status === "available") {
      // Use optimized database view (single query instead of 2)
      query = supabase
        .from('v_equipment_available')
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
            brand,
            model,
            serial_number,
            manufacturer,
            power_watts,
            voltage_volts,
            battery_type,
            battery_capacity_ah,
            ip_rating,
            rpm,
            splice_count,
            arc_calibration_date,
            avg_splice_loss_db,
            firmware_version,
            wavelength_nm,
            dynamic_range_db,
            fiber_type,
            connector_type,
            size,
            certification,
            inspection_due_date,
            certification_expiry_date,
            last_calibration_date,
            calibration_interval_months,
            calibration_certificate_no,
            accuracy_rating,
            measurement_unit
          )
        `,
          { count: "exact" }
        )
        .order("name", { ascending: true })
        .range(offset, offset + per_page - 1);

      // Apply additional filters to the view query
      if (type) {
        query = query.eq("type", type);
      }
      if (category) {
        if (category === 'uncategorized') {
          query = query.is("category", null);
        } else {
          query = query.eq("category", category);
        }
      }
      if (owned && owned !== "all") {
        query = query.eq("owned", owned === "true");
      }
    } else if (status) {
      // For other statuses, use direct filtering
      query = query.eq("status", status);
    }

    if (owned && owned !== "all") {
      query = query.eq("owned", owned === "true");
    }

    // 🔒 SECURITY FIX: Use full-text search RPC instead of unsafe ILIKE
    if (search) {
      // Use PostgreSQL full-text search via RPC (prevents SQL injection)
      const { data: searchResults, error: searchError } = await supabase.rpc(
        'search_equipment',
        {
          p_query: search,
          p_type: type || null,
          p_status: status && status !== 'available' ? status : null,
          p_owned: owned && owned !== 'all' ? (owned === 'true') : null,
          p_limit: per_page,
          p_offset: offset,
        }
      );

      if (searchError) {
        console.error('Search RPC error:', searchError);
        return NextResponse.json(
          { error: 'Failed to search equipment', details: searchError },
          { status: 500 }
        );
      }

      // For search, return results directly (no need for further filtering)
      return NextResponse.json({
        items: searchResults || [],
        total: searchResults?.length || 0,
        page,
        per_page,
        total_pages: Math.ceil((searchResults?.length || 0) / per_page),
      });
    }

    const { data: equipment, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch equipment from database" },
        { status: 500 }
      );
    }

    // Transform equipment data to flatten type_details
    const transformedEquipment = equipment?.map(item => ({
      ...item,
      type_details: Array.isArray(item.equipment_type_details) && item.equipment_type_details.length > 0
        ? item.equipment_type_details[0]
        : null
    })) || [];

    return NextResponse.json({
      items: transformedEquipment,
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
  // 🔒 SECURITY: Only admin, pm, and foreman can create equipment
  const authResult = await requireEquipmentPermission(request, 'create');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    // Validate request body with Zod schema
    const validationResult = createEquipmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const { category, type_details, ...baseFields } = data;

    // Auto-compute dates based on category
    let processedTypeDetails: any = { ...type_details };

    if (category === 'fusion_splicer' && 'last_calibration_date' in type_details && type_details.last_calibration_date) {
      const intervalDays = ('maintenance_interval_days' in type_details && type_details.maintenance_interval_days) || 365;
      processedTypeDetails.next_calibration_due = computeNextCalibrationDate(
        type_details.last_calibration_date,
        intervalDays
      );
    }

    if (category === 'otdr' && 'last_calibration_date' in type_details && type_details.last_calibration_date) {
      const intervalDays = (('calibration_interval_months' in type_details && type_details.calibration_interval_months) || 12) * 30;
      processedTypeDetails.next_calibration = computeNextCalibrationDate(
        type_details.last_calibration_date,
        intervalDays
      );
    }

    if (category === 'measuring_device' && 'last_calibration_date' in type_details && type_details.last_calibration_date) {
      const intervalDays = (('calibration_interval_months' in type_details && type_details.calibration_interval_months) || 12) * 30;
      processedTypeDetails.next_calibration = computeNextCalibrationDate(
        type_details.last_calibration_date,
        intervalDays
      );
    }

    if (category === 'power_tool' && 'inspection_interval_days' in type_details && type_details.inspection_interval_days) {
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
