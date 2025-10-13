import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '20');
    const offset = (page - 1) * per_page;
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const is_active = searchParams.get('is_active');

    // Build Supabase query
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        pin_code,
        phone,
        skills,
        is_active,
        language_preference,
        created_at,
        updated_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1);

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (is_active !== null && is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Supabase users error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users from database' },
        { status: 500 }
      );
    }

    // Parse skills from JSONB string to array
    const parsedUsers = (users || []).map(user => ({
      ...user,
      skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || [])
    }));

    return NextResponse.json({
      items: parsedUsers,
      total: count || 0,
      page,
      per_page,
      total_pages: Math.ceil((count || 0) / per_page)
    });
  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      pin_code: provided_pin_code,
      first_name,
      last_name,
      role = 'worker',
      phone,
      language_preference = 'de',
      is_active = true
    } = body;

    // Validation - either email or phone required
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Either email or phone number is required' },
        { status: 400 }
      );
    }

    // Generate PIN code if not provided (4 digits)
    const pin_code = provided_pin_code || Math.floor(1000 + Math.random() * 9000).toString();

    // Validate PIN code format (4-6 digits)
    if (!/^\d{4,6}$/.test(pin_code)) {
      return NextResponse.json(
        { error: 'PIN code must be 4-6 digits' },
        { status: 400 }
      );
    }

    // Create user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        pin_code,
        first_name,
        last_name,
        role,
        phone,
        language_preference,
        is_active
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase users creation error:', error);

      // Handle unique constraint violations
      if (error.code === '23505') {
        if (error.message?.includes('users_email_key') || error.details?.includes('email')) {
          return NextResponse.json(
            { error: 'User with this email already exists' },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: 'User with these details already exists' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create user in database' },
        { status: 500 }
      );
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Users POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}