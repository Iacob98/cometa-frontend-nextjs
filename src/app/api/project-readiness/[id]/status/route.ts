import { NextRequest, NextResponse } from 'next/server';
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
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['planning', 'ready', 'active', 'on_hold', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Get current project status
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, status')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Update project status
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select('id, name, status')
      .single();

    if (updateError) {
      console.error('Failed to update project status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update project status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: updatedProject,
      previous_status: project.status,
      new_status: status
    });

  } catch (error) {
    console.error('Update project status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
