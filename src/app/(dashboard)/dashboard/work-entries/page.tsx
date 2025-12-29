"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, MapPin, User, Eye, CheckCircle, Clock, Building2, Camera, Ruler, AlertTriangle, Home } from "lucide-react";

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

import { useWorkEntries, usePendingApprovals, useApproveWorkEntry } from "@/hooks/use-work-entries";
import { usePermissions } from "@/hooks/use-auth";
import type { StageCode } from "@/types";

export default function WorkEntriesPage() {
  const router = useRouter();
  const { canApproveWork } = usePermissions();
  const approveWorkEntry = useApproveWorkEntry();

  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageCode | "all">("all");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending">("all");

  const filters = {
    stage_code: stageFilter === "all" ? undefined : stageFilter,
    approved: approvalFilter === "all" ? undefined : (approvalFilter === "approved" ? "true" : "false"),
    page: 1,
    per_page: 20,
  };

  const { data: workEntriesResponse, isLoading, error } = useWorkEntries(filters);
  const { data: pendingApprovalsResponse } = usePendingApprovals();

  const workEntries = workEntriesResponse?.items || [];
  const pendingApprovals = pendingApprovalsResponse?.items || [];

  const handleApproveWorkEntry = async (workEntryId: string) => {
    try {
      await approveWorkEntry.mutateAsync(workEntryId);
    } catch (error) {
      console.error("Failed to approve work entry:", error);
    }
  };

  const getStageLabel = (stageCode: StageCode) => {
    const stageLabels: Record<StageCode, string> = {
      stage_1_marking: "Разметка",
      stage_2_excavation: "Раскопка",
      stage_3_conduit: "Укладка кабелепровода",
      stage_4_cable: "Укладка кабеля",
      stage_5_splice: "Сращивание/Соединение",
      stage_6_test: "Тестирование",
      stage_7_connect: "Подключение",
      stage_8_final: "Финальная проверка",
      stage_9_backfill: "Засыпка",
      stage_10_surface: "Восстановление поверхности",
    };
    return stageLabels[stageCode] || stageCode;
  };

  const getStageBadgeVariant = (stageCode: StageCode) => {
    if (!stageCode) return "secondary";
    if (stageCode.includes("marking") || stageCode.includes("excavation")) return "secondary";
    if (stageCode.includes("cable") || stageCode.includes("conduit")) return "default";
    if (stageCode.includes("testing") || stageCode.includes("quality")) return "outline";
    return "secondary";
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Рабочие записи</h1>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Не удалось загрузить рабочие записи. Попробуйте позже.
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
          <h1 className="text-3xl font-bold tracking-tight">Рабочие записи</h1>
          <p className="text-muted-foreground">
            Отслеживание и управление полевыми работами по всем проектам
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/work-entries/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Новая запись
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Все записи</TabsTrigger>
          {canApproveWork && (
            <TabsTrigger value="pending">
              Ожидают одобрения ({pendingApprovals.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Фильтр записей</CardTitle>
              <CardDescription>
                Поиск и фильтрация рабочих записей по различным критериям
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Поиск по проекту, заметкам или работнику..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={stageFilter} onValueChange={(value: StageCode | "all") => setStageFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Фильтр по этапу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все этапы</SelectItem>
                    <SelectItem value="stage_1_marking">Разметка</SelectItem>
                    <SelectItem value="stage_2_excavation">Раскопка</SelectItem>
                    <SelectItem value="stage_3_conduit">Укладка кабелепровода</SelectItem>
                    <SelectItem value="stage_4_cable_pulling">Протяжка кабеля</SelectItem>
                    <SelectItem value="stage_5_closure">Муфтирование</SelectItem>
                    <SelectItem value="stage_6_testing">Тестирование</SelectItem>
                    <SelectItem value="stage_7_backfill">Засыпка</SelectItem>
                    <SelectItem value="stage_8_restoration">Восстановление поверхности</SelectItem>
                    <SelectItem value="stage_9_documentation">Документация</SelectItem>
                    <SelectItem value="stage_10_quality_check">Контроль качества</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={approvalFilter} onValueChange={(value: "all" | "approved" | "pending") => setApprovalFilter(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Фильтр по статусу" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="approved">Одобрено</SelectItem>
                    <SelectItem value="pending">Ожидает одобрения</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Work Entries Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Рабочие записи ({workEntriesResponse?.total || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex space-x-4">
                      <div className="h-4 bg-muted animate-pulse rounded flex-1" />
                      <div className="h-4 bg-muted animate-pulse rounded w-20" />
                      <div className="h-4 bg-muted animate-pulse rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : workEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold">Записи не найдены</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchQuery || stageFilter !== "all" || approvalFilter !== "all"
                      ? "Нет записей, соответствующих фильтрам."
                      : "Начните с создания первой рабочей записи."}
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/work-entries/new")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Создать запись
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Дата и работник</TableHead>
                      <TableHead>Этап и прогресс</TableHead>
                      <TableHead>Проект</TableHead>
                      <TableHead>Локация</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Фото</TableHead>
                      <TableHead className="w-[100px]">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workEntries.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className={entry.house_id ? "bg-blue-50/50 hover:bg-blue-50" : ""}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {new Date(entry.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>
                                {entry.user
                                  ? `${entry.user.first_name || ''} ${entry.user.last_name || ''}`.trim()
                                  : "Неизвестно"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getStageBadgeVariant(entry.stage_code as StageCode)}>
                                {getStageLabel(entry.stage_code as StageCode)}
                              </Badge>
                              {entry.house_id && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                  <Home className="h-2.5 w-2.5 mr-1" />
                                  Дом
                                </Badge>
                              )}
                              {entry.was_rejected_before && !entry.rejected_by && (
                                <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs">
                                  <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                  Повторно
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-1">
                              <Ruler className="h-3 w-3" />
                              <span>{entry.meters_done_m}m</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {entry.project?.name || `Project ${entry.project_id}`}
                            </div>
                            {entry.project?.city && (
                              <div className="text-xs text-muted-foreground flex items-center space-x-1">
                                <MapPin className="h-2.5 w-2.5" />
                                <span>{entry.project.city}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {entry.house_id ? (
                            <div className="text-sm flex items-center space-x-1 text-blue-700">
                              <Home className="h-3.5 w-3.5" />
                              <span className="font-medium">Подключение дома</span>
                            </div>
                          ) : (
                            <div className="text-sm flex items-center space-x-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>
                                {entry.segment?.name ||
                                 entry.cabinet?.name ||
                                 entry.cabinet?.address ||
                                 (entry.cabinet_id ? `Шкаф ${entry.cabinet_id.slice(0, 8)}...` : "—")}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.approved_at ? (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Одобрено</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1 text-amber-600">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">Ожидает</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Camera className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{entry.photos?.length || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Открыть меню</span>
                                <Filter className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Действия</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/work-entries/${entry.id}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Подробнее
                              </DropdownMenuItem>
                              {canApproveWork && !entry.approved_at && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleApproveWorkEntry(entry.id)}
                                    disabled={approveWorkEntry.isPending}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Одобрить запись
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

        {canApproveWork && (
          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ожидают одобрения ({pendingApprovals.length})
                </CardTitle>
                <CardDescription>
                  Рабочие записи, ожидающие вашего одобрения
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-semibold">Нет записей на одобрение</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Все рабочие записи уже одобрены.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingApprovals.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {getStageLabel(entry.stage_code as StageCode)} - {entry.meters_done_m}м
                            </span>
                            {entry.was_rejected_before && (
                              <Badge variant="outline" className="border-orange-500 text-orange-600 text-xs">
                                <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                                Повторно
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.user
                              ? `${entry.user.first_name || ''} ${entry.user.last_name || ''}`.trim()
                              : "Неизвестно"} • {new Date(entry.date).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/work-entries/${entry.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Просмотр
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproveWorkEntry(entry.id)}
                            disabled={approveWorkEntry.isPending}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Одобрить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}