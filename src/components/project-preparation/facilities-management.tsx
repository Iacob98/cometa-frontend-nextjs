'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Home, Plus, Edit, Trash2, MapPin, Euro, Calendar, User, Mail, Phone, Package } from 'lucide-react';
import { useFacilities, useCreateFacility, useDeleteFacility } from '@/hooks/use-project-preparation';
import { useHousingUnits, useCreateHousingUnit, useUpdateHousingUnit, useDeleteHousingUnit } from '@/hooks/use-housing-units';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface FacilitiesManagementProps {
  projectId: string;
}

export default function FacilitiesManagement({ projectId }: FacilitiesManagementProps) {
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities(projectId);
  const { data: housingUnits, isLoading: housingLoading } = useHousingUnits(projectId);
  const createFacilityMutation = useCreateFacility();
  const deleteFacilityMutation = useDeleteFacility();
  const createHousingMutation = useCreateHousingUnit();
  const updateHousingMutation = useUpdateHousingUnit();
  const deleteHousingMutation = useDeleteHousingUnit();

  // Get project costs for budget impact
  const { data: projectCosts } = useQuery({
    queryKey: ['project-costs', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/project-preparation/costs?project_id=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project costs');
      return response.json();
    },
    enabled: !!projectId,
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      const data = await response.json();
      return data.items || [];
    },
  });

  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [showHousingForm, setShowHousingForm] = useState(false);
  const [editingHousingId, setEditingHousingId] = useState<string | null>(null);

  const [facilityForm, setFacilityForm] = useState({
    type: '',
    supplier_id: '',
    rent_daily_eur: '',
    rent_period: 'daily', // daily or monthly
    service_freq: '',
    status: 'planned',
    start_date: '',
    end_date: '',
    location_text: '',
  });

  const [housingForm, setHousingForm] = useState({
    address: '',
    rooms_total: '',
    beds_total: '',
    rent_daily_eur: '',
    rent_period: 'daily', // daily or monthly
    advance_payment: '',
    check_in_date: '',
    check_out_date: '',
    status: 'available',
  });

  // Predefined facility types with option to add custom
  const facilityTypes = [
    'Site Office',
    'Storage Container',
    'Portable Toilet',
    'Warehouse',
    'Parking Space',
    'Security Cabin',
    'Break Room',
    'Tool Storage',
    'Equipment Shed',
    'Meeting Room'
  ];

  // Find selected supplier for displaying details
  const selectedSupplier = suppliers?.find(supplier => supplier.id === facilityForm.supplier_id);

  // Fetch materials for selected supplier
  const { data: supplierMaterials } = useQuery({
    queryKey: ['supplier-materials', facilityForm.supplier_id],
    queryFn: async () => {
      if (!facilityForm.supplier_id) return [];
      const response = await fetch(`/api/materials?supplier_id=${facilityForm.supplier_id}&per_page=10`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.items || [];
    },
    enabled: !!facilityForm.supplier_id,
  });

  const handleFacilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facilityForm.type || !facilityForm.rent_daily_eur) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const rentAmount = parseFloat(facilityForm.rent_daily_eur);
      // Convert monthly rate to daily if needed
      const dailyRate = facilityForm.rent_period === 'monthly' ? rentAmount / 30 : rentAmount;

      await createFacilityMutation.mutateAsync({
        project_id: projectId,
        type: facilityForm.type,
        supplier_id: facilityForm.supplier_id || undefined,
        rent_daily_eur: dailyRate,
        service_freq: facilityForm.service_freq || undefined,
        status: facilityForm.status,
        start_date: facilityForm.start_date || undefined,
        end_date: facilityForm.end_date || undefined,
        location_text: facilityForm.location_text || undefined,
      });

      // Reset form
      setFacilityForm({
        type: '',
        supplier_id: '',
        rent_daily_eur: '',
        rent_period: 'daily',
        service_freq: '',
        status: 'planned',
        start_date: '',
        end_date: '',
        location_text: '',
      });
      setShowFacilityForm(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleHousingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!housingForm.address || !housingForm.rooms_total || !housingForm.beds_total || !housingForm.rent_daily_eur) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const rentAmount = parseFloat(housingForm.rent_daily_eur);
      // Convert monthly rate to daily if needed
      const dailyRate = housingForm.rent_period === 'monthly' ? rentAmount / 30 : rentAmount;

      if (editingHousingId) {
        // Update existing housing unit
        await updateHousingMutation.mutateAsync({
          id: editingHousingId,
          address: housingForm.address,
          rooms_total: parseInt(housingForm.rooms_total),
          beds_total: parseInt(housingForm.beds_total),
          rent_daily_eur: dailyRate,
          status: housingForm.status,
          advance_payment: housingForm.advance_payment ? parseFloat(housingForm.advance_payment) : undefined,
          check_in_date: housingForm.check_in_date || undefined,
          check_out_date: housingForm.check_out_date || undefined,
        });
        setEditingHousingId(null);
      } else {
        // Create new housing unit
        await createHousingMutation.mutateAsync({
          project_id: projectId,
          address: housingForm.address,
          rooms_total: parseInt(housingForm.rooms_total),
          beds_total: parseInt(housingForm.beds_total),
          rent_daily_eur: dailyRate,
          status: housingForm.status,
          advance_payment: housingForm.advance_payment ? parseFloat(housingForm.advance_payment) : undefined,
          check_in_date: housingForm.check_in_date || undefined,
          check_out_date: housingForm.check_out_date || undefined,
        });
      }

      // Reset form
      setHousingForm({
        address: '',
        rooms_total: '',
        beds_total: '',
        rent_daily_eur: '',
        rent_period: 'daily',
        advance_payment: '',
        check_in_date: '',
        check_out_date: '',
        status: 'available',
      });
      setShowHousingForm(false);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleEditHousing = (housing: any) => {
    setHousingForm({
      address: housing.address || '',
      rooms_total: housing.rooms_total ? housing.rooms_total.toString() : '',
      beds_total: housing.beds_total ? housing.beds_total.toString() : '',
      rent_daily_eur: housing.rent_daily_eur ? housing.rent_daily_eur.toString() : '',
      rent_period: 'daily',
      advance_payment: housing.advance_payment ? housing.advance_payment.toString() : '',
      check_in_date: housing.check_in_date || '',
      check_out_date: housing.check_out_date || '',
      status: housing.status || 'available',
    });
    setEditingHousingId(housing.id);
    setShowHousingForm(true);
  };

  const handleDeleteHousing = async (housingId: string, address: string) => {
    if (confirm(`Are you sure you want to delete housing unit at "${address}"?`)) {
      try {
        await deleteHousingMutation.mutateAsync(housingId);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleCancelHousingEdit = () => {
    setEditingHousingId(null);
    setHousingForm({
      address: '',
      rooms_total: '',
      beds_total: '',
      rent_daily_eur: '',
      rent_period: 'daily',
      advance_payment: '',
      check_in_date: '',
      check_out_date: '',
      status: 'available',
    });
    setShowHousingForm(false);
  };

  const handleEditFacility = (facility: any) => {
    setFacilityForm({
      type: facility.type,
      rent_daily_eur: facility.rent_daily_eur.toString(),
      rent_period: 'daily',
      service_freq: facility.service_freq || '',
      status: facility.status,
      start_date: facility.start_date || '',
      end_date: facility.end_date || '',
      location_text: facility.location_text || '',
    });
    setShowFacilityForm(true);
  };

  const handleDeleteFacility = async (facilityId: string, facilityType: string) => {
    if (confirm(`Are you sure you want to delete facility "${facilityType}"?`)) {
      try {
        await deleteFacilityMutation.mutateAsync(facilityId);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (facilitiesLoading || housingLoading) {
    return <div>Loading facilities and housing...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Facilities & Housing Management</h3>
        <p className="text-gray-600">
          Manage project facilities and housing arrangements for the team
        </p>
        {projectCosts && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-blue-900">Project Budget</p>
                <p className="text-xl font-bold text-blue-600">
                  €{projectCosts.project?.budget?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="font-medium text-orange-900">Facilities Cost</p>
                <p className="text-lg font-semibold text-orange-600">
                  €{projectCosts.costs?.facilities?.total?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="font-medium text-green-900">Housing Cost</p>
                <p className="text-lg font-semibold text-green-600">
                  €{projectCosts.costs?.housing?.total?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="font-medium text-red-900">Remaining Budget</p>
                <p className="text-lg font-semibold text-red-600">
                  €{projectCosts.project?.remaining_budget?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-600">
                  {projectCosts.project?.budget_utilized_percentage?.toFixed(1) || '0'}% used
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="facilities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="facilities" className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Facilities
          </TabsTrigger>
          <TabsTrigger value="housing" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Housing
          </TabsTrigger>
        </TabsList>

        {/* Facilities Tab */}
        <TabsContent value="facilities" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium">Project Facilities</h4>
              <p className="text-sm text-gray-600">
                {facilities?.length || 0} facilities configured
              </p>
            </div>
            <Button
              onClick={() => setShowFacilityForm(!showFacilityForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Facility
            </Button>
          </div>

          {/* Add Facility Form */}
          {showFacilityForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Facility</CardTitle>
                <CardDescription>
                  Add a new facility for the project (e.g., office, warehouse, site office)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFacilitySubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facility-type">Facility Type *</Label>
                      <Select
                        value={facilityTypes.includes(facilityForm.type) ? facilityForm.type : ''}
                        onValueChange={(value) => setFacilityForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select facility type" />
                        </SelectTrigger>
                        <SelectContent>
                          {facilityTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="mt-2"
                        placeholder="Or enter custom type..."
                        value={facilityTypes.includes(facilityForm.type) ? '' : facilityForm.type}
                        onChange={(e) => setFacilityForm(prev => ({ ...prev, type: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
                      <Select
                        value={facilityForm.supplier_id}
                        onValueChange={(value) => setFacilityForm(prev => ({ ...prev, supplier_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers?.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{supplier.name}</span>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                  {supplier.contact_person && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {supplier.contact_person}
                                    </span>
                                  )}
                                  {supplier.materials_count > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Package className="w-3 h-3" />
                                      {supplier.materials_count} items
                                    </span>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Supplier Information Card */}
                      {selectedSupplier && (
                        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {selectedSupplier.name}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {selectedSupplier.contact_person && (
                              <div className="flex items-center gap-2 text-blue-700">
                                <User className="w-4 h-4" />
                                <span>{selectedSupplier.contact_person}</span>
                              </div>
                            )}
                            {selectedSupplier.email && (
                              <div className="flex items-center gap-2 text-blue-700">
                                <Mail className="w-4 h-4" />
                                <span>{selectedSupplier.email}</span>
                              </div>
                            )}
                            {selectedSupplier.phone && (
                              <div className="flex items-center gap-2 text-blue-700">
                                <Phone className="w-4 h-4" />
                                <span>{selectedSupplier.phone}</span>
                              </div>
                            )}
                            {selectedSupplier.address && (
                              <div className="flex items-center gap-2 text-blue-700">
                                <MapPin className="w-4 h-4" />
                                <span>{selectedSupplier.address}</span>
                              </div>
                            )}
                            {selectedSupplier.materials_count > 0 && (
                              <div className="flex items-center gap-2 text-blue-700">
                                <Package className="w-4 h-4" />
                                <span>{selectedSupplier.materials_count} materials available</span>
                              </div>
                            )}
                          </div>

                          {/* Materials List */}
                          {supplierMaterials && supplierMaterials.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-blue-200">
                              <h5 className="font-medium text-blue-900 mb-2 text-sm">Available Materials:</h5>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {supplierMaterials.slice(0, 5).map((material: any) => (
                                  <div key={material.id} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                                    <span className="font-medium text-gray-700">{material.name}</span>
                                    <span className="text-blue-600">
                                      €{material.unit_price_eur ? material.unit_price_eur.toFixed(2) : 'N/A'}/{material.unit}
                                    </span>
                                  </div>
                                ))}
                                {supplierMaterials.length > 5 && (
                                  <div className="text-xs text-blue-600 text-center py-1">
                                    +{supplierMaterials.length - 5} more materials...
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="facility-rent">Rent Amount (EUR) *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="facility-rent"
                          type="number"
                          step="0.01"
                          value={facilityForm.rent_daily_eur}
                          onChange={(e) => setFacilityForm(prev => ({ ...prev, rent_daily_eur: e.target.value }))}
                          placeholder="150.00"
                          required
                        />
                        <Select
                          value={facilityForm.rent_period}
                          onValueChange={(value) => setFacilityForm(prev => ({ ...prev, rent_period: value }))}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">/day</SelectItem>
                            <SelectItem value="monthly">/month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="facility-status">Status</Label>
                      <Select
                        value={facilityForm.status}
                        onValueChange={(value) => setFacilityForm(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="service-freq">Service Frequency</Label>
                      <Input
                        id="service-freq"
                        value={facilityForm.service_freq}
                        onChange={(e) => setFacilityForm(prev => ({ ...prev, service_freq: e.target.value }))}
                        placeholder="e.g., Weekly, Daily"
                      />
                    </div>

                    <div>
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={facilityForm.start_date}
                        onChange={(e) => setFacilityForm(prev => ({ ...prev, start_date: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={facilityForm.end_date}
                        onChange={(e) => setFacilityForm(prev => ({ ...prev, end_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={facilityForm.location_text}
                      onChange={(e) => setFacilityForm(prev => ({ ...prev, location_text: e.target.value }))}
                      placeholder="Facility address or location description"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createFacilityMutation.isPending}
                    >
                      Add Facility
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowFacilityForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Facilities List */}
          <Card>
            <CardContent className="p-6">
              {!facilities || facilities.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Facilities</h3>
                  <p className="text-gray-600 mb-4">
                    Add facilities needed for the project.
                  </p>
                  <Button onClick={() => setShowFacilityForm(true)}>
                    Add First Facility
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Daily Rent</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facilities.map((facility) => (
                      <TableRow key={facility.id}>
                        <TableCell className="font-medium">
                          {facility.type}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(facility.status)}>
                            {facility.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          €{facility.rent_daily_eur.toLocaleString()}/day
                        </TableCell>
                        <TableCell>
                          {facility.start_date && facility.end_date ? (
                            <span className="text-sm">
                              {facility.start_date} - {facility.end_date}
                            </span>
                          ) : facility.start_date ? (
                            <span className="text-sm">From {facility.start_date}</span>
                          ) : (
                            <span className="text-gray-400">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {facility.location_text || (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {facility.supplier_name || (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFacility(facility)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFacility(facility.id, facility.type)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Housing Tab */}
        <TabsContent value="housing" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium">Housing Units</h4>
              <p className="text-sm text-gray-600">
                {housingUnits?.length || 0} housing units configured
              </p>
            </div>
            <Button
              onClick={() => setShowHousingForm(!showHousingForm)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Housing
            </Button>
          </div>

          {/* Add Housing Form */}
          {showHousingForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingHousingId ? 'Edit Housing Unit' : 'Add New Housing Unit'}
                </CardTitle>
                <CardDescription>
                  {editingHousingId
                    ? 'Update housing unit information'
                    : 'Add accommodation for project team members'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleHousingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="housing-address">Address *</Label>
                      <Input
                        id="housing-address"
                        value={housingForm.address}
                        onChange={(e) => setHousingForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Full address of the housing unit"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="rooms">Total Rooms *</Label>
                      <Input
                        id="rooms"
                        type="number"
                        min="1"
                        value={housingForm.rooms_total}
                        onChange={(e) => setHousingForm(prev => ({ ...prev, rooms_total: e.target.value }))}
                        placeholder="Number of rooms"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="beds">Total Beds *</Label>
                      <Input
                        id="beds"
                        type="number"
                        min="1"
                        value={housingForm.beds_total}
                        onChange={(e) => setHousingForm(prev => ({ ...prev, beds_total: e.target.value }))}
                        placeholder="Number of beds"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="housing-rent">Rent Amount (EUR) *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="housing-rent"
                          type="number"
                          step="0.01"
                          value={housingForm.rent_daily_eur}
                          onChange={(e) => setHousingForm(prev => ({ ...prev, rent_daily_eur: e.target.value }))}
                          placeholder="150.00"
                          required
                        />
                        <Select
                          value={housingForm.rent_period}
                          onValueChange={(value) => setHousingForm(prev => ({ ...prev, rent_period: value }))}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">/day</SelectItem>
                            <SelectItem value="monthly">/month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="advance-payment">Advance Payment (EUR)</Label>
                      <Input
                        id="advance-payment"
                        type="number"
                        step="0.01"
                        value={housingForm.advance_payment}
                        onChange={(e) => setHousingForm(prev => ({ ...prev, advance_payment: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="check-in-date">Check-in Date</Label>
                      <Input
                        id="check-in-date"
                        type="date"
                        value={housingForm.check_in_date}
                        onChange={(e) => setHousingForm(prev => ({ ...prev, check_in_date: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="check-out-date">Check-out Date</Label>
                      <Input
                        id="check-out-date"
                        type="date"
                        value={housingForm.check_out_date}
                        onChange={(e) => setHousingForm(prev => ({ ...prev, check_out_date: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="housing-status">Status</Label>
                      <Select
                        value={housingForm.status}
                        onValueChange={(value) => setHousingForm(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createHousingMutation.isPending || updateHousingMutation.isPending}
                    >
                      {editingHousingId ? 'Update Housing Unit' : 'Add Housing Unit'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelHousingEdit}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Housing List */}
          <Card>
            <CardContent className="p-6">
              {!housingUnits || housingUnits.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Housing Units</h3>
                  <p className="text-gray-600 mb-4">
                    Add housing accommodations for the project team.
                  </p>
                  <Button onClick={() => setShowHousingForm(true)}>
                    Add First Housing Unit
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Rooms</TableHead>
                      <TableHead>Beds</TableHead>
                      <TableHead>Daily Rent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {housingUnits?.map((housing) => (
                      <TableRow key={housing.id}>
                        <TableCell className="font-medium">
                          {housing.address || 'N/A'}
                        </TableCell>
                        <TableCell>{housing.rooms_total || 'N/A'}</TableCell>
                        <TableCell>{housing.beds_total || 'N/A'}</TableCell>
                        <TableCell>
                          €{housing.rent_daily_eur ? housing.rent_daily_eur.toLocaleString() : '0'}/day
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(housing.status)}>
                            {housing.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditHousing(housing)}
                              disabled={updateHousingMutation.isPending}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteHousing(housing.id, housing.address)}
                              disabled={deleteHousingMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}