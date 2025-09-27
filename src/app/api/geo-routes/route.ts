import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");
    const route_type = searchParams.get("route_type");

    let query = supabase
      .from("geo_routes")
      .select(`
        id,
        name,
        description,
        waypoints,
        distance_meters,
        estimated_duration_minutes,
        route_type,
        project_id,
        created_by,
        created_at,
        updated_at
      `);

    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    if (route_type) {
      query = query.eq("route_type", route_type);
    }

    const { data: routes, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase geo routes query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch geo routes" },
        { status: 500 }
      );
    }

    return NextResponse.json(routes || []);
  } catch (error) {
    console.error("Geo routes API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.waypoints || !Array.isArray(body.waypoints)) {
      return NextResponse.json(
        { error: "Name and waypoints array are required" },
        { status: 400 }
      );
    }

    // Calculate basic distance (simplified calculation)
    let totalDistance = 0;
    if (body.waypoints.length > 1) {
      for (let i = 1; i < body.waypoints.length; i++) {
        const prev = body.waypoints[i - 1];
        const curr = body.waypoints[i];
        // Haversine formula approximation for basic distance calculation
        const lat1 = prev.latitude * Math.PI / 180;
        const lat2 = curr.latitude * Math.PI / 180;
        const deltaLat = (curr.latitude - prev.latitude) * Math.PI / 180;
        const deltaLon = (curr.longitude - prev.longitude) * Math.PI / 180;

        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const earthRadius = 6371000; // meters
        totalDistance += earthRadius * c;
      }
    }

    const routeData = {
      name: body.name,
      description: body.description,
      waypoints: body.waypoints,
      distance_meters: body.distance_meters || Math.round(totalDistance),
      estimated_duration_minutes: body.estimated_duration_minutes || Math.round(totalDistance / 83.33), // ~5 km/h walking speed
      route_type: body.route_type || "walking",
      project_id: body.project_id || null,
      created_by: body.created_by || "system",
    };

    const { data: route, error } = await supabase
      .from("geo_routes")
      .insert([routeData])
      .select()
      .single();

    if (error) {
      console.error("Supabase geo route creation error:", error);
      return NextResponse.json(
        { error: "Failed to create geo route" },
        { status: 500 }
      );
    }

    return NextResponse.json(route, { status: 201 });
  } catch (error) {
    console.error("Geo route creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}