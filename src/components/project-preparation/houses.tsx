'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Home, MapPin, Calendar, Phone, Mail, FileText, Upload, Edit, Trash2, Plus, BarChart3, PieChart, Users, Building, CloudRain, Construction, CheckCircle, ClipboardList, Camera, Paperclip, Eye, Download, X } from 'lucide-react';
import { useProjectHouses, useCreateHouse, useUpdateHouse, useDeleteHouse } from '@/hooks/use-houses';
import { useCabinets } from '@/hooks/use-zone-layout';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface HousesProps {
  projectId: string;
}

interface CreateHouseForm {
  address: string;
  house_number?: string;
  cabinet_id?: string;
  apartment_count: number;
  floor_count: number;
  connection_type: string;
  method: string;
  house_type: string;
  planned_connection_date?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  coordinates_lat?: number;
  coordinates_lng?: number;
  notes?: string;
}

interface EditHouseForm {
  address: string;
  house_number?: string;
  connection_type: string;
  method: string;
  status: string;
  planned_connection_date?: string;
  work_started_at?: string;
  work_completed_at?: string;
  contact_name?: string;
  contact_phone?: string;
  notes?: string;
}

const CONNECTION_TYPES = [
  { value: 'full', label: 'Vollständiger Anschluss', icon: Home },
  { value: 'property', label: 'Bis Grundstück', icon: Building },
  { value: 'in_home', label: 'bis Hauswand', icon: Home },
  { value: 'other', label: 'Sonstiges', icon: AlertCircle },
];

const INSTALLATION_METHODS = [
  { value: 'trench', label: 'Graben', icon: Construction },
  { value: 'aerial', label: 'Luftleitung', icon: CloudRain },
  { value: 'underground', label: 'Unterirdisch', icon: Construction },
  { value: 'building', label: 'Gebäudeverlegung', icon: Construction },
];

const HOUSE_TYPES = [
  { value: 'residential', label: 'Wohngebäude', icon: Home },
  { value: 'commercial', label: 'Geschäftsgebäude', icon: Building },
  { value: 'mixed', label: 'Gemischte Nutzung', icon: Building },
  { value: 'industrial', label: 'Industriegebäude', icon: Building },
];

const CONNECTION_STATUSES = [
  { value: 'pending', label: 'Ausstehend', color: 'bg-gray-100 text-gray-800' },
  { value: 'scheduled', label: 'Geplant', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in-progress', label: 'In Bearbeitung', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'assigned', label: 'Zugewiesen', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'connected', label: 'Verbunden', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Abgeschlossen', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Storniert', color: 'bg-red-100 text-red-800' },
];

const DOCUMENT_TYPES = [
  { value: 'plan', label: 'Bauplan', icon: ClipboardList },
  { value: 'permit', label: 'Genehmigung', icon: FileText },
  { value: 'contract', label: 'Vertrag', icon: FileText },
  { value: 'photo_before', label: 'Foto vorher', icon: Camera },
  { value: 'photo_during', label: 'Foto während', icon: Camera },
  { value: 'photo_after', label: 'Foto nachher', icon: Camera },
  { value: 'other', label: 'Sonstiges', icon: Paperclip },
];

export default function Houses({ projectId }: HousesProps) {
  const [activeTab, setActiveTab] = useState('houses');
  const [editingHouse, setEditingHouse] = useState<string | null>(null);
  const [selectedHouseForDocs, setSelectedHouseForDocs] = useState<string | null>(null);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);
  const [viewingDocument, setViewingDocument] = useState<{
    url: string;
    filename: string;
    fileType: string;
  } | null>(null);
  const [houseDocuments, setHouseDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const { data: housesData, isLoading, error, refetch } = useProjectHouses(projectId);
  const { data: cabinets, isLoading: cabinetsLoading } = useCabinets(projectId);
  const createHouse = useCreateHouse();
  const updateHouse = useUpdateHouse();
  const deleteHouse = useDeleteHouse();
  const uploadDocument = { mutate: () => {}, isPending: false }; // TODO: Implement useUploadHouseDocument hook

  const createForm = useForm<CreateHouseForm>();
  const editForm = useForm<EditHouseForm>();

  // Load documents when house is selected
  const loadHouseDocuments = async (houseId: string) => {
    setLoadingDocs(true);
    try {
      const response = await fetch(`/api/houses/${houseId}/documents`);
      if (response.ok) {
        const data = await response.json();
        setHouseDocuments(data.items || []);
      } else {
        setHouseDocuments([]);
        toast.error('Failed to load documents');
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setHouseDocuments([]);
      toast.error('Error loading documents');
    } finally {
      setLoadingDocs(false);
    }
  };

  // Load documents when house selection changes
  const handleHouseSelectForDocs = (houseId: string) => {
    setSelectedHouseForDocs(houseId);
    loadHouseDocuments(houseId);
  };

  // View document handler
  const handleViewDocument = (doc: any) => {
    setViewingDocument({
      url: doc.download_url,
      filename: doc.filename,
      fileType: doc.file_type,
    });
  };

  // Delete document handler
  const handleDeleteDocument = async (documentId: string) => {
    if (!selectedHouseForDocs) return;

    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/houses/${selectedHouseForDocs}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Document deleted successfully');
        loadHouseDocuments(selectedHouseForDocs);
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Error deleting document');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Houses</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleCreateHouse = async (data: CreateHouseForm) => {
    try {
      const result = await createHouse.mutateAsync({
        ...data,
        project_id: projectId,
      });

      // Upload document if one was selected
      if (selectedDocumentFile && result.id) {
        try {
          const formData = new FormData();
          formData.append('file', selectedDocumentFile);
          formData.append('document_type', 'connection_plan');
          formData.append('description', 'Connection plan uploaded during house creation');

          const response = await fetch(`/api/houses/${result.id}/documents`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Document upload failed');
          }

          toast.success('House and document added successfully');
        } catch (docError) {
          console.error('Document upload error:', docError);
          toast.warning('House added but document upload failed');
        }
      } else {
        toast.success('House added successfully');
      }

      createForm.reset();
      setSelectedDocumentFile(null);
      refetch();
    } catch (error) {
      console.error('Create house error:', error);
      toast.error('Failed to add house');
    }
  };

  const handleUpdateHouse = async (houseId: string, data: EditHouseForm) => {
    try {
      await updateHouse.mutateAsync({
        house_id: houseId,
        ...data,
      });
      editForm.reset();
      setEditingHouse(null);
      refetch();
      toast.success('House updated successfully');
    } catch (error) {
      toast.error('Failed to update house');
    }
  };

  const handleDeleteHouse = async (houseId: string) => {
    if (window.confirm('Are you sure you want to delete this house?')) {
      try {
        await deleteHouse.mutateAsync(houseId);
        refetch();
        toast.success('House deleted successfully');
      } catch (error) {
        toast.error('Failed to delete house');
      }
    }
  };

  const totalHouses = housesData?.houses?.length || 0;
  const connectedCount = housesData?.houses?.filter(h => h.status === 'connected')?.length || 0;
  const assignedCount = housesData?.houses?.filter(h => h.status === 'assigned')?.length || 0;
  const totalApartments = housesData?.houses?.reduce((sum, h) => sum + (h.apartment_count || 1), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">🏠 HA & HP+</h3>
          <p className="text-gray-600">House management, connection status, and documentation</p>
        </div>
      </div>

      {/* Houses Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Häuser gesamt</p>
                <p className="text-2xl font-bold">{totalHouses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Verbunden</p>
                <p className="text-2xl font-bold">{connectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Zugewiesen</p>
                <p className="text-2xl font-bold">{assignedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Einheiten gesamt</p>
                <p className="text-2xl font-bold">{totalApartments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Houses Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="houses">Projekthäuser</TabsTrigger>
          <TabsTrigger value="add">Haus hinzufügen</TabsTrigger>
          <TabsTrigger value="status">Anschlussstatus</TabsTrigger>
          <TabsTrigger value="documents">Hausdokumente</TabsTrigger>
        </TabsList>

        {/* Project Houses Tab */}
        <TabsContent value="houses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Liste der Projekthäuser</CardTitle>
              <CardDescription>
                Houses assigned to this project with connection details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalHouses > 0 ? (
                <div className="space-y-4">
                  {housesData?.houses?.map((house) => (
                    <Card key={house.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        {editingHouse === house.id ? (
                          <form onSubmit={editForm.handleSubmit((data) => handleUpdateHouse(house.id, data))} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="address">Address</Label>
                                <Input
                                  defaultValue={house.address}
                                  {...editForm.register('address', { required: true })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="house_number">House Number</Label>
                                <Input
                                  defaultValue={house.house_number || ''}
                                  {...editForm.register('house_number')}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="connection_type">Connection Type</Label>
                                <Select onValueChange={(value) => editForm.setValue('connection_type', value)} defaultValue={house.connection_type}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CONNECTION_TYPES.map(type => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="method">Installation Method</Label>
                                <Select onValueChange={(value) => editForm.setValue('method', value)} defaultValue={house.method}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {INSTALLATION_METHODS.map(method => (
                                      <SelectItem key={method.value} value={method.value}>
                                        {method.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="status">Status</Label>
                                <Select onValueChange={(value) => editForm.setValue('status', value)} defaultValue={house.status}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CONNECTION_STATUSES.map(status => (
                                      <SelectItem key={status.value} value={status.value}>
                                        {status.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="planned_connection_date">Planned Date</Label>
                                <Input
                                  type="date"
                                  defaultValue={house.planned_connection_date || ''}
                                  {...editForm.register('planned_connection_date')}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="work_started_at">Work Start Time</Label>
                                <Input
                                  type="datetime-local"
                                  defaultValue={house.work_started_at ? new Date(house.work_started_at).toISOString().slice(0, 16) : ''}
                                  {...editForm.register('work_started_at')}
                                />
                                <p className="text-xs text-gray-500 mt-1">When work began on this connection</p>
                              </div>
                              <div>
                                <Label htmlFor="work_completed_at">Work Completion Time</Label>
                                <Input
                                  type="datetime-local"
                                  defaultValue={house.work_completed_at ? new Date(house.work_completed_at).toISOString().slice(0, 16) : ''}
                                  {...editForm.register('work_completed_at')}
                                />
                                <p className="text-xs text-gray-500 mt-1">When work was completed</p>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="notes">Notes</Label>
                              <Textarea
                                defaultValue={house.notes || ''}
                                {...editForm.register('notes')}
                              />
                            </div>

                            <div className="flex space-x-2">
                              <Button type="submit" disabled={updateHouse.isPending}>
                                {updateHouse.isPending ? 'Updating...' : 'Update'}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setEditingHouse(null)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={CONNECTION_STATUSES.find(s => s.value === house.status)?.color || 'bg-gray-100 text-gray-800'}>
                                  {CONNECTION_STATUSES.find(s => s.value === house.status)?.label || house.status}
                                </Badge>
                                <Badge variant="outline">
                                  {(() => {
                                    const type = CONNECTION_TYPES.find(t => t.value === house.connection_type);
                                    const Icon = type?.icon;
                                    return Icon ? <Icon className="w-4 h-4 mr-1" /> : null;
                                  })()}
                                  {house.connection_type}
                                </Badge>
                                <Badge variant="outline">
                                  {(() => {
                                    const method = INSTALLATION_METHODS.find(m => m.value === house.method);
                                    const Icon = method?.icon;
                                    return Icon ? <Icon className="w-4 h-4 mr-1" /> : null;
                                  })()}
                                  {house.method}
                                </Badge>
                              </div>
                              <h5 className="font-semibold">{house.address}</h5>
                              {house.house_number && (
                                <p className="text-sm text-gray-600">House Number: {house.house_number}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className="flex items-center">
                                  <Home className="w-4 h-4 mr-1" />
                                  {house.apartment_count} Units
                                </span>
                                {house.planned_connection_date && (
                                  <span className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {house.planned_connection_date}
                                  </span>
                                )}
                                {house.contact_name && (
                                  <span className="flex items-center">
                                    <Phone className="w-4 h-4 mr-1" />
                                    {house.contact_name}
                                  </span>
                                )}
                              </div>
                              {house.notes && (
                                <p className="text-sm text-gray-500 mt-1">Note: {house.notes}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingHouse(house.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteHouse(house.id)}
                                disabled={deleteHouse.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine Häuser dem Projekt hinzugefügt</h3>
                  <p className="text-gray-600 mb-4">
                    Add houses to start tracking connections for this project.
                  </p>
                  <Button onClick={() => setActiveTab('add')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Haus hinzufügen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add House Tab */}
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>🏠 Haus zum Projekt hinzufügen</CardTitle>
              <CardDescription>
                Add a new house to this project with connection details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createForm.handleSubmit(handleCreateHouse)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      placeholder="Hauptstraße 15, 10115 Berlin"
                      {...createForm.register('address', { required: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="house_number">House Number</Label>
                    <Input
                      placeholder="123A"
                      {...createForm.register('house_number')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cabinet_id">NVP Point (Cabinet)</Label>
                  <Select onValueChange={(value) => createForm.setValue('cabinet_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={cabinetsLoading ? "Loading cabinets..." : "Select NVP point"} />
                    </SelectTrigger>
                    <SelectContent>
                      {cabinets && cabinets.length > 0 ? (
                        cabinets.map((cabinet: any) => (
                          <SelectItem key={cabinet.id} value={cabinet.id}>
                            {cabinet.code} - {cabinet.name} {cabinet.address ? `(${cabinet.address})` : ''}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No cabinets available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Link this house to a network distribution point</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="apartment_count">Number of Apartments</Label>
                    <Input
                      type="number"
                      min="1"
                      defaultValue="1"
                      {...createForm.register('apartment_count', { required: true, valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="floor_count">Number of Floors</Label>
                    <Input
                      type="number"
                      min="1"
                      defaultValue="1"
                      {...createForm.register('floor_count', { required: true, valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="connection_type">Connection Type</Label>
                    <Select onValueChange={(value) => createForm.setValue('connection_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select connection type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONNECTION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="method">Installation Method</Label>
                    <Select onValueChange={(value) => createForm.setValue('method', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select installation method" />
                      </SelectTrigger>
                      <SelectContent>
                        {INSTALLATION_METHODS.map(method => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="house_type">Building Type</Label>
                    <Select onValueChange={(value) => createForm.setValue('house_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select building type" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOUSE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="planned_connection_date">Planned Connection Date</Label>
                    <Input
                      type="date"
                      {...createForm.register('planned_connection_date')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_name">Contact Person</Label>
                    <Input
                      placeholder="Max Mustermann"
                      {...createForm.register('contact_name')}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Phone</Label>
                    <Input
                      placeholder="+49 30 12345678"
                      {...createForm.register('contact_phone')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    type="email"
                    placeholder="max.mustermann@example.com"
                    {...createForm.register('contact_email')}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    placeholder="Besonderheiten beim Anschluss, Zugangshinweise..."
                    {...createForm.register('notes')}
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                  <Label className="text-base font-semibold flex items-center mb-3">
                    <Paperclip className="w-5 h-5 mr-2" />
                    Connection Plan Document (Optional)
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => setSelectedDocumentFile(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      {selectedDocumentFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDocumentFile(null)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {selectedDocumentFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>{selectedDocumentFile.name} ({(selectedDocumentFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Upload connection plans, permits, or other documents (max 10MB). PDF, images, or Office documents accepted.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createHouse.isPending}
                >
                  {createHouse.isPending ? 'Adding...' : 'Haus hinzufügen'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Connection Status Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Übersicht Anschlussstatus</CardTitle>
              <CardDescription>
                Connection status overview with statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalHouses > 0 ? (
                <div className="space-y-6">
                  {/* Status Distribution */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {CONNECTION_STATUSES.map(status => {
                      const count = housesData?.houses?.filter(h => h.status === status.value)?.length || 0;
                      const percentage = totalHouses > 0 ? Math.round((count / totalHouses) * 100) : 0;

                      return (
                        <Card key={status.value}>
                          <CardContent className="p-4 text-center">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${status.color} mb-2`}>
                              {status.label}
                            </div>
                            <p className="text-2xl font-bold">{count}</p>
                            <p className="text-sm text-gray-600">{percentage}% of houses</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Progress Indicators */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Connection Progress</h4>
                    {CONNECTION_STATUSES.map(status => {
                      const count = housesData?.houses?.filter(h => h.status === status.value)?.length || 0;
                      const percentage = totalHouses > 0 ? (count / totalHouses) * 100 : 0;

                      return (
                        <div key={status.value} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{status.label}</span>
                            <span className="text-sm">{count} houses ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Status Data</h3>
                  <p className="text-gray-600">Add houses to view connection status statistics.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>📎 Verwaltung der Hausdokumente</CardTitle>
              <CardDescription>
                Manage documents for project houses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalHouses > 0 ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="house_select">Select House</Label>
                    <Select onValueChange={handleHouseSelectForDocs}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select house for document management" />
                      </SelectTrigger>
                      <SelectContent>
                        {housesData?.houses?.map(house => (
                          <SelectItem key={house.id} value={house.id}>
                            {house.address} {house.house_number && `(${house.house_number})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedHouseForDocs && (
                    <div className="space-y-4">
                      {/* Document Upload */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Upload Document</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="doc_type">Document Type</Label>
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select document type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DOCUMENT_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>
                                      {type.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="file">File</Label>
                              <div className="flex items-center space-x-2">
                                <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" />
                                <Button type="button" disabled={uploadDocument.isPending}>
                                  <Upload className="w-4 h-4 mr-2" />
                                  {uploadDocument.isPending ? 'Uploading...' : 'Upload'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Existing Documents */}
                      {loadingDocs ? (
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                              <span className="ml-3">Loading documents...</span>
                            </div>
                          </CardContent>
                        </Card>
                      ) : houseDocuments && houseDocuments.length > 0 ? (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Existing Documents ({houseDocuments.length})</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {houseDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                  <div className="flex items-center space-x-3 flex-1">
                                    {doc.file_type?.includes('image') ? (
                                      <Camera className="w-5 h-5 text-blue-500" />
                                    ) : doc.file_type?.includes('pdf') ? (
                                      <FileText className="w-5 h-5 text-red-500" />
                                    ) : (
                                      <Paperclip className="w-5 h-5 text-gray-500" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{doc.filename}</p>
                                      <p className="text-sm text-gray-600">
                                        {DOCUMENT_TYPES.find(t => t.value === doc.document_type)?.label || doc.document_type}
                                        {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                                        {doc.upload_date && ` • ${new Date(doc.upload_date).toLocaleDateString()}`}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewDocument(doc)}
                                      className="gap-1"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleDeleteDocument(doc.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-600">No documents uploaded for this house</p>
                          <p className="text-sm text-gray-500 mt-1">Upload connection plans, photos, or permits above</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Houses Available</h3>
                  <p className="text-gray-600">Add houses to manage documents.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Viewer Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate flex-1">{viewingDocument?.filename}</span>
              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (viewingDocument?.url) {
                      window.open(viewingDocument.url, '_blank');
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingDocument(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              {viewingDocument?.fileType && (
                <span className="text-sm text-gray-500">
                  Type: {viewingDocument.fileType}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {viewingDocument?.fileType?.includes('pdf') ? (
              <iframe
                src={viewingDocument.url}
                className="w-full h-full border-0 rounded-lg"
                title={viewingDocument.filename}
              />
            ) : viewingDocument?.fileType?.includes('image') ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg overflow-auto">
                <img
                  src={viewingDocument.url}
                  alt={viewingDocument.filename}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Preview not available
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  This file type cannot be previewed in the browser
                </p>
                <Button
                  onClick={() => {
                    if (viewingDocument?.url) {
                      window.open(viewingDocument.url, '_blank');
                    }
                  }}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download to view
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}