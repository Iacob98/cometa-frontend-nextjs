import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");

    if (!project_id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Get utility contacts from database
    const { data: contacts, error } = await supabase
      .from('utility_contacts')
      .select(`
        id,
        kind,
        organization,
        contact_person,
        phone,
        email,
        notes,
        created_at
      `)
      .eq('project_id', project_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase utility contacts query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch utility contacts' },
        { status: 500 }
      );
    }

    return NextResponse.json(contacts || []);
  } catch (error) {
    console.error("Utility contacts API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch utility contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, kind, organization, phone, email, contact_person, notes } = body;

    if (!project_id || !kind || !organization) {
      return NextResponse.json(
        { error: "Project ID, kind, and organization are required" },
        { status: 400 }
      );
    }

    // Create utility contact in database
    const { data: contact, error } = await supabase
      .from('utility_contacts')
      .insert({
        project_id,
        kind,
        organization,
        contact_person,
        phone,
        email,
        notes
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase utility contact creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create utility contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contact_id: contact.id,
      message: "Utility contact created successfully",
      utility_contact: contact
    }, { status: 201 });
  } catch (error) {
    console.error("Utility contacts POST error:", error);
    return NextResponse.json(
      { error: "Failed to create utility contact" },
      { status: 500 }
    );
  }
}
