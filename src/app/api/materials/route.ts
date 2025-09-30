import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role client for bypassing RLS to read allocations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    // Get all material IDs to fetch their allocations
    const materialIds = (materials || []).map(m => m.id);

    // Fetch active allocations (not fully used or returned) for all materials
    const { data: allocations, error: allocationsError } = await supabase
      .from("material_allocations")
      .select("material_id, quantity_remaining")
      .in("material_id", materialIds)
      .in("status", ["allocated", "partially_used"]);

    if (allocationsError) {
      console.error("Allocations query error:", allocationsError);
    }

    // Calculate reserved quantities per material
    const reservedByMaterial = (allocations || []).reduce((acc, alloc) => {
      const materialId = alloc.material_id;
      const remaining = Number(alloc.quantity_remaining || 0);
      acc[materialId] = (acc[materialId] || 0) + remaining;
      return acc;
    }, {} as Record<string, number>);

    // Transform materials to match frontend interface
    const transformedMaterials = (materials || []).map(material => ({
      ...material,
      // Map database fields to frontend field names
      current_stock_qty: Number(material.current_stock || 0),
      min_stock_level: Number(material.min_stock_threshold || 0),
      reserved_qty: reservedByMaterial[material.id] || 0,
      unit_cost: Number(material.unit_price_eur || 0),
      default_price_eur: Number(material.unit_price_eur || 0),
      sku: null, // Not in database yet
      last_updated: material.updated_at,
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
      current_stock_qty: Number(material.current_stock || 0),
      min_stock_level: Number(material.min_stock_threshold || 0),
      reserved_qty: 0, // New materials have no allocations
      unit_cost: Number(material.unit_price_eur || 0),
      default_price_eur: Number(material.unit_price_eur || 0),
      sku: null,
      last_updated: material.updated_at,
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