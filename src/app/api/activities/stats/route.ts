import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");
    const user_id = searchParams.get("user_id");

    let baseQuery = supabase.from("activities");

    // Apply filters for counting
    let countQuery = baseQuery.select("*", { count: "exact", head: true });
    if (project_id) countQuery = countQuery.eq("project_id", project_id);
    if (user_id) countQuery = countQuery.eq("user_id", user_id);
    if (date_from) countQuery = countQuery.gte("created_at", date_from);
    if (date_to) countQuery = countQuery.lte("created_at", date_to);

    // Get total activities count
    const { count: totalActivities } = await countQuery;

    // Get unique users count
    let usersQuery = baseQuery.select("user_id", { count: "exact", head: true });
    if (project_id) usersQuery = usersQuery.eq("project_id", project_id);
    if (date_from) usersQuery = usersQuery.gte("created_at", date_from);
    if (date_to) usersQuery = usersQuery.lte("created_at", date_to);

    const { data: usersData } = await baseQuery
      .select("user_id")
      .then(query => {
        if (project_id) query = query.eq("project_id", project_id);
        if (date_from) query = query.gte("created_at", date_from);
        if (date_to) query = query.lte("created_at", date_to);
        return query;
      });

    const uniqueUsers = new Set(usersData?.map(item => item.user_id) || []).size;

    // Get activity types distribution
    let typesQuery = baseQuery.select("activity_type");
    if (project_id) typesQuery = typesQuery.eq("project_id", project_id);
    if (user_id) typesQuery = typesQuery.eq("user_id", user_id);
    if (date_from) typesQuery = typesQuery.gte("created_at", date_from);
    if (date_to) typesQuery = typesQuery.lte("created_at", date_to);

    const { data: typesData } = await typesQuery;
    const typeCounts = (typesData || []).reduce((acc: Record<string, number>, item) => {
      acc[item.activity_type] = (acc[item.activity_type] || 0) + 1;
      return acc;
    }, {});

    const activityTypes = Object.entries(typeCounts).map(([type, count]) => ({
      activity_type: type,
      count: count as number,
      percentage: totalActivities ? Math.round(((count as number) / totalActivities) * 100) : 0,
    }));

    // Get active projects count
    let projectsQuery = baseQuery.select("project_id");
    if (user_id) projectsQuery = projectsQuery.eq("user_id", user_id);
    if (date_from) projectsQuery = projectsQuery.gte("created_at", date_from);
    if (date_to) projectsQuery = projectsQuery.lte("created_at", date_to);

    const { data: projectsData } = await projectsQuery.not("project_id", "is", null);
    const activeProjects = new Set(projectsData?.map(item => item.project_id) || []).size;

    // Get most active users with user details
    let userStatsQuery = baseQuery.select(`
      user_id,
      users!inner(first_name, last_name, role)
    `);
    if (project_id) userStatsQuery = userStatsQuery.eq("project_id", project_id);
    if (date_from) userStatsQuery = userStatsQuery.gte("created_at", date_from);
    if (date_to) userStatsQuery = userStatsQuery.lte("created_at", date_to);

    const { data: userStatsData } = await userStatsQuery.limit(1000);
    const userCounts = (userStatsData || []).reduce((acc: Record<string, any>, item) => {
      if (!acc[item.user_id]) {
        acc[item.user_id] = {
          user_id: item.user_id,
          user_name: `${item.users?.first_name || ''} ${item.users?.last_name || ''}`.trim() || 'Unknown User',
          role: item.users?.role || 'unknown',
          activity_count: 0,
        };
      }
      acc[item.user_id].activity_count++;
      return acc;
    }, {});

    const mostActiveUsers = Object.values(userCounts)
      .sort((a: any, b: any) => b.activity_count - a.activity_count)
      .slice(0, 10);

    // Get hourly timeline
    let timelineQuery = baseQuery.select("created_at");
    if (project_id) timelineQuery = timelineQuery.eq("project_id", project_id);
    if (user_id) timelineQuery = timelineQuery.eq("user_id", user_id);
    if (date_from) timelineQuery = timelineQuery.gte("created_at", date_from);
    if (date_to) timelineQuery = timelineQuery.lte("created_at", date_to);

    const { data: timelineData } = await timelineQuery;
    const hourlyCounts = Array.from({ length: 24 }, (_, hour) => ({ hour, activity_count: 0 }));

    (timelineData || []).forEach(item => {
      if (item.created_at) {
        const hour = new Date(item.created_at).getHours();
        hourlyCounts[hour].activity_count++;
      }
    });

    // Get project activity with project names
    let projectActivityQuery = baseQuery.select(`
      project_id,
      projects!inner(name)
    `);
    if (user_id) projectActivityQuery = projectActivityQuery.eq("user_id", user_id);
    if (date_from) projectActivityQuery = projectActivityQuery.gte("created_at", date_from);
    if (date_to) projectActivityQuery = projectActivityQuery.lte("created_at", date_to);

    const { data: projectActivityData } = await projectActivityQuery.not("project_id", "is", null);
    const projectCounts = (projectActivityData || []).reduce((acc: Record<string, any>, item) => {
      if (!acc[item.project_id]) {
        acc[item.project_id] = {
          project_id: item.project_id,
          project_name: item.projects?.name || 'Unknown Project',
          activity_count: 0,
        };
      }
      acc[item.project_id].activity_count++;
      return acc;
    }, {});

    const projectActivity = Object.values(projectCounts)
      .sort((a: any, b: any) => b.activity_count - a.activity_count)
      .slice(0, 10);

    const stats = {
      overview: {
        total_activities: totalActivities || 0,
        unique_users: uniqueUsers,
        activity_types_count: Object.keys(typeCounts).length,
        active_projects: activeProjects,
      },
      activity_types: activityTypes,
      most_active_users: mostActiveUsers,
      hourly_timeline: hourlyCounts,
      project_activity: projectActivity,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Activities stats API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}