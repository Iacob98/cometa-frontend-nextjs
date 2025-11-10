# Worker App Integration Guide - COMETA Resources API

Полное руководство по интеграции worker приложения (Next.js) с системой управления ресурсами COMETA.

## Обзор

Worker приложение использует **ту же базу данных Supabase**, что и основное приложение COMETA. Доступ к данным осуществляется через:
- **Прямые запросы к Supabase** (рекомендуется для простых запросов)
- **REST API эндпоинты** основного приложения (для сложной бизнес-логики)

## 1. Настройка окружения

### Переменные `.env`

```bash
# Supabase Connection (та же БД что и COMETA)
NEXT_PUBLIC_SUPABASE_URL=https://oijmohlhdxoawzvctnxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Для server-side

# PostgreSQL Direct (опционально - для сложных запросов)
DATABASE_URL=postgresql://postgres.oijmohlhdxoawzvctnxx:[password]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres
PGHOST=aws-1-eu-north-1.pooler.supabase.com
PGPORT=6543
PGDATABASE=postgres
PGUSER=postgres.oijmohlhdxoawzvctnxx
PGPASSWORD=[your_password]

# URL основного COMETA приложения (для REST API)
COMETA_API_URL=http://localhost:3000
# или в продакшене:
# COMETA_API_URL=https://cometa.your-domain.com
```

### Установка зависимостей

```bash
npm install @supabase/supabase-js
# или
npm install pg  # Для прямых PostgreSQL запросов
```

## 2. Структура базы данных

### Таблицы назначения ресурсов

#### `equipment_assignments` - Назначение оборудования

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | UUID | ID назначения |
| `equipment_id` | UUID | ID оборудования (FK → `equipment`) |
| `project_id` | UUID | ID проекта (FK → `projects`, опционально) |
| `crew_id` | UUID | ID бригады (FK → `crews`) |
| `from_ts` | TIMESTAMP | Начало назначения |
| `to_ts` | TIMESTAMP | Окончание назначения (NULL = активно) |
| `is_permanent` | BOOLEAN | Постоянное назначение |
| `rental_cost_per_day` | DECIMAL | Стоимость аренды/день (0 = собственное) |
| `is_active` | BOOLEAN | Активное назначение |
| `created_at` | TIMESTAMP | Дата создания |
| `updated_at` | TIMESTAMP | Дата обновления |

**Связи:**
- `equipment` (LEFT JOIN) - данные об оборудовании
- `crews` (LEFT JOIN) - данные о бригаде
- `projects` (LEFT JOIN) - данные о проекте

#### `vehicle_assignments` - Назначение транспорта

Структура **идентична** `equipment_assignments`, но:
- `vehicle_id` вместо `equipment_id`
- Связь с таблицей `vehicles`

#### `material_allocations` - Выделение материалов

| Колонка | Тип | Описание |
|---------|-----|----------|
| `id` | UUID | ID выделения |
| `material_id` | UUID | ID материала (FK → `materials`) |
| `project_id` | UUID | ID проекта (FK → `projects`, опционально) |
| `crew_id` | UUID | ID бригады (FK → `crews`, опционально) |
| `quantity_allocated` | NUMERIC | Выделенное количество |
| `quantity_used` | NUMERIC | Использованное количество |
| `quantity_remaining` | NUMERIC | Остаток (вычисляемое поле) |
| `status` | VARCHAR | Статус: `allocated`, `partially_used`, `fully_used`, `returned`, `lost` |
| `allocated_date` | DATE | Дата выделения |
| `allocated_by` | UUID | Кто выделил (FK → `users`) |
| `notes` | TEXT | Заметки |
| `created_at` | TIMESTAMP | Дата создания |
| `updated_at` | TIMESTAMP | Дата обновления |

**Связи:**
- `materials` (LEFT JOIN) - данные о материале
- `projects` (LEFT JOIN) - данные о проекте
- `crews` (LEFT JOIN) - данные о бригаде
- `users` (LEFT JOIN via `allocated_by`) - кто выделил

### Справочные таблицы

#### `equipment` - Оборудование

```sql
SELECT id, name, type, category, inventory_no, status,
       owned, current_location, rental_cost_per_day
FROM equipment;
```

**Статусы:** `available`, `issued_to_brigade`, `assigned_to_project`, `maintenance`, `retired`, `lost`

#### `vehicles` - Транспорт

```sql
SELECT id, make, model, year, license_plate, vin,
       status, current_location, owned
FROM vehicles;
```

**Статусы:** `available`, `in_use`, `maintenance`, `out_of_service`

#### `materials` - Материалы

```sql
SELECT id, name, category, unit, unit_price_eur,
       current_stock, reserved_stock
FROM materials;
```

#### `crews` - Бригады

```sql
SELECT id, name, status, leader_user_id, project_id
FROM crews;
```

## 3. Способы доступа к данным

### Способ 1: Прямые запросы через Supabase Client (Рекомендуется)

**Преимущества:**
- Быстрее (нет дополнительного HTTP слоя)
- Real-time подписки
- Автоматическая типизация

**Пример настройки клиента:**

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Для server-side API routes (обход RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

**Примеры запросов:**

```typescript
// 1. Получить оборудование бригады
const { data: equipment, error } = await supabase
  .from('equipment_assignments')
  .select(`
    id,
    from_ts,
    to_ts,
    is_permanent,
    rental_cost_per_day,
    is_active,
    equipment:equipment_id (
      id,
      name,
      type,
      category,
      inventory_no,
      status,
      owned
    ),
    crew:crew_id (
      id,
      name
    )
  `)
  .eq('crew_id', crewId)
  .eq('is_active', true)
  .order('from_ts', { ascending: false })

// 2. Получить транспорт бригады
const { data: vehicles } = await supabase
  .from('vehicle_assignments')
  .select(`
    *,
    vehicle:vehicle_id (
      id,
      make,
      model,
      license_plate,
      year,
      status
    ),
    crew:crew_id (
      id,
      name
    )
  `)
  .eq('crew_id', crewId)
  .eq('is_active', true)

// 3. Получить материалы проекта
const { data: materials } = await supabase
  .from('material_allocations')
  .select(`
    *,
    material:material_id (
      id,
      name,
      category,
      unit,
      unit_price_eur
    ),
    project:project_id (
      id,
      name
    ),
    allocated_by_user:allocated_by (
      id,
      first_name,
      last_name
    )
  `)
  .eq('project_id', projectId)
  .in('status', ['allocated', 'partially_used'])

// 4. Получить все активные назначения бригады
const crewId = 'uuid-here'

const [equipmentRes, vehiclesRes, materialsRes] = await Promise.all([
  supabase
    .from('equipment_assignments')
    .select('*, equipment(*)')
    .eq('crew_id', crewId)
    .eq('is_active', true),
  supabase
    .from('vehicle_assignments')
    .select('*, vehicle(*)')
    .eq('crew_id', crewId)
    .eq('is_active', true),
  supabase
    .from('material_allocations')
    .select('*, material(*)')
    .eq('crew_id', crewId)
    .in('status', ['allocated', 'partially_used'])
])

const crewResources = {
  equipment: equipmentRes.data || [],
  vehicles: vehiclesRes.data || [],
  materials: materialsRes.data || []
}
```

### Способ 2: REST API эндпоинты COMETA

**Преимущества:**
- Готовая бизнес-логика
- Валидация и расчеты
- Агрегированные данные

**Base URL:** `http://localhost:3000` (или prod URL)

#### API Endpoints

##### 1. Оборудование

**GET** `/api/resources/equipment-assignments`

**Query params:**
- `crew_id` (UUID) - фильтр по бригаде
- `equipment_id` (UUID) - фильтр по оборудованию
- `project_id` (UUID) - фильтр по проекту
- `active_only` (boolean) - только активные

**Пример:**
```bash
curl "http://localhost:3000/api/resources/equipment-assignments?crew_id=uuid-here&active_only=true"
```

**Response:**
```json
[
  {
    "id": "assignment-uuid",
    "equipment_id": "equip-uuid",
    "crew_id": "crew-uuid",
    "project_id": "proj-uuid",
    "from_ts": "2025-01-15T08:00:00Z",
    "to_ts": null,
    "is_permanent": false,
    "rental_cost_per_day": 50.00,
    "is_active": true,
    "equipment": {
      "id": "equip-uuid",
      "name": "Excavator CAT 320",
      "type": "excavator",
      "category": "power_tool",
      "inventory_no": "EXC-001",
      "status": "issued_to_brigade",
      "owned": false
    },
    "crew": {
      "id": "crew-uuid",
      "name": "Team Alpha"
    }
  }
]
```

**POST** `/api/resources/equipment-assignments`

**Body:**
```json
{
  "equipment_id": "uuid",
  "crew_id": "uuid",
  "project_id": "uuid",
  "from_ts": "2025-01-15T08:00:00Z",
  "to_ts": "2025-02-15T17:00:00Z",
  "is_permanent": false,
  "rental_cost_per_day": 50.00
}
```

**PUT** `/api/resources/equipment-assignments`

**Body:** (Завершить назначение)
```json
{
  "assignment_id": "uuid",
  "is_active": false
}
```

##### 2. Транспорт

**GET** `/api/resources/vehicle-assignments`

**Query params:** (идентичны equipment)
- `crew_id`, `vehicle_id`, `project_id`, `active_only`

**Пример:**
```bash
curl "http://localhost:3000/api/resources/vehicle-assignments?crew_id=uuid-here&active_only=true"
```

**Response:**
```json
[
  {
    "id": "assignment-uuid",
    "vehicle_id": "veh-uuid",
    "crew_id": "crew-uuid",
    "from_ts": "2025-01-15T08:00:00Z",
    "to_ts": null,
    "is_active": true,
    "rental_cost_per_day": 100.00,
    "vehicle": {
      "id": "veh-uuid",
      "make": "Mercedes-Benz",
      "model": "Sprinter",
      "license_plate": "B-AB 1234",
      "year": 2022,
      "status": "in_use"
    },
    "crew": {
      "id": "crew-uuid",
      "name": "Team Alpha"
    }
  }
]
```

##### 3. Материалы

**GET** `/api/materials/allocations`

**Query params:**
- `project_id` (UUID) - фильтр по проекту
- `crew_id` (UUID) - фильтр по бригаде
- `material_id` (UUID) - фильтр по материалу
- `status` (string) - фильтр по статусу
- `page` (number) - страница (default: 1)
- `per_page` (number) - элементов на странице (default: 20)

**Пример:**
```bash
curl "http://localhost:3000/api/materials/allocations?project_id=uuid-here&status=allocated"
```

**Response:**
```json
{
  "allocations": [
    {
      "id": "alloc-uuid",
      "material_id": "mat-uuid",
      "project_id": "proj-uuid",
      "crew_id": null,
      "quantity_allocated": 1000,
      "quantity_used": 250,
      "quantity_remaining": 750,
      "status": "partially_used",
      "allocated_date": "2025-01-15",
      "allocated_by": "user-uuid",
      "notes": "Initial allocation",
      "material": {
        "id": "mat-uuid",
        "name": "Fiber Optic Cable SM",
        "category": "cable",
        "unit": "m",
        "unit_price_eur": 2.50
      },
      "project": {
        "id": "proj-uuid",
        "name": "Berlin Main Network"
      },
      "allocator": {
        "id": "user-uuid",
        "first_name": "John",
        "last_name": "Schmidt",
        "full_name": "John Schmidt"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 15,
    "total_pages": 1
  },
  "summary": {
    "total_allocations": 15,
    "total_value": 12500.00,
    "total_allocated": 5000,
    "total_used": 1250,
    "total_remaining": 3750
  }
}
```

**POST** `/api/materials/allocations`

**Body:**
```json
{
  "project_id": "uuid",
  "material_id": "uuid",
  "quantity_allocated": 1000,
  "allocated_by": "user-uuid",
  "allocated_date": "2025-01-15",
  "status": "allocated",
  "notes": "Initial stock for phase 1"
}
```

##### 4. Комплексный запрос - Все ресурсы проекта

**GET** `/api/projects/{projectId}/resources`

**Пример:**
```bash
curl "http://localhost:3000/api/projects/uuid-here/resources"
```

**Response:**
```json
{
  "equipment": [
    {
      "id": "assign-uuid",
      "name": "Excavator CAT 320",
      "type": "excavator",
      "inventory_no": "EXC-001",
      "crew": { "id": "crew-uuid", "name": "Team Alpha" },
      "from_ts": "2025-01-15T08:00:00Z",
      "to_ts": null,
      "is_permanent": false,
      "rental_cost_per_day": 50,
      "is_active": true,
      "assignment_source": "crew_based",
      "owned": false,
      "days": 31,
      "daily_rate": 50,
      "total_cost": 1550,
      "period": "15.01.2025 - present"
    }
  ],
  "vehicles": [
    {
      "id": "assign-uuid",
      "make": "Mercedes-Benz",
      "model": "Sprinter",
      "license_plate": "B-AB 1234",
      "crew": { "id": "crew-uuid", "name": "Team Alpha" },
      "from_ts": "2025-01-15T08:00:00Z",
      "to_ts": null,
      "is_active": true,
      "rental_cost_per_day": 100,
      "days": 31,
      "total_cost": 3100
    }
  ],
  "materials": [
    {
      "id": "alloc-uuid",
      "material_name": "Fiber Optic Cable SM",
      "category": "cable",
      "quantity_allocated": 1000,
      "quantity_used": 250,
      "quantity_remaining": 750,
      "unit": "m",
      "unit_price": 2.50,
      "total_value": 2500.00
    }
  ],
  "summary": {
    "total_resources": 15,
    "total_vehicles": 3,
    "total_equipment": 10,
    "total_cost": 12750.50
  }
}
```

## 4. Примеры интеграции в Worker App

### Next.js API Route

```typescript
// app/api/crew/[id]/resources/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const crewId = params.id

  try {
    // Параллельные запросы для оптимизации
    const [equipmentRes, vehiclesRes, materialsRes] = await Promise.all([
      supabase
        .from('equipment_assignments')
        .select(`
          *,
          equipment:equipment_id (
            id, name, type, category, inventory_no, status
          )
        `)
        .eq('crew_id', crewId)
        .eq('is_active', true),

      supabase
        .from('vehicle_assignments')
        .select(`
          *,
          vehicle:vehicle_id (
            id, make, model, license_plate, year, status
          )
        `)
        .eq('crew_id', crewId)
        .eq('is_active', true),

      supabase
        .from('material_allocations')
        .select(`
          *,
          material:material_id (
            id, name, category, unit, unit_price_eur
          )
        `)
        .eq('crew_id', crewId)
        .in('status', ['allocated', 'partially_used'])
    ])

    if (equipmentRes.error) throw equipmentRes.error
    if (vehiclesRes.error) throw vehiclesRes.error
    if (materialsRes.error) throw materialsRes.error

    return NextResponse.json({
      equipment: equipmentRes.data || [],
      vehicles: vehiclesRes.data || [],
      materials: materialsRes.data || [],
      summary: {
        total_equipment: equipmentRes.data?.length || 0,
        total_vehicles: vehiclesRes.data?.length || 0,
        total_materials: materialsRes.data?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching crew resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
}
```

### React Hook для Worker App

```typescript
// hooks/useCrewResources.ts
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCrewResources(crewId: string) {
  return useQuery({
    queryKey: ['crew-resources', crewId],
    queryFn: async () => {
      const [equipmentRes, vehiclesRes, materialsRes] = await Promise.all([
        supabase
          .from('equipment_assignments')
          .select('*, equipment(*)')
          .eq('crew_id', crewId)
          .eq('is_active', true),

        supabase
          .from('vehicle_assignments')
          .select('*, vehicle(*)')
          .eq('crew_id', crewId)
          .eq('is_active', true),

        supabase
          .from('material_allocations')
          .select('*, material(*)')
          .eq('crew_id', crewId)
          .in('status', ['allocated', 'partially_used'])
      ])

      return {
        equipment: equipmentRes.data || [],
        vehicles: vehiclesRes.data || [],
        materials: materialsRes.data || []
      }
    },
    enabled: !!crewId,
    staleTime: 5 * 60 * 1000 // 5 минут
  })
}
```

### React Component

```typescript
// components/CrewResources.tsx
'use client'

import { useCrewResources } from '@/hooks/useCrewResources'

export function CrewResources({ crewId }: { crewId: string }) {
  const { data, isLoading, error } = useCrewResources(crewId)

  if (isLoading) return <div>Загрузка ресурсов...</div>
  if (error) return <div>Ошибка загрузки</div>

  return (
    <div className="space-y-6">
      {/* Оборудование */}
      <section>
        <h2 className="text-xl font-bold mb-4">Оборудование</h2>
        <ul className="space-y-2">
          {data?.equipment.map((item) => (
            <li key={item.id} className="border p-3 rounded">
              <div className="font-medium">{item.equipment.name}</div>
              <div className="text-sm text-gray-600">
                {item.equipment.inventory_no} • {item.equipment.category}
              </div>
              {!item.is_permanent && (
                <div className="text-sm text-blue-600">
                  Аренда: €{item.rental_cost_per_day}/день
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Транспорт */}
      <section>
        <h2 className="text-xl font-bold mb-4">Транспорт</h2>
        <ul className="space-y-2">
          {data?.vehicles.map((item) => (
            <li key={item.id} className="border p-3 rounded">
              <div className="font-medium">
                {item.vehicle.make} {item.vehicle.model}
              </div>
              <div className="text-sm text-gray-600">
                {item.vehicle.license_plate} • {item.vehicle.year}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Материалы */}
      <section>
        <h2 className="text-xl font-bold mb-4">Материалы</h2>
        <ul className="space-y-2">
          {data?.materials.map((item) => (
            <li key={item.id} className="border p-3 rounded">
              <div className="font-medium">{item.material.name}</div>
              <div className="text-sm text-gray-600">
                Выделено: {item.quantity_allocated} {item.material.unit}
              </div>
              <div className="text-sm text-gray-600">
                Использовано: {item.quantity_used} {item.material.unit}
              </div>
              <div className="text-sm font-medium text-green-600">
                Остаток: {item.quantity_remaining} {item.material.unit}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
```

## 5. Real-time обновления

### Подписка на изменения (Supabase Realtime)

```typescript
// hooks/useCrewResourcesRealtime.ts
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useCrewResourcesRealtime(crewId: string) {
  const [equipment, setEquipment] = useState([])
  const [vehicles, setVehicles] = useState([])

  useEffect(() => {
    // Начальная загрузка
    loadResources()

    // Подписка на изменения equipment_assignments
    const equipmentChannel = supabase
      .channel('equipment-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'equipment_assignments',
          filter: `crew_id=eq.${crewId}`
        },
        (payload) => {
          console.log('Equipment changed:', payload)
          loadResources() // Перезагрузить данные
        }
      )
      .subscribe()

    // Подписка на изменения vehicle_assignments
    const vehicleChannel = supabase
      .channel('vehicle-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_assignments',
          filter: `crew_id=eq.${crewId}`
        },
        (payload) => {
          console.log('Vehicle changed:', payload)
          loadResources()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(equipmentChannel)
      supabase.removeChannel(vehicleChannel)
    }
  }, [crewId])

  async function loadResources() {
    const [equipmentRes, vehiclesRes] = await Promise.all([
      supabase
        .from('equipment_assignments')
        .select('*, equipment(*)')
        .eq('crew_id', crewId)
        .eq('is_active', true),
      supabase
        .from('vehicle_assignments')
        .select('*, vehicle(*)')
        .eq('crew_id', crewId)
        .eq('is_active', true)
    ])

    setEquipment(equipmentRes.data || [])
    setVehicles(vehiclesRes.data || [])
  }

  return { equipment, vehicles }
}
```

## 6. Диаграмма связей

```
┌─────────────┐
│   crews     │
│ (Бригады)   │
└──────┬──────┘
       │
       ├──────────────────────────┬──────────────────────────┐
       │                          │                          │
       ▼                          ▼                          ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│equipment_        │   │vehicle_          │   │material_         │
│assignments       │   │assignments       │   │allocations       │
└────────┬─────────┘   └────────┬─────────┘   └────────┬─────────┘
         │                      │                      │
         ▼                      ▼                      ▼
  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
  │ equipment   │       │  vehicles   │       │ materials   │
  └─────────────┘       └─────────────┘       └─────────────┘
         │                      │                      │
         └──────────────────────┴──────────────────────┘
                                │
                                ▼
                         ┌─────────────┐
                         │  projects   │
                         │ (Проекты)   │
                         └─────────────┘
```

## 7. Частые вопросы (FAQ)

### Q: Как получить все ресурсы для конкретной бригады?
**A:** Используйте параллельные запросы к трем таблицам:
```typescript
const [equipment, vehicles, materials] = await Promise.all([
  supabase.from('equipment_assignments').select('*, equipment(*)').eq('crew_id', crewId).eq('is_active', true),
  supabase.from('vehicle_assignments').select('*, vehicle(*)').eq('crew_id', crewId).eq('is_active', true),
  supabase.from('material_allocations').select('*, material(*)').eq('crew_id', crewId)
])
```

### Q: Как узнать, какие ресурсы доступны (не назначены)?
**A:** Запросите оборудование/транспорт со статусом `available`:
```typescript
const { data } = await supabase
  .from('equipment')
  .select('*')
  .eq('status', 'available')
  .eq('is_active', true)
```

### Q: Как рассчитать стоимость аренды?
**A:** Для аренды:
```typescript
const days = Math.ceil((to_ts - from_ts) / (1000 * 60 * 60 * 24))
const totalCost = rental_cost_per_day * days
```
Для собственного оборудования: `rental_cost_per_day = 0`

### Q: Как назначить оборудование на бригаду через API?
**A:** POST запрос:
```bash
curl -X POST http://localhost:3000/api/resources/equipment-assignments \
  -H "Content-Type: application/json" \
  -d '{
    "equipment_id": "uuid",
    "crew_id": "uuid",
    "project_id": "uuid",
    "from_ts": "2025-01-15T08:00:00Z",
    "rental_cost_per_day": 50.00
  }'
```

### Q: Можно ли назначить оборудование на проект, но без конкретной бригады?
**A:** Да, оставьте `crew_id = null`:
```json
{
  "equipment_id": "uuid",
  "project_id": "uuid",
  "crew_id": null,
  "from_ts": "2025-01-15T08:00:00Z"
}
```

### Q: Как получить материалы, выделенные конкретно на бригаду?
**A:**
```typescript
const { data } = await supabase
  .from('material_allocations')
  .select('*, material(*)')
  .eq('crew_id', crewId)
  .not('crew_id', 'is', null) // Только с crew_id
```

### Q: Нужна ли аутентификация для доступа к API?
**A:** Да, все API эндпоинты требуют валидный Supabase token. Для server-side используйте Service Role Key, для client-side - Anon Key с RLS политиками.

## 8. Безопасность

### RLS (Row Level Security)

Supabase поддерживает RLS для контроля доступа на уровне строк. Убедитесь что:

1. Worker app использует **Service Role Key** только на server-side (API routes)
2. Client-side запросы используют **Anon Key** с правильными RLS политиками
3. Не храните Service Role Key в переменных окружения доступных на клиенте

### Пример RLS политики

```sql
-- Бригада видит только свои назначения
CREATE POLICY "Crews see own assignments"
ON equipment_assignments
FOR SELECT
USING (crew_id IN (
  SELECT crew_id FROM crew_members WHERE user_id = auth.uid()
));
```

## 9. Тестирование

### Проверка подключения

```typescript
// test/connection.test.ts
import { supabase } from '@/lib/supabase'

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('crews')
      .select('id, name')
      .limit(1)

    if (error) throw error
    console.log('✅ Connection successful:', data)
  } catch (err) {
    console.error('❌ Connection failed:', err)
  }
}

testConnection()
```

## 10. Поддержка

Для вопросов по интеграции:
- Проверьте логи основного COMETA приложения
- Используйте Supabase Dashboard для мониторинга запросов
- Обратитесь к документации API: `/api/resources/*`

---

**Версия:** 1.0
**Дата:** 2025-11-10
**Автор:** COMETA Development Team
