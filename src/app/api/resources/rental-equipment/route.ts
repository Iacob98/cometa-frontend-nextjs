import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      project_id,
      crew_id,
      name,
      type,
      inventory_no,
      rental_company,
      daily_rate,
      hourly_rate,
      rental_start,
      rental_end,
      operator_name,
      purpose,
      contract_notes
    } = data;

    if (!project_id || !name || !type || !inventory_no || !rental_company || !daily_rate || !rental_start) {
      return NextResponse.json(
        { error: 'Missing required fields for rental equipment creation' },
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

    // Create equipment in database
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .insert([{
        name,
        type,
        inventory_no,
        status: crew_id ? 'issued_to_brigade' : 'assigned_to_project', // Use valid status based on crew assignment
        owned: false,
        rental_cost_per_day: daily_rate,
        current_location: `Project ${project_id}`,
        supplier_name: rental_company,
        purchase_date: rental_start,
        description: contract_notes || `Rental equipment for ${purpose || 'project'}`
      }])
      .select()
      .single();

    if (equipmentError) {
      console.error('Equipment creation error:', equipmentError);
      return NextResponse.json(
        { error: 'Failed to create equipment' },
        { status: 500 }
      );
    }

    // Create equipment assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('equipment_assignments')
      .insert([{
        equipment_id: equipment.id,
        project_id,
        crew_id: crew_id || null,
        from_ts: rental_start,
        to_ts: rental_end,
        is_permanent: !rental_end,
        rental_cost_per_day: daily_rate,
        is_active: true,
        notes: `Operator: ${operator_name || 'Not specified'}. Purpose: ${purpose || 'Not specified'}. Hourly rate: ${hourly_rate || 'N/A'} EUR/hour`
      }])
      .select()
      .single();

    if (assignmentError) {
      console.error('Assignment creation error:', assignmentError);
      // Clean up equipment if assignment fails
      await supabase.from('equipment').delete().eq('id', equipment.id);
      return NextResponse.json(
        { error: 'Failed to create equipment assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      equipment,
      assignment,
      message: 'Rental equipment created and assigned successfully'
    });

  } catch (error) {
    console.error('Rental equipment API error:', error);
    return NextResponse.json(
      { error: 'Failed to create rental equipment' },
      { status: 500 }
    );
  }
}