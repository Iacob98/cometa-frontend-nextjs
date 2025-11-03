import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * DELETE - Remove a specific installation plan
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cabinetId: string; planId: string }> }
) {
  try {
    const { cabinetId, planId } = await params;

    if (!cabinetId || !planId) {
      return NextResponse.json(
        { error: 'Cabinet ID and Plan ID are required' },
        { status: 400 }
      );
    }

    // Get plan info before deleting
    const planResult = await query(
      `SELECT file_path, cabinet_id FROM cabinet_plans WHERE id = $1`,
      [planId]
    );

    if (planResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    const plan = planResult.rows[0];

    // Verify plan belongs to this cabinet
    if (plan.cabinet_id !== cabinetId) {
      return NextResponse.json(
        { error: 'Plan does not belong to this cabinet' },
        { status: 403 }
      );
    }

    // Delete from storage if file exists
    if (plan.file_path) {
      const { error: deleteError } = await supabase.storage
        .from('project-documents')
        .remove([plan.file_path]);

      if (deleteError) {
        console.error('Storage delete error:', deleteError);
        // Continue even if storage delete fails
      }
    }

    // Delete from database
    await query(
      `DELETE FROM cabinet_plans WHERE id = $1`,
      [planId]
    );

    console.log(`✅ Plan ${planId} deleted for cabinet ${cabinetId}`);

    return NextResponse.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    console.error('Cabinet plan delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;
