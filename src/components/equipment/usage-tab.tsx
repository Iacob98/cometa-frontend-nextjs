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
          <h2 className="text-2xl font-bold">Equipment Usage Tracking</h2>
          <p className="text-muted-foreground">
            Track daily usage hours and monitor equipment utilization
          </p>
        </div>
        <Dialog open={isLogDialogOpen} onOpenChange={setIsLogDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Log Usage
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
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all equipment
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
                <p className="text-sm font-medium text-muted-foreground">Avg. Hours/Day</p>
                <p className="text-2xl font-bold">{avgHoursPerDay.toFixed(1)}h</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per usage entry
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
                <p className="text-sm font-medium text-muted-foreground">Usage Entries</p>
                <p className="text-2xl font-bold">{usageLogs.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Logged records
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
                <p className="text-sm font-medium text-muted-foreground">Equipment Used</p>
                <p className="text-2xl font-bold">{uniqueEquipment}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique items
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
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Equipment</Label>
              <Select value={equipmentFilter || "all"} onValueChange={(v) => setEquipmentFilter(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All equipment</SelectItem>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFilter.from_date}
                onChange={(e) => setDateFilter({ ...dateFilter, from_date: e.target.value })}
              />
            </div>

            <div>
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateFilter.to_date}
                onChange={(e) => setDateFilter({ ...dateFilter, to_date: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Logs</CardTitle>
          <CardDescription>
            {usageLogs.length} usage log{usageLogs.length !== 1 ? 's' : ''} found
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
                    <TableHead>Equipment</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours Used</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Logged At</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
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
              <h3 className="mt-4 text-lg font-semibold">No usage logs found</h3>
              <p className="text-muted-foreground">
                Log equipment usage hours to track utilization and performance.
              </p>
              <Button className="mt-4" onClick={() => setIsLogDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Log First Usage
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
      toast.error("Please fill in equipment, date, and hours");
      return;
    }

    const hours = parseFloat(formData.hours_used);
    if (hours <= 0 || hours > 24) {
      toast.error("Hours must be between 0 and 24");
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
          `Cannot add ${hours}h. Daily limit exceeded (${result.total_hours.toFixed(1)}h / 24h)`
        );
      } else {
        toast.success(
          `Validation passed. ${result.remaining_hours.toFixed(1)}h remaining for this day.`
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to validate usage");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.equipment_id || !formData.usage_date || !formData.hours_used) {
      toast.error("Please fill in all required fields");
      return;
    }

    const hours = parseFloat(formData.hours_used);
    if (hours <= 0 || hours > 24) {
      toast.error("Hours must be between 0 and 24");
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

      toast.success("Usage logged successfully");
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
      toast.error(error.message || "Failed to log usage");
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Log Equipment Usage</DialogTitle>
        <DialogDescription>
          Record daily equipment usage hours (max 24 hours per day per equipment)
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Equipment Selection */}
        <div>
          <Label htmlFor="equipment">Equipment *</Label>
          <Select
            value={formData.equipment_id}
            onValueChange={(value) => {
              setFormData({ ...formData, equipment_id: value });
              setValidationResult(null);
            }}
          >
            <SelectTrigger id="equipment">
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipment.map((eq) => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.name} ({eq.inventory_no || "No inventory #"})
                  {eq.total_usage_hours !== undefined && (
                    <span className="text-muted-foreground ml-2">
                      ({eq.total_usage_hours.toFixed(1)}h total)
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
            <Label htmlFor="date">Usage Date *</Label>
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
            <Label htmlFor="hours">Hours Used * (0-24)</Label>
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
                Validate
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
                  <span className="font-semibold">Validation passed!</span> <br />
                  Existing usage: {validationResult.existing_hours.toFixed(1)}h <br />
                  Remaining capacity: {validationResult.remaining_hours.toFixed(1)}h
                </div>
              ) : (
                <div>
                  <span className="font-semibold">Daily limit exceeded!</span> <br />
                  Adding {parseFloat(formData.hours_used).toFixed(1)}h would exceed 24h limit
                  (total: {validationResult.total_hours.toFixed(1)}h)
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Operator */}
        <div>
          <Label htmlFor="operator">Operator Name</Label>
          <Input
            id="operator"
            placeholder="e.g., John Doe"
            value={formData.operator_name}
            onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes about usage..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={logMutation.isPending}>
            {logMutation.isPending ? "Logging..." : "Log Usage"}
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
    if (!confirm(`Are you sure you want to delete this usage log?`)) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(log.id);
      toast.success("Usage log deleted successfully");
    } catch (error) {
      toast.error("Failed to delete usage log");
    }
  };

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">
            {log.equipment_name || "Unknown Equipment"}
          </div>
          <div className="text-sm text-muted-foreground">
            {log.equipment?.inventory_no || "No inventory #"}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {format(new Date(log.usage_date), "MMM dd, yyyy")}
      </TableCell>
      <TableCell>
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          {log.hours_used.toFixed(1)}h
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm">
          {log.operator_name || "Not specified"}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {log.notes || "-"}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {format(new Date(log.created_at), "MMM dd, HH:mm")}
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
    operator_name: log.operator_name || "",
    notes: log.notes || "",
  });

  const updateMutation = useUpdateEquipmentUsage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate hours
    if (formData.hours_used <= 0 || formData.hours_used > 24) {
      toast.error("Hours must be between 0 and 24");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: log.id,
        ...formData,
      });
      toast.success("Usage log updated successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to update usage log");
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Edit Usage Log</DialogTitle>
        <DialogDescription>
          Update equipment usage information
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="edit-usage-date">Usage Date *</Label>
          <Input
            id="edit-usage-date"
            type="date"
            value={formData.usage_date}
            onChange={(e) => setFormData({ ...formData, usage_date: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="edit-hours-used">Hours Used *</Label>
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
            Enter hours between 0 and 24
          </p>
        </div>

        <div>
          <Label htmlFor="edit-operator-name">Operator Name</Label>
          <Input
            id="edit-operator-name"
            value={formData.operator_name}
            onChange={(e) => setFormData({ ...formData, operator_name: e.target.value })}
            placeholder="Operator or worker name"
          />
        </div>

        <div>
          <Label htmlFor="edit-notes">Notes</Label>
          <Textarea
            id="edit-notes"
            placeholder="Additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Updating..." : "Update Log"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
