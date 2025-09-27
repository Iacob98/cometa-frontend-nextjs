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

    const { data: contacts, error } = await supabaseService
      .from("supplier_contacts")
      .select(
        `
        id,
        supplier_id,
        name,
        position,
        department,
        phone,
        email,
        is_primary,
        notes,
        created_at,
        updated_at
      `
      )
      .eq("supplier_id", id)
      .order("is_primary", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch supplier contacts from database" },
        { status: 500 }
      );
    }

    // Map name to contact_name for frontend compatibility
    const contactsWithCompatibility = (contacts || []).map(contact => ({
      ...contact,
      contact_name: contact.name,
      is_active: true, // Default since table doesn't have this field
    }));

    return NextResponse.json(contactsWithCompatibility);
  } catch (error) {
    console.error("Supplier contacts GET API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier contacts" },
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
      contact_name,
      name,
      position,
      department,
      phone,
      email,
      is_primary = false,
      notes,
    } = body;

    // Use contact_name or name (for compatibility)
    const contactName = contact_name || name;

    // Validation
    if (!contactName) {
      return NextResponse.json(
        { error: "Contact name is required" },
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

    // If this is set as primary, remove primary status from other contacts
    if (is_primary) {
      await supabaseService
        .from("supplier_contacts")
        .update({ is_primary: false })
        .eq("supplier_id", id);
    }

    // Create contact in Supabase using service role to bypass RLS
    const { data: contact, error } = await supabaseService
      .from("supplier_contacts")
      .insert({
        supplier_id: id,
        name: contactName,
        position: position || null,
        department: department || null,
        phone: phone || null,
        email: email || null,
        is_primary: is_primary,
        notes: notes || null,
      })
      .select(
        `
        id,
        supplier_id,
        name,
        position,
        department,
        phone,
        email,
        is_primary,
        notes,
        created_at,
        updated_at
      `
      )
      .single();

    if (error) {
      console.error("Supabase error creating supplier contact:", error);
      return NextResponse.json(
        { error: "Failed to create supplier contact in database" },
        { status: 500 }
      );
    }

    // Map name to contact_name for frontend compatibility
    const contactWithCompatibility = {
      ...contact,
      contact_name: contact.name,
      is_active: true,
    };

    return NextResponse.json(contactWithCompatibility, { status: 201 });
  } catch (error) {
    console.error("Create supplier contact error:", error);
    return NextResponse.json(
      { error: "Failed to create supplier contact" },
      { status: 500 }
    );
  }
}