import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS policies for cost calculations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Get project costs from various sources
    const [
      projectRes,
      facilitiesRes,
      housingRes,
      equipmentRes,
      materialRes,
      laborRes
    ] = await Promise.all([
      // Project information
      supabase
        .from('projects')
        .select('id, name')
        .eq('id', projectId)
        .single(),
      // Facilities costs
      supabase
        .from('facilities')
        .select('*')
        .eq('project_id', projectId),

      // Housing units costs
      supabase
        .from('housing_units')
        .select('*')
        .eq('project_id', projectId),

      // Equipment assignment costs
      supabase
        .from('equipment_assignments')
        .select(`
          *,
          equipment:equipment_id (
            id,
            name,
            type,
            daily_rate
          )
        `)
        .eq('project_id', projectId),

      // Material allocation costs
      supabase
        .from('material_allocations')
        .select(`
          *,
          materials:material_id (
            id,
            name,
            price_per_unit,
            unit
          )
        `)
        .eq('project_id', projectId),

      // Labor costs from work entries
      supabase
        .from('work_entries')
        .select('*')
        .eq('project_id', projectId)
    ])

    if (projectRes.error) {
      console.error('Project query error:', projectRes.error)
    }

    if (facilitiesRes.error) {
      console.error('Facilities costs query error:', facilitiesRes.error)
    }

    if (housingRes.error) {
      console.error('Housing costs query error:', housingRes.error)
    }

    if (equipmentRes.error) {
      console.error('Equipment costs query error:', equipmentRes.error)
    }

    if (materialRes.error) {
      console.error('Material costs query error:', materialRes.error)
    }

    if (laborRes.error) {
      console.error('Labor costs query error:', laborRes.error)
    }

    // Calculate totals
    const facilityCosts = (facilitiesRes.data || []).reduce((total, facility) => {
      const dailyRate = parseFloat(facility.rent_daily_eur || 0)
      const days = facility.start_date && facility.end_date
        ? Math.ceil((new Date(facility.end_date).getTime() - new Date(facility.start_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0
      return total + (dailyRate * days)
    }, 0)

    const housingCosts = (housingRes.data || []).reduce((total, housing) => {
      const dailyRate = parseFloat(housing.rent_daily_eur || 0)
      const days = housing.check_in_date && housing.check_out_date
        ? Math.ceil((new Date(housing.check_out_date).getTime() - new Date(housing.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0
      return total + (dailyRate * days)
    }, 0)

    const equipmentCosts = (equipmentRes.data || []).reduce((total, assignment) => {
      const dailyRate = parseFloat(assignment.equipment?.daily_rate || 0)
      const days = assignment.assigned_at && assignment.returned_at
        ? Math.ceil((new Date(assignment.returned_at).getTime() - new Date(assignment.assigned_at).getTime()) / (1000 * 60 * 60 * 24))
        : 30 // Default 30 days if still assigned
      return total + (dailyRate * days)
    }, 0)

    const materialCosts = (materialRes.data || []).reduce((total, allocation) => {
      const pricePerUnit = parseFloat(allocation.materials?.price_per_unit || 0)
      const quantity = parseFloat(allocation.allocated_quantity || 0)
      return total + (pricePerUnit * quantity)
    }, 0)

    const laborCosts = (laborRes.data || []).reduce((total, entry) => {
      return total + parseFloat(entry.labor_cost || 0)
    }, 0)

    const totalCosts = facilityCosts + housingCosts + equipmentCosts + materialCosts + laborCosts
    const projectBudget = parseFloat(projectRes.data?.budget || 0)
    const remainingBudget = projectBudget - totalCosts
    const budgetUtilized = projectBudget > 0 ? (totalCosts / projectBudget) * 100 : 0

    const costs = {
      project: {
        id: projectRes.data?.id,
        name: projectRes.data?.name,
        budget: projectBudget,
        remaining_budget: remainingBudget,
        budget_utilized_percentage: budgetUtilized
      },
      facilities: {
        items: facilitiesRes.data || [],
        total: facilityCosts
      },
      housing: {
        items: housingRes.data || [],
        total: housingCosts
      },
      equipment: {
        items: equipmentRes.data || [],
        total: equipmentCosts
      },
      materials: {
        items: materialRes.data || [],
        total: materialCosts
      },
      labor: {
        items: laborRes.data || [],
        total: laborCosts
      },
      summary: {
        facilities: facilityCosts,
        housing: housingCosts,
        equipment: equipmentCosts,
        materials: materialCosts,
        labor: laborCosts,
        total: totalCosts
      }
    }

    return NextResponse.json(costs)

  } catch (error) {
    console.error('Project costs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project costs' },
      { status: 500 }
    )
  }
}