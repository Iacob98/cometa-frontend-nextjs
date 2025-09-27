import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    const { data: supplier, error } = await supabaseService
      .from("suppliers")
      .select(
        `
        id,
        name,
        short_name,
        contact_person,
        email,
        phone,
        address,
        tax_number,
        payment_terms,
        rating,
        is_active,
        notes,
        created_at,
        updated_at
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch supplier from database" },
        { status: 500 }
      );
    }

    // Get materials count for this supplier
    const { count: materialsCount } = await supabaseService
      .from("supplier_materials")
      .select("*", { count: "exact", head: true })
      .eq("supplier_id", supplier.id);

    // Map name to org_name for frontend compatibility
    const supplierWithOrgName = {
      ...supplier,
      org_name: supplier.name,
      materials_count: materialsCount || 0,
    };

    return NextResponse.json(supplierWithOrgName);
  } catch (error) {
    console.error("Supplier GET API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier" },
      { status: 500 }
    );
  }
}

export async function PUT(
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
      name,
      short_name,
      contact_person,
      email,
      phone,
      address,
      tax_number,
      payment_terms,
      rating,
      is_active,
      notes,
    } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Email validation if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Rating validation
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Update supplier in Supabase using service role to bypass RLS
    const { data: supplier, error } = await supabaseService
      .from("suppliers")
      .update({
        name,
        short_name: short_name || null,
        contact_person: contact_person || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        tax_number: tax_number || null,
        payment_terms: payment_terms || null,
        rating: rating || null,
        is_active: is_active !== false,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select(
        `
        id,
        name,
        short_name,
        contact_person,
        email,
        phone,
        address,
        tax_number,
        payment_terms,
        rating,
        is_active,
        notes,
        created_at,
        updated_at
      `
      )
      .single();

    if (error) {
      console.error("Supabase error updating supplier:", error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Supplier not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Failed to update supplier in database" },
        { status: 500 }
      );
    }

    // Get materials count for this supplier
    const { count: materialsCount } = await supabaseService
      .from("supplier_materials")
      .select("*", { count: "exact", head: true })
      .eq("supplier_id", supplier.id);

    // Map name to org_name for frontend compatibility
    const supplierWithOrgName = {
      ...supplier,
      org_name: supplier.name,
      materials_count: materialsCount || 0,
    };

    return NextResponse.json(supplierWithOrgName);
  } catch (error) {
    console.error("Update supplier error:", error);
    return NextResponse.json(
      { error: "Failed to update supplier" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete supplier using service role to bypass RLS
    const { error } = await supabaseService
      .from("suppliers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error deleting supplier:", error);
      return NextResponse.json(
        { error: "Failed to delete supplier from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    console.error("Delete supplier error:", error);
    return NextResponse.json(
      { error: "Failed to delete supplier" },
      { status: 500 }
    );
  }
}