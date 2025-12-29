"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Settings,
  Plus,
  Filter,
  ArrowLeft,
  Search,
  Wrench,
  Truck,
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Package,
  PieChart as PieChartIcon,
  Loader2,
  Car,
  Calendar,
  FileText,
  Building2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useEquipment, useEquipmentAssignments, useDeleteAssignment, useEquipmentAnalytics, useTypedEquipmentView } from "@/hooks/use-equipment";
import { useVehicleAssignments } from "@/hooks/use-vehicles";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { ReservationsTab } from "@/components/equipment/reservations-tab";
import { DocumentsTab } from "@/components/equipment/documents-tab";
import { UsageTab } from "@/components/equipment/usage-tab";
import { TypedEquipmentTable } from "@/components/equipment/typed-equipment-table";
import { useOverdueMaintenanceCount } from "@/hooks/use-maintenance-schedules";
import { useExpiringDocuments } from "@/hooks/use-equipment-documents";
import { categoryConfig } from "@/lib/validations/equipment-categories";

const statusColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  issued_to_brigade: "bg-blue-100 text-blue-800 border-blue-200",
  assigned_to_project: "bg-purple-100 text-purple-800 border-purple-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
  retired: "bg-gray-100 text-gray-800 border-gray-200",
  lost: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  available: "Доступен",
  issued_to_brigade: "Выдано бригаде",
  assigned_to_project: "Назначено на проект",
  maintenance: "На обслуживании",
  retired: "Списан",
  lost: "Потеряно",
};

const statusIcons = {
  available: CheckCircle,
  issued_to_brigade: Activity,
  assigned_to_project: Building2,
  maintenance: Clock,
  retired: XCircle,
  lost: AlertTriangle,
};

const categoryColors = {
  power_tool: "bg-orange-100 text-orange-800 border-orange-200",
  fusion_splicer: "bg-purple-100 text-purple-800 border-purple-200",
  otdr: "bg-blue-100 text-blue-800 border-blue-200",
  safety_gear: "bg-green-100 text-green-800 border-green-200",
  measuring_device: "bg-cyan-100 text-cyan-800 border-cyan-200",
  accessory: "bg-gray-100 text-gray-800 border-gray-200",
  uncategorized: "bg-slate-100 text-slate-800 border-slate-200",
} as const;

const categoryLabelsRU = {
  power_tool: "Электроинструмент",
  fusion_splicer: "Сварочный аппарат",
  otdr: "OTDR",
  safety_gear: "Защитное снаряжение",
  measuring_device: "Измерительный прибор",
  accessory: "Аксессуары",
  uncategorized: "Без категории",
} as const;

export default function EquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("fleet");
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    owned: "",
    search: "",
  });

  // Handle URL tab and category parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['fleet', 'assignments', 'usage', 'reservations', 'documents', 'usage-logs'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  const { data: equipmentData, isLoading } = useEquipment({
    ...filters,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    per_page: 1000
  });

  // Only fetch typed view data for supported categories
  const supportedTypedViewCategories = ['power_tool', 'fusion_splicer', 'otdr', 'safety_gear'];
  const shouldUseTypedView = supportedTypedViewCategories.includes(selectedCategory);

  // Fetch typed view data when category is selected and supported
  const { data: typedViewData, isLoading: isLoadingTypedView } = useTypedEquipmentView(
    shouldUseTypedView ? selectedCategory : 'all',
    {
      status: filters.status,
      owned: filters.owned ? filters.owned === 'true' : undefined,
      search: filters.search,
      per_page: 1000
    },
    {
      enabled: shouldUseTypedView,
    }
  );

  const { data: equipmentAssignments } = useEquipmentAssignments({ active_only: true });
  const { data: analytics, isLoading: analyticsLoading } = useEquipmentAnalytics();
  const deleteAssignmentMutation = useDeleteAssignment();

  // Equipment enhancement hooks
  const overdueMaintenanceCount = useOverdueMaintenanceCount();
  const { data: expiringDocsData } = useExpiringDocuments(30);
  const expiringDocsCount = expiringDocsData?.total || 0;

  // Use typed view data when category is selected, otherwise use regular equipment data
  const equipment = selectedCategory !== 'all' && typedViewData?.items
    ? typedViewData.items
    : equipmentData?.items || [];

  // Only equipment assignments (no vehicles)
  const assignments = (equipmentAssignments || []).map(assignment => ({
    ...assignment,
    assignment_type: 'equipment' as const,
    resource_type: 'equipment' as const
  }));

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value,
    }));
  };

  const handleDeleteEquipment = async (equipmentId: string, equipmentName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить "${equipmentName}"? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/equipment/${equipmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || 'Не удалось удалить оборудование';

        // Provide more user-friendly error messages
        if (errorMessage.includes('currently assigned')) {
          toast.error(`Невозможно удалить "${equipmentName}": Оборудование назначено на проект. Сначала удалите все назначения.`);
        } else if (errorMessage.includes('in use')) {
          toast.error(`Невозможно удалить "${equipmentName}": Оборудование используется. Сначала измените статус.`);
        } else {
          toast.error(`Не удалось удалить "${equipmentName}": ${errorMessage}`);
        }
        return;
      }

      toast.success(`Оборудование "${equipmentName}" успешно удалено`);

      // Refresh the page to update the equipment list
      window.location.reload();
    } catch (error) {
      console.error('Delete equipment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось удалить оборудование';

      // Provide contextual error messages
      if (errorMessage.includes('currently assigned')) {
        toast.error(`Невозможно удалить "${equipmentName}": Оборудование назначено на проект. Сначала удалите все назначения.`);
      } else {
        toast.error(`Не удалось удалить "${equipmentName}": ${errorMessage}`);
      }
    }
  };

  const handleEditAssignment = (assignmentId: string) => {
    router.push(`/dashboard/equipment/assignments/${assignmentId}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/dashboard/equipment?${params.toString()}`);
  };

  const handleDeleteAssignment = async (assignmentId: string, equipmentName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить назначение для "${equipmentName}"? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      await deleteAssignmentMutation.mutateAsync(assignmentId);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Delete assignment error:', error);
    }
  };

  // Calculate statistics for equipment only (not vehicles)
  const stats = equipment.reduce(
    (acc, item) => {
      acc.total += 1;

      if (item.status === "available") acc.available += 1;
      else if (item.status === "issued_to_brigade" || item.status === "assigned_to_project") acc.inUse += 1;
      else if (item.status === "maintenance") acc.maintenance += 1;
      else if (item.status === "retired" || item.status === "lost") acc.unavailable += 1;

      if (item.owned) acc.owned += 1;
      else acc.rented += 1;

      return acc;
    },
    {
      total: 0,
      available: 0,
      inUse: 0,
      maintenance: 0,
      unavailable: 0,
      owned: 0,
      rented: 0,
    }
  );

  const utilizationRate = stats.total > 0 ? Math.round((stats.inUse / stats.total) * 100) : 0;

  if (isLoading || (selectedCategory !== 'all' && isLoadingTypedView)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Назад</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Управление оборудованием</h1>
            <p className="text-muted-foreground">
              Управление инструментами, назначениями и обслуживанием
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Отчёты
          </Button>
          <Button onClick={() => router.push("/dashboard/equipment/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить оборудование
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего оборудования</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.owned} собств., {stats.rented} в аренде
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Загруженность</p>
                <p className="text-2xl font-bold">{utilizationRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.inUse} в использовании
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Доступно</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Готово к назначению
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Требует внимания</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance + stats.unavailable}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Обслуживание, списано и потеряно
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="fleet" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Парк</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Назначения</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Аналитика</span>
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Резервации</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2 relative">
            <FileText className="h-4 w-4" />
            <span>Документы</span>
            {expiringDocsCount > 0 && (
              <Badge className="ml-1 bg-orange-500 text-white px-1.5 py-0.5 text-xs">
                {expiringDocsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="usage-logs" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Журнал</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Фильтры</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Поиск</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск оборудования..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Тип</label>
                  <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все типы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все типы</SelectItem>
                      <SelectItem value="machine">Машины</SelectItem>
                      <SelectItem value="tool">Инструменты</SelectItem>
                      <SelectItem value="measuring_device">Измерительные приборы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Статус</label>
                  <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все статусы" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="available">Доступен</SelectItem>
                      <SelectItem value="issued_to_brigade">Выдано бригаде</SelectItem>
                      <SelectItem value="assigned_to_project">Назначено на проект</SelectItem>
                      <SelectItem value="maintenance">На обслуживании</SelectItem>
                      <SelectItem value="retired">Списан</SelectItem>
                      <SelectItem value="lost">Потеряно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Владение</label>
                  <Select value={filters.owned || "all"} onValueChange={(value) => handleFilterChange("owned", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Все" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все</SelectItem>
                      <SelectItem value="true">Собственное</SelectItem>
                      <SelectItem value="false">Арендованное</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ type: "", status: "", owned: "", search: "" })}
                    className="w-full"
                  >
                    Сбросить фильтры
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Категории</CardTitle>
              <CardDescription>
                Фильтрация оборудования по категории со специфическими техническими параметрами
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
                <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full gap-1">
                  <TabsTrigger value="all" className="flex items-center gap-1 text-xs md:text-sm px-2">
                    <Package className="h-3 w-3 md:h-4 md:w-4" />
                    <span>Все</span>
                  </TabsTrigger>
                  <TabsTrigger value="power_tool" className="flex items-center gap-1 text-xs md:text-sm px-2">
                    <Wrench className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden lg:inline">Электроинструмент</span>
                    <span className="lg:hidden">Электро</span>
                  </TabsTrigger>
                  <TabsTrigger value="fusion_splicer" className="flex items-center gap-1 text-xs md:text-sm px-2">
                    <Activity className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden lg:inline">Сварочный аппарат</span>
                    <span className="lg:hidden">Сварка</span>
                  </TabsTrigger>
                  <TabsTrigger value="otdr" className="flex items-center gap-1 text-xs md:text-sm px-2">
                    <Activity className="h-3 w-3 md:h-4 md:w-4" />
                    <span>OTDR</span>
                  </TabsTrigger>
                  <TabsTrigger value="safety_gear" className="flex items-center gap-1 text-xs md:text-sm px-2">
                    <Settings className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden lg:inline">Защитное снаряжение</span>
                    <span className="lg:hidden">Защита</span>
                  </TabsTrigger>
                  <TabsTrigger value="measuring_device" className="flex items-center gap-1 text-xs md:text-sm px-2">
                    <BarChart3 className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden lg:inline">Измерительный прибор</span>
                    <span className="lg:hidden">Измер</span>
                  </TabsTrigger>
                  <TabsTrigger value="accessory" className="flex items-center gap-1 text-xs md:text-sm px-2">
                    <Package className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden lg:inline">Аксессуары</span>
                    <span className="lg:hidden">Аксес</span>
                  </TabsTrigger>
                  <TabsTrigger value="uncategorized" className="flex items-center gap-1 text-xs md:text-sm px-2">
                    <AlertTriangle className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden lg:inline">Без категории</span>
                    <span className="lg:hidden">Без кат</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Equipment Table - Category-Specific or All */}
          {selectedCategory !== 'all' ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {categoryLabelsRU[selectedCategory as keyof typeof categoryLabelsRU] || 'Оборудование'}
                </CardTitle>
                <CardDescription>
                  Найдено {equipment.length} единиц{equipment.length === 1 ? 'а' : equipment.length >= 2 && equipment.length <= 4 ? 'ы' : ''} оборудования
                  {selectedCategory !== 'all' && categoryConfig[selectedCategory as keyof typeof categoryConfig] && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({categoryConfig[selectedCategory as keyof typeof categoryConfig].description})
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TypedEquipmentTable
                  category={selectedCategory}
                  equipment={equipment}
                  onDelete={handleDeleteEquipment}
                />
              </CardContent>
            </Card>
          ) : (
          <Card>
            <CardHeader>
              <CardTitle>Парк оборудования</CardTitle>
              <CardDescription>
                Найдено {equipment.length} единиц{equipment.length === 1 ? 'а' : equipment.length >= 2 && equipment.length <= 4 ? 'ы' : ''} оборудования
              </CardDescription>
            </CardHeader>
            <CardContent>
              {equipment.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Оборудование</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Владение</TableHead>
                        <TableHead>Местоположение</TableHead>
                        <TableHead>Дневная ставка</TableHead>
                        <TableHead className="w-[100px]">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipment.map((item) => {
                        const StatusIcon = statusIcons[item.status as keyof typeof statusIcons] || Activity;

                        return (
                          <TableRow key={item.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-gray-600" />
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.inventory_no || 'Без инв. номера'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={categoryColors[item.category as keyof typeof categoryColors] || categoryColors.uncategorized}>
                                {categoryLabelsRU[item.category as keyof typeof categoryLabelsRU] || item.category || "—"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <StatusIcon className="h-4 w-4" />
                                <Badge className={statusColors[item.status]}>
                                  {statusLabels[item.status]}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={item.owned ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                                {item.owned ? "Собственное" : "Арендованное"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {item.current_location || "Не указано"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {item.rental_cost_per_day ? `€${item.rental_cost_per_day}/день` : '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/dashboard/equipment/${item.id}/edit`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteEquipment(item.id, item.name)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Оборудование не найдено</h3>
                  <p className="text-muted-foreground">
                    Нет оборудования, соответствующего текущим фильтрам.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/equipment/new")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить первое оборудование
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Активных назначений</p>
                    <p className="text-2xl font-bold">{assignments?.length || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ресурсы в работе ({assignments?.filter(a => a.assignment_type === 'equipment').length || 0} оборуд., {assignments?.filter(a => a.assignment_type === 'vehicle').length || 0} трансп.)
                    </p>
                  </div>
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Проектов охвачено</p>
                    <p className="text-2xl font-bold">{new Set(assignments?.map(a => a.project_id) || []).size}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Активные проектные площадки
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Сред. продолжительность</p>
                    <p className="text-2xl font-bold">
                      {analytics?.assignments?.averageDuration ? `${analytics?.assignments?.averageDuration} дн.` : '0 дн.'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Текущие назначения
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Текущие назначения</CardTitle>
                  <CardDescription>
                    Активные назначения оборудования и транспорта на проекты
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/equipment/assignments/new')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Создать назначение
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assignments && assignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ресурс</TableHead>
                        <TableHead>Тип</TableHead>
                        <TableHead>Проект</TableHead>
                        <TableHead>Назначен</TableHead>
                        <TableHead>Дата начала</TableHead>
                        <TableHead>Ожид. возврат</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => {
                        const assignedEquipment = equipment.find(eq => eq.id === assignment.equipment_id);
                        const isVehicle = assignment.assignment_type === 'vehicle';
                        const resourceIcon = isVehicle ? Car : Wrench;
                        const ResourceIcon = resourceIcon;

                        return (
                          <TableRow key={assignment.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${isVehicle ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                  <ResourceIcon className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="font-medium">{assignment.equipment?.name || 'Неизвестный ресурс'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {assignment.equipment?.inventory_no || 'Без инв. №'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${isVehicle ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                                <div className="flex items-center space-x-1">
                                  <ResourceIcon className="h-3 w-3" />
                                  <span>{isVehicle ? 'Транспорт' : 'Оборудование'}</span>
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{assignment.project_name || assignment.project_id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{assignment.crew_name || 'Не назначен'}</div>
                            </TableCell>
                            <TableCell>
                              {assignment.from_ts ? new Date(assignment.from_ts).toLocaleDateString('ru-RU') : 'Н/Д'}
                            </TableCell>
                            <TableCell>
                              {assignment.to_ts ? new Date(assignment.to_ts).toLocaleDateString('ru-RU') : 'Бессрочно'}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${assignment.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {assignment.is_active ? 'Активен' : 'Неактивен'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAssignment(assignment.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => handleDeleteAssignment(assignment.id, assignment.equipment?.name || 'Неизвестный ресурс')}
                                  disabled={deleteAssignmentMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Нет активных назначений</h3>
                  <p className="text-muted-foreground">
                    Оборудование в данный момент не назначено на проекты.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/equipment/assignments/new")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Создать назначение
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Всего часов</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? '...' : `${analytics?.overview?.totalHours || 0}ч`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Часы использования оборудования
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Эффективность</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? '...' : `${analytics?.overview?.efficiencyScore || 0}%`}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      На основе доступности
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Простой</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? '...' : `${analytics?.overview?.downtimeRate || 0}%`}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Обслуживание + Поломки
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Полученный доход</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? '...' : `€${(analytics?.overview?.revenueGenerated || 0).toLocaleString('ru-RU')}`}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Месячная оценка
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Использование оборудования</CardTitle>
                <CardDescription>Часы использования по типу оборудования</CardDescription>
              </CardHeader>
              <CardContent>
                <UsageChart data={analytics?.utilization} loading={analyticsLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Распределение по статусам</CardTitle>
                <CardDescription>Текущее распределение статусов оборудования</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusPieChart data={analytics?.statusDistribution} loading={analyticsLoading} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Тренды производительности</CardTitle>
              <CardDescription>Месячные показатели производительности оборудования</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <ReservationsTab />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentsTab />
        </TabsContent>

        <TabsContent value="usage-logs" className="space-y-4">
          <UsageTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Chart Components
interface UsageChartProps {
  data?: { name: string; hours: number; revenue: number; assignments: number }[];
  loading?: boolean;
}

const UsageChart = ({ data = [], loading = false }: UsageChartProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <div className="text-center">
          <Activity className="h-8 w-8 mx-auto mb-2" />
          <p>Нет данных об использовании</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [
            name === 'revenue' ? `€${value}` : value,
            name === 'hours' ? 'Часы' : name === 'revenue' ? 'Доход' : 'Назначения'
          ]}
        />
        <Legend />
        <Bar dataKey="hours" fill="#3b82f6" name="Часы" />
        <Bar dataKey="revenue" fill="#10b981" name="Доход (€)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

interface StatusPieChartProps {
  data?: { name: string; value: number; color: string }[];
  loading?: boolean;
}

const StatusPieChart = ({ data = [], loading = false }: StatusPieChartProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <div className="text-center">
          <PieChartIcon className="h-8 w-8 mx-auto mb-2" />
          <p>Нет данных о статусах</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
};

interface PerformanceChartProps {
  data?: { month: string; utilization: number; efficiency: number; downtime: number }[];
  loading?: boolean;
}

const PerformanceChart = ({ data, loading = false }: PerformanceChartProps) => {
  // Show message that historical data is not available yet
  const performanceData = data || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (performanceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-500 mb-2">Нет данных о производительности</p>
          <p className="text-sm text-gray-400">Историческое отслеживание производительности будет доступно после активации назначений оборудования.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="utilization" stroke="#3b82f6" name="Использование %" strokeWidth={2} />
          <Line type="monotone" dataKey="efficiency" stroke="#10b981" name="Эффективность %" strokeWidth={2} />
          <Line type="monotone" dataKey="downtime" stroke="#ef4444" name="Простой %" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};