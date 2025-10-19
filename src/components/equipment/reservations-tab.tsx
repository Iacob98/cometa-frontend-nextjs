"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Plus, X, AlertCircle, Clock, User } from "lucide-react";
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

import { useEquipmentReservations, useCreateReservation, useCancelReservation, useCheckEquipmentAvailability } from "@/hooks/use-equipment-reservations";
import { useEquipment } from "@/hooks/use-equipment";
import { useProjects } from "@/hooks/use-projects";
import type { CreateEquipmentReservationRequest } from "@/types/equipment-enhanced";

export function ReservationsTab() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // Filters
  const [equipmentFilter, setEquipmentFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const { data: reservationsData, isLoading } = useEquipmentReservations({
    equipment_id: equipmentFilter || undefined,
    project_id: projectFilter || undefined,
    active_only: true,
  });

  const { data: equipmentData } = useEquipment({ status: "available", per_page: 1000 });
  const { data: projectsData } = useProjects({ status: "active", per_page: 1000 });

  const reservations = reservationsData?.items || [];
  const equipment = equipmentData?.items || [];
  const projects = projectsData?.items || [];

  const handleClearFilters = () => {
    setEquipmentFilter("");
    setProjectFilter("");
  };

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Equipment Reservations</h2>
          <p className="text-muted-foreground">
            Time-based equipment reservations with conflict prevention
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Reservation
            </Button>
          </DialogTrigger>
          <CreateReservationDialog
            equipment={equipment}
            projects={projects}
            onClose={() => setIsCreateDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <Label>Project</Label>
              <Select value={projectFilter || "all"} onValueChange={(v) => setProjectFilter(v === "all" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Reservations</CardTitle>
          <CardDescription>
            {reservations.length} reservation{reservations.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : reservations.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Reserved By</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <ReservationRow key={reservation.id} reservation={reservation} />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No reservations found</h3>
              <p className="text-muted-foreground">
                Create a reservation to reserve equipment for a project.
              </p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Reservation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ReservationRowProps {
  reservation: any;
}

function ReservationRow({ reservation }: ReservationRowProps) {
  const cancelMutation = useCancelReservation();

  const handleCancel = async () => {
    if (!confirm(`Are you sure you want to cancel this reservation for "${reservation.equipment_name}"?`)) {
      return;
    }

    try {
      await cancelMutation.mutateAsync(reservation.id);
      toast.success("Reservation cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel reservation");
    }
  };

  const now = new Date();
  const from = new Date(reservation.reserved_from);
  const until = new Date(reservation.reserved_until);
  const isActive = now >= from && now <= until;
  const isFuture = now < from;
  const isPast = now > until;

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{reservation.equipment_name || "Unknown Equipment"}</div>
        <div className="text-sm text-muted-foreground">
          {reservation.equipment?.inventory_no || "No inventory #"}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{reservation.project_name || "Unknown Project"}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {reservation.reserved_by_user_name || "Unknown User"}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="text-sm">
            <span className="font-medium">From:</span> {format(from, "MMM dd, yyyy HH:mm")}
          </div>
          <div className="text-sm">
            <span className="font-medium">Until:</span> {format(until, "MMM dd, yyyy HH:mm")}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {isActive && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        )}
        {isFuture && (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Upcoming
          </Badge>
        )}
        {isPast && (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Past
          </Badge>
        )}
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground">
          {reservation.notes || "-"}
        </span>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={cancelMutation.isPending || isPast}
          className="text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

interface CreateReservationDialogProps {
  equipment: any[];
  projects: any[];
  onClose: () => void;
}

function CreateReservationDialog({ equipment, projects, onClose }: CreateReservationDialogProps) {
  const [formData, setFormData] = useState<CreateEquipmentReservationRequest>({
    equipment_id: "",
    reserved_from: "",
    reserved_until: "",
    project_id: "",
    notes: "",
  });

  const [conflicts, setConflicts] = useState<any[]>([]);

  const createMutation = useCreateReservation();
  const checkAvailability = useCheckEquipmentAvailability();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.equipment_id || !formData.reserved_from || !formData.reserved_until) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check availability first
    try {
      const result = await checkAvailability.mutateAsync({
        equipment_id: formData.equipment_id,
        from_date: formData.reserved_from,
        to_date: formData.reserved_until,
      });

      if (!result.is_available) {
        setConflicts(result.conflicts || []);
        toast.error(`Equipment is not available for this period. Found ${result.conflicts?.length || 0} conflict(s).`);
        return;
      }

      // Create reservation
      await createMutation.mutateAsync(formData);
      toast.success("Reservation created successfully");
      onClose();

      // Reset form
      setFormData({
        equipment_id: "",
        reserved_from: "",
        reserved_until: "",
        project_id: "",
        notes: "",
      });
      setConflicts([]);
    } catch (error: any) {
      toast.error(error.message || "Failed to create reservation");
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Equipment Reservation</DialogTitle>
        <DialogDescription>
          Reserve equipment for a specific time period and project
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Equipment Selection */}
        <div>
          <Label htmlFor="equipment">Equipment *</Label>
          <Select
            value={formData.equipment_id}
            onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}
          >
            <SelectTrigger id="equipment">
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipment.map((eq) => (
                <SelectItem key={eq.id} value={eq.id}>
                  {eq.name} ({eq.inventory_no || "No inventory #"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project Selection */}
        <div>
          <Label htmlFor="project">Project</Label>
          <Select
            value={formData.project_id || "none"}
            onValueChange={(value) => setFormData({ ...formData, project_id: value === "none" ? undefined : value })}
          >
            <SelectTrigger id="project">
              <SelectValue placeholder="Select project (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No project</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="from">Reserved From *</Label>
            <Input
              id="from"
              type="datetime-local"
              value={formData.reserved_from}
              onChange={(e) => setFormData({ ...formData, reserved_from: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="until">Reserved Until *</Label>
            <Input
              id="until"
              type="datetime-local"
              value={formData.reserved_until}
              onChange={(e) => setFormData({ ...formData, reserved_until: e.target.value })}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes..."
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        {/* Conflict Warning */}
        {conflicts.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Scheduling Conflicts Found:</div>
              <ul className="list-disc list-inside space-y-1">
                {conflicts.map((conflict, idx) => (
                  <li key={idx} className="text-sm">
                    Reserved from {format(new Date(conflict.reserved_from), "MMM dd, yyyy HH:mm")} to{" "}
                    {format(new Date(conflict.reserved_until), "MMM dd, yyyy HH:mm")}
                    {conflict.project_name && ` for ${conflict.project_name}`}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || checkAvailability.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Reservation"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
