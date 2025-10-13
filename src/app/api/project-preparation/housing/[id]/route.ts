import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UpdateHousingUnitSchema = z.object({
  address: z.string().optional(),
  rooms_total: z.number().int().positive().optional(),
  beds_total: z.number().int().positive().optional(),
  occupied_beds: z.number().int().min(0).optional(),
  rent_daily_eur: z.number().positive().optional(),
  status: z.enum(['available', 'occupied', 'checked_out', 'maintenance']).optional(),
  advance_payment: z.number().optional(),
  check_in_date: z.string().optional(),
  check_out_date: z.string().optional(),
  owner_salutation: z.enum(['Herr', 'Frau']).optional(),
  owner_first_name: z.string().optional(),
  owner_last_name: z.string().optional(),
  owner_phone: z.string().optional(),
}).refine((data) => {
  if (data.occupied_beds !== undefined && data.beds_total !== undefined) {
    return data.occupied_beds <= data.beds_total;
  }
  return true;
}, {
  message: "Occupied beds cannot exceed total beds",
  path: ["occupied_beds"],
}).refine((data) => {
  // Conditional validation: If any owner info is provided, salutation is required
  const hasOwnerInfo = data.owner_first_name || data.owner_last_name || data.owner_phone;
  if (hasOwnerInfo && !data.owner_salutation) {
    return false;
  }
  return true;
}, {
  message: "Owner salutation is required when owner contact information is provided",
  path: ["owner_salutation"],
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Housing unit ID is required" },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = UpdateHousingUnitSchema.safeParse(body);
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

    // Check if housing unit exists
    const { data: existingUnit, error: checkError } = await supabase
      .from("housing_units")
      .select("id, project_id")
      .eq("id", id)
      .single();

    if (checkError || !existingUnit) {
      return NextResponse.json(
        { error: "Housing unit not found" },
        { status: 404 }
      );
    }

    // Build update data (only include provided fields)
    const updateData: any = {};
    const allowedFields = [
      'address', 'rooms_total', 'beds_total', 'occupied_beds', 'rent_daily_eur',
      'status', 'advance_payment', 'check_in_date', 'check_out_date',
      'owner_salutation', 'owner_first_name', 'owner_last_name', 'owner_phone'
    ];

    for (const field of allowedFields) {
      if (validatedData[field as keyof typeof validatedData] !== undefined) {
        updateData[field] = validatedData[field as keyof typeof validatedData];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    // Update housing unit
    const { data: updatedUnit, error } = await supabase
      .from("housing_units")
      .update(updateData)
      .eq("id", id)
      .select(`
        id,
        project_id,
        address,
        rooms_total,
        beds_total,
        rent_daily_eur,
        advance_payment,
        check_in_date,
        check_out_date,
        status,
        owner_salutation,
        owner_first_name,
        owner_last_name,
        owner_phone,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update housing unit" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Housing unit updated successfully",
      housing_unit: updatedUnit
    });
  } catch (error) {
    console.error("Housing unit PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update housing unit" },
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
        { error: "Housing unit ID is required" },
        { status: 400 }
      );
    }

    // Check if housing unit exists
    const { data: existingUnit, error: checkError } = await supabase
      .from("housing_units")
      .select("id, address")
      .eq("id", id)
      .single();

    if (checkError || !existingUnit) {
      return NextResponse.json(
        { error: "Housing unit not found" },
        { status: 404 }
      );
    }

    // Delete housing unit
    const { error } = await supabase
      .from("housing_units")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete housing unit" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Housing unit deleted successfully",
      deleted_housing_unit: {
        id: existingUnit.id,
        address: existingUnit.address
      }
    });
  } catch (error) {
    console.error("Housing unit DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete housing unit" },
      { status: 500 }
    );
  }
}
