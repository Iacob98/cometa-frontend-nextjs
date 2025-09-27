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
    const { id: projectId } = await params;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Check if project exists
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

    // Return empty readiness data (no readiness tracking implemented yet)
    const readinessData = {
      project_id: projectId,
      project_status: project.status || 'planning',
      overall_readiness: 0,
      total_checks: 0,
      completed_checks: 0,
      days_to_start: null,
      critical_issues: 0,
      categories: {},
      issues: [],
      last_updated: new Date().toISOString(),
      message: 'Project readiness tracking not yet implemented'
    };

    return NextResponse.json(readinessData);

  } catch (error) {
    console.error('Project readiness API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project readiness data' },
      { status: 500 }
    );
  }
}