"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  BarChart3,
  Clock,
  Users,
  Download,
  RefreshCw,
  TrendingUp,
  Eye
} from "lucide-react";

import {
  useActivities,
  useActivityStats,
  getActivityTypeLabel,
  getActivityTypeColor,
  ACTIVITY_TYPES,
  type ActivityFilters
} from "@/hooks/use-activities";

export default function ActivitiesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<ActivityFilters>({
    page: 1,
    per_page: 50,
  });

  const { data: activities, isLoading, error, refetch } = useActivities(filters);
  const { data: stats, isLoading: statsLoading } = useActivityStats({
    user_id: filters.user_id,
    project_id: filters.project_id,
    activity_type: filters.activity_type,
    date_from: filters.date_from,
    date_to: filters.date_to,
  });

  const handleFilterChange = (key: keyof ActivityFilters, value: string | number) => {
    // Convert "all" values to undefined for proper filtering
    const actualValue = value === "all" ? undefined : value;

    setFilters(prev => ({
      ...prev,
      [key]: actualValue,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleDateRangeFilter = (range: string) => {
    const now = new Date();
    let dateFrom: string | undefined;

    switch (range) {
      case 'today':
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        break;
      case 'week':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'month':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'all':
      default:
        dateFrom = undefined;
        break;
    }

    setFilters(prev => ({
      ...prev,
      date_from: dateFrom,
      page: 1,
    }));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Журнал действий</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Activity className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-sm font-semibold">Ошибка загрузки действий</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Не удалось загрузить журнал действий. Попробуйте снова.
              </p>
              <Button onClick={() => refetch()} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Повторить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Журнал действий</h1>
          <p className="text-muted-foreground">
            Полный журнал аудита системных действий и действий пользователей
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
        </div>
      </div>

      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">
            Журнал действий ({activities?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="mr-2 h-4 w-4" />
            Аналитика
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего действий</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.total_activities}</div>
                  <p className="text-xs text-muted-foreground">
                    Все записанные действия
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активные пользователи</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.unique_users}</div>
                  <p className="text-xs text-muted-foreground">
                    Пользователи с активностью
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Типы действий</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.activity_types_count}</div>
                  <p className="text-xs text-muted-foreground">
                    Различные типы действий
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активные проекты</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.active_projects}</div>
                  <p className="text-xs text-muted-foreground">
                    Проекты с активностью
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Фильтр действий
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск действий..."
                    className="pl-9"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>

                <Select onValueChange={(value) => handleFilterChange('activity_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Тип действия" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {getActivityTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={handleDateRangeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Период" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всё время</SelectItem>
                    <SelectItem value="today">Сегодня</SelectItem>
                    <SelectItem value="week">Последние 7 дней</SelectItem>
                    <SelectItem value="month">Последние 30 дней</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="datetime-local"
                  placeholder="С даты"
                  value={filters.date_from ? new Date(filters.date_from).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value ? new Date(e.target.value).toISOString() : '')}
                />

                <Input
                  type="datetime-local"
                  placeholder="По дату"
                  value={filters.date_to ? new Date(filters.date_to).toISOString().slice(0, 16) : ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value ? new Date(e.target.value).toISOString() : '')}
                />

                <Select onValueChange={(value) => handleFilterChange('per_page', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Размер страницы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 на странице</SelectItem>
                    <SelectItem value="50">50 на странице</SelectItem>
                    <SelectItem value="100">100 на странице</SelectItem>
                    <SelectItem value="200">200 на странице</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activities Table */}
          <Card>
            <CardHeader>
              <CardTitle>Журнал действий</CardTitle>
              <CardDescription>
                Найдено {activities?.total || 0} действий
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  ))}
                </div>
              ) : !activities?.activities || activities.activities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Действия не найдены</h3>
                  <p className="text-gray-600 mb-4">
                    Нет действий, соответствующих текущим фильтрам.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ page: 1, per_page: 50 })}
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Время</TableHead>
                        <TableHead>Пользователь</TableHead>
                        <TableHead>Действие</TableHead>
                        <TableHead>Описание</TableHead>
                        <TableHead>Проект</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium text-sm">
                                  {activity.user?.name || 'Unknown User'}
                                </div>
                                {activity.user?.role && (
                                  <div className="text-xs text-muted-foreground">
                                    {activity.user.role}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getActivityTypeColor(activity.activity_type)}>
                              {getActivityTypeLabel(activity.activity_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm max-w-xs truncate block">
                              {activity.description}
                            </span>
                          </TableCell>
                          <TableCell>
                            {activity.project ? (
                              <span className="text-sm font-medium">
                                {activity.project.name}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Show activity details in a modal or navigate to details page
                                console.log('View activity details:', activity);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {activities && activities.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Показано {((activities.page - 1) * activities.per_page) + 1} -{' '}
                {Math.min(activities.page * activities.per_page, activities.total)} из{' '}
                {activities.total} действий
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('page', Math.max(1, (filters.page || 1) - 1))}
                  disabled={activities.page <= 1}
                >
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                  disabled={activities.page >= activities.total_pages}
                >
                  Вперёд
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {statsLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Activity Types Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Типы действий</CardTitle>
                  <CardDescription>
                    Распределение типов действий
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.activity_types.slice(0, 10).map((type) => (
                      <div key={type.activity_type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getActivityTypeColor(type.activity_type)}>
                            {getActivityTypeLabel(type.activity_type)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{type.count}</span>
                          <span className="text-sm text-muted-foreground">
                            ({type.percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Most Active Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Самые активные пользователи</CardTitle>
                  <CardDescription>
                    Пользователи с наибольшей активностью
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.most_active_users.slice(0, 10).map((user, index) => (
                      <div key={user.user_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{user.user_name}</div>
                            <div className="text-sm text-muted-foreground">{user.role}</div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {user.activity_count} действий
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Activity */}
              {stats.project_activity.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Активность по проектам</CardTitle>
                    <CardDescription>
                      Наиболее активные проекты
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.project_activity.slice(0, 10).map((project, index) => (
                        <div key={project.project_id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                              {index + 1}
                            </div>
                            <div className="font-medium">{project.project_name}</div>
                          </div>
                          <div className="text-sm font-medium">
                            {project.activity_count} действий
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  Нет данных аналитики
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}