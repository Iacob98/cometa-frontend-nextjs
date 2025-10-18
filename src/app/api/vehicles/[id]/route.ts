import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;

    // Get single vehicle from Supabase
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select(`
        id,
        brand,
        model,
        plate_number,
        type,
        status,
        rental_cost_per_day,
        fuel_type,
        year_manufactured,
        description,
        is_active,
        tipper_type,
        max_weight_kg,
        comment,
        number_of_seats,
        has_first_aid_kit,
        first_aid_kit_expiry_date,
        created_at,
        updated_at,
        vehicle_assignments(
          id,
          project_id,
          crew_id,
          user_id,
          from_ts,
          to_ts,
          is_permanent,
          rental_cost_per_day,
          notes,
          created_at,
          project:projects(id, name, city),
          crew:crews(id, name),
          user:users(id, first_name, last_name, email)
        )
      `)
      .eq('id', vehicleId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Supabase vehicle query error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch vehicle' },
        { status: 500 }
      );
    }

    // Format response to match expected structure
    const currentAssignments = (vehicle.vehicle_assignments || []).filter((assignment: any) => {
      if (!assignment.to_ts) return true; // Permanent or ongoing assignments
      return new Date(assignment.to_ts) > new Date(); // Future end date
    });

    let currentAssignment = null;
    if (currentAssignments.length > 0) {
      currentAssignment = currentAssignments[0];
    }

    const formattedVehicle = {
      id: vehicle.id,
      brand: vehicle.brand || '',
      model: vehicle.model || '',
      plate_number: vehicle.plate_number,
      type: vehicle.type || 'transporter',
      status: vehicle.status || 'available',
      rental_cost_per_day: Number(vehicle.rental_cost_per_day) || 0,
      fuel_type: vehicle.fuel_type || 'diesel',
      year_manufactured: vehicle.year_manufactured,
      description: vehicle.description || '',
      is_active: vehicle.is_active,
      tipper_type: vehicle.tipper_type || 'kein Kipper',
      max_weight_kg: vehicle.max_weight_kg ? Number(vehicle.max_weight_kg) : null,
      comment: vehicle.comment || null,
      number_of_seats: vehicle.number_of_seats ? Number(vehicle.number_of_seats) : null,
      has_first_aid_kit: vehicle.has_first_aid_kit || false,
      first_aid_kit_expiry_date: vehicle.first_aid_kit_expiry_date || null,
      full_name: `${vehicle.brand || ''} ${vehicle.model || ''} (${vehicle.plate_number})`.trim(),
      age: vehicle.year_manufactured ? new Date().getFullYear() - vehicle.year_manufactured : null,
      current_assignment: currentAssignment ? {
        id: currentAssignment.id,
        project_id: currentAssignment.project_id,
        crew_id: currentAssignment.crew_id,
        user_id: currentAssignment.user_id,
        from_ts: currentAssignment.from_ts,
        to_ts: currentAssignment.to_ts,
        is_permanent: currentAssignment.is_permanent,
        rental_cost_per_day: Number(currentAssignment.rental_cost_per_day) || 0,
        notes: currentAssignment.notes || '',
        project: currentAssignment.project ? {
          id: currentAssignment.project.id,
          name: currentAssignment.project.name,
          city: currentAssignment.project.city
        } : null,
        crew: currentAssignment.crew ? {
          id: currentAssignment.crew.id,
          name: currentAssignment.crew.name
        } : null,
        assigned_user: currentAssignment.user ? {
          id: currentAssignment.user.id,
          name: `${currentAssignment.user.first_name} ${currentAssignment.user.last_name}`,
          email: currentAssignment.user.email
        } : null,
        duration_days: currentAssignment.to_ts ?
          Math.ceil((new Date(currentAssignment.to_ts).getTime() - new Date(currentAssignment.from_ts).getTime()) / (1000 * 60 * 60 * 24)) : null
      } : null,
      assignments_count: vehicle.vehicle_assignments?.length || 0,
      created_at: vehicle.created_at,
      updated_at: vehicle.updated_at
    };

    return NextResponse.json(formattedVehicle);
  } catch (error) {
    console.error('Vehicle GET API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;
    const body = await request.json();
    const {
      brand,
      model,
      type,
      status,
      rental_cost_per_day,
      fuel_type,
      year_manufactured,
      description,
      tipper_type,
      max_weight_kg,
      comment,
      number_of_seats,
      has_first_aid_kit,
      first_aid_kit_expiry_date
    } = body;

    // Validate tipper_type if provided
    if (tipper_type !== undefined) {
      const validTipperTypes = ['Kipper', 'kein Kipper'];
      if (!validTipperTypes.includes(tipper_type)) {
        return NextResponse.json(
          { error: `Invalid tipper type. Must be one of: ${validTipperTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate type if provided
    if (type !== undefined) {
      const validTypes = ['pkw', 'lkw', 'transporter', 'pritsche', 'anhänger', 'excavator', 'other'];
      if (!validTypes.includes(type)) {
        return NextResponse.json(
          { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validate max_weight_kg if provided
    if (max_weight_kg !== undefined && max_weight_kg !== null) {
      const weight = Number(max_weight_kg);
      if (isNaN(weight) || weight < 0 || weight > 100000) {
        return NextResponse.json(
          { error: 'Invalid max weight. Must be between 0 and 100,000 kg' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (rental_cost_per_day !== undefined) updateData.rental_cost_per_day = Number(rental_cost_per_day);
    if (fuel_type !== undefined) updateData.fuel_type = fuel_type;
    if (year_manufactured !== undefined) updateData.year_manufactured = year_manufactured ? parseInt(year_manufactured) : null;
    if (description !== undefined) updateData.description = description;
    if (tipper_type !== undefined) updateData.tipper_type = tipper_type;
    if (max_weight_kg !== undefined) updateData.max_weight_kg = max_weight_kg ? Number(max_weight_kg) : null;
    if (comment !== undefined) updateData.comment = comment;
    if (number_of_seats !== undefined) updateData.number_of_seats = number_of_seats ? Number(number_of_seats) : null;
    if (has_first_aid_kit !== undefined) updateData.has_first_aid_kit = Boolean(has_first_aid_kit);
    if (first_aid_kit_expiry_date !== undefined) updateData.first_aid_kit_expiry_date = first_aid_kit_expiry_date || null;

    // Update vehicle
    const { data: updatedVehicle, error: updateError } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', vehicleId)
      .select(`
        id,
        brand,
        model,
        plate_number,
        type,
        status,
        rental_cost_per_day,
        fuel_type,
        year_manufactured,
        description,
        is_active,
        tipper_type,
        max_weight_kg,
        comment,
        number_of_seats,
        has_first_aid_kit,
        first_aid_kit_expiry_date,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('Supabase vehicle update error:', updateError);
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update vehicle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Vehicle PUT API error:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;

    // Check if vehicle has active assignments
    const { data: activeAssignments, error: assignmentError } = await supabase
      .from('vehicle_assignments')
      .select('id')
      .eq('vehicle_id', vehicleId)
      .is('to_ts', null); // Active assignments (no end date)

    if (assignmentError) {
      console.error('Error checking vehicle assignments:', assignmentError);
      return NextResponse.json(
        { error: 'Failed to check vehicle assignments' },
        { status: 500 }
      );
    }

    if (activeAssignments && activeAssignments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vehicle with active assignments. Please end all assignments first.' },
        { status: 400 }
      );
    }

    // Soft delete vehicle by setting is_active to false
    const { error: deleteError } = await supabase
      .from('vehicles')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId);

    if (deleteError) {
      console.error('Supabase vehicle delete error:', deleteError);
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Vehicle not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to delete vehicle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Vehicle DELETE API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}