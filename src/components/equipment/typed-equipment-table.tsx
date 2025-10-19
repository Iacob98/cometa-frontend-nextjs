'use client';

/**
 * Typed Equipment Table Component
 * Date: 2025-10-19
 * Purpose: Display equipment with type-specific columns based on selected view type
 */

import { useState } from 'react';
import { useTypedEquipmentView } from '@/hooks/use-typed-equipment-views';
import type { EquipmentViewType, TypedEquipmentView, EquipmentColumnConfig } from '@/types/equipment-enhanced';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';

// Column configurations for each view type
const COLUMN_CONFIGS: Record<Exclude<EquipmentViewType, 'all'>, EquipmentColumnConfig[]> = {
  power_tools: [
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'inventory_no', label: 'Inventory #', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'power_watts', label: 'Power (W)', type: 'number', sortable: true },
    { key: 'voltage_volts', label: 'Voltage (V)', type: 'number', sortable: true },
    { key: 'battery_type', label: 'Battery Type', type: 'text' },
    { key: 'battery_capacity_ah', label: 'Battery (Ah)', type: 'number' },
    { key: 'ip_rating', label: 'IP Rating', type: 'text' },
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
  ],
  fusion_splicers: [
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'inventory_no', label: 'Inventory #', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'calibration_date', label: 'Calibration Date', type: 'date', sortable: true },
    { key: 'calibration_status', label: 'Cal. Status', type: 'text' },
    { key: 'splice_loss_db', label: 'Splice Loss (dB)', type: 'number' },
    { key: 'heating_time_seconds', label: 'Heating Time (s)', type: 'number' },
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
  ],
  otdrs: [
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'inventory_no', label: 'Inventory #', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'wavelength_nm', label: 'Wavelength (nm)', type: 'number', sortable: true },
    { key: 'dynamic_range_db', label: 'Dynamic Range (dB)', type: 'number' },
    { key: 'dead_zone_meters', label: 'Dead Zone (m)', type: 'number' },
    { key: 'fiber_type', label: 'Fiber Type', type: 'text' },
    { key: 'calibration_date', label: 'Calibration Date', type: 'date', sortable: true },
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'model', label: 'Model', type: 'text' },
  ],
  safety_gear: [
    { key: 'name', label: 'Name', type: 'text', sortable: true },
    { key: 'inventory_no', label: 'Inventory #', type: 'text', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true },
    { key: 'size', label: 'Size', type: 'text' },
    { key: 'certification', label: 'Certification', type: 'text' },
    { key: 'certification_expiry', label: 'Cert. Expiry', type: 'date', sortable: true },
    { key: 'last_inspection_date', label: 'Last Inspection', type: 'date', sortable: true },
    { key: 'next_inspection_date', label: 'Next Inspection', type: 'date', sortable: true },
    { key: 'defects_noted', label: 'Defects', type: 'text' },
  ],
};

interface TypedEquipmentTableProps {
  initialViewType?: Exclude<EquipmentViewType, 'all'>;
}

export function TypedEquipmentTable({ initialViewType = 'power_tools' }: TypedEquipmentTableProps) {
  const [viewType, setViewType] = useState<Exclude<EquipmentViewType, 'all'>>(initialViewType);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Fetch data for selected view type
  const { data, isLoading, error } = useTypedEquipmentView(viewType, {
    search,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    per_page: 20,
  });

  const columns = COLUMN_CONFIGS[viewType];

  // Render cell value based on column type
  const renderCellValue = (item: TypedEquipmentView, column: EquipmentColumnConfig) => {
    const value = (item as any)[column.key];

    if (value === null || value === undefined) return '-';

    switch (column.type) {
      case 'status':
        const statusColors: Record<string, string> = {
          available: 'bg-green-100 text-green-800',
          assigned: 'bg-blue-100 text-blue-800',
          maintenance: 'bg-yellow-100 text-yellow-800',
          damaged: 'bg-red-100 text-red-800',
          retired: 'bg-gray-100 text-gray-800',
        };
        return (
          <Badge className={statusColors[value] || 'bg-gray-100'}>
            {value}
          </Badge>
        );

      case 'date':
        return new Date(value).toLocaleDateString();

      case 'boolean':
        return value ? 'Yes' : 'No';

      case 'number':
        return typeof value === 'number' ? value.toFixed(2) : value;

      default:
        return value;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-end">
        {/* View Type Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Equipment Type</label>
          <Select value={viewType} onValueChange={(v) => setViewType(v as Exclude<EquipmentViewType, 'all'>)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="power_tools">Power Tools</SelectItem>
              <SelectItem value="fusion_splicers">Fusion Splicers</SelectItem>
              <SelectItem value="otdrs">OTDRs</SelectItem>
              <SelectItem value="safety_gear">Safety Gear</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Status</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search name, inventory, brand..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          Error loading equipment: {error.message}
        </div>
      ) : !data?.items?.length ? (
        <div className="text-center py-12 text-gray-500">
          No equipment found for this type
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {renderCellValue(item, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, data.total)} of {data.total} items
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                  disabled={page >= data.total_pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
