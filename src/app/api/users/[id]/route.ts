import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for bypassing RLS
const supabase = createClient(
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
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user details
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      console.error('Supabase user query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }

    // Format user for frontend (map database fields to frontend field names)
    const formattedUser = {
      ...user,
      full_name: `${user.first_name} ${user.last_name}`.trim(),
      skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || []),
      lang_pref: user.language_preference || 'de' // Map language_preference to lang_pref
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error('User GET API error:', error);
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
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Map frontend field names to database column names
    const updateData: any = {};

    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.pin_code !== undefined) updateData.pin_code = body.pin_code;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.skills !== undefined) updateData.skills = body.skills;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    // Map lang_pref to language_preference for database
    if (body.lang_pref !== undefined) updateData.language_preference = body.lang_pref;

    updateData.updated_at = new Date().toISOString();

    // Update user
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      console.error('Supabase user update error:', error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Format user for frontend (map database fields to frontend field names)
    const formattedUser = {
      ...user,
      full_name: `${user.first_name} ${user.last_name}`.trim(),
      skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || []),
      lang_pref: user.language_preference || 'de' // Map language_preference to lang_pref
    };

    return NextResponse.json({
      message: 'User updated successfully',
      user: formattedUser
    });
  } catch (error) {
    console.error('User PUT API error:', error);
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
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists first
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('id', id)
      .single();

    if (checkError || !existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase user deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully',
      deleted_user: existingUser
    });
  } catch (error) {
    console.error('User DELETE API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}