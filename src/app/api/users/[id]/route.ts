import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.email !== undefined) updateData.email = body.email;
    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.skills !== undefined) updateData.skills = body.skills;
    if (body.lang_pref !== undefined) updateData.language_preference = body.lang_pref;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    const formattedUser = {
      ...user,
      full_name: (user.first_name + ' ' + user.last_name).trim() || user.email || 'Unknown',
      skills: typeof user.skills === 'string' ? JSON.parse(user.skills) : (user.skills || []),
      lang_pref: user.language_preference || 'de'
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
