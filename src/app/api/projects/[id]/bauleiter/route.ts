import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-pool';

// GET - Fetch current bauleiter for a project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        u.lang_pref
       FROM projects p
       LEFT JOIN users u ON p.bauleiter_id = u.id
       WHERE p.id = $1 AND u.id IS NOT NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ bauleiter: null });
    }

    return NextResponse.json({ bauleiter: result.rows[0] });
  } catch (error) {
    console.error('Error fetching project bauleiter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bauleiter' },
      { status: 500 }
    );
  }
}

// POST - Assign bauleiter to project
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { bauleiter_id } = body;

    if (!bauleiter_id) {
      return NextResponse.json(
        { error: 'Bauleiter ID is required' },
        { status: 400 }
      );
    }

    // Verify the user has bauleiter role
    const userCheck = await query(
      `SELECT id, role FROM users WHERE id = $1 AND role = 'bauleiter'`,
      [bauleiter_id]
    );

    if (userCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found or is not a Bauleiter' },
        { status: 400 }
      );
    }

    // Assign bauleiter to project
    const result = await query(
      `UPDATE projects
       SET bauleiter_id = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, bauleiter_id`,
      [bauleiter_id, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch the assigned bauleiter details
    const bauleiterResult = await query(
      `SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.role,
        u.lang_pref
       FROM users u
       WHERE u.id = $1`,
      [bauleiter_id]
    );

    return NextResponse.json({
      message: 'Bauleiter assigned successfully',
      bauleiter: bauleiterResult.rows[0],
    });
  } catch (error) {
    console.error('Error assigning bauleiter:', error);
    return NextResponse.json(
      { error: 'Failed to assign bauleiter' },
      { status: 500 }
    );
  }
}

// DELETE - Unassign bauleiter from project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await query(
      `UPDATE projects
       SET bauleiter_id = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Bauleiter unassigned successfully',
    });
  } catch (error) {
    console.error('Error unassigning bauleiter:', error);
    return NextResponse.json(
      { error: 'Failed to unassign bauleiter' },
      { status: 500 }
    );
  }
}
