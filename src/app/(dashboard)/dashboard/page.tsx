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
            С возвращением, {user?.first_name}!
          </h1>
          <p className="text-muted-foreground">
            Обзор текущего состояния ваших проектов по строительству оптоволоконных сетей.
          </p>
          {hasError && (
            <div className="mt-2 flex items-center gap-2 text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Используются кэшированные данные - проблема с подключением к базе данных</span>
            </div>
          )}
          {dashboardStats?.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-1">
              Обновлено: {new Date(dashboardStats.lastUpdated).toLocaleTimeString('ru-RU')}
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
          Обновить
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные проекты</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.projects.total ? `из ${dashboardStats.projects.total} всего` : 'Загрузка...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Рабочие записи</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalWorkEntries}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.workEntries.thisWeek ? `+${dashboardStats.workEntries.thisWeek} за неделю` : 'Загрузка...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидают одобрения</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {stats.pendingApprovals > 0 ? 'Требует внимания' : 'Всё обработано!'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Активные работники</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mb-1" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeWorkers}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.team.totalWorkers ? `из ${dashboardStats.team.totalWorkers} всего` : 'Загрузка...'}
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
              Последняя активность
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
                        {activity.user?.name || 'Неизвестный пользователь'} • {new Date(activity.created_at).toLocaleString('ru-RU')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Нет недавней активности</p>
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
              Статус проектов
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
                    <span className="text-sm text-muted-foreground">Активные</span>
                    <Badge variant="default">{dashboardStats?.projects.active || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Планирование</span>
                    <Badge variant="secondary">{dashboardStats?.projects.planning || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Завершённые</span>
                    <Badge variant="outline">{dashboardStats?.projects.completed || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Приостановлены</span>
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
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>
            Часто используемые действия в зависимости от вашей роли
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {canCreateWork && (
              <Button variant="outline">
                <ClipboardList className="mr-2 h-4 w-4" />
                Создать запись
              </Button>
            )}
            {(isAdmin || isProjectManager) && (
              <Button variant="outline">
                <Building2 className="mr-2 h-4 w-4" />
                Новый проект
              </Button>
            )}
            {(isAdmin || isProjectManager) && (
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Управление командами
              </Button>
            )}
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Отчёты
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}