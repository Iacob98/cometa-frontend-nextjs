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
        { error: 'Crew ID is required' },
        { status: 400 }
      );
    }

    // Get crew with all related data
    const { data: crew, error } = await supabase
      .from('crews')
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
          email,
          role
        ),
        crew_members(
          id,
          user_id,
          role,
          is_active,
          joined_at,
          left_at,
          user:users(
            id,
            first_name,
            last_name,
            email,
            role,
            phone
          )
        )
      `)
      .eq('id', id)
      .eq('crew_members.is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Crew not found' },
          { status: 404 }
        );
      }
      console.error('Supabase crew query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch crew' },
        { status: 500 }
      );
    }

    // Format for frontend compatibility
    const formattedCrew = {
      id: crew.id,
      name: crew.name,
      description: crew.description || '',
      status: crew.status || 'active',
      foreman: crew.leader ? {
        id: crew.leader.id,
        full_name: `${crew.leader.first_name} ${crew.leader.last_name}`,
        first_name: crew.leader.first_name,
        last_name: crew.leader.last_name,
        email: crew.leader.email,
        role: crew.leader.role
      } : null,
      members: (crew.crew_members || []).map((member: any) => ({
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
        phone: member.user?.phone || '',
        // Keep nested user object for backward compatibility
        user: member.user ? {
          id: member.user.id,
          first_name: member.user.first_name,
          last_name: member.user.last_name,
          full_name: `${member.user.first_name} ${member.user.last_name}`,
          email: member.user.email,
          role: member.user.role,
          phone: member.user.phone
        } : null
      })),
      member_count: crew.crew_members?.length || 0,
      created_at: crew.created_at,
      updated_at: crew.updated_at
    };

    return NextResponse.json(formattedCrew);
  } catch (error) {
    console.error('Crew GET API error:', error);
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
        { error: 'Crew ID is required' },
        { status: 400 }
      );
    }

    // Build update data object (only include provided fields)
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.leader_user_id !== undefined) updateData.leader_user_id = body.leader_user_id;

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Update the crew
    const { data: crew, error } = await supabase
      .from('crews')
      .update(updateData)
      .eq('id', id)
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
          email,
          role
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Crew not found' },
          { status: 404 }
        );
      }
      console.error('Supabase crew update error:', error);
      return NextResponse.json(
        { error: 'Failed to update crew' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Crew updated successfully',
      crew
    });
  } catch (error) {
    console.error('Crew PUT API error:', error);
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
        { error: 'Crew ID is required' },
        { status: 400 }
      );
    }

    // Check if crew exists first
    const { data: existingCrew, error: checkError } = await supabase
      .from('crews')
      .select('id, name')
      .eq('id', id)
      .single();

    if (checkError || !existingCrew) {
      return NextResponse.json(
        { error: 'Crew not found' },
        { status: 404 }
      );
    }

    // Delete the crew (cascade will handle crew_members)
    const { error } = await supabase
      .from('crews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase crew deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete crew' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Crew deleted successfully',
      deleted_crew: existingCrew
    });
  } catch (error) {
    console.error('Crew DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}