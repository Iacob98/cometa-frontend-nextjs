import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schema
const HousingUnitSchema = z.object({
  project_id: z.string().uuid("Invalid project ID"),
  house_id: z.string().uuid("Invalid house ID").optional(),
  unit_number: z.string().optional(),
  unit_type: z.enum(['apartment', 'office', 'commercial', 'basement', 'attic']).default('apartment'),
  floor: z.number().int().optional(),
  room_count: z.number().int().min(1).optional(),
  area_sqm: z.number().positive().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  access_instructions: z.string().optional(),
  installation_notes: z.string().optional(),
  status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']).default('pending')
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;
    const project_id = searchParams.get("project_id");
    const house_id = searchParams.get("house_id");
    const status = searchParams.get("status");
    const unit_type = searchParams.get("unit_type");
    const search = searchParams.get("search");

    let query = supabase
      .from("housing_units")
      .select(
        `
        id,
        project_id,
        house_id,
        unit_number,
        unit_type,
        floor,
        room_count,
        area_sqm,
        contact_person,
        contact_phone,
        access_instructions,
        installation_notes,
        status,
        created_at,
        updated_at,
        projects(id, name, city),
        houses(id, street, city, house_number, postal_code)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    if (house_id) {
      query = query.eq("house_id", house_id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (unit_type) {
      query = query.eq("unit_type", unit_type);
    }

    if (search) {
      query = query.or(
        `unit_number.ilike.%${search}%,contact_person.ilike.%${search}%,contact_phone.ilike.%${search}%`
      );
    }

    const { data: housingUnits, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch housing units from database" },
        { status: 500 }
      );
    }

    // Enhance data with calculated fields
    const enhancedUnits = (housingUnits || []).map(unit => {
      const projectInfo = Array.isArray(unit.projects) ? unit.projects[0] : unit.projects;
      const houseInfo = Array.isArray(unit.houses) ? unit.houses[0] : unit.houses;

      return {
        ...unit,
        project_name: projectInfo?.name || "Unknown Project",
        project_city: projectInfo?.city || "Unknown City",
        house_street: houseInfo?.street || "Unknown Street",
        house_city: houseInfo?.city || "Unknown City",
        house_number: houseInfo?.house_number || null,
        postal_code: houseInfo?.postal_code || null,
        full_address: houseInfo?.street && houseInfo?.house_number
          ? `${houseInfo.street} ${houseInfo.house_number}, ${houseInfo.city || ''}`
          : houseInfo?.street || "Unknown Address"
      };
    });

    // Calculate summary statistics
    const statusCounts = enhancedUnits.reduce((acc, unit) => {
      acc[unit.status] = (acc[unit.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const unitTypeCounts = enhancedUnits.reduce((acc, unit) => {
      acc[unit.unit_type] = (acc[unit.unit_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalArea = enhancedUnits.reduce((sum, unit) => sum + (unit.area_sqm || 0), 0);

    return NextResponse.json({
      items: enhancedUnits,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
      summary: {
        status_counts: statusCounts,
        unit_type_counts: unitTypeCounts,
        total_area_sqm: totalArea,
        average_area_sqm: enhancedUnits.length > 0 ? totalArea / enhancedUnits.length : 0
      }
    });
  } catch (error) {
    console.error("Housing units API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch housing units" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod
    const validationResult = HousingUnitSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("id", validatedData.project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Verify house exists if house_id is provided
    if (validatedData.house_id) {
      const { data: house, error: houseError } = await supabase
        .from("houses")
        .select("id, address")
        .eq("id", validatedData.house_id)
        .single();

      if (houseError || !house) {
        return NextResponse.json(
          { error: "House not found" },
          { status: 404 }
        );
      }
    }

    // Check for duplicate unit_number in the same house (if both are provided)
    if (validatedData.house_id && validatedData.unit_number) {
      const { data: existingUnit, error: duplicateError } = await supabase
        .from("housing_units")
        .select("id")
        .eq("house_id", validatedData.house_id)
        .eq("unit_number", validatedData.unit_number)
        .maybeSingle();

      if (duplicateError) {
        console.error("Duplicate check error:", duplicateError);
        return NextResponse.json(
          { error: "Failed to check for duplicate unit" },
          { status: 500 }
        );
      }

      if (existingUnit) {
        return NextResponse.json(
          { error: "Unit number already exists in this house" },
          { status: 409 }
        );
      }
    }

    // Create housing unit in Supabase
    const { data: housingUnit, error } = await supabase
      .from("housing_units")
      .insert([validatedData])
      .select(
        `
        id,
        project_id,
        house_id,
        unit_number,
        unit_type,
        floor,
        room_count,
        area_sqm,
        contact_person,
        contact_phone,
        access_instructions,
        installation_notes,
        status,
        created_at,
        updated_at,
        projects(id, name, city),
        houses(id, street, city, house_number, postal_code)
      `
      )
      .single();

    if (error) {
      console.error("Supabase error creating housing unit:", error);
      return NextResponse.json(
        { error: "Failed to create housing unit in database" },
        { status: 500 }
      );
    }

    // Enhanced response data
    const projectData = Array.isArray(housingUnit.projects) ? housingUnit.projects[0] : housingUnit.projects;
    const houseData = Array.isArray(housingUnit.houses) ? housingUnit.houses[0] : housingUnit.houses;

    const enhancedUnit = {
      ...housingUnit,
      project_name: projectData?.name || "Unknown Project",
      project_city: projectData?.city || "Unknown City",
      house_street: houseData?.street || "Unknown Street",
      house_city: houseData?.city || "Unknown City",
      house_number: houseData?.house_number || null,
      postal_code: houseData?.postal_code || null,
      full_address: houseData?.street && houseData?.house_number
        ? `${houseData.street} ${houseData.house_number}, ${houseData.city || ''}`
        : houseData?.street || "Unknown Address"
    };

    return NextResponse.json({
      message: "Housing unit created successfully",
      housing_unit: enhancedUnit
    }, { status: 201 });

  } catch (error) {
    console.error("Create housing unit error:", error);
    return NextResponse.json(
      { error: "Failed to create housing unit" },
      { status: 500 }
    );
  }
}