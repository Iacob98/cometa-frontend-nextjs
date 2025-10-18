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
    const { id: projectId } = await params

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
    const { id: projectId } = await params
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

// PUT /api/projects/[id]/soil-types?soil_type_id=... - Update a soil type
export async function PUT(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params
    const url = new URL(request.url)
    const soilTypeId = url.searchParams.get('soil_type_id')

    if (!soilTypeId) {
      return NextResponse.json(
        { error: 'soil_type_id is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { soil_type_name, price_per_meter, quantity_meters, notes } = body

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (soil_type_name !== undefined) updateData.soil_type_name = soil_type_name
    if (price_per_meter !== undefined) {
      if (price_per_meter <= 0) {
        return NextResponse.json(
          { error: 'price_per_meter must be greater than 0' },
          { status: 400 }
        )
      }
      updateData.price_per_meter = price_per_meter
    }
    if (quantity_meters !== undefined) updateData.quantity_meters = quantity_meters
    if (notes !== undefined) updateData.notes = notes

    const { data: soilType, error } = await supabase
      .from('project_soil_types')
      .update(updateData)
      .eq('id', soilTypeId)
      .eq('project_id', projectId) // Ensure soil type belongs to project
      .select()
      .single()

    if (error) {
      console.error('Soil type update error:', error)
      return NextResponse.json(
        { error: 'Failed to update soil type' },
        { status: 500 }
      )
    }

    // Recalculate project totals after update
    await recalculateProjectTotals(projectId)

    return NextResponse.json(soilType)

  } catch (error) {
    console.error('Project soil type update error:', error)
    return NextResponse.json(
      { error: 'Failed to update soil type' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/soil-types?soil_type_id=... - Delete a soil type
export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params
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
