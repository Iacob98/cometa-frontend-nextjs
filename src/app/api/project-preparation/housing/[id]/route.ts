import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const UpdateHousingUnitSchema = z.object({
  address: z.string().min(1, "Address is required").optional(),
  rooms_total: z.number().int().positive("Number of rooms must be positive").optional(),
  beds_total: z.number().int().positive("Number of beds must be positive").optional(),
  rent_daily_eur: z.number().positive("Daily rent must be positive").optional(),
  status: z.enum(['available', 'occupied', 'maintenance']).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

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
    const { data: existingHousingUnit, error: fetchError } = await supabase
      .from('housing_units')
      .select('id, project_id, address')
      .eq('id', id)
      .single();

    if (fetchError || !existingHousingUnit) {
      return NextResponse.json(
        { error: 'Housing unit not found' },
        { status: 404 }
      );
    }

    // Update housing unit in database
    const { data: housingUnit, error } = await supabase
      .from('housing_units')
      .update(validatedData)
      .eq('id', id)
      .select(`
        id,
        project_id,
        address,
        rooms_total,
        beds_total,
        rent_daily_eur,
        status
      `)
      .single();

    if (error) {
      console.error('Database error updating housing unit:', error);
      return NextResponse.json(
        { error: 'Failed to update housing unit in database' },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      message: "Housing unit updated successfully",
      housing_unit: housingUnit
    };

    return NextResponse.json(response);
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

    // Check if housing unit exists
    const { data: existingHousingUnit, error: fetchError } = await supabase
      .from('housing_units')
      .select('id, address, project_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingHousingUnit) {
      return NextResponse.json(
        { error: 'Housing unit not found' },
        { status: 404 }
      );
    }

    // Check if housing unit has any allocations (people assigned to it)
    const { data: allocations, error: allocationsError } = await supabase
      .from('housing_allocations')
      .select('id')
      .eq('housing_id', id)
      .limit(1);

    if (allocationsError) {
      console.error('Error checking housing allocations:', allocationsError);
      return NextResponse.json(
        { error: 'Failed to check housing allocations' },
        { status: 500 }
      );
    }

    if (allocations && allocations.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete housing unit with active allocations. Please remove all residents first.' },
        { status: 409 }
      );
    }

    // Delete housing unit from database
    const { error } = await supabase
      .from('housing_units')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error deleting housing unit:', error);
      return NextResponse.json(
        { error: 'Failed to delete housing unit from database' },
        { status: 500 }
      );
    }

    const response = {
      success: true,
      message: `Housing unit at "${existingHousingUnit.address}" deleted successfully`
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Housing unit DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete housing unit" },
      { status: 500 }
    );
  }
}