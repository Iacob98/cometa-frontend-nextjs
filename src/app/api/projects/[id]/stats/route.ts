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

    // Get project basic info
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('total_length_m, base_rate_per_m')
      .eq('id', projectId)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      console.error('Supabase project query error:', projectError);
      return NextResponse.json(
        { error: 'Failed to fetch project data' },
        { status: 500 }
      );
    }

    const totalLength = project?.total_length_m || 0;
    const baseRate = project?.base_rate_per_m || 0;

    // Get work entries statistics with parallel queries
    const [workEntriesResult, teamResult, materialsResult, costsResult] = await Promise.all([
      // Work entries statistics
      supabase
        .from('work_entries')
        .select('id, approved_by, meters_done_m')
        .eq('project_id', projectId),

      // Team members count (using crews table)
      supabase
        .from('crew_members')
        .select('user_id, crews!inner(project_id)')
        .eq('crews.project_id', projectId)
        .eq('is_active', true),

      // Material allocations count
      supabase
        .from('material_allocations')
        .select('id', { count: 'exact' })
        .eq('project_id', projectId),

      // Financial data (costs/transactions)
      supabase
        .from('transactions')
        .select('amount_eur')
        .eq('project_id', projectId)
        .eq('transaction_type', 'expense')
    ]);

    // Process work entries
    let workEntries = 0;
    let pendingApprovals = 0;
    let completedLength = 0;

    if (workEntriesResult.data) {
      workEntries = workEntriesResult.data.length;
      pendingApprovals = workEntriesResult.data.filter(entry => !entry.approved_by).length;
      completedLength = workEntriesResult.data.reduce(
        (sum, entry) => sum + (entry.meters_done_m || 0),
        0
      );
    }

    // Process team members count
    const teamMembers = teamResult.data?.length || 0;

    // Process materials count
    const materialsCount = materialsResult.count || 0;

    // Process financial data
    const totalSpent = costsResult.data?.reduce(
      (sum, transaction) => sum + (transaction.amount_eur || 0),
      0
    ) || 0;

    // Calculate progress percentage
    const progressPercentage = totalLength > 0
      ? Math.round((completedLength / totalLength) * 100)
      : 0;

    const projectBudget = totalLength * baseRate;

    // Calculate preparation progress based on available data
    let preparationProgress = 0;
    if (teamMembers > 0) preparationProgress += 40;
    if (materialsCount > 0) preparationProgress += 30;
    if (workEntries > 0) preparationProgress += 30;

    // Determine current phase based on progress and completion
    let currentPhase = 1;
    let phaseName = "Project Initiation";

    if (preparationProgress >= 90) {
      currentPhase = 10;
      phaseName = "Project Execution";
    } else if (preparationProgress >= 80) {
      currentPhase = 9;
      phaseName = "Final Preparation";
    } else if (materialsCount > 0) {
      currentPhase = 6;
      phaseName = "Materials Procurement";
    } else if (teamMembers > 0) {
      currentPhase = 5;
      phaseName = "Team Assignment";
    } else if (preparationProgress > 30) {
      currentPhase = 3;
      phaseName = "Resource Planning";
    } else if (preparationProgress > 10) {
      currentPhase = 2;
      phaseName = "Site Assessment";
    }

    return NextResponse.json({
      progress: {
        totalLength,
        completedLength,
        progressPercentage,
        workEntries,
        pendingApprovals,
        teamMembers,
        materialsCount,
      },
      phase: {
        currentPhase,
        totalPhases: 10,
        phaseName,
        phaseProgress: preparationProgress,
      },
      financial: {
        projectBudget,
        totalSpent,
        spentPercentage: projectBudget > 0 ? Math.round((totalSpent / projectBudget) * 100) : 0,
        remainingBudget: projectBudget - totalSpent,
      },
    });

  } catch (error) {
    console.error('Project stats API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}