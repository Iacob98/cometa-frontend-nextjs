import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UpdateFacilitySchema = z.object({
  type: z.string().min(1, "Type is required").optional(),
  supplier_id: z.string().uuid().optional(),
  rent_daily_eur: z.number().positive("Rent must be positive").optional(),
  service_freq: z.string().optional(),
  status: z.enum(['planned', 'active', 'completed']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location_text: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validationResult = UpdateFacilitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if facility exists
    const { data: existingFacility, error: fetchError } = await supabase
      .from('facilities')
      .select('id, project_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingFacility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Verify supplier exists if provided
    if (validatedData.supplier_id) {
      const { data: supplier, error: supplierError } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('id', validatedData.supplier_id)
        .single();

      if (supplierError || !supplier) {
        return NextResponse.json(
          { error: 'Supplier not found' },
          { status: 404 }
        );
      }
    }

    // Update facility in database
    const { data: facility, error } = await supabase
      .from('facilities')
      .update(validatedData)
      .eq('id', id)
      .select(`
        id,
        project_id,
        type,
        supplier_id,
        rent_daily_eur,
        service_freq,
        status,
        start_date,
        end_date,
        location_text,
        suppliers(id, name)
      `)
      .single();

    if (error) {
      console.error('Database error updating facility:', error);
      return NextResponse.json(
        { error: 'Failed to update facility in database' },
        { status: 500 }
      );
    }

    // Transform response to include supplier name
    const response = {
      success: true,
      message: "Facility updated successfully",
      facility: {
        ...facility,
        supplier_name: facility.suppliers?.name || null
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Facility PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update facility" },
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

    // Check if facility exists
    const { data: existingFacility, error: fetchError } = await supabase
      .from('facilities')
      .select('id, type, project_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingFacility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    // Delete facility from database
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error deleting facility:', error);
      return NextResponse.json(
        { error: 'Failed to delete facility from database' },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      message: `Facility "${existingFacility.type}" deleted successfully`
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Facility DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete facility" },
      { status: 500 }
    );
  }
}