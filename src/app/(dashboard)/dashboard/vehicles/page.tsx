"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Truck,
  Car,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Edit,
  Trash2,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useVehicles, useDeleteVehicle, useVehicleAssignments } from "@/hooks/use-vehicles";
import { useDeleteAssignment } from "@/hooks/use-equipment";
import { VehicleDocumentsDialog } from "@/components/vehicles/vehicle-documents-dialog";

const statusColors = {
  available: "bg-green-100 text-green-800 border-green-200",
  in_use: "bg-blue-100 text-blue-800 border-blue-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
  broken: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels = {
  available: "Available",
  in_use: "In Use",
  maintenance: "Maintenance",
  broken: "Broken",
};

const statusIcons = {
  available: CheckCircle,
  in_use: Activity,
  maintenance: Clock,
  broken: XCircle,
};

const typeColors = {
  pkw: "bg-green-100 text-green-800 border-green-200",
  lkw: "bg-indigo-100 text-indigo-800 border-indigo-200",
  transporter: "bg-blue-100 text-blue-800 border-blue-200",
  pritsche: "bg-purple-100 text-purple-800 border-purple-200",
  anhänger: "bg-gray-100 text-gray-800 border-gray-200",
  excavator: "bg-yellow-100 text-yellow-800 border-yellow-200",
  other: "bg-slate-100 text-slate-800 border-slate-200",
} as const;

const typeLabels = {
  pkw: "PKW",
  lkw: "LKW",
  transporter: "Transporter",
  pritsche: "Pritsche",
  anhänger: "Anhänger",
  excavator: "Excavator",
  other: "Other",
} as const;

export default function VehiclesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("fleet");
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    search: "",
  });

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['fleet', 'assignments'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const { data: vehiclesData, isLoading } = useVehicles({
    ...filters,
    per_page: 1000
  });
  const { data: vehicleAssignments } = useVehicleAssignments({ active_only: true });
  const deleteVehicleMutation = useDeleteVehicle();
  const deleteAssignmentMutation = useDeleteAssignment();

  const vehicles = vehiclesData?.items || [];

  // Map vehicle assignments for display
  const assignments = (vehicleAssignments || []).map(assignment => ({
    ...assignment,
    assignment_type: 'vehicle' as const,
    resource_type: 'vehicle' as const,
    equipment: assignment.vehicle ? {
      name: `${assignment.vehicle.brand} ${assignment.vehicle.model}`,
      type: assignment.vehicle.type,
      inventory_no: assignment.vehicle.plate_number
    } : null,
  }));

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = filters.search.toLowerCase();
    return (
      !filters.search ||
      vehicle.brand?.toLowerCase().includes(searchLower) ||
      vehicle.model?.toLowerCase().includes(searchLower) ||
      vehicle.plate_number?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.status === 'available').length,
    inUse: vehicles.filter(v => v.status === 'in_use').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value,
    }));
  };

  const handleDeleteVehicle = async (vehicleId: string, vehicleName: string) => {
    if (!confirm(`Are you sure you want to delete "${vehicleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || 'Failed to delete vehicle';

        if (errorMessage.includes('currently assigned')) {
          toast.error(`Cannot delete "${vehicleName}": Vehicle is currently assigned. Please remove all assignments first.`);
        } else {
          toast.error(`Failed to delete "${vehicleName}": ${errorMessage}`);
        }
        return;
      }

      toast.success(`Vehicle "${vehicleName}" deleted successfully`);
      // Refresh will be handled by TanStack Query
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(`Error deleting vehicle: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEditAssignment = (assignmentId: string) => {
    router.push(`/dashboard/equipment/assignments/${assignmentId}`);
  };

  const handleDeleteAssignment = async (assignmentId: string, vehicleName: string) => {
    if (!confirm(`Are you sure you want to delete the assignment for "${vehicleName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAssignmentMutation.mutateAsync(assignmentId);
    } catch (error) {
      console.error('Delete assignment error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Vehicle Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your fleet of vehicles, track assignments, and monitor usage
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/vehicles/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              In Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inUse}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maintenance}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="fleet" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Vehicle Fleet</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Assignments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicles Fleet</CardTitle>
              <CardDescription>
                Browse and manage all vehicles in your fleet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by brand, model, or plate number..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="pkw">PKW</SelectItem>
                <SelectItem value="lkw">LKW</SelectItem>
                <SelectItem value="transporter">Transporter</SelectItem>
                <SelectItem value="pritsche">Pritsche</SelectItem>
                <SelectItem value="anhänger">Anhänger</SelectItem>
                <SelectItem value="excavator">Excavator</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in_use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="broken">Broken</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vehicles Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Tipper</TableHead>
                  <TableHead>Max Weight</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>First Aid Kit</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {filters.search || filters.type || filters.status
                        ? "No vehicles found matching your filters"
                        : "No vehicles added yet. Click 'Add Vehicle' to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div>{vehicle.brand} {vehicle.model}</div>
                              {vehicle.year_manufactured && (
                                <div className="text-xs text-muted-foreground">
                                  {vehicle.year_manufactured}
                                </div>
                              )}
                              {vehicle.comment && (
                                <div className="text-xs text-muted-foreground italic">
                                  {vehicle.comment}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={typeColors[vehicle.type as keyof typeof typeColors] || "bg-slate-100 text-slate-800 border-slate-200"}>
                            {typeLabels[vehicle.type as keyof typeof typeLabels] || vehicle.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{vehicle.plate_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={vehicle.tipper_type === 'Kipper' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                            {vehicle.tipper_type || 'kein Kipper'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vehicle.max_weight_kg ? `${vehicle.max_weight_kg} kg` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {(vehicle as any).number_of_seats ? (
                              <span className="text-sm">{(vehicle as any).number_of_seats}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(vehicle as any).has_first_aid_kit ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {vehicle.current_assignment?.crew?.name ? (
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                              {vehicle.current_assignment.crew.name}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {vehicle.rental_cost_per_day ? `€${vehicle.rental_cost_per_day}/day` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {/* Document count and warnings */}
                            <div className="flex items-center gap-1">
                              {(vehicle as any).documents_expired > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-red-100 text-red-800 border-red-200 text-xs px-1.5 py-0"
                                >
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {(vehicle as any).documents_expired}
                                </Badge>
                              )}
                              {(vehicle as any).documents_expiring_soon > 0 && (
                                <Badge
                                  variant="outline"
                                  className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-1.5 py-0"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {(vehicle as any).documents_expiring_soon}
                                </Badge>
                              )}
                            </div>

                            <VehicleDocumentsDialog
                              vehicleId={vehicle.id}
                              vehicleName={`${vehicle.brand} ${vehicle.model}`}
                              trigger={
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="relative"
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  <span className="text-xs">
                                    {(vehicle as any).documents_count || 0}
                                  </span>
                                  {((vehicle as any).documents_expired > 0 ||
                                    (vehicle as any).documents_expiring_soon > 0) && (
                                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                                  )}
                                </Button>
                              }
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}/edit`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Current Assignments</CardTitle>
                  <CardDescription>
                    Active vehicle assignments across projects
                  </CardDescription>
                </div>
                <Button
                  onClick={() => router.push('/dashboard/equipment/assignments/new')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {assignments && assignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Expected Return</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => {
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                  <Truck className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="font-medium">{assignment.equipment?.name || 'Unknown Vehicle'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {assignment.equipment?.inventory_no || 'No plate number'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                <div className="flex items-center space-x-1">
                                  <Truck className="h-3 w-3" />
                                  <span>Vehicle</span>
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{assignment.project_name || assignment.project_id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{assignment.crew_name || 'Unassigned'}</div>
                            </TableCell>
                            <TableCell>
                              {assignment.from_ts ? format(new Date(assignment.from_ts), 'MMM dd, yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {assignment.to_ts ? format(new Date(assignment.to_ts), 'MMM dd, yyyy') : 'Open-ended'}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${assignment.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {assignment.is_active ? 'Active' : 'Inactive'}
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
                                  onClick={() => handleDeleteAssignment(assignment.id, assignment.equipment?.name || 'Unknown Vehicle')}
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
                  <h3 className="mt-4 text-lg font-semibold">No active assignments</h3>
                  <p className="text-muted-foreground">
                    No vehicles are currently assigned to projects.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/equipment/assignments/new")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
