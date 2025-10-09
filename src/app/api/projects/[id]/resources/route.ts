import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Context {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id: projectId } = await params

    // Step 1: Get all crews assigned to this project
    const { data: projectCrews, error: crewsError } = await supabase
      .from('crews')
      .select('id, name')
      .eq('project_id', projectId)
      .eq('status', 'active')

    if (crewsError) {
      console.error('Error fetching project crews:', crewsError)
    }

    const crewIds = projectCrews?.map(c => c.id) || []

    // Step 2: Get crew-based equipment assignments (via crews on this project)
    const crewEquipmentPromise = crewIds.length > 0
      ? supabase
          .from('equipment_assignments')
          .select(`
            *,
            equipment:equipment_id (
              id,
              name,
              type,
              inventory_no,
              status,
              purchase_date,
              purchase_price_eur
            ),
            crew:crew_id (
              id,
              name
            )
          `)
          .in('crew_id', crewIds)
          .eq('is_active', true)
      : Promise.resolve({ data: [], error: null })

    // Step 3: Get direct project equipment assignments (crew_id is null)
    const directEquipmentPromise = supabase
      .from('equipment_assignments')
      .select(`
        *,
        equipment:equipment_id (
          id,
          name,
          type,
          inventory_no,
          status,
          purchase_date
        )
      `)
      .eq('project_id', projectId)
      .is('crew_id', null)
      .eq('is_active', true)

    // Step 4: Get crew-based vehicle assignments (via crews on this project)
    const crewVehiclesPromise = crewIds.length > 0
      ? supabase
          .from('vehicle_assignments')
          .select(`
            *,
            vehicle:vehicle_id (
              id,
              brand,
              model,
              plate_number,
              type,
              status,
              fuel_consumption_l_per_100km
            ),
            crew:crew_id (
              id,
              name
            )
          `)
          .in('crew_id', crewIds)
          .eq('is_active', true)
      : Promise.resolve({ data: [], error: null })

    // Step 5: Get direct project vehicle assignments (crew_id is null)
    const directVehiclesPromise = supabase
      .from('vehicle_assignments')
      .select(`
        *,
        vehicle:vehicle_id (
          id,
          brand,
          model,
          plate_number,
          type,
          status,
          fuel_consumption_l_per_100km
        )
      `)
      .eq('project_id', projectId)
      .is('crew_id', null)
      .eq('is_active', true)

    // Step 6: Get material allocations (unchanged)
    const materialPromise = supabase
      .from('material_allocations')
      .select(`
        *,
        material:material_id (
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

    // Execute all queries in parallel
    const [
      crewEquipmentRes,
      directEquipmentRes,
      crewVehiclesRes,
      directVehiclesRes,
      materialRes
    ] = await Promise.all([
      crewEquipmentPromise,
      directEquipmentPromise,
      crewVehiclesPromise,
      directVehiclesPromise,
      materialPromise
    ])

    if (crewEquipmentRes.error) {
      console.error('Crew equipment query error:', crewEquipmentRes.error)
    }
    if (directEquipmentRes.error) {
      console.error('Direct equipment query error:', directEquipmentRes.error)
    }
    if (crewVehiclesRes.error) {
      console.error('Crew vehicles query error:', crewVehiclesRes.error)
    }
    if (directVehiclesRes.error) {
      console.error('Direct vehicles query error:', directVehiclesRes.error)
    }
    if (materialRes.error) {
      console.error('Material query error:', materialRes.error)
    }

    // Merge and tag with assignment_source
    const allEquipment = [
      ...(crewEquipmentRes.data || []).map(e => ({
        ...e,
        assignment_source: 'crew_based' as const
      })),
      ...(directEquipmentRes.data || []).map(e => ({
        ...e,
        assignment_source: 'direct' as const
      }))
    ]

    const allVehicles = [
      ...(crewVehiclesRes.data || []).map(v => ({
        ...v,
        assignment_source: 'crew_based' as const
      })),
      ...(directVehiclesRes.data || []).map(v => ({
        ...v,
        assignment_source: 'direct' as const
      }))
    ]

    const resources = {
      equipment: allEquipment,
      vehicles: allVehicles,
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