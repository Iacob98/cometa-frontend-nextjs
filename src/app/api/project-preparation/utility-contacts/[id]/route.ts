import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { kind, organization, phone, email, contact_person, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Update utility contact in database
    const { data: contact, error } = await supabase
      .from('utility_contacts')
      .update({
        kind,
        organization,
        phone,
        email,
        contact_person,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase utility contact update error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Utility contact not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update utility contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Utility contact updated successfully",
      utility_contact: contact
    });
  } catch (error) {
    console.error("Utility contact PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update utility contact" },
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
        { error: "Contact ID is required" },
        { status: 400 }
      );
    }

    // Delete utility contact from database
    const { error } = await supabase
      .from('utility_contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase utility contact deletion error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Utility contact not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to delete utility contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Utility contact deleted successfully"
    });
  } catch (error) {
    console.error("Utility contact DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete utility contact" },
      { status: 500 }
    );
  }
}