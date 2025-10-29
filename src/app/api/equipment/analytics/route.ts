import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { requireEquipmentPermission } from '@/lib/auth-middleware';



export async function GET(request: NextRequest) {
  // 🔒 SECURITY: Require viewAnalytics permission
  const authResult = await requireEquipmentPermission(request, 'viewAnalytics');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const supabase = getSupabaseServerClient();
try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const start_date = searchParams.get('start_date');
    const end_date = searchParams.get('end_date');
    const period = searchParams.get('period') || 'month'; // month, quarter, year

    // Get all equipment
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .select(`
        id,
        name,
        type,
        inventory_no,
        status,
        rental_cost_per_day,
        purchase_date,
        warranty_until,
        description,
        is_active,
        created_at
      `)
      .eq('is_active', true);

    if (equipmentError) {
      console.error('Supabase equipment query error:', equipmentError);
      return NextResponse.json(
        { error: 'Failed to fetch equipment data' },
        { status: 500 }
      );
    }

    // Get equipment assignments with filters
    let assignmentsQuery = supabase
      .from('equipment_assignments')
      .select(`
        id,
        equipment_id,
        project_id,
        crew_id,
        user_id,
        from_ts,
        to_ts,
        is_permanent,
        rental_cost_per_day,
        notes,
        created_at,
        equipment:equipment(
          id,
          name,
          type,
          inventory_no,
          rental_cost_per_day
        ),
        project:projects(
          id,
          name,
          city
        ),
        crew:crews(
          id,
          name
        ),
        user:users(
          id,
          first_name,
          last_name,
          email
        )
      `);

    // Apply filters
    if (project_id) {
      assignmentsQuery = assignmentsQuery.eq('project_id', project_id);
    }

    if (start_date && end_date) {
      assignmentsQuery = assignmentsQuery
        .gte('from_ts', start_date)
        .lte('from_ts', end_date);
    } else if (start_date) {
      assignmentsQuery = assignmentsQuery.gte('from_ts', start_date);
    } else if (end_date) {
      assignmentsQuery = assignmentsQuery.lte('from_ts', end_date);
    }

    const { data: assignments, error: assignmentsError } = await assignmentsQuery;

    if (assignmentsError) {
      console.error('Supabase assignments query error:', assignmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch assignments data' },
        { status: 500 }
      );
    }

    // Get equipment maintenance records
    const { data: maintenance, error: maintenanceError } = await supabase
      .from('equipment_maintenance')
      .select(`
        id,
        equipment_id,
        maintenance_type,
        description,
        cost,
        date,
        next_maintenance_date,
        performed_by,
        created_at,
        equipment:equipment(
          id,
          name,
          type,
          inventory_no
        )
      `);

    if (maintenanceError) {
      console.error('Supabase maintenance query error:', maintenanceError);
      // Continue without maintenance data
    }

    // Calculate analytics
    const totalEquipment = equipment?.length || 0;
    const totalAssignments = assignments?.length || 0;
    const totalMaintenance = maintenance?.length || 0;

    // Equipment status distribution
    const statusDistribution = (equipment || []).reduce((acc: any, item: any) => {
      const status = item.status || 'available';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Equipment type distribution
    const typeDistribution = (equipment || []).reduce((acc: any, item: any) => {
      const type = item.type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Utilization rates (equipment that are currently assigned)
    const currentDate = new Date();
    const activeAssignments = (assignments || []).filter((assignment: any) => {
      const fromDate = new Date(assignment.from_ts);
      const toDate = assignment.to_ts ? new Date(assignment.to_ts) : null;

      return fromDate <= currentDate && (!toDate || toDate > currentDate);
    });

    const utilizedEquipmentIds = new Set(activeAssignments.map((a: any) => a.equipment_id));
    const utilizationRate = totalEquipment > 0 ?
      ((utilizedEquipmentIds.size / totalEquipment) * 100).toFixed(2) : 0;

    // Rental cost analytics
    const totalRentalValue = (equipment || []).reduce((sum: number, item: any) =>
      sum + (Number(item.rental_cost_per_day) || 0), 0
    );

    const averageRentalCost = totalEquipment > 0 ?
      totalRentalValue / totalEquipment : 0;

    // Assignment duration analytics
    const assignmentDurations = (assignments || []).map((assignment: any) => {
      const fromDate = new Date(assignment.from_ts);
      const toDate = assignment.to_ts ? new Date(assignment.to_ts) : new Date();
      const durationDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...assignment,
        duration_days: durationDays,
        daily_cost: Number(assignment.rental_cost_per_day) || Number(assignment.equipment?.rental_cost_per_day) || 0,
        total_cost: durationDays * (Number(assignment.rental_cost_per_day) || Number(assignment.equipment?.rental_cost_per_day) || 0)
      };
    });

    const totalRentalCosts = assignmentDurations.reduce((sum: number, assignment: any) =>
      sum + assignment.total_cost, 0
    );

    const averageAssignmentDuration = assignmentDurations.length > 0 ?
      assignmentDurations.reduce((sum: number, assignment: any) => sum + assignment.duration_days, 0) /
      assignmentDurations.length : 0;

    // Project distribution
    const projectDistribution: { [key: string]: any } = {};
    (assignments || []).forEach((assignment: any) => {
      const projectId = assignment.project_id;
      if (!projectDistribution[projectId]) {
        projectDistribution[projectId] = {
          project_id: projectId,
          project_name: assignment.project?.name || 'Unknown Project',
          project_city: assignment.project?.city || '',
          equipment_count: new Set(),
          assignment_count: 0,
          total_rental_cost: 0
        };
      }

      projectDistribution[projectId].equipment_count.add(assignment.equipment_id);
      projectDistribution[projectId].assignment_count += 1;
      projectDistribution[projectId].total_rental_cost += assignmentDurations.find(a => a.id === assignment.id)?.total_cost || 0;
    });

    // Convert Set to count for project distribution
    const formattedProjectDistribution = Object.values(projectDistribution).map((project: any) => ({
      ...project,
      equipment_count: project.equipment_count.size
    }));

    // Most used equipment
    const equipmentUsage: { [key: string]: any } = {};
    (assignments || []).forEach((assignment: any) => {
      const equipmentId = assignment.equipment_id;
      if (!equipmentUsage[equipmentId]) {
        equipmentUsage[equipmentId] = {
          equipment_id: equipmentId,
          equipment_name: assignment.equipment?.name || 'Unknown Equipment',
          equipment_type: assignment.equipment?.type || '',
          inventory_no: assignment.equipment?.inventory_no || '',
          assignment_count: 0,
          total_days: 0,
          total_cost: 0
        };
      }

      const assignmentData = assignmentDurations.find(a => a.id === assignment.id);
      if (assignmentData) {
        equipmentUsage[equipmentId].assignment_count += 1;
        equipmentUsage[equipmentId].total_days += assignmentData.duration_days;
        equipmentUsage[equipmentId].total_cost += assignmentData.total_cost;
      }
    });

    const topUsedEquipment = Object.values(equipmentUsage)
      .sort((a: any, b: any) => b.assignment_count - a.assignment_count)
      .slice(0, 10);

    // Monthly trend (for the current year)
    const currentYear = new Date().getFullYear();
    const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthAssignments = (assignments || []).filter((assignment: any) => {
        const assignmentDate = new Date(assignment.from_ts);
        return assignmentDate.getFullYear() === currentYear &&
               assignmentDate.getMonth() + 1 === month;
      });

      const monthMaintenance = (maintenance || []).filter((m: any) => {
        const maintenanceDate = new Date(m.date);
        return maintenanceDate.getFullYear() === currentYear &&
               maintenanceDate.getMonth() + 1 === month;
      });

      const monthRentalCosts = monthAssignments.reduce((sum: number, assignment: any) => {
        const assignmentData = assignmentDurations.find(a => a.id === assignment.id);
        return sum + (assignmentData?.total_cost || 0);
      }, 0);

      const monthMaintenanceCosts = monthMaintenance.reduce((sum: number, m: any) =>
        sum + (Number(m.cost) || 0), 0
      );

      return {
        month,
        monthName: new Date(currentYear, i, 1).toLocaleString('en', { month: 'long' }),
        assignments: monthAssignments.length,
        maintenance_records: monthMaintenance.length,
        rental_costs: monthRentalCosts,
        maintenance_costs: monthMaintenanceCosts,
        total_costs: monthRentalCosts + monthMaintenanceCosts
      };
    });

    // Maintenance analytics
    const maintenanceStats = {
      total_maintenance: totalMaintenance,
      completed: 0, // No status column available
      scheduled: totalMaintenance, // All maintenance records are considered scheduled
      overdue: (maintenance || []).filter((m: any) => {
        const maintenanceDate = new Date(m.date);
        return maintenanceDate < currentDate;
      }).length,
      total_maintenance_cost: (maintenance || []).reduce((sum: number, m: any) =>
        sum + (Number(m.cost) || 0), 0
      )
    };

    return NextResponse.json({
      summary: {
        total_equipment: totalEquipment,
        total_assignments: totalAssignments,
        active_assignments: activeAssignments.length,
        utilization_rate: Number(utilizationRate),
        total_rental_value: totalRentalValue,
        average_rental_cost: Math.round(averageRentalCost * 100) / 100,
        total_rental_costs: Math.round(totalRentalCosts * 100) / 100,
        average_assignment_duration: Math.round(averageAssignmentDuration * 10) / 10
      },
      distributions: {
        status: Object.entries(statusDistribution).map(([status, count]) => ({
          status,
          count,
          percentage: totalEquipment > 0 ? ((count as number / totalEquipment) * 100).toFixed(2) : 0
        })),
        type: Object.entries(typeDistribution).map(([type, count]) => ({
          type,
          count,
          percentage: totalEquipment > 0 ? ((count as number / totalEquipment) * 100).toFixed(2) : 0
        }))
      },
      project_distribution: formattedProjectDistribution,
      top_used_equipment: topUsedEquipment,
      monthly_trends: monthlyTrends,
      maintenance: maintenanceStats,
      filters: {
        project_id,
        start_date,
        end_date,
        period
      }
    });
  } catch (error) {
    console.error('Equipment analytics API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}