"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Home,
  Calendar,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Eye,
  Edit,
  Trash2,
  CalendarPlus,
  Play,
  CheckSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useHouses,
  usePendingConnections,
  useScheduledAppointments,
  useInProgressConnections,
  useCompletedConnections,
  useTodaysAppointments,
  useDeleteHouse,
  useScheduleAppointment,
  useStartConnection,
  useCompleteConnection,
} from "@/hooks/use-houses";
import { useProjects } from "@/hooks/use-projects";
import { useTeams } from "@/hooks/use-teams";
import { usePermissions } from "@/hooks/use-auth";
import type { HouseFilters, HouseConnectionStatus, ConnectionType } from "@/types";

export default function HousesPage() {
  const router = useRouter();
  const { canManageConnections } = usePermissions();
  const deleteHouse = useDeleteHouse();
  const scheduleAppointment = useScheduleAppointment();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<HouseConnectionStatus | "all">("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");

  const filters: HouseFilters = {
    search: searchQuery || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    project_id: projectFilter === "all" ? undefined : projectFilter,
    page: 1,
    per_page: 20,
  };

  const { data: housesResponse, isLoading: housesLoading, error: housesError } = useHouses(filters);
  const { data: pendingConnections } = usePendingConnections();
  const { data: scheduledAppointments } = useScheduledAppointments();
  const { data: inProgressConnections } = useInProgressConnections();
  const { data: completedConnections } = useCompletedConnections();
  const { data: todaysAppointments } = useTodaysAppointments();
  const { data: projectsResponse } = useProjects({ page: 1, per_page: 100 });
  const { data: teams } = useTeams();

  const houses = housesResponse?.items || [];
  const projects = projectsResponse?.items || [];

  const handleDeleteHouse = async (houseId: string, houseNumber: string) => {
    if (confirm(`Вы уверены, что хотите удалить дом "${houseNumber}"? Это действие нельзя отменить.`)) {
      await deleteHouse.mutateAsync(houseId);
    }
  };

  const getStatusBadgeVariant = (status: HouseConnectionStatus) => {
    switch (status) {
      case "created":
        return "secondary";
      case "planned":
        return "outline";
      case "started":
        return "secondary";
      case "finished":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: HouseConnectionStatus) => {
    switch (status) {
      case "created":
        return "Создан";
      case "planned":
        return "Запланирован";
      case "started":
        return "Начат";
      case "finished":
        return "Завершён";
      default:
        return status;
    }
  };

  const getConnectionTypeLabel = (type: ConnectionType) => {
    return type === "full" ? "Полное подключение" : "Частичное подключение";
  };

  const getConnectionMethodLabel = (method: string) => {
    return method === "trench" ? "Траншея" : "Прокол";
  };

  if (housesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Подключения домов</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Не удалось загрузить подключения домов. Попробуйте позже.
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
          <h1 className="text-3xl font-bold tracking-tight">Подключения домов</h1>
          <p className="text-muted-foreground">
            Управление записями на подключение и отслеживание прогресса
          </p>
        </div>
        {canManageConnections && (
          <Button onClick={() => router.push("/dashboard/houses/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Новый дом
          </Button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ожидают</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingConnections?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ожидают назначения
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Запланировано</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledAppointments?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Записи назначены
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">В работе</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressConnections?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Активные работы
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Завершено</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedConnections?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Подключений выполнено
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Сегодня</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysAppointments?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Записей на сегодня
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Все дома ({houses.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Ожидают ({pendingConnections?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Запланировано ({scheduledAppointments?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="today">
            Сегодня ({todaysAppointments?.total || 0})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Завершено ({completedConnections?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Фильтр домов</CardTitle>
              <CardDescription>
                Поиск и фильтрация подключений домов по различным критериям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по номеру дома, адресу или клиенту..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Фильтр по проекту" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все проекты</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(value: HouseConnectionStatus | "all") => setStatusFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Фильтр по статусу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="created">Создан</SelectItem>
                    <SelectItem value="planned">Запланирован</SelectItem>
                    <SelectItem value="started">Начат</SelectItem>
                    <SelectItem value="finished">Завершён</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Houses Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Подключения домов
              </CardTitle>
            </CardHeader>
            <CardContent>
              {housesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-muted animate-pulse rounded flex-1" />
                      <div className="h-4 bg-muted animate-pulse rounded w-20" />
                      <div className="h-4 bg-muted animate-pulse rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : houses.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Дома не найдены</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery || statusFilter !== "all" || projectFilter !== "all"
                      ? "Нет домов, соответствующих фильтрам."
                      : "Начните с добавления домов для подключения."}
                  </p>
                  {canManageConnections && (
                    <Button
                      className="mt-4"
                      onClick={() => router.push("/dashboard/houses/new")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить дом
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дом и адрес</TableHead>
                      <TableHead>Клиент</TableHead>
                      <TableHead>Проект</TableHead>
                      <TableHead>Информация о подключении</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Назначенная команда</TableHead>
                      <TableHead>Дата записи</TableHead>
                      <TableHead className="w-[100px]">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {houses.map((house) => (
                      <TableRow key={house.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">#{house.house_number}</div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{house.address}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {house.customer_name && (
                              <div className="font-medium text-sm">{house.customer_name}</div>
                            )}
                            {house.customer_contact && (
                              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{house.customer_contact}</span>
                              </div>
                            )}
                            {!house.customer_name && !house.customer_contact && (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {house.project?.name || `Project ${house.project_id}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {getConnectionTypeLabel(house.connection_type)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {getConnectionMethodLabel(house.connection_method)} • {house.estimated_length_m}m
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(house.status)}>
                            {getStatusLabel(house.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {house.assigned_team?.name || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {house.scheduled_date ? (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(house.scheduled_date).toLocaleDateString()}</span>
                              </div>
                            ) : (
                              "—"
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Действия</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/houses/${house.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Подробнее
                              </DropdownMenuItem>
                              {canManageConnections && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/dashboard/houses/${house.id}/edit`)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Редактировать
                                  </DropdownMenuItem>
                                  {house.status === "created" && (
                                    <DropdownMenuItem
                                      onClick={() => router.push(`/dashboard/houses/${house.id}/schedule`)}
                                    >
                                      <CalendarPlus className="mr-2 h-4 w-4" />
                                      Назначить запись
                                    </DropdownMenuItem>
                                  )}
                                  {house.status === "planned" && (
                                    <DropdownMenuItem
                                      onClick={() => router.push(`/dashboard/houses/${house.id}/start`)}
                                    >
                                      <Play className="mr-2 h-4 w-4" />
                                      Начать подключение
                                    </DropdownMenuItem>
                                  )}
                                  {house.status === "started" && (
                                    <DropdownMenuItem
                                      onClick={() => router.push(`/dashboard/houses/${house.id}/complete`)}
                                    >
                                      <CheckSquare className="mr-2 h-4 w-4" />
                                      Завершить подключение
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteHouse(house.id, house.house_number)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Удалить дом
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Ожидающие подключения
              </CardTitle>
              <CardDescription>
                Дома, ожидающие назначения команды и записи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Управление ожидающими подключениями будет реализовано с интерфейсом назначения команд.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Запланированные записи
              </CardTitle>
              <CardDescription>
                Дома с подтверждёнными датами записи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Календарь запланированных записей будет реализован.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Записи на сегодня
              </CardTitle>
              <CardDescription>
                Записи, запланированные на сегодня
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Панель сегодняшних записей будет реализована с обновлениями статуса в реальном времени.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Завершённые подключения
              </CardTitle>
              <CardDescription>
                Успешно завершённые подключения домов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                История и статистика завершённых подключений будет реализована.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}