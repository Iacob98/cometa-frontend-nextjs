import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
        owned,
        is_active,
        created_at,
        updated_at
      `,
        { count: "exact" }
      )
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
        `name.ilike.%${search}%,inventory_no.ilike.%${search}%,type.ilike.%${search}%,description.ilike.%${search}%`
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
    const {
      type,
      name,
      inventory_no,
      status = "available",
      rental_cost_per_day,
      description,
      owned = true,
      current_location,
    } = body;

    // Validation
    if (!type || !name) {
      return NextResponse.json(
        { error: "Type and name are required" },
        { status: 400 }
      );
    }

    // FIXED: Create equipment directly in Supabase with correct field names
    const { data: equipment, error } = await supabase
      .from("equipment")
      .insert([
        {
          type,
          name,
          inventory_no,
          status: status || "available",
          rental_cost_per_day: rental_cost_per_day || null,
          description: description || null,
          owned: owned,
          current_location: current_location || null,
        },
      ])
      .select(
        `
        id,
        type,
        name,
        inventory_no,
        status,
        rental_cost_per_day,
        description,
        owned,
        current_location,
        created_at
      `
      )
      .single();

    if (error) {
      console.error("Supabase error creating equipment:", error);
      return NextResponse.json(
        { error: "Failed to create equipment in database" },
        { status: 500 }
      );
    }

    return NextResponse.json(equipment, { status: 201 });
  } catch (error) {
    console.error("Create equipment error:", error);
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    );
  }
}
