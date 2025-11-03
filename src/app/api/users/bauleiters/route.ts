import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';

// GET - Fetch all users with bauleiter role
export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        role,
        lang_pref,
        is_active,
        created_at
       FROM users
       WHERE role = 'bauleiter' AND is_active = true
       ORDER BY first_name, last_name`,
      []
    );

    return NextResponse.json({ bauleiters: result.rows });
  } catch (error) {
    console.error('Error fetching bauleiters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bauleiters' },
      { status: 500 }
    );
  }
}
