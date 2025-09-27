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

    const { data: members, error } = await supabaseService
      .from('crew_members')
      .select(`
        id,
        crew_id,
        user_id,
        role,
        joined_at,
        user:users(id, first_name, last_name, email, role)
      `)
      .eq('crew_id', id);

    if (error) {
      console.error('Supabase crew members fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch crew members from database' },
        { status: 500 }
      );
    }

    // Map role to role_in_crew for frontend compatibility
    const membersWithCompatibility = (members || []).map(member => ({
      ...member,
      role_in_crew: member.role,
      // Add user data to the root level for compatibility
      user_id: member.user_id,
      first_name: member.user?.first_name,
      last_name: member.user?.last_name,
      full_name: `${member.user?.first_name || ''} ${member.user?.last_name || ''}`.trim(),
      email: member.user?.email,
    }));

    return NextResponse.json({ members: membersWithCompatibility });
  } catch (error) {
    console.error('Crew members GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crew members' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log('🚨 Crew member POST request:', { id, body });

    if (!id) {
      console.log('❌ Missing crew ID');
      return NextResponse.json(
        { error: 'Crew ID is required' },
        { status: 400 }
      );
    }

    const { user_id, role_in_crew = 'member' } = body;

    if (!user_id) {
      console.log('❌ Missing user ID');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('✅ Adding member to crew:', { crew_id: id, user_id, role: role_in_crew });

    // Check if user is already in this crew
    const { data: existingMember } = await supabaseService
      .from('crew_members')
      .select('id')
      .eq('crew_id', id)
      .eq('user_id', user_id)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this crew' },
        { status: 409 }
      );
    }

    // Add user to crew
    const { data: newMember, error } = await supabaseService
      .from('crew_members')
      .insert({
        crew_id: id,
        user_id,
        role: role_in_crew,
        joined_at: new Date().toISOString()
      })
      .select(`
        id,
        crew_id,
        user_id,
        role,
        joined_at,
        user:users(id, first_name, last_name, email, role)
      `)
      .single();

    if (error) {
      console.error('❌ Supabase crew member add error:', error);
      console.error('❌ Error code:', error.code);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error details:', error.details);
      if (error.code === '23503') {
        return NextResponse.json(
          { error: 'Invalid crew or user ID' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to add member to crew: ${error.message}` },
        { status: 500 }
      );
    }

    // Add compatibility mapping for the response
    const memberWithCompatibility = {
      ...newMember,
      role_in_crew: newMember.role,
      user_id: newMember.user_id,
      first_name: newMember.user?.first_name,
      last_name: newMember.user?.last_name,
      full_name: `${newMember.user?.first_name || ''} ${newMember.user?.last_name || ''}`.trim(),
      email: newMember.user?.email,
    };

    return NextResponse.json({
      message: 'Member added to crew successfully',
      member: memberWithCompatibility
    });
  } catch (error) {
    console.error('Crew members POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to add member to crew' },
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
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!id) {
      return NextResponse.json(
        { error: 'Crew ID is required' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseService
      .from('crew_members')
      .delete()
      .eq('crew_id', id)
      .eq('user_id', user_id);

    if (error) {
      console.error('Supabase crew member remove error:', error);
      return NextResponse.json(
        { error: 'Failed to remove member from crew' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Member removed from crew successfully'
    });
  } catch (error) {
    console.error('Crew members DELETE API error:', error);
    return NextResponse.json(
      { error: 'Failed to remove member from crew' },
      { status: 500 }
    );
  }
}