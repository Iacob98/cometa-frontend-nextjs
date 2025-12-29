"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Clock, Plus, TrendingUp, Activity, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useEquipmentUsage, useLogEquipmentUsage, useUpdateEquipmentUsage, useDeleteEquipmentUsage, useValidateDailyUsage } from "@/hooks/use-equipment-usage";
import { useEquipment } from "@/hooks/use-equipment";

export function UsageTab() {
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState({
    from_date: "",
    to_date: "",
  });

  const { data: usageData, isLoading } = useEquipmentUsage({
    equipment_id: equipmentFilter || undefined,
    from_date: dateFilter.from_date || undefined,
    to_date: dateFilter.to_date || undefined,
  });

  const { data: equipmentData } = useEquipment({ per_page: 1000 });

  const usageLogs = usageData?.items || [];
  const equipment = equipmentData?.items || [];

  // Calculate summary stats
  const totalHours = usageLogs.reduce((sum, log) => sum + log.hours_used, 0);
  const avgHoursPerDay = usageLogs.length > 0 ? totalHours / usageLogs.length : 0;
  const uniqueEquipment = new Set(usageLogs.map((log) => log.equipment_id)).size;

  const handleClearFilters = () => {
    setEquipmentFilter("");
    setDateFilter({ from_date: "", to_date: "" });
  };

  return (
    <div className="space-y-4">
      {/* Header with Log Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Учёт использования оборудования</h2>
          <p className="text-muted-foreground">
            Отслеживание ежедневных часов работы и мониторинг использования оборудования
          </p>
        </div>
        <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Записать использование
            </Button>
          </DialogTrigger>
          <LogUsageDialog
            equipment={equipment}
            onClose={() => setIsLogDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Всего часов</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}ч</p>
                <p className="text-xs text-muted-foreground mt-1">
                  По всему оборудованию
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
                <p className="text-sm font-medium text-muted-foreground">Сред. часов/день</p>
                <p className="text-2xl font-bold">{avgHoursPerDay.toFixed(1)}ч</p>
                <p className="text-xs text-muted-foreground mt-1">
                  На запись
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
                <p className="text-sm font-medium text-muted-foreground">Записей использования</p>
                <p className="text-2xl font-bold">{usageLogs.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Записанных данных
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Использовано оборуд.</p>
                <p className="text-2xl font-bold">{uniqueEquipment}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Уникальных единиц
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Оборудование</Label>
              <Select value={equipmentFilter || "all"} onValueChange={(v) => setEquipmentFilter(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Всё оборудование" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всё оборудование</SelectItem>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Дата с</Label>
              <Input
                type="date"
                value={dateFilter.from_date}
                onChange={(e) => setDateFilter({ ...dateFilter, from_date: e.target.value })}
              />
            </div>

            <div>
              <Label>Дата по</Label>
              <Input
                type="date"
                value={dateFilter.to_date}
                onChange={(e) => setDateFilter({ ...dateFilter, to_date: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                Сбросить фильтры
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Журнал использования</CardTitle>
          <CardDescription>
            Найдено записей: {usageLogs.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : usageLogs.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Оборудование</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Часы работы</TableHead>
                    <TableHead>Оператор</TableHead>
                    <TableHead>Примечания</TableHead>
                    <TableHead>Записано</TableHead>
                    <TableHead className="w-[100px]">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageLogs.map((log) => (
                    <UsageLogRow key={log.id} log={log} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Записи использования не найдены</h3>
              <p className="text-muted-foreground">
                Записывайте часы работы оборудования для отслеживания использования и производительности.
              </p>
              <Button className="mt-4" onClick={() => setIsLogDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Создать первую запись
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface LogUsageDialogProps {
  equipment: any[];
  onClose: () => void;
}

function LogUsageDialog({ equipment, onClose }: LogUsageDialogProps) {
  const [formData, setFormData] = useState({
    equipment_id: "",
    usage_date: format(new Date(), "yyyy-MM-dd"),
    hours_used: "",
    operator_name: "",
    notes: "",
  });

  const [validationResult, setValidationResult] = useState<any>(null);

  const logMutation = useLogEquipmentUsage();
  const validateMutation = useValidateDailyUsage();

  const handleValidate = async () => {
    if (!formData.equipment_id || !formData.usage_date || !formData.hours_used) {
      toast.error("Пожалуйста, заполните оборудование, дату и часы");
      return;
    }

    const hours = parseFloat(formData.hours_used);
    if (hours <= 0 || hours > 24) {
      toast.error("Часы должны быть от 0 до 24");
      return;
    }

    try {
      const result = await validateMutation.mutateAsync({
        equipment_id: formData.equipment_id,
        usage_date: formData.usage_date,
        hours_to_add: hours,
      });

      setValidationResult(result);

      if (!result.is_valid) {
        toast.error(
          `Нельзя добавить ${hours}ч. Дневной лимит превышен (${result.total_hours.toFixed(1)}ч / 24ч)`
        );
      } else {
        toast.success(
          `Проверка пройдена. Осталось ${result.remaining_hours.toFixed(1)}ч на этот день.`
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Не удалось проверить использование");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.equipment_id || !formData.usage_date || !formData.hours_used) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    const hours = parseFloat(formData.hours_used);
    if (hours <= 0 || hours > 24) {
      toast.error("Часы должны быть от 0 до 24");
      return;
    }

    try {
      await logMutation.mutateAsync({
        equipment_id: formData.equipment_id,
        usage_date: formData.usage_date,
        hours_used: hours,
        operator_name: formData.operator_name || undefined,
        notes: formData.notes || undefined,
      });

      toast.success("Использование записано");
      onClose();

      // Reset form
      setFormData({
        equipment_id: "",
        usage_date: format(new Date(), "yyyy-MM-dd"),
        hours_used: "",
        operator_name: "",
        notes: "",
      });
      setValidationResult(null);
    } catch (error: any) {
      toast.error(error.message || "Не удалось записать использование");
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Запись использования оборудования</DialogTitle>
        <DialogDescription>
          Запись ежедневных часов работы оборудования (макс. 24 часа в день на единицу)
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Equipment Selection */}
        <div>
          <Label htmlFor="equipment">Оборудование *</Label>
          <Select
            value={formData.equipment_id}
            onValueChange={(value) => {
              setFormData({ ...formData, equipment_id: value });
              setValidationResult(null);
            }}
          >
            <SelectTrigger id="equipment">
              <SelectValue placeholder="Выберите оборудование" />
            </SelectTrigger>
            <SelectContent>
              {equipment.map((eq) => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.name} ({eq.inventory_no || "Без инв. №"})
                  {eq.total_usage_hours !== undefined && (
                    <span className="text-muted-foreground ml-2">
                      ({eq.total_usage_hours.toFixed(1)}ч всего)
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date and Hours */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Дата использования *</Label>
            <Input
              id="date"
              type="date"
              value={formData.usage_date}
              onChange={(e) => {
                setFormData({ ...formData, usage_date: e.target.value });
                setValidationResult(null);
              }}
            />
          </div>
          <div>
            <Label htmlFor="hours">Часы работы * (0-24)</Label>
            <div className="flex gap-2">
              <Input
                id="hours"
                type="number"
                step="0.1"
                min="0"
                max="24"
                placeholder="8.5"
                value={formData.hours_used}
                onChange={(e) => {
                  setFormData({ ...formData, hours_used: e.target.value });
                  setValidationResult(null);
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleValidate}
                disabled={validateMutation.isPending}
              >
                Проверить
              </Button>
            </div>
          </div>
        </div>

        {/* Validation Result */}
        {validationResult && (
          <Alert variant={validationResult.is_valid ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {validationResult.is_valid ? (
                <div>
                  <span className="font-semibold">Проверка пройдена!</span> <br />
                  Существующее использование: {validationResult.existing_hours.toFixed(1)}ч <br />
                  Оставшаяся ёмкость: {validationResult.remaining_hours.toFixed(1)}ч
                </div>
              ) : (
                <div>
                  <span className="font-semibold">Дневной лимит превышен!</span> <br />
                  Добавление {parseFloat(formData.hours_used).toFixed(1)}ч превысит 24ч лимит
                  (всего: {validationResult.total_hours.toFixed(1)}ч)
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Operator */}
        <div>
          <Label htmlFor="operator">Имя оператора</Label>
          <Input
            id="operator"
            placeholder="напр. Иванов И.И."
            value={formData.operator_name}
            onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Примечания</Label>
          <Textarea
            id="notes"
            placeholder="Дополнительные примечания об использовании..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={logMutation.isPending}>
            {logMutation.isPending ? "Сохранение..." : "Записать"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

interface UsageLogRowProps {
  log: any;
}

function UsageLogRow({ log }: UsageLogRowProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const deleteMutation = useDeleteEquipmentUsage();

  const handleDelete = async () => {
    if (!confirm(`Вы уверены, что хотите удалить эту запись использования?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(log.id);
      toast.success("Запись использования удалена");
    } catch (error) {
      toast.error("Не удалось удалить запись использования");
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">
            {log.equipment_name || "Неизвестное оборудование"}
          </div>
          <div className="text-sm text-muted-foreground">
            {log.equipment?.inventory_no || "Без инв. №"}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {format(new Date(log.usage_date), "dd.MM.yyyy")}
      </TableCell>
      <TableCell>
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          {log.hours_used.toFixed(1)}ч
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm">
          {log.operator_name || "Не указан"}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {log.notes || "-"}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {format(new Date(log.created_at), "dd.MM, HH:mm")}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <EditUsageDialog
              log={log}
              onClose={() => setIsEditDialogOpen(false)}
            />
          </Dialog>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface EditUsageDialogProps {
  log: any;
  onClose: () => void;
}

function EditUsageDialog({ log, onClose }: EditUsageDialogProps) {
  const [formData, setFormData] = useState({
    usage_date: log.usage_date || "",
    hours_used: log.hours_used || 0,
    notes: log.notes || "",
  });

  const updateMutation = useUpdateEquipmentUsage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate hours
    if (formData.hours_used <= 0 || formData.hours_used > 24) {
      toast.error("Часы должны быть от 0 до 24");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: log.id,
        usage_date: formData.usage_date,
        hours_used: formData.hours_used,
        notes: formData.notes,
      });
      toast.success("Запись использования обновлена");
      onClose();
    } catch (error) {
      toast.error("Не удалось обновить запись использования");
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Редактирование записи использования</DialogTitle>
        <DialogDescription>
          Обновление информации об использовании оборудования
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="edit-usage-date">Дата использования *</Label>
          <Input
            id="edit-usage-date"
            type="date"
            value={formData.usage_date}
            onChange={(e) => setFormData({ ...formData, usage_date: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="edit-hours-used">Часы работы *</Label>
          <Input
            id="edit-hours-used"
            type="number"
            step="0.1"
            min="0"
            max="24"
            value={formData.hours_used}
            onChange={(e) => setFormData({ ...formData, hours_used: parseFloat(e.target.value) })}
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Введите часы от 0 до 24
          </p>
        </div>

        <div>
          <Label htmlFor="edit-notes">Примечания</Label>
          <Textarea
            id="edit-notes"
            placeholder="Дополнительные примечания..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
