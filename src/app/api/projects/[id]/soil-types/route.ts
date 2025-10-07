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

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Project soil type deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete soil type' },
      { status: 500 }
    )
  }
}
