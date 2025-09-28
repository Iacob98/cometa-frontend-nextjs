import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

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
    const { code, name, address, notes, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Cabinet ID is required" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;

    // Update cabinet in database
    const { data: updatedCabinet, error } = await supabase
      .from('cabinets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase cabinet update error:', error);
      return NextResponse.json(
        { error: 'Failed to update cabinet in database' },
        { status: 500 }
      );
    }

    if (!updatedCabinet) {
      return NextResponse.json(
        { error: 'Cabinet not found' },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      message: "Cabinet updated successfully",
      cabinet: {
        id: updatedCabinet.id,
        code: updatedCabinet.code,
        name: updatedCabinet.name,
        address: updatedCabinet.address,
        updated_at: updatedCabinet.updated_at
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Zone layout cabinet PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update cabinet" },
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
        { error: "Cabinet ID is required" },
        { status: 400 }
      );
    }

    // Check if cabinet exists and get related data
    const { data: cabinet, error: fetchError } = await supabase
      .from('cabinets')
      .select('id, code, name')
      .eq('id', id)
      .single();

    if (fetchError || !cabinet) {
      return NextResponse.json(
        { error: 'Cabinet not found' },
        { status: 404 }
      );
    }

    // Delete cabinet from database
    const { error: deleteError } = await supabase
      .from('cabinets')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Supabase cabinet deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete cabinet from database' },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      message: `Cabinet "${cabinet.name}" (${cabinet.code}) deleted successfully`
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Zone layout cabinet DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete cabinet" },
      { status: 500 }
    );
  }
}