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
    const entity_type = searchParams.get("entity_type");
    const entity_id = searchParams.get("entity_id");
    const geometry_type = searchParams.get("geometry_type");
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = Math.min(parseInt(searchParams.get("per_page") || "50"), 100);

    let query = supabase
      .from("geospatial_features")
      .select(`
        id,
        type,
        geometry,
        properties,
        project_id,
        entity_type,
        entity_id,
        created_at,
        updated_at,
        created_by
      `);

    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    if (entity_type) {
      query = query.eq("entity_type", entity_type);
    }

    if (entity_id) {
      query = query.eq("entity_id", entity_id);
    }

    if (geometry_type) {
      query = query.eq("type", geometry_type);
    }

    // Count total for pagination
    const { count } = await supabase
      .from("geospatial_features")
      .select("*", { count: "exact", head: true });

    const { data: features, error } = await query
      .range((page - 1) * per_page, page * per_page - 1)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase geospatial features query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch geospatial features" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: features || [],
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    });
  } catch (error) {
    console.error("Geospatial features API error:", error);
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
    if (!body.type || !body.geometry || !body.entity_type || !body.entity_id) {
      return NextResponse.json(
        { error: "Type, geometry, entity_type, and entity_id are required" },
        { status: 400 }
      );
    }

    const featureData = {
      type: body.type,
      geometry: body.geometry,
      properties: body.properties || {},
      project_id: body.project_id || null,
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      created_by: body.created_by || "system",
    };

    const { data: feature, error } = await supabase
      .from("geospatial_features")
      .insert([featureData])
      .select()
      .single();

    if (error) {
      console.error("Supabase geospatial feature creation error:", error);
      return NextResponse.json(
        { error: "Failed to create geospatial feature" },
        { status: 500 }
      );
    }

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error("Geospatial feature creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}