# COMETA Worker App Integration - Quick Start

Краткое руководство по интеграции worker приложения с COMETA API для доступа к ресурсам (оборудование, транспорт, материалы).

## 📚 Документация

Все файлы находятся в `.taskmaster/docs/`:

1. **[worker-app-integration.md](./worker-app-integration.md)** - Полное руководство (10KB+)
   - API эндпоинты с примерами
   - Supabase Client запросы
   - React hooks и компоненты
   - Real-time подписки
   - Безопасность и RLS

2. **[worker-app.env.example](./worker-app.env.example)** - Шаблон переменных окружения
   - Supabase credentials
   - PostgreSQL параметры
   - COMETA API URL

3. **[worker-app-types.ts](./worker-app-types.ts)** - TypeScript типы
   - Все интерфейсы для ресурсов
   - Request/Response типы
   - Фильтры и параметры

## 🚀 Быстрый старт

### 1. Настройка окружения

```bash
# Скопируйте шаблон в ваш worker app
cp .taskmaster/docs/worker-app.env.example /path/to/worker-app/.env

# Отредактируйте .env и заполните:
NEXT_PUBLIC_SUPABASE_URL=https://oijmohlhdxoawzvctnxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 2. Установка зависимостей

```bash
cd /path/to/worker-app
npm install @supabase/supabase-js
```

### 3. Создание Supabase клиента

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 4. Первый запрос

```typescript
// Получить оборудование бригады
const { data } = await supabase
  .from('equipment_assignments')
  .select('*, equipment(*)')
  .eq('crew_id', crewId)
  .eq('is_active', true)
```

## 📋 Основные эндпоинты

### Оборудование бригады
```bash
GET /api/resources/equipment-assignments?crew_id={id}&active_only=true
```

### Транспорт бригады
```bash
GET /api/resources/vehicle-assignments?crew_id={id}&active_only=true
```

### Материалы проекта
```bash
GET /api/materials/allocations?project_id={id}
```

### Все ресурсы проекта
```bash
GET /api/projects/{id}/resources
```

## 💡 Примеры

### React Hook

```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCrewEquipment(crewId: string) {
  return useQuery({
    queryKey: ['crew-equipment', crewId],
    queryFn: async () => {
      const { data } = await supabase
        .from('equipment_assignments')
        .select('*, equipment(*), crew(*)')
        .eq('crew_id', crewId)
        .eq('is_active', true)
      return data || []
    },
    enabled: !!crewId
  })
}
```

### API Route

```typescript
// app/api/crew/[id]/resources/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { data } = await supabase
    .from('equipment_assignments')
    .select('*, equipment(*)')
    .eq('crew_id', params.id)
    .eq('is_active', true)

  return NextResponse.json({ equipment: data || [] })
}
```

## 🔗 Структура БД

```
crews (бригады)
  ├── equipment_assignments → equipment
  ├── vehicle_assignments → vehicles
  └── material_allocations → materials

projects (проекты)
  ├── equipment_assignments → equipment
  ├── vehicle_assignments → vehicles
  └── material_allocations → materials
```

## 📊 Типы данных

```typescript
// Скопируйте из worker-app-types.ts
interface EquipmentAssignment {
  id: UUID;
  equipment_id: UUID;
  crew_id: UUID;
  from_ts: string;
  to_ts?: string;
  is_active: boolean;
  rental_cost_per_day: number;
  equipment?: Equipment;
  crew?: Crew;
}
```

## 🔐 Безопасность

- ✅ **Client-side**: используйте `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ **Server-side**: используйте `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ **НИКОГДА** не используйте Service Role Key в браузере
- ⚠️ Service Role Key обходит Row Level Security (RLS)

## 📞 Поддержка

Проблемы с интеграцией? Проверьте:

1. Правильность Supabase credentials в `.env`
2. Доступность основного COMETA приложения
3. Логи в Supabase Dashboard → Logs
4. Документацию в [worker-app-integration.md](./worker-app-integration.md)

## 🎯 Следующие шаги

1. Прочитайте полную документацию: `worker-app-integration.md`
2. Скопируйте TypeScript типы: `worker-app-types.ts`
3. Настройте `.env` по примеру: `worker-app.env.example`
4. Реализуйте первый запрос к ресурсам
5. Добавьте Real-time подписки (см. документацию)

---

**Версия:** 1.0
**Дата:** 2025-11-10
**База данных:** Supabase PostgreSQL (общая с COMETA)
