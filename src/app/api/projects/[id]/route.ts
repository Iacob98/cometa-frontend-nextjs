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
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project with manager details using Supabase
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        customer,
        city,
        address,
        contact_24h,
        start_date,
        end_date_plan,
        status,
        total_length_m,
        base_rate_per_m,
        pm_user_id,
        language_default,
        created_at,
        updated_at,
        manager:users!projects_pm_user_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      console.error('Supabase project query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      );
    }

    // Format response with calculated fields
    const projectResponse = {
      ...project,
      manager_name: project.manager ? `${project.manager.first_name} ${project.manager.last_name}` : null,
      manager_email: project.manager?.email || null,
      progress: Math.floor(Math.random() * 60 + 20), // Mock progress for now
      description: `Fiber optic construction project in ${project.city || 'various locations'}`,
      budget: (project.total_length_m || 0) * (project.base_rate_per_m || 0)
    };

    return NextResponse.json(projectResponse);
  } catch (error) {
    console.error('Project API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Build update data object (only include provided fields)
    const updateData: any = {};
    const allowedFields = [
      'name', 'customer', 'city', 'address', 'contact_24h',
      'start_date', 'end_date_plan', 'status', 'total_length_m',
      'base_rate_per_m', 'pm_user_id', 'language_default'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update the project
    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        name,
        customer,
        city,
        address,
        contact_24h,
        start_date,
        end_date_plan,
        status,
        total_length_m,
        base_rate_per_m,
        pm_user_id,
        language_default,
        created_at,
        updated_at,
        manager:users!projects_pm_user_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      console.error('Supabase project update error:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    // Format response with calculated fields
    const projectResponse = {
      ...project,
      manager_name: project.manager ? `${project.manager.first_name} ${project.manager.last_name}` : null,
      manager_email: project.manager?.email || null,
      progress: Math.floor(Math.random() * 60 + 20),
      description: `Fiber optic construction project in ${project.city || 'various locations'}`,
      budget: (project.total_length_m || 0) * (project.base_rate_per_m || 0)
    };

    return NextResponse.json({
      message: 'Project updated successfully',
      project: projectResponse
    });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Check if project exists first
    const { data: existingProject, error: checkError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', id)
      .single();

    if (checkError || !existingProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete the project (cascade will handle related records)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase project deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Project deleted successfully',
      deleted_project: existingProject
    });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}