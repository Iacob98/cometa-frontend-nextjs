/**
 * Enhanced Equipment Types
 * Date: 2025-10-19
 * Purpose: Types for new equipment management features (reservations, documents, usage, typed views)
 * Reference: database/migrations/001-006_*.sql
 */

import type { UUID } from './index';

// ========================================
// Equipment Reservations
// ========================================

export interface EquipmentReservation {
  id: UUID;
  equipment_id: UUID;
  project_id?: UUID;
  reserved_by_user_id?: UUID;
  reserved_from: string; // ISO timestamp
  reserved_until: string; // ISO timestamp
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Joined data
  equipment?: {
    id: UUID;
    name: string;
    type: string;
    inventory_no?: string;
    status: EquipmentStatus;
  };
  project?: {
    id: UUID;
    name: string;
  };
  reserved_by?: {
    id: UUID;
    first_name: string;
    last_name: string;
  };
}

export interface CreateEquipmentReservationRequest {
  equipment_id: UUID;
  project_id?: UUID;
  reserved_from: string;
  reserved_until: string;
  notes?: string;
}

export interface EquipmentReservationConflict {
  equipment_id: UUID;
  equipment_name: string;
  conflicting_reservations: Array<{
    id: UUID;
    project_name?: string;
    reserved_by: string;
    from: string;
    until: string;
  }>;
  message: string;
}

// ========================================
// Equipment Documents
// ========================================

export type EquipmentDocumentType =
  | 'warranty'
  | 'manual'
  | 'calibration'
  | 'inspection'
  | 'safety'
  | 'purchase'
  | 'other';

export interface EquipmentDocument {
  id: UUID;
  equipment_id: UUID;
  document_type: EquipmentDocumentType;
  document_name: string;
  file_path: string; // Supabase Storage path
  file_size_bytes?: number;
  mime_type?: string;
  issue_date?: string; // ISO date
  expiry_date?: string; // ISO date
  notes?: string;
  uploaded_by_user_id?: UUID;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Computed fields
  days_until_expiry?: number;
  is_expiring_soon?: boolean; // < 60 days
  is_expired?: boolean;

  // Joined data
  equipment?: {
    id: UUID;
    name: string;
    type: string;
  };
  uploaded_by?: {
    id: UUID;
    first_name: string;
    last_name: string;
  };
}

export interface UploadEquipmentDocumentRequest {
  equipment_id: UUID;
  document_type: EquipmentDocumentType;
  document_name: string;
  file: File;
  issue_date?: string;
  expiry_date?: string;
  notes?: string;
}

export interface ExpiringDocumentsFilter {
  days_ahead?: number; // Default 60
  document_type?: EquipmentDocumentType;
  equipment_type?: string;
}

// ========================================
// Equipment Usage Logs
// ========================================

export interface EquipmentUsageLog {
  id: UUID;
  equipment_id: UUID;
  assignment_id?: UUID;
  work_entry_id?: UUID;
  usage_date: string; // ISO date
  hours_used: number; // 0-24
  notes?: string;
  logged_by_user_id?: UUID;
  created_at: string;

  // Joined data
  equipment?: {
    id: UUID;
    name: string;
    type: string;
  };
  assignment?: {
    id: UUID;
    crew_id: UUID;
    crew_name?: string;
    project_id?: UUID;
    project_name?: string;
  };
  logged_by?: {
    id: UUID;
    first_name: string;
    last_name: string;
  };
}

export interface CreateUsageLogRequest {
  equipment_id: UUID;
  usage_date: string;
  hours_used: number;
  assignment_id?: UUID;
  work_entry_id?: UUID;
  notes?: string;
}

export interface UsageSummary {
  equipment_id: UUID;
  total_hours: number;
  total_days: number;
  avg_hours_per_day: number;
  max_hours_single_day: number;
  min_hours_single_day: number;
  from_date?: string;
  to_date?: string;
}

export interface ImportUsageLogsRequest {
  csv_data: string; // CSV format: equipment_id,usage_date,hours_used,notes
}

export interface ImportUsageLogsResponse {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

// ========================================
// Equipment Maintenance Schedules
// ========================================

export type MaintenanceScheduleType =
  | 'routine'
  | 'inspection'
  | 'calibration'
  | 'lubrication'
  | 'cleaning'
  | 'testing'
  | 'other';

export type MaintenanceIntervalType =
  | 'calendar'       // Days-based (e.g., every 180 days)
  | 'usage_hours'    // Hours-based (e.g., every 100 hours)
  | 'cycles';        // Usage cycles (e.g., every 1000 cycles)

export interface EquipmentMaintenanceSchedule {
  id: UUID;
  equipment_id: UUID;
  maintenance_type: MaintenanceScheduleType;
  interval_type: MaintenanceIntervalType;
  interval_value: number;
  last_performed_date?: string; // ISO date
  last_performed_hours?: number;
  next_due_date?: string; // ISO date
  next_due_hours?: number;
  description?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Computed fields
  is_overdue?: boolean;
  days_overdue?: number;
  hours_overdue?: number;
  days_until_due?: number;
  hours_until_due?: number;

  // Joined data
  equipment?: {
    id: UUID;
    name: string;
    type: string;
    total_usage_hours: number;
  };
}

export interface CreateMaintenanceScheduleRequest {
  equipment_id: UUID;
  maintenance_type: MaintenanceScheduleType;
  interval_type: MaintenanceIntervalType;
  interval_value: number;
  description?: string;
  notes?: string;
}

export interface OverdueMaintenanceItem {
  schedule_id: UUID;
  equipment_id: UUID;
  equipment_name: string;
  maintenance_type: MaintenanceScheduleType;
  next_due_date?: string;
  days_overdue?: number;
  next_due_hours?: number;
  current_hours: number;
  hours_overdue?: number;
}

export interface UpcomingMaintenanceItem {
  schedule_id: UUID;
  equipment_id: UUID;
  equipment_name: string;
  maintenance_type: MaintenanceScheduleType;
  next_due_date?: string;
  days_until_due?: number;
  next_due_hours?: number;
  current_hours: number;
  hours_until_due?: number;
}

// ========================================
// Equipment Type Details (Typed Attributes)
// ========================================

export interface EquipmentTypeDetails {
  id: UUID;
  equipment_id: UUID;

  // Power Tool attributes
  power_watts?: number;
  voltage_volts?: number;
  battery_type?: string;
  battery_capacity_ah?: number;
  ip_rating?: string; // e.g., IP65, IP67
  blade_size_mm?: number;
  rpm?: number;

  // Fusion Splicer attributes
  brand?: string;
  model?: string;
  firmware_version?: string;
  arc_calibration_date?: string; // ISO date
  avg_splice_loss_db?: number;
  splice_count?: number;
  electrode_replacement_date?: string; // ISO date

  // OTDR attributes
  wavelength_nm?: number; // e.g., 1310, 1550
  dynamic_range_db?: number;
  fiber_type?: string; // e.g., SM, MM
  connector_type?: string; // e.g., SC, LC, FC
  pulse_width_ns?: number;
  measurement_range_km?: number;

  // Safety Gear attributes
  size?: string; // e.g., S, M, L, XL
  certification?: string; // e.g., EN 397, ANSI Z89.1
  inspection_due_date?: string; // ISO date
  certification_expiry_date?: string; // ISO date
  manufacturer?: string;

  // Vehicle/Heavy Equipment attributes
  license_plate?: string;
  vin?: string;
  engine_hours?: number;
  fuel_type?: string; // diesel, petrol, electric, hybrid
  tank_capacity_liters?: number;
  load_capacity_kg?: number;

  // Measuring Equipment attributes
  accuracy_rating?: string;
  measurement_unit?: string;
  calibration_interval_months?: number;
  last_calibration_date?: string; // ISO date
  calibration_certificate_no?: string;

  // Common attributes
  serial_number?: string;
  purchase_price_eur?: number;
  depreciation_rate_percent?: number;
  residual_value_eur?: number;

  // Flexible custom fields
  custom_attributes?: Record<string, any>;

  created_at: string;
  updated_at: string;
}

export interface UpdateEquipmentTypeDetailsRequest {
  equipment_id: UUID;
  // Include all optional fields from EquipmentTypeDetails
  [key: string]: any;
}

// ========================================
// Typed View Definitions
// ========================================

export interface PowerToolView {
  id: UUID;
  name: string;
  type: string;
  inventory_no?: string;
  status: EquipmentStatus;
  current_location?: string;
  owned: boolean;
  rental_cost_per_day?: number;
  power_watts?: number;
  voltage_volts?: number;
  battery_type?: string;
  battery_capacity_ah?: number;
  ip_rating?: string;
  blade_size_mm?: number;
  rpm?: number;
  serial_number?: string;
  brand?: string;
  model?: string;
}

export interface FusionSplicerView {
  id: UUID;
  name: string;
  type: string;
  inventory_no?: string;
  status: EquipmentStatus;
  current_location?: string;
  brand?: string;
  model?: string;
  firmware_version?: string;
  arc_calibration_date?: string;
  avg_splice_loss_db?: number;
  splice_count?: number;
  electrode_replacement_date?: string;
  serial_number?: string;
  calibration_status?: 'never_calibrated' | 'calibration_overdue' | 'calibration_soon' | 'calibration_ok';
}

export interface OTDRView {
  id: UUID;
  name: string;
  type: string;
  inventory_no?: string;
  status: EquipmentStatus;
  current_location?: string;
  brand?: string;
  model?: string;
  wavelength_nm?: number;
  dynamic_range_db?: number;
  fiber_type?: string;
  connector_type?: string;
  pulse_width_ns?: number;
  measurement_range_km?: number;
  last_calibration_date?: string;
  calibration_certificate_no?: string;
  serial_number?: string;
  calibration_status?: 'never_calibrated' | 'calibration_overdue' | 'calibration_soon' | 'calibration_ok';
}

export interface SafetyGearView {
  id: UUID;
  name: string;
  type: string;
  inventory_no?: string;
  status: EquipmentStatus;
  current_location?: string;
  size?: string;
  certification?: string;
  inspection_due_date?: string;
  certification_expiry_date?: string;
  manufacturer?: string;
  serial_number?: string;
  compliance_status?: 'inspection_overdue' | 'inspection_soon' | 'certification_expired' | 'certification_expiring' | 'ok';
}

export type EquipmentTypedView = PowerToolView | FusionSplicerView | OTDRView | SafetyGearView;

export type EquipmentViewType = 'all' | 'power_tools' | 'fusion_splicers' | 'otdrs' | 'safety_gear' | 'custom';

// ========================================
// Equipment Status Types
// ========================================

export type EquipmentStatus =
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'broken'
  | 'retired';

// ========================================
// Analytics Types
// ========================================

export interface EquipmentAnalytics {
  overview: {
    totalHours: number;
    efficiencyScore: number;
    downtimeRate: number;
    revenueGenerated: number;
  };
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  utilization: Array<{
    name: string;
    hours: number;
    revenue: number;
    assignments: number;
  }>;
  assignments: {
    total: number;
    active: number;
    averageDailyCost: number;
    totalDailyRevenue: number;
    averageDuration: number;
  };
  equipment: {
    totalCount: number;
    byType: Record<string, { count: number; value: number }>;
    byStatus: Record<EquipmentStatus, number>;
  };
  maintenance: {
    totalCost: number;
    averageCostPerEquipment: number;
    upcomingCount: number;
    overdueCount: number;
  };
}

export interface AnalyticsTimeWindow {
  from: string; // ISO date
  to: string; // ISO date
  label: string; // e.g., "Last 7 days", "Last 30 days"
}

// ========================================
// Filter Types
// ========================================

export interface EquipmentReservationFilters {
  equipment_id?: UUID;
  project_id?: UUID;
  reserved_by_user_id?: UUID;
  active_only?: boolean;
  from_date?: string;
  to_date?: string;
}

export interface EquipmentDocumentFilters {
  equipment_id?: UUID;
  document_type?: EquipmentDocumentType;
  expiring_within_days?: number;
  expired_only?: boolean;
  active_only?: boolean;
}

export interface EquipmentUsageFilters {
  equipment_id?: UUID;
  assignment_id?: UUID;
  work_entry_id?: UUID;
  from_date?: string;
  to_date?: string;
  logged_by_user_id?: UUID;
}

export interface MaintenanceScheduleFilters {
  equipment_id?: UUID;
  maintenance_type?: MaintenanceScheduleType;
  overdue_only?: boolean;
  upcoming_within_days?: number;
  active_only?: boolean;
}

// ========================================
// Response Types
// ========================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface EquipmentAvailabilityCheck {
  equipment_id: UUID;
  is_available: boolean;
  reason?: string;
  conflicts?: Array<{
    type: 'assignment' | 'reservation' | 'maintenance';
    from: string;
    until?: string;
    details: string;
  }>;
}

// ========================================
// Typed Equipment Views
// ========================================

export type EquipmentViewType = 'all' | 'power_tools' | 'fusion_splicers' | 'otdrs' | 'safety_gear';

// Base equipment fields (common to all types)
export interface BaseEquipmentView {
  id: UUID;
  name: string;
  type: string;
  inventory_no?: string;
  status: EquipmentStatus;
  current_location?: string;
  owned: boolean;
  rental_cost_per_day?: number;
}

// Power Tools specific fields
export interface PowerToolView extends BaseEquipmentView {
  power_watts?: number;
  voltage_volts?: number;
  battery_type?: string;
  battery_capacity_ah?: number;
  ip_rating?: string;
  blade_size_mm?: number;
  rpm?: number;
  serial_number?: string;
  brand?: string;
  model?: string;
}

// Fusion Splicer specific fields
export interface FusionSplicerView extends BaseEquipmentView {
  calibration_date?: string;
  calibration_status?: string;
  splice_loss_db?: number;
  heating_time_seconds?: number;
  electrode_replacement_date?: string;
  cleaver_blade_replacement_date?: string;
  serial_number?: string;
  brand?: string;
  model?: string;
}

// OTDR specific fields
export interface OTDRView extends BaseEquipmentView {
  wavelength_nm?: number;
  dynamic_range_db?: number;
  dead_zone_meters?: number;
  fiber_type?: string;
  calibration_date?: string;
  calibration_status?: string;
  serial_number?: string;
  brand?: string;
  model?: string;
}

// Safety Gear specific fields
export interface SafetyGearView extends BaseEquipmentView {
  size?: string;
  certification?: string;
  certification_expiry?: string;
  last_inspection_date?: string;
  next_inspection_date?: string;
  defects_noted?: string;
}

export type TypedEquipmentView =
  | PowerToolView
  | FusionSplicerView
  | OTDRView
  | SafetyGearView;

// Column configuration for typed views
export interface EquipmentColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'status';
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
}
