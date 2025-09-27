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
    const { id: equipmentId } = await params;

    // Get single equipment from Supabase
    const { data: equipment, error } = await supabase
      .from('equipment')
      .select(`
        id,
        type,
        name,
        inventory_no,
        owned,
        status,
        rental_cost_per_day,
        purchase_date,
        warranty_until,
        description,
        is_active,
        created_at,
        updated_at,
        equipment_assignments(
          id,
          project_id,
          crew_id,
          from_ts,
          to_ts,
          is_permanent,
          rental_cost_per_day,
          notes,
          created_at,
          project:projects(id, name, city),
          crew:crews(id, name)
        )
      `)
      .eq('id', equipmentId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Supabase equipment query error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Equipment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch equipment' },
        { status: 500 }
      );
    }

    // Format response to match expected structure
    const currentAssignments = (equipment.equipment_assignments || []).filter((assignment: any) => {
      if (!assignment.to_ts) return true; // Permanent or ongoing assignments
      return new Date(assignment.to_ts) > new Date(); // Future end date
    });

    let currentAssignment = null;
    if (currentAssignments.length > 0) {
      currentAssignment = currentAssignments[0];
    }

    const formattedEquipment = {
      id: equipment.id,
      type: equipment.type,
      name: equipment.name,
      inventory_no: equipment.inventory_no || '',
      owned: equipment.owned,
      status: equipment.status || 'available',
      purchase_price_eur: 0, // Not available in current schema, set to 0
      rental_price_per_day_eur: Number(equipment.rental_cost_per_day) || 0,
      rental_price_per_hour_eur: 0, // Not available in current schema, set to 0
      current_location: '', // Not available in current schema, set to empty
      quantity: 1, // Default to 1 for backward compatibility
      purchase_date: equipment.purchase_date,
      warranty_until: equipment.warranty_until,
      description: equipment.description || '',
      is_active: equipment.is_active,
      current_assignment: currentAssignment ? {
        id: currentAssignment.id,
        project_id: currentAssignment.project_id,
        crew_id: currentAssignment.crew_id,
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
        duration_days: currentAssignment.to_ts ?
          Math.ceil((new Date(currentAssignment.to_ts).getTime() - new Date(currentAssignment.from_ts).getTime()) / (1000 * 60 * 60 * 24)) : null
      } : null,
      assignments_count: equipment.equipment_assignments?.length || 0,
      created_at: equipment.created_at,
      updated_at: equipment.updated_at
    };

    return NextResponse.json(formattedEquipment);
  } catch (error) {
    console.error('Equipment GET API error:', error);
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
    const { id: equipmentId } = await params;
    const body = await request.json();
    const {
      type,
      name,
      inventory_no,
      owned,
      status,
      purchase_price_eur, // This will be ignored since it doesn't exist in the schema
      rental_price_per_day_eur,
      rental_price_per_hour_eur, // This will be ignored since it doesn't exist in the schema
      current_location, // This will be ignored since it doesn't exist in the schema
      description
    } = body;

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (type !== undefined) updateData.type = type;
    if (name !== undefined) updateData.name = name;
    if (inventory_no !== undefined) updateData.inventory_no = inventory_no;
    if (owned !== undefined) updateData.owned = owned;
    if (status !== undefined) updateData.status = status;
    if (rental_price_per_day_eur !== undefined) updateData.rental_cost_per_day = Number(rental_price_per_day_eur);
    if (description !== undefined) updateData.description = description;

    // Update equipment
    const { data: updatedEquipment, error: updateError } = await supabase
      .from('equipment')
      .update(updateData)
      .eq('id', equipmentId)
      .select(`
        id,
        type,
        name,
        inventory_no,
        owned,
        status,
        rental_cost_per_day,
        purchase_date,
        warranty_until,
        description,
        is_active,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('Supabase equipment update error:', updateError);
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Equipment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to update equipment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Equipment updated successfully',
      equipment: updatedEquipment
    });
  } catch (error) {
    console.error('Equipment PUT API error:', error);
    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: equipmentId } = await params;

    // Check if equipment has active assignments
    const { data: activeAssignments, error: assignmentError } = await supabase
      .from('equipment_assignments')
      .select('id')
      .eq('equipment_id', equipmentId)
      .is('to_ts', null); // Active assignments (no end date)

    if (assignmentError) {
      console.error('Error checking equipment assignments:', assignmentError);
      return NextResponse.json(
        { error: 'Failed to check equipment assignments' },
        { status: 500 }
      );
    }

    if (activeAssignments && activeAssignments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete equipment with active assignments. Please end all assignments first.' },
        { status: 400 }
      );
    }

    // Soft delete equipment by setting is_active to false
    const { error: deleteError } = await supabase
      .from('equipment')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', equipmentId);

    if (deleteError) {
      console.error('Supabase equipment delete error:', deleteError);
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Equipment not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to delete equipment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Equipment DELETE API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}