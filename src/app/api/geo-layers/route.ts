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

    let query = supabase
      .from("geo_layers")
      .select(`
        id,
        name,
        description,
        layer_type,
        style,
        is_visible,
        opacity,
        z_index,
        project_id,
        created_by,
        created_at,
        updated_at
      `);

    if (project_id) {
      query = query.eq("project_id", project_id);
    }

    const { data: layers, error } = await query.order("z_index", { ascending: true });

    if (error) {
      console.error("Supabase geo layers query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch geo layers" },
        { status: 500 }
      );
    }

    return NextResponse.json(layers || []);
  } catch (error) {
    console.error("Geo layers API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const layerData = {
      name: body.name,
      description: body.description,
      layer_type: body.layer_type,
      style: body.style || {},
      is_visible: body.is_visible !== undefined ? body.is_visible : true,
      opacity: body.opacity !== undefined ? body.opacity : 1.0,
      z_index: body.z_index || 0,
      project_id: body.project_id || null,
      created_by: body.created_by || "system",
    };

    const { data: layer, error } = await supabase
      .from("geo_layers")
      .insert([layerData])
      .select()
      .single();

    if (error) {
      console.error("Supabase geo layer creation error:", error);
      return NextResponse.json(
        { error: "Failed to create geo layer" },
        { status: 500 }
      );
    }

    return NextResponse.json(layer, { status: 201 });
  } catch (error) {
    console.error("Geo layer creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}