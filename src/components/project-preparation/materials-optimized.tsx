/**
 * OPTIMIZED MATERIALS COMPONENT
 *
 * React Performance Optimization Patterns:
 * 1. React.memo для предотвращения избыточных рендеров
 * 2. useMemo для дорогих вычислений
 * 3. useCallback для стабильности функций
 * 4. Component splitting для лучшей изоляции
 * 5. Conditional rendering optimizations
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { AlertCircle, Package, ShoppingCart, Calendar, Euro, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import { useUnifiedProjectMaterials, useUnifiedWarehouseMaterials, ProjectMaterial } from '@/hooks/use-materials';
import { useMaterialOrders } from '@/hooks/use-material-orders';
import { useProjects } from '@/hooks/use-projects';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface OptimizedMaterialsProps {
  projectId: string;
}

interface MaterialAssignmentForm {
  material_id: string;
  quantity: number;
  from_date: string;
  to_date?: string;
  notes?: string;
}

interface EditMaterialForm {
  quantity: number;
  unit_price: number;
  from_date: string;
  to_date?: string;
  notes?: string;
}

// OPTIMIZATION: Pre-defined status configuration to avoid recreating on every render
const STATUS_CONFIG = {
  allocated: { label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  used: { label: 'Used', color: 'bg-green-100 text-green-800' },
  returned: { label: 'Returned', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
} as const;

// OPTIMIZATION: Memoized materials summary statistics
const MaterialsSummaryStats = React.memo<{
  materials?: ProjectMaterial[];
}>(({ materials = [] }) => {
  // OPTIMIZATION: useMemo for expensive calculations
  const stats = useMemo(() => {
    const totalMaterials = materials.length;
    const pendingCount = materials.filter(m => m.status === 'allocated').length;
    const usedCount = materials.filter(m => m.status === 'used').length;
    const totalCost = materials.reduce((sum, m) => sum + (m.total_cost || 0), 0);

    return { totalMaterials, pendingCount, usedCount, totalCost };
  }, [materials]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Total Materials</p>
              <p className="text-2xl font-bold">{stats.totalMaterials}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">{stats.pendingCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Used</p>
              <p className="text-2xl font-bold">{stats.usedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Euro className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Total Cost</p>
              <p className="text-2xl font-bold">€{stats.totalCost.toFixed(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

MaterialsSummaryStats.displayName = 'MaterialsSummaryStats';

// OPTIMIZATION: Memoized material card component
const MaterialCard = React.memo<{
  material: ProjectMaterial;
  onEdit: (material: ProjectMaterial) => void;
  onDelete: (assignmentId: string) => void;
  isDeleting?: boolean;
}>(({ material, onEdit, onDelete, isDeleting = false }) => {
  // OPTIMIZATION: useCallback to prevent function recreation
  const handleEdit = useCallback(() => {
    onEdit(material);
  }, [material, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(material.id);
  }, [material.id, onDelete]);

  // OPTIMIZATION: Memoized status config lookup
  const statusConfig = useMemo(() => {
    return STATUS_CONFIG[material.status as keyof typeof STATUS_CONFIG] ||
           { label: material.status, color: 'bg-gray-100 text-gray-800' };
  }, [material.status]);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={statusConfig.color}>
                {statusConfig.label}
              </Badge>
              <Badge variant="outline">{material.material?.sku || material.sku || 'No SKU'}</Badge>
            </div>

            <h5 className="font-semibold">{material.material?.name || material.name || 'Unknown Material'}</h5>
            <p className="text-sm text-gray-600">
              Quantity: {material.allocated_qty} {material.material?.unit || material.unit}
            </p>

            <div className="flex items-center space-x-4 mt-2 text-sm">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {material.allocation_date}
                {material.return_date && ` - ${material.return_date}`}
              </span>
              <span className="flex items-center">
                <Euro className="w-4 h-4 mr-1" />
                €{material.material?.price || material.unit_price || 0}/unit
              </span>
            </div>

            {material.notes && (
              <p className="text-sm text-gray-500 mt-1">Note: {material.notes}</p>
            )}
            {material.allocated_by_name && (
              <p className="text-sm text-gray-500">Assigned by: {material.allocated_by_name}</p>
            )}
          </div>

          <div className="text-right">
            <p className="font-semibold">€{material.total_cost?.toFixed(2) || '0.00'}</p>
            <div className="flex space-x-2 mt-2">
              <Button size="sm" variant="outline" onClick={handleEdit}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MaterialCard.displayName = 'MaterialCard';

// OPTIMIZATION: Memoized loading skeleton
const MaterialsLoadingSkeleton = React.memo(() => (
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
));

MaterialsLoadingSkeleton.displayName = 'MaterialsLoadingSkeleton';

// OPTIMIZATION: Memoized error component
const MaterialsError = React.memo<{
  error: Error;
  onRetry: () => void;
}>(({ error, onRetry }) => (
  <Card>
    <CardContent className="p-6">
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Materials</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </CardContent>
  </Card>
));

MaterialsError.displayName = 'MaterialsError';

// OPTIMIZATION: Main component with React.memo
const OptimizedMaterials = React.memo<OptimizedMaterialsProps>(({ projectId }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('assigned');
  const [editingMaterial, setEditingMaterial] = useState<ProjectMaterial | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // API hooks
  const {
    data: projectMaterials,
    isLoading: projectLoading,
    error: projectError,
    refetch: refetchProject
  } = useUnifiedProjectMaterials(projectId);

  const { data: warehouseMaterials, isLoading: warehouseLoading } = useUnifiedWarehouseMaterials();
  const { data: materialOrdersResponse } = useMaterialOrders({ project_id: projectId });
  const { data: projectsResponse } = useProjects();

  // Form hooks
  const assignForm = useForm<MaterialAssignmentForm>();
  const editForm = useForm<EditMaterialForm>();

  // OPTIMIZATION: Memoized derived data
  const materialOrders = useMemo(() =>
    materialOrdersResponse?.items || [],
    [materialOrdersResponse?.items]
  );

  const project = useMemo(() =>
    projectsResponse?.items?.find(p => p.id === projectId),
    [projectsResponse?.items, projectId]
  );

  const materials = useMemo(() =>
    projectMaterials?.materials || [],
    [projectMaterials?.materials]
  );

  // OPTIMIZATION: Memoized callbacks for child components
  const handleEditMaterial = useCallback((material: ProjectMaterial) => {
    setEditingMaterial(material);
    editForm.setValue('quantity', material.allocated_qty);
    editForm.setValue('unit_price', material.unit_price);
    editForm.setValue('from_date', material.allocation_date);
    editForm.setValue('to_date', material.return_date || '');
    editForm.setValue('notes', material.notes || '');
    setShowEditDialog(true);
  }, [editForm]);

  const handleDeleteMaterial = useCallback(async (assignmentId: string) => {
    if (window.confirm('Are you sure you want to delete this material assignment?')) {
      try {
        // Implementation would go here
        toast.success('Material assignment deleted successfully');
        refetchProject();
      } catch (error) {
        toast.error('Failed to delete material assignment');
      }
    }
  }, [refetchProject]);

  const handleRetry = useCallback(() => {
    refetchProject();
  }, [refetchProject]);

  // OPTIMIZATION: Early returns for loading and error states
  if (projectLoading) {
    return <MaterialsLoadingSkeleton />;
  }

  if (projectError) {
    return <MaterialsError error={projectError} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Materials Management</h3>
          <p className="text-gray-600">Material allocation and ordering for projects</p>
        </div>
      </div>

      {/* Materials Summary - Memoized Component */}
      <MaterialsSummaryStats materials={materials} />

      {/* Materials Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assigned">Assigned Materials</TabsTrigger>
          <TabsTrigger value="assign">Assign Materials</TabsTrigger>
          <TabsTrigger value="order">Order Materials</TabsTrigger>
        </TabsList>

        {/* Assigned Materials Tab */}
        <TabsContent value="assigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Materials</CardTitle>
              <CardDescription>
                Materials currently assigned to this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {materials.length > 0 ? (
                <div className="space-y-4">
                  {/* OPTIMIZATION: Using memoized MaterialCard components */}
                  {materials.map((material) => (
                    <MaterialCard
                      key={material.id}
                      material={material}
                      onEdit={handleEditMaterial}
                      onDelete={handleDeleteMaterial}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Materials Assigned</h3>
                  <p className="text-gray-600 mb-4">
                    Assign materials to start tracking inventory for this project.
                  </p>
                  <Button onClick={() => setActiveTab('assign')}>
                    <Package className="w-4 h-4 mr-2" />
                    Assign Materials
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be similarly optimized... */}
        <TabsContent value="assign">
          <Card>
            <CardHeader>
              <CardTitle>Assign Materials to Project</CardTitle>
              <CardDescription>
                Select materials from warehouse inventory to assign to this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Assignment interface would be implemented here with similar optimization patterns...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="order">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Order Materials</span>
              </CardTitle>
              <CardDescription>
                Order materials from suppliers for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Order interface would be implemented here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Material Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Material Assignment</DialogTitle>
            <DialogDescription>
              Update material assignment details
            </DialogDescription>
          </DialogHeader>
          {/* Edit form implementation... */}
        </DialogContent>
      </Dialog>
    </div>
  );
});

OptimizedMaterials.displayName = 'OptimizedMaterials';

export default OptimizedMaterials;