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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const per_page = parseInt(searchParams.get("per_page") || "20");
    const offset = (page - 1) * per_page;
    const search = searchParams.get("search");
    const is_active = searchParams.get("is_active");
    const rating = searchParams.get("rating");

    let query = supabaseService
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
      `,
        { count: "exact" }
      )
      .order("name", { ascending: true })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (is_active !== null) {
      query = query.eq("is_active", is_active === "true");
    }

    if (rating) {
      query = query.eq("rating", parseInt(rating));
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,short_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data: suppliers, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch suppliers from database" },
        { status: 500 }
      );
    }

    // Get materials count for each supplier
    const suppliersWithCounts = await Promise.all(
      (suppliers || []).map(async (supplier) => {
        const { count: materialsCount } = await supabaseService
          .from("supplier_materials")
          .select("*", { count: "exact", head: true })
          .eq("supplier_id", supplier.id);

        return {
          ...supplier,
          org_name: supplier.name, // Map name to org_name for frontend compatibility
          materials_count: materialsCount || 0,
        };
      })
    );

    return NextResponse.json({
      items: suppliersWithCounts,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page),
    });
  } catch (error) {
    console.error("Suppliers API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
      is_active = true,
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

    // Create supplier in Supabase using service role to bypass RLS
    const { data: supplier, error } = await supabaseService
      .from("suppliers")
      .insert([
        {
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
          notes: notes || null
        },
      ])
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
      console.error("Supabase error creating supplier:", error);
      return NextResponse.json(
        { error: "Failed to create supplier in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...supplier,
      org_name: supplier.name, // Map name to org_name for frontend compatibility
      materials_count: 0,
    }, { status: 201 });
  } catch (error) {
    console.error("Create supplier error:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}