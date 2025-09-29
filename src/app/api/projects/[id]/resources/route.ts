import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Context {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params

    // Get all resources for the project including equipment assignments and vehicle assignments
    const [equipmentRes, vehicleRes, materialRes] = await Promise.all([
      // Get equipment assignments
      supabase
        .from('equipment_assignments')
        .select(`
          *,
          equipment:equipment_id (
            id,
            name,
            type,
            serial_number,
            status,
            purchase_date,
            warranty_expiry_date
          )
        `)
        .eq('project_id', projectId),

      // Get vehicle assignments
      supabase
        .from('vehicle_assignments')
        .select(`
          *,
          vehicles:vehicle_id (
            id,
            license_plate,
            make,
            model,
            year,
            type,
            status,
            fuel_type
          )
        `)
        .eq('project_id', projectId),

      // Get material allocations
      supabase
        .from('material_allocations')
        .select(`
          *,
          materials:material_id (
            id,
            name,
            category,
            unit,
            current_stock,
            reorder_level,
            price_per_unit
          )
        `)
        .eq('project_id', projectId)
    ])

    if (equipmentRes.error) {
      console.error('Equipment query error:', equipmentRes.error)
    }

    if (vehicleRes.error) {
      console.error('Vehicle query error:', vehicleRes.error)
    }

    if (materialRes.error) {
      console.error('Material query error:', materialRes.error)
    }

    const resources = {
      equipment: equipmentRes.data || [],
      vehicles: vehicleRes.data || [],
      materials: materialRes.data || []
    }

    return NextResponse.json(resources)

  } catch (error) {
    console.error('Project resources error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project resources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params
    const body = await request.json()
    const { type, resource_id, assigned_at, assigned_by, notes } = body

    let result

    switch (type) {
      case 'equipment':
        result = await supabase
          .from('equipment_assignments')
          .insert({
            project_id: projectId,
            equipment_id: resource_id,
            assigned_at,
            assigned_by,
            notes,
            status: 'active'
          })
        break

      case 'vehicle':
        result = await supabase
          .from('vehicle_assignments')
          .insert({
            project_id: projectId,
            vehicle_id: resource_id,
            assigned_at,
            assigned_by,
            notes,
            status: 'active'
          })
        break

      case 'material':
        const { quantity } = body
        result = await supabase
          .from('material_allocations')
          .insert({
            project_id: projectId,
            material_id: resource_id,
            allocated_quantity: quantity,
            allocated_at: assigned_at,
            allocated_by: assigned_by,
            notes,
            status: 'allocated'
          })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid resource type' },
          { status: 400 }
        )
    }

    if (result.error) {
      console.error('Resource assignment error:', result.error)
      return NextResponse.json(
        { error: 'Failed to assign resource' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data)

  } catch (error) {
    console.error('Project resources assignment error:', error)
    return NextResponse.json(
      { error: 'Failed to assign resource' },
      { status: 500 }
    )
  }
}