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
    const category = searchParams.get("category");
    const unit = searchParams.get("unit");
    const search = searchParams.get("search");
    const is_active = searchParams.get("is_active");
    const supplier_name = searchParams.get("supplier_name");

    let query = supabase
      .from("materials")
      .select(
        `
        id,
        name,
        category,
        unit,
        unit_price_eur,
        supplier_name,
        description,
        is_active,
        current_stock,
        min_stock_threshold,
        created_at,
        updated_at
      `,
        { count: "exact" }
      )
      .eq("is_active", true)
      .order("name", { ascending: true })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (category) {
      query = query.eq("category", category);
    }

    if (unit) {
      query = query.eq("unit", unit);
    }

    if (supplier_name) {
      query = query.eq("supplier_name", supplier_name);
    }

    if (is_active !== null) {
      query = query.eq("is_active", is_active === "true");
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,category.ilike.%${search}%,supplier_name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data: materials, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch materials from database" },
        { status: 500 }
      );
    }

    // Transform materials to match frontend interface
    const transformedMaterials = (materials || []).map(material => ({
      ...material,
      unit_cost: material.unit_price_eur || 0,
      current_stock_qty: 100, // Default stock quantity
      min_stock_level: 10     // Default minimum stock level
    }));

    return NextResponse.json({
      items: transformedMaterials,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    });
  } catch (error) {
    console.error("Materials API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      unit = "pcs",
      unit_price_eur = 0,
      supplier_name,
      description,
      is_active = true,
    } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Create material in Supabase
    const { data: material, error } = await supabase
      .from("materials")
      .insert([
        {
          name,
          category: category || null,
          unit: unit || "pcs",
          unit_price_eur: unit_price_eur || 0,
          supplier_name: supplier_name || null,
          description: description || null,
          is_active: is_active !== false,
        },
      ])
      .select(
        `
        id,
        name,
        category,
        unit,
        unit_price_eur,
        supplier_name,
        description,
        is_active,
        current_stock,
        min_stock_threshold,
        created_at,
        updated_at
      `
      )
      .single();

    if (error) {
      console.error("Supabase error creating material:", error);
      return NextResponse.json(
        { error: "Failed to create material in database" },
        { status: 500 }
      );
    }

    // Transform material to match frontend interface
    const transformedMaterial = {
      ...material,
      unit_cost: material.unit_price_eur || 0,
      current_stock_qty: 100, // Default stock quantity
      min_stock_level: 10     // Default minimum stock level
    };

    return NextResponse.json(transformedMaterial, { status: 201 });
  } catch (error) {
    console.error("Create material error:", error);
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}