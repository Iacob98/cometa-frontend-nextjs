/**
 * COMETA Worker App - TypeScript Type Definitions
 *
 * Этот файл содержит все TypeScript интерфейсы для работы с ресурсами COMETA.
 * Скопируйте необходимые типы в ваш worker app.
 *
 * @version 1.0
 * @date 2025-11-10
 */

// ==============================================
// БАЗОВЫЕ ТИПЫ
// ==============================================

export type UUID = string;

// Статусы оборудования
export type EquipmentStatus =
  | 'available'
  | 'issued_to_brigade'
  | 'assigned_to_project'
  | 'maintenance'
  | 'retired'
  | 'lost';

// Категории оборудования
export type EquipmentCategory =
  | 'power_tool'
  | 'hand_tool'
  | 'measuring'
  | 'safety_gear'
  | 'consumable'
  | 'vehicle'
  | 'other';

// Статусы транспорта
export type VehicleStatus =
  | 'available'
  | 'in_use'
  | 'maintenance'
  | 'out_of_service';

// Статусы материалов
export type MaterialAllocationStatus =
  | 'allocated'
  | 'partially_used'
  | 'fully_used'
  | 'returned'
  | 'lost';

// Тип собственности
export type OwnershipType =
  | 'owned'
  | 'rented'
  | 'leased';

// ==============================================
// ОБОРУДОВАНИЕ (EQUIPMENT)
// ==============================================

/**
 * Оборудование - основная информация
 */
export interface Equipment {
  id: UUID;
  name: string;
  type?: string;
  category?: EquipmentCategory;
  inventory_no?: string;
  status: EquipmentStatus;
  rental_cost_per_day?: number;
  purchase_date?: string;
  warranty_until?: string;
  description?: string;
  notes?: string;
  owned: boolean;
  current_location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_usage_hours?: number;
  serial_number?: string;
  supplier_name?: string;
  daily_rate?: number;
  warranty_expiry_date?: string;
  unit_type?: 'serial' | 'qty';
  quantity?: number;
  available_quantity?: number;
  owner_type?: 'warehouse' | 'brigade' | 'project' | 'maintenance';
  owner_id?: UUID;
}

/**
 * Назначение оборудования на бригаду/проект
 */
export interface EquipmentAssignment {
  id: UUID;
  equipment_id: UUID;
  project_id?: UUID;
  crew_id: UUID;
  from_ts: string; // ISO timestamp
  to_ts?: string | null; // ISO timestamp, null = активное
  is_permanent: boolean;
  rental_cost_per_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Связанные данные (при join)
  equipment?: Equipment;
  crew?: Crew;
  project?: Project;
}

/**
 * Назначение оборудования с расчетами (из API)
 */
export interface EquipmentAssignmentWithDetails extends EquipmentAssignment {
  // Дополнительные поля от API
  assignment_source: 'crew_based' | 'direct';
  days?: number; // Количество дней назначения
  daily_rate?: number;
  total_cost?: number; // Рассчитанная стоимость
  period?: string; // Форматированный период
}

// ==============================================
// ТРАНСПОРТ (VEHICLES)
// ==============================================

/**
 * Транспорт - основная информация
 */
export interface Vehicle {
  id: UUID;
  make: string; // Производитель (Mercedes-Benz, Ford, etc.)
  model: string; // Модель (Sprinter, Transit, etc.)
  year?: number;
  license_plate: string; // Номерной знак
  vin?: string; // VIN номер
  status: VehicleStatus;
  current_location?: string;
  owned: boolean;
  rental_cost_per_day?: number;
  fuel_type?: string; // diesel, gasoline, electric, hybrid
  mileage?: number; // Пробег в км
  insurance_expiry?: string; // ISO date
  next_service_date?: string; // ISO date
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Назначение транспорта на бригаду/проект
 */
export interface VehicleAssignment {
  id: UUID;
  vehicle_id: UUID;
  project_id?: UUID;
  crew_id: UUID;
  from_ts: string;
  to_ts?: string | null;
  is_permanent: boolean;
  rental_cost_per_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Связанные данные
  vehicle?: Vehicle;
  crew?: Crew;
  project?: Project;
}

/**
 * Назначение транспорта с расчетами
 */
export interface VehicleAssignmentWithDetails extends VehicleAssignment {
  days?: number;
  total_cost?: number;
  period?: string;
}

// ==============================================
// МАТЕРИАЛЫ (MATERIALS)
// ==============================================

/**
 * Материал - основная информация
 */
export interface Material {
  id: UUID;
  name: string;
  category: string;
  unit: string; // m, kg, pcs, etc.
  unit_price_eur: number;
  current_stock: number;
  reserved_stock: number;
  min_stock_level?: number;
  supplier_id?: UUID;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Выделение материала на проект/бригаду
 */
export interface MaterialAllocation {
  id: UUID;
  material_id: UUID;
  project_id?: UUID;
  crew_id?: UUID;
  quantity_allocated: number;
  quantity_used: number;
  quantity_remaining: number; // Вычисляемое: allocated - used
  status: MaterialAllocationStatus;
  allocated_date: string; // ISO date
  allocated_by: UUID;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Связанные данные
  material?: Material;
  project?: Project;
  crew?: Crew;
  allocated_by_user?: User;
}

/**
 * Выделение материала с расчетами
 */
export interface MaterialAllocationWithDetails extends MaterialAllocation {
  total_value?: number; // quantity_allocated * unit_price_eur
  material_name?: string;
  material_category?: string;
  project_name?: string;
  allocator_name?: string;
}

// ==============================================
// БРИГАДЫ И ПРОЕКТЫ
// ==============================================

/**
 * Бригада (команда работников)
 */
export interface Crew {
  id: UUID;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  leader_user_id?: UUID;
  project_id?: UUID;
  created_at: string;
  updated_at: string;

  // Связанные данные
  leader?: User;
  project?: Project;
  members?: CrewMember[];
}

/**
 * Член бригады
 */
export interface CrewMember {
  id: UUID;
  crew_id: UUID;
  user_id: UUID;
  role: 'member' | 'leader';
  is_active: boolean;
  joined_at: string;

  // Связанные данные
  user?: User;
}

/**
 * Проект
 */
export interface Project {
  id: UUID;
  name: string;
  status: 'draft' | 'planning' | 'active' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  city?: string;
  address?: string;
  total_length_m?: number;
  base_rate_per_m?: number;
  pm_user_id?: UUID;
  created_at: string;
  updated_at: string;

  // Связанные данные
  pm?: User;
  crews?: Crew[];
}

/**
 * Пользователь
 */
export interface User {
  id: UUID;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'pm' | 'foreman' | 'crew' | 'viewer' | 'worker';
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ==============================================
// АГРЕГИРОВАННЫЕ ОТВЕТЫ API
// ==============================================

/**
 * Комплексный ответ - все ресурсы проекта
 */
export interface ProjectResourcesResponse {
  equipment: EquipmentAssignmentWithDetails[];
  vehicles: VehicleAssignmentWithDetails[];
  materials: MaterialAllocationWithDetails[];
  summary: {
    total_resources: number;
    total_vehicles: number;
    total_equipment: number;
    total_cost: number;
  };
}

/**
 * Пагинированный ответ для материалов
 */
export interface MaterialAllocationsResponse {
  allocations: MaterialAllocationWithDetails[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  summary: {
    total_allocations: number;
    total_value: number;
    total_allocated: number;
    total_used: number;
    total_remaining: number;
  };
}

/**
 * Ресурсы бригады (комплексный ответ)
 */
export interface CrewResourcesResponse {
  equipment: EquipmentAssignment[];
  vehicles: VehicleAssignment[];
  materials: MaterialAllocation[];
  summary?: {
    total_equipment: number;
    total_vehicles: number;
    total_materials: number;
  };
}

// ==============================================
// REQUEST TYPES (для создания/обновления)
// ==============================================

/**
 * Создание назначения оборудования
 */
export interface CreateEquipmentAssignmentRequest {
  equipment_id: UUID;
  crew_id: UUID;
  project_id?: UUID;
  from_ts: string; // ISO timestamp
  to_ts?: string; // ISO timestamp, опционально
  is_permanent: boolean;
  rental_cost_per_day: number;
}

/**
 * Обновление назначения оборудования
 */
export interface UpdateEquipmentAssignmentRequest {
  assignment_id: UUID;
  is_active: boolean; // false = завершить назначение
  to_ts?: string; // Опционально установить дату окончания
}

/**
 * Создание назначения транспорта
 */
export interface CreateVehicleAssignmentRequest {
  vehicle_id: UUID;
  crew_id: UUID;
  project_id?: UUID;
  from_ts: string;
  to_ts?: string;
  is_permanent: boolean;
  rental_cost_per_day: number;
}

/**
 * Создание выделения материала
 */
export interface CreateMaterialAllocationRequest {
  material_id: UUID;
  project_id: UUID;
  crew_id?: UUID; // Опционально - на конкретную бригаду
  quantity_allocated: number;
  allocated_by: UUID;
  allocated_date: string; // ISO date
  status?: MaterialAllocationStatus; // По умолчанию 'allocated'
  notes?: string;
}

/**
 * Обновление выделения материала
 */
export interface UpdateMaterialAllocationRequest {
  id: UUID;
  quantity_used?: number; // Обновить использованное количество
  status?: MaterialAllocationStatus;
  notes?: string;
}

// ==============================================
// FILTER TYPES (для запросов)
// ==============================================

/**
 * Фильтры для запроса назначений оборудования
 */
export interface EquipmentAssignmentFilters {
  equipment_id?: UUID;
  crew_id?: UUID;
  project_id?: UUID;
  active_only?: boolean;
}

/**
 * Фильтры для запроса назначений транспорта
 */
export interface VehicleAssignmentFilters {
  vehicle_id?: UUID;
  crew_id?: UUID;
  project_id?: UUID;
  active_only?: boolean;
}

/**
 * Фильтры для запроса выделений материалов
 */
export interface MaterialAllocationFilters {
  material_id?: UUID;
  project_id?: UUID;
  crew_id?: UUID;
  status?: MaterialAllocationStatus;
  page?: number;
  per_page?: number;
}

// ==============================================
// UTILITY TYPES
// ==============================================

/**
 * Стандартный ответ об ошибке
 */
export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
  timestamp?: string;
}

/**
 * Стандартный успешный ответ
 */
export interface SuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// ==============================================
// ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
// ==============================================

/*
// 1. Получить оборудование бригады
const equipmentAssignments: EquipmentAssignment[] = await supabase
  .from('equipment_assignments')
  .select('*, equipment(*), crew(*)')
  .eq('crew_id', crewId)
  .eq('is_active', true)

// 2. Создать назначение оборудования
const newAssignment: CreateEquipmentAssignmentRequest = {
  equipment_id: '...',
  crew_id: '...',
  from_ts: new Date().toISOString(),
  is_permanent: false,
  rental_cost_per_day: 50.00
}

const response = await fetch('/api/resources/equipment-assignments', {
  method: 'POST',
  body: JSON.stringify(newAssignment)
})

// 3. Получить все ресурсы проекта
const projectResources: ProjectResourcesResponse = await fetch(
  `/api/projects/${projectId}/resources`
).then(r => r.json())

// 4. Типизированный hook
function useCrewResources(crewId: UUID) {
  return useQuery<CrewResourcesResponse>({
    queryKey: ['crew-resources', crewId],
    queryFn: async () => {
      const response = await fetch(`/api/crew/${crewId}/resources`)
      return response.json()
    }
  })
}
*/

// ==============================================
// EXPORT ALL
// ==============================================

export type {
  // Базовые типы
  EquipmentStatus,
  EquipmentCategory,
  VehicleStatus,
  MaterialAllocationStatus,
  OwnershipType,

  // Основные сущности
  Equipment,
  EquipmentAssignment,
  EquipmentAssignmentWithDetails,
  Vehicle,
  VehicleAssignment,
  VehicleAssignmentWithDetails,
  Material,
  MaterialAllocation,
  MaterialAllocationWithDetails,
  Crew,
  CrewMember,
  Project,
  User,

  // Ответы API
  ProjectResourcesResponse,
  MaterialAllocationsResponse,
  CrewResourcesResponse,

  // Request типы
  CreateEquipmentAssignmentRequest,
  UpdateEquipmentAssignmentRequest,
  CreateVehicleAssignmentRequest,
  CreateMaterialAllocationRequest,
  UpdateMaterialAllocationRequest,

  // Фильтры
  EquipmentAssignmentFilters,
  VehicleAssignmentFilters,
  MaterialAllocationFilters,

  // Utility
  ErrorResponse,
  SuccessResponse,
};
