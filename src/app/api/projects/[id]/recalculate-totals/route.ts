import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Context {
  params: { id: string }
}

// POST /api/projects/[id]/recalculate-totals - Manually recalculate project totals from soil types
export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params

    // Check if project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Get all soil types for the project
    const { data: soilTypes, error: fetchError } = await supabase
      .from('project_soil_types')
      .select('quantity_meters, price_per_meter')
      .eq('project_id', projectId)

    if (fetchError) {
      console.error('Failed to fetch soil types:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch soil types' },
        { status: 500 }
      )
    }

    // Calculate totals
    let totalLength = 0
    let totalValue = 0

    if (soilTypes && soilTypes.length > 0) {
      soilTypes.forEach(soilType => {
        const quantity = parseFloat(soilType.quantity_meters || '0')
        const price = parseFloat(soilType.price_per_meter || '0')

        totalLength += quantity
        totalValue += quantity * price
      })
    }

    // Update project with calculated values
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        total_length_m: totalLength,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select('id, name, total_length_m')
      .single()

    if (updateError) {
      console.error('Failed to update project totals:', updateError)
      return NextResponse.json(
        { error: 'Failed to update project totals' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      project: updatedProject,
      calculated_totals: {
        total_length_m: totalLength,
        total_value_eur: totalValue,
        soil_types_count: soilTypes?.length || 0
      },
      message: 'Project totals recalculated successfully'
    })

  } catch (error) {
    console.error('Recalculate totals error:', error)
    return NextResponse.json(
      { error: 'Failed to recalculate project totals' },
      { status: 500 }
    )
  }
}
