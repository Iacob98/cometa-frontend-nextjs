import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const equipment_id = searchParams.get("equipment_id");
    const crew_id = searchParams.get("crew_id");
    const project_id = searchParams.get("project_id");
    const active_only = searchParams.get("active_only") === "true";

    let query = supabase
      .from("equipment_assignments")
      .select(`
        id,
        equipment_id,
        crew_id,
        project_id,
        from_ts,
        to_ts,
        is_permanent,
        rental_cost_per_day,
        is_active,
        equipment:equipment(
          id,
          name,
          type,
          inventory_no
        )
      `);

    if (equipment_id) {
      query = query.eq("equipment_id", equipment_id);
    }

    if (crew_id) {
      query = query.eq("crew_id", crew_id);
    }

    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    if (active_only) {
      query = query.eq("is_active", true);
    }

    const { data: assignments, error } = await query.order("from_ts", { ascending: false });

    if (error) {
      console.error("Supabase equipment assignments query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch equipment assignments" },
        { status: 500 }
      );
    }

    return NextResponse.json(assignments || []);
  } catch (error) {
    console.error("Equipment assignments API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields - crew_id is now optional
    if (!body.equipment_id || !body.project_id) {
      return NextResponse.json(
        { error: "Equipment ID and Project ID are required" },
        { status: 400 }
      );
    }

    // If crew_id is provided, validate it belongs to the project
    if (body.crew_id) {
      const { data: crew, error: crewError } = await supabase
        .from("crews")
        .select("id, project_id")
        .eq("id", body.crew_id)
        .eq("project_id", body.project_id)
        .single();

      if (crewError || !crew) {
        return NextResponse.json(
          { error: "Crew not found or not assigned to this project" },
          { status: 400 }
        );
      }
    }

    // Check for concurrent assignments - prevent same equipment on multiple active crews
    if (body.crew_id) {
      const { data: existingAssignments, error: checkError } = await supabase
        .from("equipment_assignments")
        .select("id, crew_id, crew:crews(name)")
        .eq("equipment_id", body.equipment_id)
        .eq("is_active", true)
        .not("crew_id", "is", null);

      if (checkError) {
        console.error("Error checking equipment assignments:", checkError);
        return NextResponse.json(
          { error: "Failed to check equipment availability" },
          { status: 500 }
        );
      }

      if (existingAssignments && existingAssignments.length > 0) {
        const assignedCrew = existingAssignments[0].crew as any;
        return NextResponse.json(
          {
            error: `Equipment is already assigned to crew "${assignedCrew?.name}". End the existing assignment first.`
          },
          { status: 400 }
        );
      }
    }

    const assignmentData = {
      equipment_id: body.equipment_id,
      crew_id: body.crew_id || null,
      project_id: body.project_id,
      from_ts: body.from_ts,
      to_ts: body.to_ts || null,
      is_permanent: body.is_permanent || false,
      rental_cost_per_day: body.rental_cost_per_day || 0,
      is_active: true,
    };

    const { data: assignment, error } = await supabase
      .from("equipment_assignments")
      .insert([assignmentData])
      .select()
      .single();

    if (error) {
      console.error("Supabase equipment assignment creation error:", error);
      return NextResponse.json(
        { error: "Failed to create equipment assignment" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        assignment_id: assignment.id,
        message: body.crew_id
          ? "Equipment assigned to crew successfully"
          : "Equipment assigned to project successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Equipment assignment creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignment_id, is_active } = body;

    if (!assignment_id) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Update the assignment to set is_active to false (end assignment)
    const { data: updatedAssignment, error } = await supabase
      .from("equipment_assignments")
      .update({
        is_active: is_active !== undefined ? is_active : false,
        to_ts: is_active === false ? new Date().toISOString() : null
      })
      .eq("id", assignment_id)
      .select()
      .single();

    if (error) {
      console.error("Supabase equipment assignment update error:", error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Equipment assignment not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update equipment assignment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Equipment assignment updated successfully",
      assignment: updatedAssignment
    });

  } catch (error) {
    console.error("Equipment assignment PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update equipment assignment" },
      { status: 500 }
    );
  }
}