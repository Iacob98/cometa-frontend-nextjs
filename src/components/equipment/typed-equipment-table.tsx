'use client';

/**
 * Typed Equipment Table Component
 * Date: 2025-10-23
 * Purpose: Display equipment with category-specific columns based on equipment category
 * Updated: Now accepts equipment data as props instead of fetching internally
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Equipment } from '@/hooks/use-equipment';

// Column configuration type
type ColumnType = 'text' | 'number' | 'date' | 'status' | 'boolean';

interface EquipmentColumnConfig {
  key: string;
  label: string;
  type: ColumnType;
  path?: string; // Path to nested property in type_details (e.g., 'type_details.power_watts')
}

// Column configurations for each category (German labels)
// Note: No paths needed - API returns flat structure from database views
const COLUMN_CONFIGS: Record<string, EquipmentColumnConfig[]> = {
  power_tool: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'inventory_no', label: 'Inventar-Nr.', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'power_watts', label: 'Leistung (W)', type: 'number' },
    { key: 'voltage_volts', label: 'Spannung (V)', type: 'number' },
    { key: 'battery_type', label: 'Batterie-Typ', type: 'text' },
    { key: 'ip_rating', label: 'IP-Schutzklasse', type: 'text' },
    { key: 'brand', label: 'Marke', type: 'text' },
    { key: 'model', label: 'Modell', type: 'text' },
  ],
  fusion_splicer: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'inventory_no', label: 'Inventar-Nr.', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'splice_count', label: 'Spleißzähler', type: 'number' },
    { key: 'last_calibration_date', label: 'Letzte Kalibrierung', type: 'date' },
    { key: 'next_calibration_due', label: 'Nächste Kalibrierung', type: 'date' },
    { key: 'avg_splice_loss_db', label: 'Ø Spleißverlust (dB)', type: 'number' },
    { key: 'firmware_version', label: 'Firmware', type: 'text' },
    { key: 'brand', label: 'Marke', type: 'text' },
    { key: 'model', label: 'Modell', type: 'text' },
  ],
  otdr: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'inventory_no', label: 'Inventar-Nr.', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'wavelength_nm', label: 'Wellenlänge (nm)', type: 'number' },
    { key: 'dynamic_range_db', label: 'Dynamikbereich (dB)', type: 'number' },
    { key: 'fiber_type', label: 'Fasertyp', type: 'text' },
    { key: 'connector_type', label: 'Stecker-Typ', type: 'text' },
    { key: 'last_calibration_date', label: 'Letzte Kalibrierung', type: 'date' },
    { key: 'brand', label: 'Marke', type: 'text' },
    { key: 'model', label: 'Modell', type: 'text' },
  ],
  safety_gear: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'inventory_no', label: 'Inventar-Nr.', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'size', label: 'Größe', type: 'text' },
    { key: 'certification', label: 'Zertifizierung', type: 'text' },
    { key: 'inspection_due_date', label: 'Nächste Inspektion', type: 'date' },
    { key: 'certification_expiry_date', label: 'Zertifikat läuft ab', type: 'date' },
  ],
  measuring_device: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'inventory_no', label: 'Inventar-Nr.', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'measurement_unit', label: 'Messeinheit', type: 'text' },
    { key: 'accuracy_rating', label: 'Genauigkeit', type: 'text' },
    { key: 'last_calibration_date', label: 'Letzte Kalibrierung', type: 'date' },
    { key: 'calibration_interval_months', label: 'Kalibrierintervall (Monate)', type: 'number' },
    { key: 'brand', label: 'Marke', type: 'text' },
    { key: 'model', label: 'Modell', type: 'text' },
  ],
  accessory: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'inventory_no', label: 'Inventar-Nr.', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'brand', label: 'Marke', type: 'text' },
    { key: 'model', label: 'Modell', type: 'text' },
    { key: 'serial_number', label: 'Seriennummer', type: 'text' },
  ],
  uncategorized: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'inventory_no', label: 'Inventar-Nr.', type: 'text' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'type', label: 'Typ', type: 'text' },
    { key: 'current_location', label: 'Standort', type: 'text' },
    { key: 'owned', label: 'Eigentum', type: 'boolean' },
  ],
};

interface TypedEquipmentTableProps {
  category: string;
  equipment: Equipment[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string, name: string) => void;
}

export function TypedEquipmentTable({
  category,
  equipment,
  onEdit,
  onDelete
}: TypedEquipmentTableProps) {
  const router = useRouter();
  const columns = COLUMN_CONFIGS[category] || COLUMN_CONFIGS.uncategorized;

  // Get nested value using path notation (e.g., 'type_details.power_watts')
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Render cell value based on column type
  const renderCellValue = (item: Equipment, column: EquipmentColumnConfig) => {
    // Get value from nested path or direct property
    const value = column.path
      ? getNestedValue(item, column.path)
      : (item as any)[column.key];

    if (value === null || value === undefined) return '—';

    switch (column.type) {
      case 'status':
        const statusColors: Record<string, string> = {
          available: 'bg-green-100 text-green-800',
          in_use: 'bg-blue-100 text-blue-800',
          maintenance: 'bg-yellow-100 text-yellow-800',
          broken: 'bg-red-100 text-red-800',
          out_of_service: 'bg-gray-100 text-gray-800',
          retired: 'bg-gray-100 text-gray-800',
        };
        const statusLabels: Record<string, string> = {
          available: 'Verfügbar',
          in_use: 'In Benutzung',
          maintenance: 'Wartung',
          broken: 'Defekt',
          out_of_service: 'Außer Betrieb',
          retired: 'Ausgemustert',
        };
        return (
          <Badge className={statusColors[value] || 'bg-gray-100'}>
            {statusLabels[value] || value}
          </Badge>
        );

      case 'date':
        try {
          return new Date(value).toLocaleDateString('de-DE');
        } catch {
          return value;
        }

      case 'boolean':
        return value ? 'Ja' : 'Nein';

      case 'number':
        return typeof value === 'number' ? value.toFixed(2) : value;

      default:
        return value;
    }
  };

  if (!equipment || equipment.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Keine Ausrüstung für diese Kategorie gefunden
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            <TableHead className="w-[100px]">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/50">
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {renderCellValue(item, column)}
                </TableCell>
              ))}
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit ? onEdit(item.id) : router.push(`/dashboard/equipment/${item.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete && onDelete(item.id, item.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
