import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schema for updates (all fields optional)
const UpdateHousingUnitSchema = z.object({
  project_id: z.string().uuid("Invalid project ID").optional(),
  house_id: z.string().uuid("Invalid house ID").optional(),
  unit_number: z.string().optional(),
  unit_type: z.enum(['apartment', 'office', 'commercial', 'basement', 'attic']).optional(),
  floor: z.number().int().optional(),
  room_count: z.number().int().min(1).optional(),
  area_sqm: z.number().positive().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  access_instructions: z.string().optional(),
  installation_notes: z.string().optional(),
  status: z.enum(['pending', 'scheduled', 'in_progress', 'completed', 'cancelled']).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Housing unit ID is required" },
        { status: 400 }
      );
    }

    const { data: housingUnit, error } = await supabase
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
        houses(id, street, city, house_number, postal_code),
        housing_allocations(
          id,
          crew_id,
          user_id,
          allocation_date,
          status,
          notes,
          crews(id, name),
          users(id, first_name, last_name, email)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Housing unit not found" },
          { status: 404 }
        );
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch housing unit from database" },
        { status: 500 }
      );
    }

    // Enhanced response data
    const project = Array.isArray(housingUnit.projects) ? housingUnit.projects[0] : housingUnit.projects;
    const house = Array.isArray(housingUnit.houses) ? housingUnit.houses[0] : housingUnit.houses;

    const enhancedUnit = {
      ...housingUnit,
      project_name: project?.name || "Unknown Project",
      project_city: project?.city || "Unknown City",
      house_street: house?.street || "Unknown Street",
      house_city: house?.city || "Unknown City",
      house_number: house?.house_number || null,
      postal_code: house?.postal_code || null,
      full_address: house?.street && house?.house_number
        ? `${house.street} ${house.house_number}, ${house.city || ''}`
        : house?.street || "Unknown Address",
      allocations_count: housingUnit.housing_allocations?.length || 0
    };

    return NextResponse.json(enhancedUnit);
  } catch (error) {
    console.error("Housing unit GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch housing unit" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Housing unit ID is required" },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = UpdateHousingUnitSchema.safeParse(body);
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

    // Check if housing unit exists
    const { data: existingUnit, error: checkError } = await supabase
      .from("housing_units")
      .select("id, project_id, house_id, unit_number")
      .eq("id", id)
      .single();

    if (checkError || !existingUnit) {
      return NextResponse.json(
        { error: "Housing unit not found" },
        { status: 404 }
      );
    }

    // Verify project exists if being updated
    if (validatedData.project_id && validatedData.project_id !== existingUnit.project_id) {
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id, name, city")
        .eq("id", validatedData.project_id)
        .single();

      if (projectError || !projectData) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 }
        );
      }
    }

    // Verify house exists if being updated
    if (validatedData.house_id && validatedData.house_id !== existingUnit.house_id) {
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

    // Check for duplicate unit_number if being updated
    const updatedHouseId = validatedData.house_id || existingUnit.house_id;
    const updatedUnitNumber = validatedData.unit_number || existingUnit.unit_number;

    if (updatedHouseId && updatedUnitNumber &&
        (validatedData.house_id !== existingUnit.house_id || validatedData.unit_number !== existingUnit.unit_number)) {
      const { data: duplicateUnit, error: duplicateError } = await supabase
        .from("housing_units")
        .select("id")
        .eq("house_id", updatedHouseId)
        .eq("unit_number", updatedUnitNumber)
        .neq("id", id)
        .maybeSingle();

      if (duplicateError) {
        console.error("Duplicate check error:", duplicateError);
        return NextResponse.json(
          { error: "Failed to check for duplicate unit" },
          { status: 500 }
        );
      }

      if (duplicateUnit) {
        return NextResponse.json(
          { error: "Unit number already exists in this house" },
          { status: 409 }
        );
      }
    }

    // Build update data (only include provided fields)
    const updateData: any = {};
    const allowedFields = [
      'project_id', 'house_id', 'unit_number', 'unit_type', 'floor',
      'room_count', 'area_sqm', 'contact_person', 'contact_phone',
      'access_instructions', 'installation_notes', 'status'
    ];

    for (const field of allowedFields) {
      if (validatedData[field as keyof typeof validatedData] !== undefined) {
        updateData[field] = validatedData[field as keyof typeof validatedData];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    // Update housing unit
    const { data: updatedUnit, error } = await supabase
      .from("housing_units")
      .update(updateData)
      .eq("id", id)
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
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update housing unit" },
        { status: 500 }
      );
    }

    // Enhanced response data
    const projectInfo = Array.isArray(updatedUnit.projects) ? updatedUnit.projects[0] : updatedUnit.projects;
    const houseInfo = Array.isArray(updatedUnit.houses) ? updatedUnit.houses[0] : updatedUnit.houses;

    const enhancedUnit = {
      ...updatedUnit,
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

    return NextResponse.json({
      message: "Housing unit updated successfully",
      housing_unit: enhancedUnit
    });
  } catch (error) {
    console.error("Housing unit PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update housing unit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Housing unit ID is required" },
        { status: 400 }
      );
    }

    // Check if housing unit exists
    const { data: existingUnit, error: checkError } = await supabase
      .from("housing_units")
      .select("id, unit_number, unit_type")
      .eq("id", id)
      .single();

    if (checkError || !existingUnit) {
      return NextResponse.json(
        { error: "Housing unit not found" },
        { status: 404 }
      );
    }

    // Check if housing unit has allocations
    const { count: allocationsCount, error: allocationsError } = await supabase
      .from("housing_allocations")
      .select("*", { count: "exact", head: true })
      .eq("housing_unit_id", id);

    if (allocationsError) {
      console.error("Allocations check error:", allocationsError);
      return NextResponse.json(
        { error: "Failed to check housing unit dependencies" },
        { status: 500 }
      );
    }

    if (allocationsCount && allocationsCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete housing unit with active allocations",
          details: `This housing unit has ${allocationsCount} allocation(s). Remove allocations first.`
        },
        { status: 409 }
      );
    }

    // Delete housing unit
    const { error } = await supabase
      .from("housing_units")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete housing unit" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Housing unit deleted successfully",
      deleted_housing_unit: {
        id: existingUnit.id,
        unit_number: existingUnit.unit_number,
        unit_type: existingUnit.unit_type
      }
    });
  } catch (error) {
    console.error("Housing unit DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete housing unit" },
      { status: 500 }
    );
  }
}