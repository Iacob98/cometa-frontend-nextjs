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

    // Get crews that have worked on this project through work_entries
    const { data: workEntries, error: workError } = await supabase
      .from('work_entries')
      .select(`
        crew_id,
        crews:crews(
          id,
          name,
          description,
          status,
          leader_user_id,
          created_at,
          updated_at
        )
      `)
      .eq('project_id', projectId)
      .not('crew_id', 'is', null);

    if (workError) {
      console.error('Supabase work entries query error:', workError);
      return NextResponse.json(
        { error: 'Failed to fetch team data' },
        { status: 500 }
      );
    }

    // Extract unique crews from work entries
    const crewsMap = new Map();
    (workEntries || []).forEach((entry: any) => {
      if (entry.crews) {
        crewsMap.set(entry.crews.id, entry.crews);
      }
    });
    const crews = Array.from(crewsMap.values());

    // For now, return simplified structure until we can fix the nested queries
    const formattedTeam = {
      project_id: projectId,
      crews: (crews || []).map((crew: any) => ({
        id: crew.id,
        name: crew.name,
        description: crew.description,
        status: crew.status,
        leader_user_id: crew.leader_user_id,
        leader: null, // Will need separate query
        members: [], // Will need separate query
        created_at: crew.created_at,
        updated_at: crew.updated_at
      })),
      total_members: 0, // Will be calculated after member queries
      active_crews: (crews || []).filter((crew: any) => crew.status === 'active').length
    };

    return NextResponse.json(formattedTeam);
  } catch (error) {
    console.error('Project team API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { crew_name, leader_user_id, member_user_ids = [] } = body;

    if (!crew_name) {
      return NextResponse.json(
        { error: 'Crew name is required' },
        { status: 400 }
      );
    }

    // Create new crew (crews are not directly linked to projects)
    const { data: newCrew, error: crewError } = await supabase
      .from('crews')
      .insert({
        name: crew_name,
        leader_user_id: leader_user_id || null,
        status: 'active',
        description: `Crew: ${crew_name}`
      })
      .select()
      .single();

    if (crewError) {
      console.error('Supabase crew creation error:', crewError);
      return NextResponse.json(
        { error: 'Failed to create crew' },
        { status: 500 }
      );
    }

    // Add crew members if provided
    if (member_user_ids.length > 0) {
      const memberInserts = member_user_ids.map((userId: string) => ({
        crew_id: newCrew.id,
        user_id: userId,
        role: 'member',
        is_active: true,
        joined_at: new Date().toISOString()
      }));

      const { error: membersError } = await supabase
        .from('crew_members')
        .insert(memberInserts);

      if (membersError) {
        console.error('Supabase crew members creation error:', membersError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      message: 'Team crew created successfully',
      crew: newCrew
    }, { status: 201 });
  } catch (error) {
    console.error('Project team POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create team crew' },
      { status: 500 }
    );
  }
}