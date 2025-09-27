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

    const { data: projectSuppliers, error } = await supabaseService
      .from("project_suppliers")
      .select(
        `
        id,
        project_id,
        supplier_id,
        supplier_role,
        contact_person,
        contract_reference,
        start_date,
        end_date,
        status,
        notes,
        created_at,
        updated_at,
        project:projects(id, name, customer, city, status)
      `
      )
      .eq("supplier_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch supplier project assignments from database" },
        { status: 500 }
      );
    }

    // Format the response for frontend compatibility
    const formattedAssignments = (projectSuppliers || []).map(assignment => ({
      ...assignment,
      project_name: assignment.project?.name || null,
      project_customer: assignment.project?.customer || null,
      project_city: assignment.project?.city || null,
      project_status: assignment.project?.status || null,
      assigned_at: assignment.created_at, // Map for compatibility
    }));

    return NextResponse.json(formattedAssignments);
  } catch (error) {
    console.error("Supplier projects GET API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch supplier projects" },
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
      project_id,
      supplier_role = 'material',
      contact_person,
      contract_reference,
      start_date,
      end_date,
      status = 'active',
      notes,
    } = body;

    // Validation
    if (!project_id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const { data: existingAssignment } = await supabaseService
      .from("project_suppliers")
      .select("id")
      .eq("supplier_id", id)
      .eq("project_id", project_id)
      .single();

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Supplier is already assigned to this project" },
        { status: 409 }
      );
    }

    // Create assignment in Supabase using service role to bypass RLS
    const { data: projectSupplier, error } = await supabaseService
      .from("project_suppliers")
      .insert({
        supplier_id: id,
        project_id,
        supplier_role,
        contact_person: contact_person || null,
        contract_reference: contract_reference || null,
        start_date: start_date || null,
        end_date: end_date || null,
        status,
        notes: notes || null,
      })
      .select(
        `
        id,
        project_id,
        supplier_id,
        supplier_role,
        contact_person,
        contract_reference,
        start_date,
        end_date,
        status,
        notes,
        created_at,
        updated_at,
        project:projects(id, name, customer, city, status)
      `
      )
      .single();

    if (error) {
      console.error("Supabase error creating supplier project assignment:", error);
      if (error.code === '23503') {
        return NextResponse.json(
          { error: "Invalid project or supplier ID" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Failed to create supplier project assignment in database" },
        { status: 500 }
      );
    }

    // Format the response for frontend compatibility
    const formattedAssignment = {
      ...projectSupplier,
      project_name: projectSupplier.project?.name || null,
      project_description: projectSupplier.project?.description || null,
      project_status: projectSupplier.project?.status || null,
      assigned_at: projectSupplier.created_at, // Map for compatibility
    };

    return NextResponse.json(formattedAssignment, { status: 201 });
  } catch (error) {
    console.error("Create supplier project assignment error:", error);
    return NextResponse.json(
      { error: "Failed to create supplier project assignment" },
      { status: 500 }
    );
  }
}