import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      project_id,
      crew_id,
      brand,
      model,
      plate_number,
      type,
      rental_company,
      daily_rate,
      hourly_rate,
      fuel_consumption,
      rental_start,
      rental_end,
      driver_name,
      purpose,
      contract_notes
    } = data;

    if (!project_id || !brand || !model || !plate_number || !type || !rental_company || !daily_rate || !rental_start) {
      return NextResponse.json(
        { error: 'Missing required fields for rental vehicle creation' },
        { status: 400 }
      );
    }

    // Check if project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create vehicle in database
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .insert([{
        brand,
        model,
        plate_number,
        type,
        status: 'in_use',
        owned: false,
        rental_price_per_day_eur: daily_rate,
        fuel_consumption_l_per_100km: fuel_consumption,
        current_location: `Project ${project_id}`,
        supplier_name: rental_company,
        purchase_date: rental_start,
        description: contract_notes || `Rental vehicle for ${purpose || 'project'}`
      }])
      .select()
      .single();

    if (vehicleError) {
      console.error('Vehicle creation error:', vehicleError);
      return NextResponse.json(
        { error: 'Failed to create vehicle' },
        { status: 500 }
      );
    }

    // Create vehicle assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('vehicle_assignments')
      .insert([{
        vehicle_id: vehicle.id,
        project_id,
        crew_id: crew_id || null,
        from_ts: rental_start,
        to_ts: rental_end,
        is_permanent: !rental_end,
        rental_cost_per_day: daily_rate,
        is_active: true,
        notes: `Driver: ${driver_name || 'Not specified'}. Purpose: ${purpose || 'Not specified'}`
      }])
      .select()
      .single();

    if (assignmentError) {
      console.error('Assignment creation error:', assignmentError);
      // Clean up vehicle if assignment fails
      await supabase.from('vehicles').delete().eq('id', vehicle.id);
      return NextResponse.json(
        { error: 'Failed to create vehicle assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      vehicle,
      assignment,
      message: 'Rental vehicle created and assigned successfully'
    });

  } catch (error) {
    console.error('Rental vehicle API error:', error);
    return NextResponse.json(
      { error: 'Failed to create rental vehicle' },
      { status: 500 }
    );
  }
}