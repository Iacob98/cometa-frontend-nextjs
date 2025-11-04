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

    // Get crews directly assigned to this project
    const { data: crews, error: crewsError } = await supabase
      .from('crews')
      .select(`
        id,
        name,
        description,
        status,
        leader_user_id,
        created_at,
        updated_at,
        crew_members:crew_members(
          id,
          user_id,
          role,
          is_active,
          joined_at,
          users:users(
            id,
            first_name,
            last_name,
            email,
            role
          )
        )
      `)
      .eq('project_id', projectId);

    if (crewsError) {
      console.error('Supabase crews query error:', crewsError);
      return NextResponse.json(
        { error: 'Failed to fetch team data' },
        { status: 500 }
      );
    }

    // Calculate total members across all crews
    let totalMembers = 0;
    const formattedCrews = (crews || []).map((crew: any) => {
      const activeMembers = (crew.crew_members || []).filter((member: any) => member.is_active);
      totalMembers += activeMembers.length;

      // Find foreman by checking user.role (not crew_members.role)
      const foremanMember = activeMembers.find((member: any) =>
        member.users && member.users.role === 'foreman'
      );

      // Also check for leader role in crew_members table
      const leaderMember = activeMembers.find((member: any) => member.role === 'leader');

      return {
        id: crew.id,
        name: crew.name,
        description: crew.description,
        status: crew.status,
        leader_user_id: crew.leader_user_id,
        leader: leaderMember?.users || null,
        foreman: foremanMember ? {
          ...foremanMember.users,
          full_name: `${foremanMember.users.first_name} ${foremanMember.users.last_name}`.trim()
        } : null,
        members: activeMembers.map((member: any) => ({
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          role_in_crew: member.role,
          is_active: member.is_active,
          joined_at: member.joined_at,
          user: {
            ...member.users,
            full_name: `${member.users.first_name} ${member.users.last_name}`.trim()
          }
        })),
        member_count: activeMembers.length,
        created_at: crew.created_at,
        updated_at: crew.updated_at
      };
    });

    // Calculate summary statistics
    const summary = {
      total_crews: formattedCrews.length,
      total_members: totalMembers,
      foreman_count: formattedCrews.reduce((count, crew) => {
        return count + (crew.members.filter((m: any) => m.role === 'leader' || m.role === 'foreman').length);
      }, 0),
      worker_count: formattedCrews.reduce((count, crew) => {
        return count + (crew.members.filter((m: any) => m.role === 'member' || m.role === 'worker' || m.role === 'trainee').length);
      }, 0)
    };

    const formattedTeam = {
      project_id: projectId,
      crews: formattedCrews,
      total_members: totalMembers,
      active_crews: (crews || []).filter((crew: any) => crew.status === 'active').length,
      summary: summary
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