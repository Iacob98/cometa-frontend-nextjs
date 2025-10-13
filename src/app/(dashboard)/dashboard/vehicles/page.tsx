"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { useVehicles, useDeleteVehicle } from "@/hooks/use-vehicles";

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
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    search: "",
  });

  const { data: vehiclesData, isLoading } = useVehicles({
    ...filters,
    per_page: 1000
  });
  const deleteVehicleMutation = useDeleteVehicle();

  const vehicles = vehiclesData?.items || [];

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

      {/* Filters and Table */}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {filters.search || filters.type || filters.status
                        ? "No vehicles found matching your filters"
                        : "No vehicles added yet. Click 'Add Vehicle' to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVehicles.map((vehicle) => {
                    const StatusIcon = statusIcons[vehicle.status as keyof typeof statusIcons] || Activity;
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
                          <Badge variant="outline" className={statusColors[vehicle.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200"}>
                            {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                            {statusLabels[vehicle.status as keyof typeof statusLabels] || vehicle.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vehicle.rental_cost_per_day ? `€${vehicle.rental_cost_per_day}/day` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
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
    </div>
  );
}
