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
  Car
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useEquipment, useEquipmentAssignments, useDeleteAssignment, useEquipmentAnalytics } from "@/hooks/use-equipment";
import { useVehicles, useVehicleAssignments } from "@/hooks/use-vehicles";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

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
  machine: "bg-purple-100 text-purple-800 border-purple-200",
  tool: "bg-orange-100 text-orange-800 border-orange-200",
  measuring_device: "bg-cyan-100 text-cyan-800 border-cyan-200",
  // Vehicle types
  van: "bg-blue-100 text-blue-800 border-blue-200",
  truck: "bg-indigo-100 text-indigo-800 border-indigo-200",
  trailer: "bg-gray-100 text-gray-800 border-gray-200",
  excavator: "bg-yellow-100 text-yellow-800 border-yellow-200",
  other: "bg-slate-100 text-slate-800 border-slate-200",
} as const;

const typeLabels = {
  machine: "Machine",
  tool: "Tool",
  measuring_device: "Measuring Device",
  // Vehicle types
  van: "Van",
  truck: "Truck",
  trailer: "Trailer",
  excavator: "Excavator",
  other: "Other Vehicle",
} as const;

export default function EquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("fleet");
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    owned: "",
    search: "",
  });

  // Handle URL tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['fleet', 'assignments', 'usage', 'management'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const { data: equipmentData, isLoading } = useEquipment({
    ...filters,
    per_page: 1000
  });
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles({
    ...filters,
    per_page: 1000
  });
  const { data: equipmentAssignments } = useEquipmentAssignments({ active_only: true });
  const { data: vehicleAssignments } = useVehicleAssignments({ active_only: true });
  const { data: analytics, isLoading: analyticsLoading } = useEquipmentAnalytics();
  const deleteAssignmentMutation = useDeleteAssignment();

  const equipment = equipmentData?.items || [];
  const vehicles = vehiclesData?.items || [];

  // Combine equipment and vehicle assignments
  const assignments = [
    ...(equipmentAssignments || []).map(assignment => ({
      ...assignment,
      assignment_type: 'equipment' as const,
      resource_type: 'equipment' as const
    })),
    ...(vehicleAssignments || []).map(assignment => ({
      ...assignment,
      id: assignment.id,
      equipment_id: assignment.vehicle_id, // Map vehicle_id to equipment_id for consistency
      equipment: assignment.vehicle ? {
        name: `${assignment.vehicle.brand} ${assignment.vehicle.model}`,
        type: assignment.vehicle.type,
        inventory_no: assignment.vehicle.plate_number
      } : null,
      assignment_type: 'vehicle' as const,
      resource_type: 'vehicle' as const,
      from_ts: assignment.from_ts,
      to_ts: assignment.to_ts,
      crew_id: assignment.crew_id,
      project_id: assignment.project_id,
      crew_name: assignment.crew?.name,
      project_name: assignment.project?.name
    }))
  ];

  // Combine equipment and vehicles for display with consistent format
  const allResources = [
    ...equipment.map(item => ({
      ...item,
      resource_type: 'equipment' as const,
      plate_number: item.inventory_no, // Map inventory_no to plate_number for consistency
      brand: item.name,
      model: item.type
    })),
    ...vehicles.map(item => ({
      ...item,
      resource_type: 'vehicle' as const,
      name: `${item.brand} ${item.model}`,
      inventory_no: item.plate_number, // Map plate_number to inventory_no for consistency
      type: item.type
    }))
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value,
    }));
  };

  const handleDeleteEquipment = async (equipmentId: string, equipmentName: string) => {
    if (!confirm(`Are you sure you want to delete "${equipmentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/equipment/${equipmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || 'Failed to delete equipment';

        // Provide more user-friendly error messages
        if (errorMessage.includes('currently assigned')) {
          toast.error(`Cannot delete "${equipmentName}": Equipment is currently assigned to a project. Please remove all assignments first.`);
        } else if (errorMessage.includes('in use')) {
          toast.error(`Cannot delete "${equipmentName}": Equipment is currently in use. Please change status first.`);
        } else {
          toast.error(`Failed to delete "${equipmentName}": ${errorMessage}`);
        }
        return;
      }

      toast.success(`Equipment "${equipmentName}" deleted successfully`);

      // Refresh the page to update the equipment list
      window.location.reload();
    } catch (error) {
      console.error('Delete equipment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete equipment';

      // Provide contextual error messages
      if (errorMessage.includes('currently assigned')) {
        toast.error(`Cannot delete "${equipmentName}": Equipment is currently assigned to a project. Please remove all assignments first.`);
      } else {
        toast.error(`Failed to delete "${equipmentName}": ${errorMessage}`);
      }
    }
  };

  const handleEditAssignment = (assignmentId: string) => {
    router.push(`/dashboard/equipment/assignments/${assignmentId}`);
  };

  const handleDeleteAssignment = async (assignmentId: string, equipmentName: string) => {
    if (!confirm(`Are you sure you want to delete the assignment for "${equipmentName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAssignmentMutation.mutateAsync(assignmentId);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Delete assignment error:', error);
    }
  };

  // Calculate statistics
  const stats = allResources.reduce(
    (acc, item) => {
      acc.total += 1;
      acc.totalValue += item.purchase_price_eur || 0;

      if (item.status === "available") acc.available += 1;
      else if (item.status === "in_use") acc.inUse += 1;
      else if (item.status === "maintenance") acc.maintenance += 1;
      else if (item.status === "broken") acc.broken += 1;

      if (item.owned) acc.owned += 1;
      else acc.rented += 1;

      return acc;
    },
    {
      total: 0,
      totalValue: 0,
      available: 0,
      inUse: 0,
      maintenance: 0,
      broken: 0,
      owned: 0,
      rented: 0,
    }
  );

  const utilizationRate = stats.total > 0 ? Math.round((stats.inUse / stats.total) * 100) : 0;

  if (isLoading || vehiclesLoading) {
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
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Equipment & Vehicle Management</h1>
            <p className="text-muted-foreground">
              Manage your equipment tools, vehicles, assignments, and maintenance
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard/vehicles/new")}>
            <Car className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
          <Button onClick={() => router.push("/dashboard/equipment/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Equipment
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Equipment</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  €{stats.totalValue.toLocaleString()} value
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
                <p className="text-sm font-medium text-muted-foreground">Utilization Rate</p>
                <p className="text-2xl font-bold">{utilizationRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.inUse} in use
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
                <p className="text-sm font-medium text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready for assignment
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
                <p className="text-sm font-medium text-muted-foreground">Attention Needed</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance + stats.broken}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maintenance & repairs
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="fleet" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Equipment Fleet</span>
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Assignments</span>
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Usage & Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search equipment..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select value={filters.type || "all"} onValueChange={(value) => handleFilterChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="machine">Machines</SelectItem>
                      <SelectItem value="tool">Tools</SelectItem>
                      <SelectItem value="measuring_device">Measuring Devices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in_use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="broken">Broken</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Ownership</label>
                  <Select value={filters.owned || "all"} onValueChange={(value) => handleFilterChange("owned", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Owned</SelectItem>
                      <SelectItem value="false">Rented</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({ type: "", status: "", owned: "", search: "" })}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Table */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Fleet</CardTitle>
              <CardDescription>
                {equipment.length} equipment item{equipment.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {equipment.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ownership</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Purchase Price</TableHead>
                        <TableHead>Daily Rate</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allResources.map((item) => {
                        const StatusIcon = statusIcons[item.status as keyof typeof statusIcons];

                        return (
                          <TableRow key={item.id} className="hover:bg-muted/50">
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {item.resource_type === 'vehicle' ? (
                                  <Car className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <Package className="h-4 w-4 text-gray-600" />
                                )}
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.resource_type === 'vehicle'
                                      ? `Plate: ${item.plate_number || item.inventory_no || 'No plate'}`
                                      : (item.inventory_no || 'No inventory number')
                                    }
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={typeColors[item.type]}>
                                {typeLabels[item.type]}
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
                                {item.owned ? "Owned" : "Rented"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {item.current_location || "Not specified"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                €{item.purchase_price_eur?.toLocaleString() || '0'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                €{item.rental_price_per_day_eur?.toFixed(2) || '0'}/day
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (item.resource_type === 'vehicle') {
                                      router.push(`/dashboard/vehicles/${item.id}/edit`);
                                    } else {
                                      router.push(`/dashboard/equipment/${item.id}/edit`);
                                    }
                                  }}
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
                  <h3 className="mt-4 text-lg font-semibold">No equipment found</h3>
                  <p className="text-muted-foreground">
                    No equipment matches your current filters.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => router.push("/dashboard/equipment/new")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Equipment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Assignments</p>
                    <p className="text-2xl font-bold">{assignments?.length || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Resources currently deployed ({assignments?.filter(a => a.assignment_type === 'equipment').length || 0} equipment, {assignments?.filter(a => a.assignment_type === 'vehicle').length || 0} vehicles)
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
                    <p className="text-sm font-medium text-muted-foreground">Projects Covered</p>
                    <p className="text-2xl font-bold">{new Set(assignments?.map(a => a.project_id) || []).size}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Active project sites
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
                    <p className="text-sm font-medium text-muted-foreground">Avg. Assignment Duration</p>
                    <p className="text-2xl font-bold">
                      {analytics?.assignments?.averageDuration ? `${analytics?.assignments?.averageDuration}d` : '0d'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current assignments
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
                  <CardTitle>Current Assignments</CardTitle>
                  <CardDescription>
                    Active equipment and vehicle assignments across projects
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
                        <TableHead>Resource</TableHead>
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
                                  <div className="font-medium">{assignment.equipment?.name || 'Unknown Resource'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {assignment.equipment?.inventory_no || 'No inventory #'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${isVehicle ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
                                <div className="flex items-center space-x-1">
                                  <ResourceIcon className="h-3 w-3" />
                                  <span>{isVehicle ? 'Vehicle' : 'Equipment'}</span>
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
                                  onClick={() => handleDeleteAssignment(assignment.id, assignment.equipment?.name || 'Unknown Resource')}
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
                    No equipment is currently assigned to projects.
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

        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? '...' : `${analytics?.overview?.totalHours || 0}h`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Equipment usage hours
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
                    <p className="text-sm font-medium text-muted-foreground">Efficiency Score</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? '...' : `${analytics?.overview?.efficiencyScore || 0}%`}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Based on availability
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
                    <p className="text-sm font-medium text-muted-foreground">Downtime</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? '...' : `${analytics?.overview?.downtimeRate || 0}%`}
                    </p>
                    <p className="text-xs text-red-600 mt-1">
                      Maintenance + Broken
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
                    <p className="text-sm font-medium text-muted-foreground">Revenue Generated</p>
                    <p className="text-2xl font-bold">
                      {analyticsLoading ? '...' : `€${(analytics?.overview?.revenueGenerated || 0).toLocaleString()}`}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Monthly estimate
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
                <CardTitle>Equipment Utilization</CardTitle>
                <CardDescription>Usage hours by equipment type</CardDescription>
              </CardHeader>
              <CardContent>
                <UsageChart data={analytics?.utilization} loading={analyticsLoading} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current equipment status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <StatusPieChart data={analytics?.statusDistribution} loading={analyticsLoading} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Monthly equipment performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Maintenance Due</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Equipment needs attention
                    </p>
                  </div>
                  <Settings className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Out of Service</p>
                    <p className="text-2xl font-bold text-red-600">{stats.broken}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requiring immediate repair
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analytics?.equipment?.totalCount > 0
                        ? `${Math.round(((analytics?.equipment?.byStatus?.available || 0) + (analytics?.equipment?.byStatus?.in_use || 0)) / analytics?.equipment?.totalCount * 100)}%`
                        : '0%'}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Operational equipment
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" onClick={() => router.push('/dashboard/equipment/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Equipment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="mr-2 h-4 w-4" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Bulk Operations
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Maintenance</CardTitle>
                <CardDescription>Equipment requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipment.filter(eq => eq.status === 'maintenance').slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.inventory_no}</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {statusLabels[item.status]}
                      </Badge>
                    </div>
                  ))}
                  {equipment.filter(eq => eq.status === 'maintenance').length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No maintenance scheduled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Equipment Categories</CardTitle>
              <CardDescription>Manage equipment by type and category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(typeLabels).map(([type, label]) => {
                  const count = equipment.filter(eq => eq.type === type).length;
                  const value = equipment.filter(eq => eq.type === type).reduce((sum, eq) => sum + (eq.purchase_price_eur || 0), 0);
                  return (
                    <div key={type} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{label}</h4>
                        <Badge className={typeColors[type]}>{count}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Total Value: €{value.toLocaleString()}</p>
                      <div className="mt-3 space-x-2">
                        <Button size="sm" variant="outline">View All</Button>
                        <Button size="sm" variant="ghost">Manage</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
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
          <p>No utilization data available</p>
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
            name === 'hours' ? 'Hours' : name === 'revenue' ? 'Revenue' : 'Assignments'
          ]}
        />
        <Legend />
        <Bar dataKey="hours" fill="#3b82f6" name="Hours" />
        <Bar dataKey="revenue" fill="#10b981" name="Revenue (€)" />
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
          <p>No status data available</p>
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
          <p className="text-lg font-medium text-gray-500 mb-2">No Performance Data Available</p>
          <p className="text-sm text-gray-400">Historical performance tracking will be available once equipment assignments are active.</p>
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
          <Line type="monotone" dataKey="utilization" stroke="#3b82f6" name="Utilization %" strokeWidth={2} />
          <Line type="monotone" dataKey="efficiency" stroke="#10b981" name="Efficiency %" strokeWidth={2} />
          <Line type="monotone" dataKey="downtime" stroke="#ef4444" name="Downtime %" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};