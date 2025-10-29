import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateApiAuth, requireRole, requireProjectAccess, logUnauthorizedAccess } from '@/lib/api-auth'

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Context {
  params: { id: string }
}

// Helper function to recalculate project totals from soil types
async function recalculateProjectTotals(projectId: string) {
  try {
    // Get all soil types for the project
    const { data: soilTypes, error: fetchError } = await supabase
      .from('project_soil_types')
      .select('quantity_meters, price_per_meter')
      .eq('project_id', projectId);

    if (fetchError) {
      console.error('Failed to fetch soil types for recalculation:', fetchError);
      return false;
    }

    // Calculate totals
    let totalLength = 0;
    let totalValue = 0;

    if (soilTypes && soilTypes.length > 0) {
      soilTypes.forEach(soilType => {
        const quantity = parseFloat(soilType.quantity_meters || '0');
        const price = parseFloat(soilType.price_per_meter || '0');

        totalLength += quantity;
        totalValue += quantity * price;
      });
    }

    // Update project with calculated values
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        total_length_m: totalLength,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (updateError) {
      console.error('Failed to update project totals:', updateError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in recalculateProjectTotals:', error);
    return false;
  }
}

// GET /api/projects/[id]/soil-types - Get all soil types for a project
export async function GET(request: NextRequest, { params }: Context) {
  try {
    // SECURITY: Validate authentication and project access
    const authResult = await validateApiAuth(request);
    const { id: projectId } = await params;

    const authError = await requireProjectAccess(authResult, projectId, supabase);
    if (authError) {
      logUnauthorizedAccess(
        authResult.user?.id,
        `soil-types-read-${projectId}`,
        request
      );
      return authError;
    }

    // Proceed with authorized query
    const { data: soilTypes, error } = await supabase
      .from('project_soil_types')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Soil types query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch soil types' },
        { status: 500 }
      )
    }

    return NextResponse.json(soilTypes || [])

  } catch (error) {
    console.error('Project soil types error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project soil types' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/soil-types - Add a new soil type
export async function POST(request: NextRequest, { params }: Context) {
  try {
    // SECURITY: Validate authentication and role - only PM and admin can create
    const authResult = await validateApiAuth(request);
    const roleError = requireRole(authResult, ['admin', 'pm']);
    if (roleError) {
      const { id: projectId } = await params;
      logUnauthorizedAccess(
        authResult.user?.id,
        `soil-types-create-${projectId}`,
        request
      );
      return roleError;
    }

    // SECURITY: Validate project access
    const { id: projectId } = await params;
    const projectAccessError = await requireProjectAccess(authResult, projectId, supabase);
    if (projectAccessError) {
      logUnauthorizedAccess(
        authResult.user?.id,
        `soil-types-create-${projectId}`,
        request
      );
      return projectAccessError;
    }

    const body = await request.json()
    const { soil_type_name, price_per_meter, quantity_meters, notes } = body

    // Validation
    if (!soil_type_name || !price_per_meter) {
      return NextResponse.json(
        { error: 'Missing required fields: soil_type_name, price_per_meter' },
        { status: 400 }
      )
    }

    if (price_per_meter <= 0) {
      return NextResponse.json(
        { error: 'price_per_meter must be greater than 0' },
        { status: 400 }
      )
    }

    const { data: soilType, error } = await supabase
      .from('project_soil_types')
      .insert({
        project_id: projectId,
        soil_type_name,
        price_per_meter,
        quantity_meters: quantity_meters || null,
        notes: notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Soil type creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create soil type' },
        { status: 500 }
      )
    }

    // Recalculate project totals
    await recalculateProjectTotals(projectId)

    return NextResponse.json(soilType, { status: 201 })

  } catch (error) {
    console.error('Project soil type creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create soil type' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/soil-types?soil_type_id=... - Delete a soil type
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    // SECURITY: Validate authentication and role - only PM and admin can delete
    const authResult = await validateApiAuth(request);
    const roleError = requireRole(authResult, ['admin', 'pm']);
    if (roleError) {
      const { id: projectId } = await params;
      logUnauthorizedAccess(
        authResult.user?.id,
        `soil-types-delete-${projectId}`,
        request
      );
      return roleError;
    }

    // SECURITY: Validate project access
    const { id: projectId } = await params;
    const projectAccessError = await requireProjectAccess(authResult, projectId, supabase);
    if (projectAccessError) {
      logUnauthorizedAccess(
        authResult.user?.id,
        `soil-types-delete-${projectId}`,
        request
      );
      return projectAccessError;
    }

    const url = new URL(request.url)
    const soilTypeId = url.searchParams.get('soil_type_id')

    if (!soilTypeId) {
      return NextResponse.json(
        { error: 'soil_type_id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('project_soil_types')
      .delete()
      .eq('id', soilTypeId)
      .eq('project_id', projectId) // Ensure soil type belongs to project

    if (error) {
      console.error('Soil type deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete soil type' },
        { status: 500 }
      )
    }

    // Recalculate project totals after deletion
    await recalculateProjectTotals(projectId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Project soil type deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete soil type' },
      { status: 500 }
    )
  }
}
