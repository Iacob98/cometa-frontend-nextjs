import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crew_id = searchParams.get("crew_id");
    const project_id = searchParams.get("project_id");
    const active_only = searchParams.get("active_only") === "true";

    const assignments: any[] = [];

    // Get equipment assignments
    let equipmentQuery = supabase
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

    if (crew_id) {
      equipmentQuery = equipmentQuery.eq("crew_id", crew_id);
    }
    if (project_id) {
      equipmentQuery = equipmentQuery.eq("project_id", project_id);
    }
    if (active_only) {
      equipmentQuery = equipmentQuery.eq("is_active", true);
    }

    const { data: equipmentData, error: equipmentError } = await equipmentQuery.order("from_ts", { ascending: false });

    if (equipmentError) {
      console.error("Equipment assignments query error:", equipmentError);
    } else {
      // Transform equipment assignments
      (equipmentData || []).forEach((assignment: any) => {
        assignments.push({
          id: assignment.id,
          resource_id: assignment.equipment_id,
          resource_type: "equipment",
          assignment_type: "equipment",
          crew_id: assignment.crew_id,
          project_id: assignment.project_id,
          from_ts: assignment.from_ts,
          to_ts: assignment.to_ts,
          is_permanent: assignment.is_permanent,
          rental_cost_per_day: assignment.rental_cost_per_day,
          is_active: assignment.is_active,
          equipment: assignment.equipment,
          // For unified interface
          name: assignment.equipment?.name || 'Unknown Equipment',
          type: assignment.equipment?.type || 'equipment',
          inventory_no: assignment.equipment?.inventory_no,
        });
      });
    }

    // Get vehicle assignments
    let vehicleQuery = supabase
      .from("vehicle_assignments")
      .select(`
        id,
        vehicle_id,
        crew_id,
        project_id,
        from_ts,
        to_ts,
        is_permanent,
        rental_cost_per_day,
        is_active,
        vehicle:vehicles(
          id,
          brand,
          model,
          plate_number,
          type
        )
      `);

    if (crew_id) {
      vehicleQuery = vehicleQuery.eq("crew_id", crew_id);
    }
    if (project_id) {
      vehicleQuery = vehicleQuery.eq("project_id", project_id);
    }
    if (active_only) {
      vehicleQuery = vehicleQuery.eq("is_active", true);
    }

    const { data: vehicleData, error: vehicleError } = await vehicleQuery.order("from_ts", { ascending: false });

    if (vehicleError) {
      console.error("Vehicle assignments query error:", vehicleError);
    } else {
      // Transform vehicle assignments
      (vehicleData || []).forEach((assignment: any) => {
        assignments.push({
          id: assignment.id,
          resource_id: assignment.vehicle_id,
          resource_type: "vehicle",
          assignment_type: "vehicle",
          crew_id: assignment.crew_id,
          project_id: assignment.project_id,
          from_ts: assignment.from_ts,
          to_ts: assignment.to_ts,
          is_permanent: assignment.is_permanent,
          rental_cost_per_day: assignment.rental_cost_per_day,
          is_active: assignment.is_active,
          vehicle: assignment.vehicle,
          // For unified interface
          name: assignment.vehicle ? `${assignment.vehicle.brand} ${assignment.vehicle.model}` : 'Unknown Vehicle',
          type: assignment.vehicle?.type || 'vehicle',
          plate_number: assignment.vehicle?.plate_number,
        });
      });
    }

    // Sort by from_ts descending
    assignments.sort((a, b) => {
      const dateA = new Date(a.from_ts || 0).getTime();
      const dateB = new Date(b.from_ts || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Unified assignments API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resource_type, resource_id, crew_id, project_id, from_ts, to_ts, is_permanent, rental_cost_per_day } = body;

    // Validate required fields
    if (!resource_type || !resource_id || !crew_id) {
      return NextResponse.json(
        { error: "resource_type, resource_id, and crew_id are required" },
        { status: 400 }
      );
    }

    let result;

    if (resource_type === "equipment") {
      const { data: assignment, error } = await supabase
        .from("equipment_assignments")
        .insert([{
          equipment_id: resource_id,
          crew_id,
          project_id,
          from_ts,
          to_ts,
          is_permanent: is_permanent || false,
          rental_cost_per_day: rental_cost_per_day || 0,
          is_active: true,
        }])
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
          equipment:equipment(id, name, type, inventory_no)
        `)
        .single();

      if (error) throw error;
      result = assignment;
    } else if (resource_type === "vehicle") {
      const { data: assignment, error } = await supabase
        .from("vehicle_assignments")
        .insert([{
          vehicle_id: resource_id,
          crew_id,
          project_id,
          from_ts,
          to_ts,
          is_permanent: is_permanent || false,
          rental_cost_per_day: rental_cost_per_day || 0,
          is_active: true,
        }])
        .select(`
          id,
          vehicle_id,
          crew_id,
          project_id,
          from_ts,
          to_ts,
          is_permanent,
          rental_cost_per_day,
          is_active,
          vehicle:vehicles(id, brand, model, plate_number, type)
        `)
        .single();

      if (error) throw error;
      result = assignment;
    } else {
      return NextResponse.json(
        { error: "Invalid resource_type. Must be 'equipment' or 'vehicle'" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        assignment_id: result.id,
        message: `${resource_type} assignment created successfully`,
        assignment: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unified assignment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}