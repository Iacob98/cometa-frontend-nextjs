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

    // Check if project exists and get status
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name, status, start_date')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Call the readiness calculation function
    const { data: readinessResult, error: readinessError } = await supabase
      .rpc('calculate_project_readiness', {
        p_project_id: projectId
      });

    if (readinessError) {
      console.error('Readiness calculation error:', readinessError);
      return NextResponse.json(
        { error: 'Failed to calculate project readiness' },
        { status: 500 }
      );
    }

    // Extract the result (RPC returns array with single row)
    const calculation = readinessResult?.[0];

    if (!calculation) {
      return NextResponse.json(
        { error: 'No readiness data returned' },
        { status: 500 }
      );
    }

    // Calculate days to start
    let daysToStart = null;
    if (project.start_date) {
      const startDate = new Date(project.start_date);
      const today = new Date();
      const diffTime = startDate.getTime() - today.getTime();
      daysToStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Format response to match frontend interface
    const readinessData = {
      project_id: projectId,
      project_status: project.status || 'planning',
      overall_readiness: calculation.overall_readiness || 0,
      total_checks: calculation.total_checks || 0,
      completed_checks: calculation.completed_checks || 0,
      days_to_start: daysToStart,
      critical_issues: calculation.critical_issues || 0,
      categories: calculation.category_details || {},
      issues: calculation.issues || [],
      last_updated: new Date().toISOString()
    };

    // Cache the result in project_readiness table
    const { error: cacheError } = await supabase
      .from('project_readiness')
      .upsert({
        project_id: projectId,
        overall_readiness: calculation.overall_readiness,
        total_checks: calculation.total_checks,
        completed_checks: calculation.completed_checks,
        critical_issues: calculation.critical_issues,
        documentation_score: calculation.documentation_score,
        resources_score: calculation.resources_score,
        infrastructure_score: calculation.infrastructure_score,
        approvals_score: calculation.approvals_score,
        category_details: calculation.category_details,
        issues: calculation.issues,
        calculated_at: new Date().toISOString()
      }, {
        onConflict: 'project_id'
      });

    if (cacheError) {
      console.error('Failed to cache readiness data:', cacheError);
      // Don't fail the request if caching fails
    }

    return NextResponse.json(readinessData);

  } catch (error) {
    console.error('Project readiness API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project readiness data' },
      { status: 500 }
    );
  }
}