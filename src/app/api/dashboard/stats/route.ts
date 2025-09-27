import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching dashboard statistics from database...');

    // Get project statistics
    const projectStatsQuery = `
      SELECT
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_projects,
        COUNT(CASE WHEN status = 'on_hold' THEN 1 END) as on_hold_projects
      FROM projects;
    `;

    // Get work entries statistics
    const workEntriesQuery = `
      SELECT
        COUNT(*) as total_work_entries,
        COUNT(CASE WHEN approved = false THEN 1 END) as pending_approvals,
        COUNT(CASE WHEN approved = true THEN 1 END) as approved_entries,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as entries_this_week
      FROM work_entries;
    `;

    // Get team statistics
    const teamStatsQuery = `
      SELECT
        COUNT(DISTINCT u.id) as total_workers,
        COUNT(DISTINCT CASE WHEN u.is_active = true THEN u.id END) as active_workers,
        COUNT(DISTINCT c.id) as total_crews,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_crews
      FROM users u
      LEFT JOIN crew_members cm ON u.id = cm.user_id
      LEFT JOIN crews c ON cm.crew_id = c.id
      WHERE u.role IN ('crew', 'worker', 'foreman');
    `;

    // Get material statistics
    const materialStatsQuery = `
      SELECT
        COUNT(*) as total_materials,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_materials,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_materials,
        COALESCE(AVG(unit_price_eur), 0) as avg_material_price
      FROM materials;
    `;

    // Get recent activity count
    const activityQuery = `
      SELECT COUNT(*) as recent_activities
      FROM activity_logs
      WHERE created_at >= NOW() - INTERVAL '24 hours';
    `;

    // Execute all queries in parallel
    const [projectResult, workResult, teamResult, materialResult, activityResult] = await Promise.all([
      query(projectStatsQuery),
      query(workEntriesQuery),
      query(teamStatsQuery),
      query(materialStatsQuery),
      query(activityQuery)
    ]);

    // Parse project statistics
    const projectData = projectResult.rows[0] ? {
      total: parseInt(projectResult.rows[0].total_projects) || 0,
      active: parseInt(projectResult.rows[0].active_projects) || 0,
      completed: parseInt(projectResult.rows[0].completed_projects) || 0,
      planning: parseInt(projectResult.rows[0].planning_projects) || 0,
      onHold: parseInt(projectResult.rows[0].on_hold_projects) || 0
    } : { total: 0, active: 0, completed: 0, planning: 0, onHold: 0 };

    // Parse work entries statistics
    const workData = workResult.rows[0] ? {
      total: parseInt(workResult.rows[0].total_work_entries) || 0,
      pendingApprovals: parseInt(workResult.rows[0].pending_approvals) || 0,
      approved: parseInt(workResult.rows[0].approved_entries) || 0,
      thisWeek: parseInt(workResult.rows[0].entries_this_week) || 0
    } : { total: 0, pendingApprovals: 0, approved: 0, thisWeek: 0 };

    // Parse team statistics
    const teamData = teamResult.rows[0] ? {
      totalWorkers: parseInt(teamResult.rows[0].total_workers) || 0,
      activeWorkers: parseInt(teamResult.rows[0].active_workers) || 0,
      totalCrews: parseInt(teamResult.rows[0].total_crews) || 0,
      activeCrews: parseInt(teamResult.rows[0].active_crews) || 0
    } : { totalWorkers: 0, activeWorkers: 0, totalCrews: 0, activeCrews: 0 };

    // Parse material statistics
    const materialData = materialResult.rows[0] ? {
      totalMaterials: parseInt(materialResult.rows[0].total_materials) || 0,
      activeMaterials: parseInt(materialResult.rows[0].active_materials) || 0,
      inactiveMaterials: parseInt(materialResult.rows[0].inactive_materials) || 0,
      avgPrice: parseFloat(materialResult.rows[0].avg_material_price) || 0
    } : { totalMaterials: 0, activeMaterials: 0, inactiveMaterials: 0, avgPrice: 0 };

    // Parse activity statistics
    const activityData = activityResult.rows[0] ? {
      recentActivities: parseInt(activityResult.rows[0].recent_activities) || 0
    } : { recentActivities: 0 };

    console.log('Dashboard statistics fetched successfully:', {
      projects: projectData,
      workEntries: workData,
      team: teamData,
      materials: materialData,
      activities: activityData
    });

    return NextResponse.json({
      projects: projectData,
      workEntries: workData,
      team: teamData,
      materials: materialData,
      activities: activityData,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard statistics API error:', error);

    // Return fallback data in case of database errors
    return NextResponse.json({
      projects: { total: 0, active: 0, completed: 0, planning: 0, onHold: 0 },
      workEntries: { total: 0, pendingApprovals: 0, approved: 0, thisWeek: 0 },
      team: { totalWorkers: 0, activeWorkers: 0, totalCrews: 0, activeCrews: 0 },
      materials: { totalMaterials: 0, inStock: 0, outOfStock: 0, totalValue: 0 },
      activities: { recentActivities: 0 },
      lastUpdated: new Date().toISOString(),
      error: 'Database connection failed - showing fallback data'
    }, { status: 200 }); // Still return 200 to not break the frontend
  }
}