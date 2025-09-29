import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Delete project plan from database
    const { error } = await supabase
      .from('project_plans')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase project plan deletion error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project plan not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to delete project plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project plan deleted successfully"
    });
  } catch (error) {
    console.error("Project plan DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete project plan" },
      { status: 500 }
    );
  }
}