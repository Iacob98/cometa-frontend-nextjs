import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      activation_date,
      activation_notes,
      responsible_manager,
      notify_stakeholders = false
    } = body;

    // Validation
    if (!project_id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!activation_date) {
      return NextResponse.json(
        { error: 'Activation date is required' },
        { status: 400 }
      );
    }

    if (!responsible_manager) {
      return NextResponse.json(
        { error: 'Responsible manager is required' },
        { status: 400 }
      );
    }

    // Get current project status and readiness
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, status')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get current readiness score
    const { data: readinessData } = await supabase
      .from('project_readiness')
      .select('overall_readiness')
      .eq('project_id', project_id)
      .single();

    const currentReadiness = readinessData?.overall_readiness || 0;

    // Check if project meets readiness threshold (90%)
    if (currentReadiness < 90) {
      return NextResponse.json(
        {
          error: 'Project does not meet activation requirements',
          message: `Project readiness is ${currentReadiness}%, minimum required is 90%`,
          current_readiness: currentReadiness,
          required_readiness: 90
        },
        { status: 400 }
      );
    }

    // Create activation log entry
    const { data: activationLog, error: logError } = await supabase
      .from('project_activation_log')
      .insert({
        project_id,
        activation_date,
        activation_notes: activation_notes || null,
        responsible_manager,
        notify_stakeholders,
        readiness_at_activation: currentReadiness,
        previous_status: project.status,
        new_status: 'active',
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (logError) {
      console.error('Failed to create activation log:', logError);
      return NextResponse.json(
        { error: 'Failed to create activation log' },
        { status: 500 }
      );
    }

    // Update project status to active
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', project_id);

    if (updateError) {
      console.error('Failed to update project status:', updateError);
      return NextResponse.json(
        { error: 'Failed to activate project' },
        { status: 500 }
      );
    }

    // TODO: If notify_stakeholders is true, send notifications
    // This would integrate with an email service or notification system

    return NextResponse.json({
      success: true,
      activation_log: activationLog,
      message: `Project successfully activated on ${activation_date}`,
      previous_status: project.status,
      new_status: 'active',
      readiness_at_activation: currentReadiness
    }, { status: 201 });

  } catch (error) {
    console.error('Project activation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
