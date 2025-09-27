import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for bypassing RLS
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

    const { data: crew, error } = await supabaseService
      .from('crews')
      .select(`
        id,
        name,
        status,
        project_id,
        foreman_user_id,
        created_at,
        updated_at,
        project:projects(id, name, city),
        foreman:users!crews_foreman_user_id_fkey(id, first_name, last_name, email, phone)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase crew fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch crew from database' },
        { status: 500 }
      );
    }

    if (!crew) {
      return NextResponse.json(
        { error: 'Crew not found' },
        { status: 404 }
      );
    }

    // Format response for frontend compatibility
    const formattedCrew = {
      ...crew,
      foreman: crew.foreman ? {
        ...crew.foreman,
        full_name: `${crew.foreman.first_name || ''} ${crew.foreman.last_name || ''}`.trim(),
      } : null,
    };

    return NextResponse.json(formattedCrew);
  } catch (error) {
    console.error('Crew GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crew' },
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

    const { name, status, foreman_user_id, project_id } = body;

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    if (foreman_user_id !== undefined) updateData.foreman_user_id = foreman_user_id;
    if (project_id !== undefined) updateData.project_id = project_id;

    const { data: updatedCrew, error } = await supabaseService
      .from('crews')
      .update(updateData)
      .eq('id', id)
      .select(`
        id,
        name,
        status,
        project_id,
        foreman_user_id,
        created_at,
        updated_at,
        project:projects(id, name, city),
        foreman:users!crews_foreman_user_id_fkey(id, first_name, last_name, email, phone)
      `)
      .single();

    if (error) {
      console.error('Supabase crew update error:', error);
      return NextResponse.json(
        { error: 'Failed to update crew' },
        { status: 500 }
      );
    }

    // Format response for frontend compatibility
    const formattedCrew = {
      ...updatedCrew,
      foreman: updatedCrew.foreman ? {
        ...updatedCrew.foreman,
        full_name: `${updatedCrew.foreman.first_name || ''} ${updatedCrew.foreman.last_name || ''}`.trim(),
      } : null,
    };

    return NextResponse.json({
      message: 'Crew updated successfully',
      crew: formattedCrew
    });
  } catch (error) {
    console.error('Crew PUT API error:', error);
    return NextResponse.json(
      { error: 'Failed to update crew' },
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

    // Check if crew has members
    const { data: members, error: membersError } = await supabaseService
      .from('crew_members')
      .select('id')
      .eq('crew_id', id);

    if (membersError) {
      console.error('Error checking crew members:', membersError);
      return NextResponse.json(
        { error: 'Failed to check crew members' },
        { status: 500 }
      );
    }

    if (members && members.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete crew with existing members' },
        { status: 400 }
      );
    }

    const { error } = await supabaseService
      .from('crews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase crew delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete crew' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Crew deleted successfully'
    });
  } catch (error) {
    console.error('Crew DELETE API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete crew' },
      { status: 500 }
    );
  }
}