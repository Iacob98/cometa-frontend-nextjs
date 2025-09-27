import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role client for bypassing RLS
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    const { data: supplierMaterials, error } = await supabaseService
      .from("supplier_materials")
      .select(
        `
        id,
        supplier_id,
        material_id,
        supplier_part_number,
        unit_price,
        minimum_order_qty,
        lead_time_days,
        is_preferred,
        last_price_update,
        notes,
        created_at,
        updated_at,
        material:materials(
          id,
          name,
          category,
          unit,
          unit_price_eur,
          supplier_name,
          description,
          is_active
        )
      `
      )
      .eq("supplier_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch supplier materials from database" },
        { status: 500 }
      );
    }

    // Format for frontend compatibility
    const formattedMaterials = (supplierMaterials || []).map(item => ({
      ...item,
      material_name: item.material?.name || null,
      material_category: item.material?.category || null,
      material_unit: item.material?.unit || null,
      material_description: item.material?.description || null,
    }));

    return NextResponse.json(formattedMaterials);
  } catch (error) {
    console.error("Supplier materials GET API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier materials" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    const {
      material_id,
      material_name,
      category,
      unit,
      supplier_part_number,
      unit_price,
      minimum_order_qty = 1,
      lead_time_days,
      is_preferred = false,
      notes,
    } = body;

    // Validation - either material_id or material_name is required
    if (!material_id && !material_name) {
      return NextResponse.json(
        { error: "Either material ID or material name is required" },
        { status: 400 }
      );
    }

    if (material_name && !unit) {
      return NextResponse.json(
        { error: "Unit is required when creating new material" },
        { status: 400 }
      );
    }

    if (!unit_price || unit_price <= 0) {
      return NextResponse.json(
        { error: "Unit price must be positive" },
        { status: 400 }
      );
    }

    if (minimum_order_qty <= 0) {
      return NextResponse.json(
        { error: "Minimum order quantity must be positive" },
        { status: 400 }
      );
    }

    let finalMaterialId = material_id;

    // If material_name is provided, create a new material first
    if (material_name) {
      const { data: newMaterial, error: materialError } = await supabaseService
        .from("materials")
        .insert({
          name: material_name,
          category: category || null,
          unit: unit,
          unit_price_eur: unit_price,
          is_active: true,
        })
        .select("id")
        .single();

      if (materialError) {
        console.error("Supabase error creating material:", materialError);
        return NextResponse.json(
          { error: "Failed to create material in database" },
          { status: 500 }
        );
      }

      finalMaterialId = newMaterial.id;
    }

    // Check if this supplier-material combination already exists
    const { data: existing } = await supabaseService
      .from("supplier_materials")
      .select("id")
      .eq("supplier_id", id)
      .eq("material_id", finalMaterialId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This material is already associated with this supplier" },
        { status: 409 }
      );
    }

    // Create supplier material association
    const { data: supplierMaterial, error } = await supabaseService
      .from("supplier_materials")
      .insert({
        supplier_id: id,
        material_id: finalMaterialId,
        supplier_part_number: supplier_part_number || null,
        unit_price,
        minimum_order_qty,
        lead_time_days: lead_time_days || null,
        is_preferred,
        notes: notes || null,
      })
      .select(
        `
        id,
        supplier_id,
        material_id,
        supplier_part_number,
        unit_price,
        minimum_order_qty,
        lead_time_days,
        is_preferred,
        last_price_update,
        notes,
        created_at,
        updated_at,
        material:materials(
          id,
          name,
          category,
          unit,
          unit_price_eur,
          supplier_name,
          description,
          is_active
        )
      `
      )
      .single();

    if (error) {
      console.error("Supabase error creating supplier material:", error);
      if (error.code === '23503') {
        return NextResponse.json(
          { error: "Invalid material or supplier ID" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create supplier material in database" },
        { status: 500 }
      );
    }

    // Format for frontend compatibility
    const formattedMaterial = {
      ...supplierMaterial,
      material_name: supplierMaterial.material?.name || null,
      material_category: supplierMaterial.material?.category || null,
      material_unit: supplierMaterial.material?.unit || null,
      material_description: supplierMaterial.material?.description || null,
    };

    return NextResponse.json(formattedMaterial, { status: 201 });
  } catch (error) {
    console.error("Create supplier material error:", error);
    return NextResponse.json(
      { error: "Failed to create supplier material" },
      { status: 500 }
    );
  }
}