import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;
    const project_id = searchParams.get('project_id');

    // Build the query for material assignments (same as allocations)
    let query = supabase
      .from('material_allocations')
      .select(`
        id,
        project_id,
        material_id,
        quantity_allocated,
        quantity_used,
        allocated_date,
        allocated_by,
        status,
        notes,
        created_at,
        updated_at,
        project:projects!material_allocations_project_id_fkey(
          id,
          name,
          city,
          address
        ),
        material:materials!material_allocations_material_id_fkey(
          id,
          name,
          category,
          unit,
          unit_price_eur,
          supplier_name
        )
      `, { count: 'exact' })
      .order('allocated_date', { ascending: false })
      .range(offset, offset + per_page - 1);

    // Filter by project if provided
    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    const { data: assignments, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch material assignments' },
        { status: 500 }
      );
    }

    // Transform data to match assignment format
    const transformedAssignments = (assignments || []).map(assignment => ({
      id: assignment.id,
      project_id: assignment.project_id,
      material_id: assignment.material_id,
      quantity: assignment.quantity_allocated,
      from_date: assignment.allocated_date,
      notes: assignment.notes,
      status: assignment.status,
      created_at: assignment.created_at,
      updated_at: assignment.updated_at,
      project: assignment.project,
      material: assignment.material
    }));

    return NextResponse.json({
      assignments: transformedAssignments,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page)
    });

  } catch (error) {
    console.error('Material assignments GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch material assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      material_id,
      quantity,
      from_date,
      to_date,
      notes = ''
    } = body;

    // Validate required fields
    if (!project_id || !material_id || !quantity) {
      return NextResponse.json(
        { error: 'Project ID, material ID, and quantity are required' },
        { status: 400 }
      );
    }

    // Validate quantity is positive
    if (Number(quantity) <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // Create new material assignment using the material_allocations table
    const { data: newAssignment, error: assignmentError } = await supabase
      .from('material_allocations')
      .insert({
        project_id,
        material_id,
        quantity_allocated: quantity,
        allocated_date: from_date || new Date().toISOString(),
        status: 'allocated',
        notes,
        allocated_by: '9e81e275-8b8d-4d3c-99e3-45ffff80af20', // admin@cometa.de - TODO: Get from session
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        id,
        project_id,
        material_id,
        quantity_allocated,
        allocated_date,
        status,
        notes,
        created_at,
        updated_at,
        project:projects!material_allocations_project_id_fkey(
          id,
          name,
          city
        ),
        material:materials!material_allocations_material_id_fkey(
          id,
          name,
          category,
          unit,
          unit_price_eur,
          supplier_name
        )
      `)
      .single();

    if (assignmentError) {
      console.error('Assignment creation error:', assignmentError);
      return NextResponse.json(
        { error: 'Failed to create material assignment' },
        { status: 500 }
      );
    }

    // Transform response to match assignment format
    const transformedAssignment = {
      id: newAssignment.id,
      project_id: newAssignment.project_id,
      material_id: newAssignment.material_id,
      quantity: newAssignment.quantity_allocated,
      from_date: newAssignment.allocated_date,
      notes: newAssignment.notes,
      status: newAssignment.status,
      created_at: newAssignment.created_at,
      updated_at: newAssignment.updated_at,
      project: newAssignment.project,
      material: newAssignment.material
    };

    return NextResponse.json(transformedAssignment);

  } catch (error) {
    console.error('Material assignment POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create material assignment' },
      { status: 500 }
    );
  }
}