"use client";

import { Building2, Users, ClipboardList, AlertCircle, TrendingUp, Calendar, Activity, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-auth";
import { useDashboardStats, useRecentActivities, useDashboardRefresh } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isAdmin, isProjectManager, isWorker, isForeman } = usePermissions();
  const canCreateWork = isWorker || isForeman || isProjectManager || isAdmin;

  // Real data from database using TanStack Query
  const { data: dashboardStats, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: recentActivities, isLoading: activitiesLoading } = useRecentActivities();
  const { refreshDashboard } = useDashboardRefresh();

  // Format recent activities from API or use empty array
  const displayActivities = recentActivities?.slice(0, 3) || [];

  // Create stats object from real data or defaults
  const stats = {
    activeProjects: dashboardStats?.projects.active || 0,
    totalWorkEntries: dashboardStats?.workEntries.total || 0,
    pendingApprovals: dashboardStats?.workEntries.pendingApprovals || 0,
    activeWorkers: dashboardStats?.team.activeWorkers || 0,
  };

  // Show error message if database connection failed
  const hasError = statsError || dashboardStats?.error;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening in your fiber optic construction projects today.
          </p>
          {hasError && (
            <div className="mt-2 flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Using cached data - database connection issue</span>
            </div>
          )}
          {dashboardStats?.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {new Date(dashboardStats.lastUpdated).toLocaleTimeString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshDashboard}
          disabled={statsLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.projects.total ? `of ${dashboardStats.projects.total} total projects` : 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Work Entries</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalWorkEntries}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.workEntries.thisWeek ? `+${dashboardStats.workEntries.thisWeek} this week` : 'Loading...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats.pendingApprovals > 0 ? 'Requires attention' : 'All caught up!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeWorkers}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.team.totalWorkers ? `of ${dashboardStats.team.totalWorkers} total workers` : 'Loading...'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activitiesLoading ? (
                // Loading skeleton for activities
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-4 w-4 mt-1" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : displayActivities.length > 0 ? (
                displayActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className="mt-1">
                      {activity.type === "work_entry" && (
                        <ClipboardList className="h-4 w-4 text-blue-500" />
                      )}
                      {activity.type === "project" && (
                        <Building2 className="h-4 w-4 text-green-500" />
                      )}
                      {activity.type === "approval" && (
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                      )}
                      {!["work_entry", "project", "approval"].includes(activity.type) && (
                        <Activity className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user?.name || 'Unknown User'} • {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Status Overview */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Project Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <Badge variant="default">{dashboardStats?.projects.active || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Planning</span>
                    <Badge variant="secondary">{dashboardStats?.projects.planning || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <Badge variant="outline">{dashboardStats?.projects.completed || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">On Hold</span>
                    <Badge variant="destructive">{dashboardStats?.projects.onHold || 0}</Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks you can perform based on your role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {canCreateWork && (
              <Button variant="outline">
                <ClipboardList className="mr-2 h-4 w-4" />
                Create Work Entry
              </Button>
            )}
            {(isAdmin || isProjectManager) && (
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                New Project
              </Button>
            )}
            {(isAdmin || isProjectManager) && (
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Teams
              </Button>
            )}
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}