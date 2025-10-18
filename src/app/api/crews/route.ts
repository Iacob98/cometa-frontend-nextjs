import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role client to bypass RLS for crew member queries
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
    const search = searchParams.get('search');
    const project_id = searchParams.get('project_id');
    const status = searchParams.get('status');

    // Build the query for crews with their members
    let query = supabase
      .from('crews')
      .select(`
        id,
        name,
        description,
        status,
        leader_user_id,
        project_id,
        created_at,
        updated_at,
        leader:users!crews_leader_user_id_fkey(
          id,
          first_name,
          last_name,
          email,
          role
        ),
        crew_members(
          id,
          user_id,
          role,
          is_active,
          joined_at,
          user:users(
            id,
            first_name,
            last_name,
            email,
            role
          )
        )
      `, { count: 'exact' })
      .eq('crew_members.is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (project_id) {
      query = query.eq('project_id', project_id);
    }

    const { data: crews, error, count } = await query;

    if (error) {
      console.error('Supabase crews query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch crews data' },
        { status: 500 }
      );
    }

    // Format response to ensure proper structure for frontend
    const formattedCrews = (crews || []).map((crew: any) => ({
      id: crew.id,
      name: crew.name,
      description: crew.description || '',
      status: crew.status || 'active',
      project_id: crew.project_id,
      foreman: crew.leader ? {
        id: crew.leader.id,
        full_name: `${crew.leader.first_name} ${crew.leader.last_name}`,
        first_name: crew.leader.first_name,
        last_name: crew.leader.last_name,
        email: crew.leader.email,
        role: crew.leader.role
      } : null,
      members: [
        // Add leader as first member if exists
        ...(crew.leader ? [{
          id: `leader-${crew.leader.id}`,
          user_id: crew.leader.id,
          role: 'leader',
          role_in_crew: 'leader',
          is_active: true,
          joined_at: crew.created_at,
          active_from: crew.created_at,
          first_name: crew.leader.first_name,
          last_name: crew.leader.last_name,
          full_name: `${crew.leader.first_name} ${crew.leader.last_name}`,
          email: crew.leader.email,
          user: {
            id: crew.leader.id,
            first_name: crew.leader.first_name,
            last_name: crew.leader.last_name,
            full_name: `${crew.leader.first_name} ${crew.leader.last_name}`,
            email: crew.leader.email,
            role: crew.leader.role
          }
        }] : []),
        // Add regular members
        ...(crew.crew_members || []).map((member: any) => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        role_in_crew: member.role, // Add compatibility field for frontend
        is_active: member.is_active,
        joined_at: member.joined_at,
        active_from: member.joined_at, // Add compatibility field for frontend
        // Flatten user data to member level for frontend compatibility
        first_name: member.user?.first_name || '',
        last_name: member.user?.last_name || '',
        full_name: member.user ? `${member.user.first_name} ${member.user.last_name}` : '',
        email: member.user?.email || '',
        // Keep nested user object for backward compatibility
        user: member.user ? {
          id: member.user.id,
          first_name: member.user.first_name,
          last_name: member.user.last_name,
          full_name: `${member.user.first_name} ${member.user.last_name}`,
          email: member.user.email,
          role: member.user.role
        } : null
      }))
      ],
      member_count: (crew.crew_members?.length || 0) + (crew.leader_user_id ? 1 : 0),
      created_at: crew.created_at,
      updated_at: crew.updated_at
    }));

    return NextResponse.json({
      crews: formattedCrews,
      pagination: {
        page,
        per_page,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / per_page)
      },
      summary: {
        total_crews: count || 0,
        active_crews: formattedCrews.filter(c => c.status === 'active').length,
        total_members: formattedCrews.reduce((sum, c) => sum + c.member_count, 0)
      }
    });
  } catch (error) {
    console.error('Crews API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, leader_user_id, status = 'active' } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Crew name is required' },
        { status: 400 }
      );
    }

    // Create new crew
    const { data: newCrew, error: crewError } = await supabase
      .from('crews')
      .insert({
        name,
        description: description || '',
        leader_user_id: leader_user_id || null,
        status
      })
      .select(`
        id,
        name,
        description,
        status,
        leader_user_id,
        created_at,
        updated_at,
        leader:users!crews_leader_user_id_fkey(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (crewError) {
      console.error('Supabase crew creation error:', crewError);
      return NextResponse.json(
        { error: 'Failed to create crew' },
        { status: 500 }
      );
    }

    // Format response
    const formattedCrew = {
      id: newCrew.id,
      name: newCrew.name,
      description: newCrew.description || '',
      status: newCrew.status,
      foreman: newCrew.leader ? {
        id: newCrew.leader.id,
        full_name: `${newCrew.leader.first_name} ${newCrew.leader.last_name}`,
        email: newCrew.leader.email
      } : null,
      members: [],
      member_count: 0,
      created_at: newCrew.created_at,
      updated_at: newCrew.updated_at
    };

    return NextResponse.json({
      message: 'Crew created successfully',
      crew: formattedCrew
    }, { status: 201 });
  } catch (error) {
    console.error('Crews POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create crew' },
      { status: 500 }
    );
  }
}