import { z } from 'zod';

// Base equipment schema (common fields for all categories)
export const baseEquipmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  inventory_no: z.string().optional(),
  serial_number: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.number().optional(),
  ownership: z.enum(['owned', 'rented', 'leased']).optional(),
  location: z.string().optional(),
  status: z.enum(['available', 'in_use', 'maintenance', 'out_of_service', 'retired']).default('available'),
  notes: z.string().optional(),
});

// Power Tool category schema
export const powerToolDetailsSchema = z.object({
  power_watts: z.number().min(1, 'Power is required'),
  voltage_volts: z.number().optional(),
  battery_type: z.enum(['Li-ion', 'NiMH', 'NiCd', 'Corded']).optional(),
  rpm: z.number().optional(),
  ip_rating: z.string().optional(),
  weight_kg: z.number().optional(),
  tool_type: z.string().optional(),
  accessories_included: z.array(z.string()).optional(),
  inspection_interval_days: z.number().optional(),
  next_inspection_date: z.string().optional(),
});

export const powerToolSchema = baseEquipmentSchema.extend({
  category: z.literal('power_tool'),
  type_details: powerToolDetailsSchema,
});

// Fusion Splicer category schema
export const fusionSplicerDetailsSchema = z.object({
  splice_count: z.number().optional().default(0),
  last_calibration_date: z.string().min(1, 'Last calibration date is required'),
  next_calibration_due: z.string().optional(),
  firmware_version: z.string().optional(),
  arc_calibration_done: z.boolean().optional().default(false),
  core_alignment: z.boolean().optional().default(false),
  battery_health_percent: z.number().min(0).max(100).optional(),
  maintenance_interval_days: z.number().optional(),
});

export const fusionSplicerSchema = baseEquipmentSchema.extend({
  category: z.literal('fusion_splicer'),
  type_details: fusionSplicerDetailsSchema,
});

// OTDR category schema
export const otdrDetailsSchema = z.object({
  wavelengths_nm: z.array(z.number()).min(1, 'At least one wavelength is required'),
  dynamic_range_db: z.number().optional(),
  fiber_type: z.enum(['Singlemode', 'Multimode', 'OM3', 'OM4']).optional(),
  connector_type: z.enum(['SC', 'LC', 'FC', 'ST']).optional(),
  last_calibration_date: z.string().min(1, 'Calibration date is required'),
  calibration_interval_months: z.number().optional().default(12),
  firmware_version: z.string().optional(),
  gps_enabled: z.boolean().optional().default(false),
});

export const otdrSchema = baseEquipmentSchema.extend({
  category: z.literal('otdr'),
  type_details: otdrDetailsSchema,
});

// Safety Gear category schema
export const safetyGearDetailsSchema = z.object({
  size: z.string().optional(),
  certification: z.string().optional(),
  inspection_interval_months: z.number().optional(),
  next_inspection_date: z.string().min(1, 'Next inspection date is required'),
  expiration_date: z.string().optional(),
  assigned_user_id: z.string().uuid().optional(),
  color: z.string().optional(),
});

export const safetyGearSchema = baseEquipmentSchema.extend({
  category: z.literal('safety_gear'),
  type_details: safetyGearDetailsSchema,
});

// Vehicle category schema
export const vehicleEquipmentDetailsSchema = z.object({
  license_plate: z.string().min(1, 'License plate is required'),
  vin: z.string().optional(),
  mileage_km: z.number().optional(),
  fuel_type: z.enum(['Diesel', 'Gasoline', 'Electric', 'Hybrid']).optional(),
  emission_class: z.string().optional(),
  service_interval_km: z.number().optional(),
  insurance_expiry: z.string().optional(),
  inspection_date: z.string().optional(),
  gps_tracker_id: z.string().optional(),
});

export const vehicleEquipmentSchema = baseEquipmentSchema.extend({
  category: z.literal('vehicle'),
  type_details: vehicleEquipmentDetailsSchema,
});

// Measuring Device category schema
export const measuringDeviceDetailsSchema = z.object({
  measurement_type: z.enum(['Length', 'Voltage', 'Temperature', 'Current', 'Other']).optional(),
  range_text: z.string().optional(),
  accuracy_rating: z.string().optional(),
  last_calibration_date: z.string().min(1, 'Calibration date is required'),
  calibration_interval_months: z.number().optional().default(12),
  battery_type: z.string().optional(),
});

export const measuringDeviceSchema = baseEquipmentSchema.extend({
  category: z.literal('measuring_device'),
  type_details: measuringDeviceDetailsSchema,
});

// Accessory category schema
export const accessoryDetailsSchema = z.object({
  compatible_models: z.array(z.string()).optional(),
  part_number: z.string().optional(),
  quantity_in_set: z.number().optional(),
  replacement_cycle_months: z.number().optional(),
});

export const accessorySchema = baseEquipmentSchema.extend({
  category: z.literal('accessory'),
  type_details: accessoryDetailsSchema,
});

// Union schema for all categories
export const createEquipmentSchema = z.discriminatedUnion('category', [
  powerToolSchema,
  fusionSplicerSchema,
  otdrSchema,
  safetyGearSchema,
  vehicleEquipmentSchema,
  measuringDeviceSchema,
  accessorySchema,
]);

// Type inference from schemas
export type CreatePowerToolInput = z.infer<typeof powerToolSchema>;
export type CreateFusionSplicerInput = z.infer<typeof fusionSplicerSchema>;
export type CreateOTDRInput = z.infer<typeof otdrSchema>;
export type CreateSafetyGearInput = z.infer<typeof safetyGearSchema>;
export type CreateVehicleEquipmentInput = z.infer<typeof vehicleEquipmentSchema>;
export type CreateMeasuringDeviceInput = z.infer<typeof measuringDeviceSchema>;
export type CreateAccessoryInput = z.infer<typeof accessorySchema>;
export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;

// Helper function to compute auto-filled dates
export function computeNextCalibrationDate(
  calibrationDate: string,
  intervalDays: number = 365
): string {
  const date = new Date(calibrationDate);
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString().split('T')[0];
}

export function computeNextInspectionDate(
  baseDate: string,
  intervalDays: number
): string {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString().split('T')[0];
}

// Category configuration for form rendering
export const categoryConfig = {
  power_tool: {
    label: 'Power Tool',
    description: 'Drills, grinders, saws, compressors, etc.',
    icon: 'Wrench',
    requiredFields: ['power_watts'],
  },
  fusion_splicer: {
    label: 'Fusion Splicer',
    description: 'Fiber optic welding and splicing equipment',
    icon: 'Cable',
    requiredFields: ['last_calibration_date'],
    badge: 'Calibration Required',
  },
  otdr: {
    label: 'OTDR',
    description: 'Optical Time Domain Reflectometer',
    icon: 'Radio',
    requiredFields: ['wavelengths_nm', 'calibration_date'],
  },
  safety_gear: {
    label: 'Safety Gear',
    description: 'Helmets, harnesses, gloves, reflective vests',
    icon: 'Shield',
    requiredFields: ['next_inspection_date'],
  },
  vehicle: {
    label: 'Vehicle / Transport',
    description: 'Company vans, trailers, lifts',
    icon: 'Truck',
    requiredFields: ['license_plate'],
  },
  measuring_device: {
    label: 'Measuring Device',
    description: 'Laser meters, multimeters, thermometers',
    icon: 'Ruler',
    requiredFields: ['calibration_date'],
  },
  accessory: {
    label: 'Accessory / Component',
    description: 'Cases, batteries, cables, replacement parts',
    icon: 'Package',
    requiredFields: [],
  },
} as const;
