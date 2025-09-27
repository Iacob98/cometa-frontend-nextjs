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
    const measurement_type = searchParams.get("measurement_type");
    const measured_by = searchParams.get("measured_by");

    let query = supabase
      .from("geo_measurements")
      .select(`
        id,
        measurement_type,
        geometry,
        value,
        unit,
        label,
        notes,
        project_id,
        measured_by,
        measured_at
      `);

    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    if (measurement_type) {
      query = query.eq("measurement_type", measurement_type);
    }

    if (measured_by) {
      query = query.eq("measured_by", measured_by);
    }

    const { data: measurements, error } = await query.order("measured_at", { ascending: false });

    if (error) {
      console.error("Supabase geo measurements query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch geo measurements" },
        { status: 500 }
      );
    }

    return NextResponse.json(measurements || []);
  } catch (error) {
    console.error("Geo measurements API error:", error);
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
    if (!body.measurement_type || !body.geometry || !body.unit) {
      return NextResponse.json(
        { error: "Measurement type, geometry, and unit are required" },
        { status: 400 }
      );
    }

    // Calculate value based on geometry and measurement type
    let calculatedValue = body.value;

    if (!calculatedValue) {
      if (body.measurement_type === "distance" && body.geometry?.coordinates) {
        // Calculate distance for LineString geometry
        const coords = body.geometry.coordinates;
        let totalDistance = 0;

        if (coords && coords.length > 1) {
          for (let i = 1; i < coords.length; i++) {
            const [lon1, lat1] = coords[i - 1];
            const [lon2, lat2] = coords[i];

            // Haversine formula
            const R = 6371000; // Earth's radius in meters
            const lat1Rad = lat1 * Math.PI / 180;
            const lat2Rad = lat2 * Math.PI / 180;
            const deltaLatRad = (lat2 - lat1) * Math.PI / 180;
            const deltaLonRad = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(deltaLatRad/2) * Math.sin(deltaLatRad/2) +
                      Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                      Math.sin(deltaLonRad/2) * Math.sin(deltaLonRad/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            totalDistance += R * c;
          }
        }
        calculatedValue = totalDistance;
      } else if (body.measurement_type === "area" && body.geometry?.coordinates) {
        // Calculate area for Polygon geometry (simplified)
        const coords = body.geometry.coordinates[0]; // Exterior ring
        if (coords && coords.length >= 4) {
          let area = 0;
          const n = coords.length - 1; // Last point same as first

          for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += coords[i][0] * coords[j][1];
            area -= coords[j][0] * coords[i][1];
          }

          // Convert to square meters (very rough approximation)
          calculatedValue = Math.abs(area / 2) * 111319.49 * 111319.49;
        }
      }
    }

    const measurementData = {
      measurement_type: body.measurement_type,
      geometry: body.geometry,
      value: calculatedValue || 0,
      unit: body.unit,
      label: body.label,
      notes: body.notes,
      project_id: body.project_id || null,
      measured_by: body.measured_by || "system",
      measured_at: body.measured_at || new Date().toISOString(),
    };

    const { data: measurement, error } = await supabase
      .from("geo_measurements")
      .insert([measurementData])
      .select()
      .single();

    if (error) {
      console.error("Supabase geo measurement creation error:", error);
      return NextResponse.json(
        { error: "Failed to create geo measurement" },
        { status: 500 }
      );
    }

    return NextResponse.json(measurement, { status: 201 });
  } catch (error) {
    console.error("Geo measurement creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}