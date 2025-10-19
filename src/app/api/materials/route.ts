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
        reserved_stock,
        sku,
        created_at,
        updated_at,
        supplier_materials(
          supplier:suppliers(
            id,
            name,
            contact_person,
            phone,
            email
          )
        )
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
    // Note: reserved_qty now comes directly from reserved_stock column (updated by triggers)
    const transformedMaterials = (materials || []).map(material => {
      // Extract supplier from supplier_materials junction
      const supplierData = material.supplier_materials?.[0]?.supplier || null;

      return {
        ...material,
        // Map database fields to frontend field names
        current_stock_qty: Number(material.current_stock || 0),
        min_stock_level: Number(material.min_stock_threshold || 0),
        reserved_qty: Number(material.reserved_stock || 0), // Now using denormalized column
        unit_cost: Number(material.unit_price_eur || 0),
        default_price_eur: Number(material.unit_price_eur || 0),
        sku: material.sku || null,
        last_updated: material.updated_at,
        // Add supplier information
        supplier: supplierData ? {
          id: supplierData.id,
          name: supplierData.name,
          contact_person: supplierData.contact_person,
          phone: supplierData.phone,
          email: supplierData.email,
        } : null,
      };
    });

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
      sku,
    } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Validate SKU uniqueness if provided
    if (sku) {
      const { data: existingSku } = await supabase
        .from("materials")
        .select("id")
        .eq("sku", sku)
        .maybeSingle();

      if (existingSku) {
        return NextResponse.json(
          { error: `SKU '${sku}' already exists` },
          { status: 400 }
        );
      }
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
          sku: sku || null,
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
        reserved_stock,
        sku,
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
      reserved_qty: Number(material.reserved_stock || 0), // New materials have no allocations, but include field
      unit_cost: Number(material.unit_price_eur || 0),
      default_price_eur: Number(material.unit_price_eur || 0),
      sku: material.sku || null,
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