/**
 * VIRTUALIZED MATERIAL LIST COMPONENT
 *
 * Специализированный виртуализированный список для отображения материалов
 * Оптимизирован для больших списков материалов и инвентаря
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { VirtualizedList, VirtualizedListItem } from '@/components/ui/virtualized-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Package, Barcode, Warehouse, Euro, Calendar, AlertTriangle, CheckCircle, Clock, Settings } from 'lucide-react';

export interface Material {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  unit: string;
  unit_price: number;
  quantity_in_stock: number;
  reserved_quantity?: number;
  minimum_stock_level?: number;
  supplier?: string;
  location?: string;
  status: 'available' | 'low-stock' | 'out-of-stock' | 'discontinued';
  last_updated: string;
  expiry_date?: string;
  batch_number?: string;
  tags?: string[];
}

interface VirtualizedMaterialListProps {
  materials: Material[];
  height: number;
  loading?: boolean;
  onMaterialClick?: (material: Material) => void;
  onMaterialSelect?: (material: Material, selected: boolean) => void;
  selectedMaterialIds?: Set<string>;
  searchable?: boolean;
  showActions?: boolean;
  onEditMaterial?: (material: Material) => void;
  onDeleteMaterial?: (material: Material) => void;
  onOrderMaterial?: (material: Material) => void;
  emptyMessage?: string;
  className?: string;
}

// OPTIMIZATION: Status configuration memoized
const MATERIAL_STATUS_CONFIG = {
  available: { label: 'Available', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  'low-stock': { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  'out-of-stock': { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  discontinued: { label: 'Discontinued', color: 'bg-gray-100 text-gray-800', icon: Clock },
} as const;

// OPTIMIZATION: Memoized material card renderer
const MaterialCardRenderer = React.memo<{
  material: Material;
  index: number;
  onEditMaterial?: (material: Material) => void;
  onDeleteMaterial?: (material: Material) => void;
  onOrderMaterial?: (material: Material) => void;
  showActions?: boolean;
}>(({ material, index, onEditMaterial, onDeleteMaterial, onOrderMaterial, showActions = true }) => {
  // OPTIMIZATION: Memoized callbacks
  const handleEdit = useCallback(() => {
    onEditMaterial?.(material);
  }, [material, onEditMaterial]);

  const handleDelete = useCallback(() => {
    onDeleteMaterial?.(material);
  }, [material, onDeleteMaterial]);

  const handleOrder = useCallback(() => {
    onOrderMaterial?.(material);
  }, [material, onOrderMaterial]);

  // OPTIMIZATION: Memoized status config
  const statusConfig = useMemo(() =>
    MATERIAL_STATUS_CONFIG[material.status] || {
      label: material.status,
      color: 'bg-gray-100 text-gray-800',
      icon: Package
    },
    [material.status]
  );

  // OPTIMIZATION: Memoized stock calculations
  const stockInfo = useMemo(() => {
    const availableQuantity = material.quantity_in_stock - (material.reserved_quantity || 0);
    const stockPercentage = material.minimum_stock_level
      ? Math.min((material.quantity_in_stock / material.minimum_stock_level) * 100, 100)
      : 100;

    const isLowStock = material.minimum_stock_level
      ? material.quantity_in_stock <= material.minimum_stock_level
      : false;

    const totalValue = material.quantity_in_stock * material.unit_price;

    return {
      availableQuantity,
      stockPercentage,
      isLowStock,
      totalValue,
      isExpiring: material.expiry_date
        ? new Date(material.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : false,
    };
  }, [material.quantity_in_stock, material.reserved_quantity, material.minimum_stock_level, material.unit_price, material.expiry_date]);

  const StatusIcon = statusConfig.icon;

  return (
    <Card className={`border-l-4 ${stockInfo.isLowStock ? 'border-l-yellow-500' : 'border-l-green-500'} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {material.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1 flex items-center">
              <Barcode className="w-3 h-3 mr-1" />
              SKU: {material.sku}
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
            <Badge variant="outline">
              {material.category}
            </Badge>
          </div>
        </div>

        {material.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {material.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stock Information */}
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Package className="w-4 h-4 mr-2 text-blue-500" />
              <span className="text-gray-600">In Stock: </span>
              <span className={`font-semibold ml-1 ${stockInfo.isLowStock ? 'text-yellow-600' : 'text-green-600'}`}>
                {material.quantity_in_stock} {material.unit}
              </span>
            </div>

            {material.reserved_quantity && material.reserved_quantity > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>Reserved: {material.reserved_quantity} {material.unit}</span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Available: {stockInfo.availableQuantity} {material.unit}</span>
            </div>

            {material.minimum_stock_level && (
              <div className="flex items-center text-sm text-gray-600">
                <AlertTriangle className="w-4 h-4 mr-2" />
                <span>Min Level: {material.minimum_stock_level} {material.unit}</span>
              </div>
            )}
          </div>

          {/* Financial and Location Info */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Euro className="w-4 h-4 mr-2" />
              <span>Unit Price: €{material.unit_price.toFixed(2)}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Euro className="w-4 h-4 mr-2" />
              <span>Total Value: €{stockInfo.totalValue.toLocaleString()}</span>
            </div>

            {material.location && (
              <div className="flex items-center text-sm text-gray-600">
                <Warehouse className="w-4 h-4 mr-2" />
                <span className="truncate">Location: {material.location}</span>
              </div>
            )}

            {material.supplier && (
              <div className="flex items-center text-sm text-gray-600">
                <Package className="w-4 h-4 mr-2" />
                <span className="truncate">Supplier: {material.supplier}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stock Level Progress */}
        {material.minimum_stock_level && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Stock Level</span>
              <span className={stockInfo.isLowStock ? 'text-yellow-600 font-semibold' : ''}>
                {stockInfo.stockPercentage.toFixed(1)}% of minimum
              </span>
            </div>
            <Progress
              value={Math.min(stockInfo.stockPercentage, 100)}
              className={`h-2 ${stockInfo.isLowStock ? 'bg-yellow-100' : ''}`}
            />
            {stockInfo.isLowStock && (
              <p className="text-xs text-yellow-600 mt-1">
                Stock is below minimum level - consider reordering
              </p>
            )}
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Updated: {new Date(material.last_updated).toLocaleDateString()}</span>
          </div>

          {material.expiry_date && (
            <div className="flex items-center text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              <span className={stockInfo.isExpiring ? 'text-red-600 font-semibold' : 'text-gray-500'}>
                Expires: {new Date(material.expiry_date).toLocaleDateString()}
                {stockInfo.isExpiring && ' (Soon!)'}
              </span>
            </div>
          )}

          {material.batch_number && (
            <div className="flex items-center text-xs text-gray-500">
              <Barcode className="w-3 h-3 mr-1" />
              <span>Batch: {material.batch_number}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {material.tags && material.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {material.tags.slice(0, 3).map((tag, tagIndex) => (
              <Badge key={tagIndex} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {material.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{material.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex justify-end space-x-2 mt-4">
            {stockInfo.isLowStock && (
              <Button
                size="sm"
                variant="default"
                onClick={handleOrder}
                className="text-xs bg-yellow-600 hover:bg-yellow-700"
              >
                <Package className="w-3 h-3 mr-1" />
                Order
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleEdit}
              className="text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="text-xs"
            >
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

MaterialCardRenderer.displayName = 'MaterialCardRenderer';

// OPTIMIZATION: Main virtualized material list component
export const VirtualizedMaterialList = React.memo<VirtualizedMaterialListProps>(({
  materials,
  height,
  loading = false,
  onMaterialClick,
  onMaterialSelect,
  selectedMaterialIds,
  searchable = true,
  showActions = true,
  onEditMaterial,
  onDeleteMaterial,
  onOrderMaterial,
  emptyMessage = 'No materials found',
  className = ''
}) => {
  // OPTIMIZATION: Transform materials to VirtualizedListItem format
  const listItems = useMemo<VirtualizedListItem[]>(() =>
    materials.map(material => ({
      id: material.id,
      title: material.name,
      subtitle: `SKU: ${material.sku} | Category: ${material.category}`,
      status: material.status,
      description: material.description,
      metadata: {
        material,
        priority: material.status === 'out-of-stock' ? 'high' :
                 material.status === 'low-stock' ? 'medium' : 'low',
        actions: showActions ? [
          {
            label: 'Edit',
            onClick: () => onEditMaterial?.(material),
          },
          {
            label: 'Delete',
            onClick: () => onDeleteMaterial?.(material),
          },
          ...(material.status === 'low-stock' || material.status === 'out-of-stock' ? [{
            label: 'Order',
            onClick: () => onOrderMaterial?.(material),
          }] : []),
        ] : undefined,
      },
    })),
    [materials, showActions, onEditMaterial, onDeleteMaterial, onOrderMaterial]
  );

  // OPTIMIZATION: Memoized custom item renderer
  const renderMaterialItem = useCallback((item: VirtualizedListItem, index: number) => {
    const material = item.metadata.material as Material;
    return (
      <MaterialCardRenderer
        material={material}
        index={index}
        onEditMaterial={onEditMaterial}
        onDeleteMaterial={onDeleteMaterial}
        onOrderMaterial={onOrderMaterial}
        showActions={showActions}
      />
    );
  }, [onEditMaterial, onDeleteMaterial, onOrderMaterial, showActions]);

  // OPTIMIZATION: Memoized click handler
  const handleItemClick = useCallback((item: VirtualizedListItem) => {
    const material = item.metadata.material as Material;
    onMaterialClick?.(material);
  }, [onMaterialClick]);

  // OPTIMIZATION: Memoized select handler
  const handleItemSelect = useCallback((item: VirtualizedListItem, selected: boolean) => {
    const material = item.metadata.material as Material;
    onMaterialSelect?.(material, selected);
  }, [onMaterialSelect]);

  return (
    <VirtualizedList
      items={listItems}
      height={height}
      itemHeight={320} // Increased height for rich material content
      onItemClick={handleItemClick}
      onItemSelect={handleItemSelect}
      selectedIds={selectedMaterialIds}
      searchable={searchable}
      searchPlaceholder="Search materials by name, SKU, category, supplier, or description..."
      renderCustomItem={renderMaterialItem}
      emptyMessage={emptyMessage}
      loading={loading}
      className={className}
    />
  );
});

VirtualizedMaterialList.displayName = 'VirtualizedMaterialList';

export default VirtualizedMaterialList;