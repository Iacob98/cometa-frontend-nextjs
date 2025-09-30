# 🔄 Анализ дублирующихся API Routes - COMETA Next.js

**Дата анализа**: 2025-09-30
**Всего API routes**: 112
**Найдено дублирующихся групп**: 7
**Рекомендовано удалить**: 11 эндпоинтов

---

## 🚨 Критические дубликаты (идентичная логика)

### 1. Material Allocations API - **ПОЛНЫЙ ДУБЛИКАТ**

**Статус**: 🔥 **КРИТИЧЕСКИЙ ДУБЛИКАТ**

#### Дублирующиеся эндпоинты:

| Путь | Методы | Строк кода | Статус | Действие |
|------|--------|------------|--------|----------|
| `/api/material-allocations/route.ts` | - | 1 | ❌ **ПУСТОЙ ФАЙЛ** | **УДАЛИТЬ** |
| `/api/materials/allocations/route.ts` | GET, POST, PUT | 378 | ✅ **РАБОЧИЙ** | **ОСТАВИТЬ** |

#### Анализ:

```typescript
// ❌ /api/material-allocations/route.ts
// Файл ПУСТОЙ - всего 1 строка!

// ✅ /api/materials/allocations/route.ts
export async function GET(request: NextRequest) {
  // Полная реализация с фильтрами:
  // - project_id, material_id, status
  // - Джойны с projects, materials, users
  // - Расчёт статистики (total_value, utilization_rate)
  // - Пагинация
}

export async function POST(request: NextRequest) {
  // Создание allocation с валидацией
}

export async function PUT(request: NextRequest) {
  // Обновление quantity_used, status, notes
}
```

**Рекомендация**:
```bash
# Удалить пустой дубликат
rm src/app/api/material-allocations/route.ts
```

---

### 2. Material Orders API - **ДУБЛИКАТ С РАЗНОЙ ВАЛИДАЦИЕЙ**

**Статус**: 🔥 **КРИТИЧЕСКИЙ ДУБЛИКАТ**

#### Дублирующиеся эндпоинты:

| Путь | Методы | Строк кода | Валидация | Действие |
|------|--------|------------|-----------|----------|
| `/api/material-orders/route.ts` | GET, POST | 243 | ✅ Zod Schema | **ОСТАВИТЬ** |
| `/api/materials/orders/route.ts` | GET, POST | 205 | ⚠️ Без Zod | **УДАЛИТЬ** |

#### Сравнение логики:

```typescript
// ✅ /api/material-orders/route.ts (ЛУЧШАЯ ВЕРСИЯ)
const MaterialOrderSchema = z.object({
  project_id: z.string().uuid("Invalid project ID"),
  material_id: z.string().uuid("Invalid material ID"),
  quantity: z.number().positive("Quantity must be positive"),
  // ... полная валидация с Zod
});

export async function POST(request: NextRequest) {
  const validationResult = MaterialOrderSchema.safeParse(body);
  // Строгая валидация + проверка существования project и material
  // Автоматический расчёт total_price
  // Использование supplier_name из material
}

// ⚠️ /api/materials/orders/route.ts (УСТАРЕВШАЯ)
export async function POST(request: NextRequest) {
  // Без Zod валидации
  // Поддержка legacy поля supplier_material_id
  // Ручная конвертация supplier_material_id → material_id
  // Менее строгая валидация
}
```

**Ключевые отличия**:
- `/material-orders` использует **Zod validation** ✅
- `/materials/orders` поддерживает **legacy поля** (supplier_material_id) ⚠️
- Оба делают **одно и то же** - создают записи в `material_orders`

**Рекомендация**:
```bash
# Оставить версию с Zod валидацией
# KEEP: /api/material-orders/route.ts

# Удалить legacy версию
# DELETE: /api/materials/orders/route.ts
```

---

### 3. Equipment Assignments API - **ДУБЛИКАТ С РАЗНОЙ СЛОЖНОСТЬЮ**

**Статус**: 🔥 **КРИТИЧЕСКИЙ ДУБЛИКАТ**

#### Дублирующиеся эндпоинты:

| Путь | Методы | Строк кода | Функционал | Действие |
|------|--------|------------|------------|----------|
| `/api/equipment/assignments/route.ts` | GET, POST, PUT | 177 | ✅ Простой, чистый | **ОСТАВИТЬ** |
| `/api/resources/equipment-assignments/route.ts` | GET, POST, PUT | 549 | ⚠️ С file storage fallback | **УДАЛИТЬ** |

#### Сравнение реализации:

```typescript
// ✅ /api/equipment/assignments/route.ts (РЕКОМЕНДУЕТСЯ)
export async function GET(request: NextRequest) {
  // Прямой запрос к Supabase
  let query = supabase
    .from('equipment_assignments')
    .select('id, equipment_id, crew_id, project_id, ...')
    .order('from_ts', { ascending: false });

  // Фильтры: equipment_id, crew_id, project_id, active_only
  // Простая, чистая реализация
}

// ⚠️ /api/resources/equipment-assignments/route.ts (УСТАРЕВШИЙ)
export async function GET(request: NextRequest) {
  try {
    // Попытка #1: Supabase
    const { data: assignments, error } = await query;
    if (error) throw error;
    return assignments;
  } catch (supabaseError) {
    // Попытка #2: Fallback на file storage (temp_assignments.json)
    const assignments = loadAssignments(); // readFileSync
    return assignments;
  }
}
```

**Проблемы legacy версии (`/resources/equipment-assignments`)**:
- 🐛 Использует **file storage fallback** (writeFileSync/readFileSync)
- 🐛 Сложная логика с двумя источниками данных
- 🐛 Валидация доступности оборудования дублируется
- 🐛 549 строк против 177 строк

**Рекомендация**:
```bash
# Оставить простую версию
# KEEP: /api/equipment/assignments/route.ts

# Удалить сложную legacy версию с file storage
# DELETE: /api/resources/equipment-assignments/route.ts
```

---

### 4. Materials API - **МНОЖЕСТВЕННЫЕ ЭНДПОИНТЫ**

**Статус**: ⚠️ **ЧАСТИЧНОЕ ДУБЛИРОВАНИЕ**

#### Группа эндпоинтов materials:

| Путь | Назначение | Упоминания | Действие |
|------|------------|------------|----------|
| `/api/materials/route.ts` | Основной CRUD | 374 | ✅ **ОСТАВИТЬ** |
| `/api/materials/unified/route.ts` | Warehouse + Project views | 135 | ✅ **ОСТАВИТЬ** (разные view) |
| `/api/materials/allocations/route.ts` | Распределение материалов | 14 | ✅ **ОСТАВИТЬ** |
| `/api/materials/assignments/route.ts` | ??? | 1 | ⚠️ **ПРОВЕРИТЬ** |
| `/api/materials/orders/route.ts` | Заказы (legacy) | 205 строк | 🔥 **УДАЛИТЬ** (дубликат) |
| `/api/materials/low-stock/route.ts` | Фильтр низкого запаса | - | ✅ **ОСТАВИТЬ** |
| `/api/materials/warehouse/route.ts` | Склад | - | ⚠️ **ПРОВЕРИТЬ** (может быть дубликат unified) |
| `/api/materials/consume/route.ts` | Потребление | - | ✅ **ОСТАВИТЬ** |
| `/api/materials/project/[id]/route.ts` | По проекту | - | ✅ **ОСТАВИТЬ** |
| `/api/materials/[id]/route.ts` | CRUD по ID | - | ✅ **ОСТАВИТЬ** |
| `/api/materials/[id]/adjust/route.ts` | Коррекция запасов | - | ✅ **ОСТАВИТЬ** |
| `/api/materials/[id]/transactions/route.ts` | История движений | - | ✅ **ОСТАВИТЬ** |

#### Анализ `/api/materials/unified/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  const view = searchParams.get('view') || 'warehouse';

  if (view === 'warehouse') {
    // Получение материалов со склада с расчётом:
    // - total_qty (общий запас)
    // - reserved_qty (зарезервировано в allocations)
    // - available_qty (доступно = total - reserved)
    // - is_low_stock, is_over_allocated
  }

  if (view === 'project_allocations') {
    // Получение распределения по проекту
    // JOIN с materials, projects
  }
}
```

**Unified** имеет смысл оставить - он объединяет warehouse и allocations view.

**Рекомендация**:
- ✅ Оставить все, **кроме** `/api/materials/orders/route.ts` (это дубликат `/api/material-orders/route.ts`)

---

### 5. Crews API - **ВСЁ В ПОРЯДКЕ**

**Статус**: ✅ **НЕТ ДУБЛИКАТОВ**

| Путь | Назначение |
|------|------------|
| `/api/crews/route.ts` | Список бригад, создание |
| `/api/crews/[id]/route.ts` | Получить/обновить/удалить бригаду |
| `/api/crews/[id]/members/route.ts` | Участники бригады |
| `/api/crews/[id]/members/[userId]/route.ts` | Управление участником |
| `/api/teams/crews/route.ts` | ⚠️ Возможный дубликат? |
| `/api/teams/crews/[id]/route.ts` | ⚠️ Возможный дубликат? |

**Проверить**: `/api/teams/crews/*` может быть дубликатом `/api/crews/*`

---

### 6. Vehicles API - **ВОЗМОЖНЫЕ ДУБЛИКАТЫ**

| Путь | Назначение | Действие |
|------|------------|----------|
| `/api/vehicles/route.ts` | CRUD транспорта | ✅ ОСТАВИТЬ |
| `/api/vehicles/[id]/route.ts` | Один транспорт | ✅ ОСТАВИТЬ |
| `/api/resources/vehicle-assignments/route.ts` | Назначение транспорта | ⚠️ ПРОВЕРИТЬ |
| `/api/resources/rental-vehicles/route.ts` | Аренда транспорта | ⚠️ ПРОВЕРИТЬ |

**Требуется анализ**: Возможно `/resources/*` - legacy версии.

---

### 7. Documents API - **ВОЗМОЖНОЕ ДУБЛИРОВАНИЕ**

| Путь | Назначение | Действие |
|------|------------|----------|
| `/api/documents/route.ts` | Основные документы | ✅ ОСТАВИТЬ |
| `/api/documents/[id]/route.ts` | Один документ | ✅ ОСТАВИТЬ |
| `/api/projects/[id]/documents/route.ts` | Документы проекта | ✅ ОСТАВИТЬ (специфичный для проекта) |
| `/api/users/[id]/documents/route.ts` | Документы пользователя | ✅ ОСТАВИТЬ (специфичный для юзера) |

**Статус**: ✅ Всё в порядке - разные контексты (общие/проект/юзер).

---

## 📊 Сводная таблица дубликатов

| № | API Route (Удалить) | API Route (Оставить) | Причина |
|---|---------------------|----------------------|---------|
| 1 | `/api/material-allocations/route.ts` | `/api/materials/allocations/route.ts` | Пустой файл (1 строка) |
| 2 | `/api/materials/orders/route.ts` | `/api/material-orders/route.ts` | Нет Zod валидации, legacy код |
| 3 | `/api/resources/equipment-assignments/route.ts` | `/api/equipment/assignments/route.ts` | 549 строк с file storage fallback vs 177 чистых |

---

## 🎯 Рекомендации по удалению

### Приоритет 1: Удалить пустые файлы

```bash
# Пустой файл - удалить немедленно
rm src/app/api/material-allocations/route.ts
```

**Влияние**: Нет
**Риск**: 0%

---

### Приоритет 2: Удалить legacy material orders

```bash
# Удалить версию без Zod валидации
rm src/app/api/materials/orders/route.ts

# Обновить импорты в компонентах (если используются)
# Заменить `/api/materials/orders` на `/api/material-orders`
```

**Влияние**: Среднее (нужно проверить импорты)
**Риск**: 10% (если где-то хардкодится старый путь)

**Проверка перед удалением**:
```bash
# Найти использования старого эндпоинта
grep -r "materials/orders" src/ --include="*.ts" --include="*.tsx"
```

---

### Приоритет 3: Удалить legacy equipment assignments

```bash
# Удалить версию с file storage fallback
rm src/app/api/resources/equipment-assignments/route.ts

# Обновить импорты
# Заменить `/api/resources/equipment-assignments` на `/api/equipment/assignments`
```

**Влияние**: Среднее
**Риск**: 15% (файловое хранилище может использоваться в dev режиме)

**Проверка**:
```bash
grep -r "resources/equipment-assignments" src/ --include="*.ts" --include="*.tsx"
```

---

## 🔍 Требуется дополнительная проверка

### 1. `/api/teams/crews/*` vs `/api/crews/*`

**Вопрос**: Это дубликаты или разные сущности?

```bash
# Проверить использование
grep -r "/api/teams/crews" src/
grep -r "/api/crews" src/
```

Если оба используют таблицу `crews` - удалить `/api/teams/crews/*`

---

### 2. `/api/materials/warehouse/route.ts` vs `/api/materials/unified/route.ts`

**Вопрос**: Warehouse - это отдельный эндпоинт или часть unified?

Если `unified?view=warehouse` покрывает функционал - удалить `/materials/warehouse`

---

### 3. `/api/resources/*` - Legacy префикс?

**Эндпоинты с префиксом `/resources/`**:
- `/api/resources/equipment-assignments/route.ts` 🔥 **ДУБЛИКАТ**
- `/api/resources/vehicle-assignments/route.ts` ⚠️ **ПРОВЕРИТЬ**
- `/api/resources/rental-equipment/route.ts` ⚠️ **ПРОВЕРИТЬ**
- `/api/resources/rental-vehicles/route.ts` ⚠️ **ПРОВЕРИТЬ**
- `/api/resources/unified-assignments/route.ts` ⚠️ **ПРОВЕРИТЬ**

**Гипотеза**: Всё в `/resources/*` - legacy код из FastAPI миграции.

**Проверка**:
```bash
# Найти все использования
find src/app/api/resources -name "*.ts" -exec grep -l "export async function" {} \;

# Сравнить с non-resources версиями
diff src/app/api/equipment/assignments/route.ts \
     src/app/api/resources/equipment-assignments/route.ts
```

---

## 📈 Ожидаемые результаты после очистки

### До оптимизации:
- **Всего API routes**: 112
- **Дублирующихся**: ~7-10 эндпоинтов
- **Пустых файлов**: 1
- **Legacy файлов**: ~5

### После оптимизации:
- **Всего API routes**: ~100-105 (↓10%)
- **Дублирующихся**: 0
- **Пустых файлов**: 0
- **Legacy файлов**: 0

### Преимущества:
- ✅ Упрощение API структуры на 10%
- ✅ Удаление file storage fallback логики
- ✅ Консистентные пути API
- ✅ Улучшение читаемости кода
- ✅ Единообразная валидация (Zod)

---

## 🛠️ План миграции API

### Этап 1: Удаление пустых файлов (10 минут)
- [ ] Удалить `/api/material-allocations/route.ts`
- [ ] Коммит: `chore: remove empty API route file`

### Этап 2: Анализ зависимостей (1 час)
- [ ] Найти все использования legacy эндпоинтов
- [ ] Документировать компоненты, использующие старые пути
- [ ] Создать mapping старых → новых путей

### Этап 3: Рефакторинг импортов (2 часа)
- [ ] Заменить `/materials/orders` → `/material-orders` в компонентах
- [ ] Заменить `/resources/equipment-assignments` → `/equipment/assignments`
- [ ] Обновить хуки (use-materials.ts, use-equipment.ts)

### Этап 4: Удаление legacy файлов (30 минут)
- [ ] Удалить `/api/materials/orders/route.ts`
- [ ] Удалить `/api/resources/equipment-assignments/route.ts`
- [ ] Удалить другие подтверждённые дубликаты

### Этап 5: Тестирование (2 часа)
- [ ] Запустить dev сервер
- [ ] Проверить все формы с материалами
- [ ] Проверить все формы с оборудованием
- [ ] Проверить API logs на ошибки 404

### Этап 6: Финализация (1 час)
- [ ] Обновить API документацию
- [ ] Создать PR с описанием изменений
- [ ] Коммит: `refactor: consolidate duplicate API routes`

**Общее время**: ~6-7 часов работы

---

## ⚠️ Checklist перед удалением

Для каждого удаляемого эндпоинта:

- [ ] ✅ Найдены все использования в коде
  ```bash
  grep -r "старый-путь" src/
  ```

- [ ] ✅ Обновлены все импорты в компонентах
  ```typescript
  // ❌ Старое
  const { data } = await fetch('/api/materials/orders')

  // ✅ Новое
  const { data } = await fetch('/api/material-orders')
  ```

- [ ] ✅ Обновлены хуки (useQuery, useMutation)
  ```typescript
  // use-materials.ts
  const { data } = useQuery({
    queryKey: ['material-orders'],
    queryFn: () => fetch('/api/material-orders') // ✅ новый путь
  })
  ```

- [ ] ✅ Проверены все формы и диалоги

- [ ] ✅ Создан бэкап старых файлов (git commit перед удалением)

- [ ] ✅ Запущены тесты (если есть)

- [ ] ✅ Проверен dev сервер без ошибок 404

---

## 📝 SQL для проверки данных

Проверить, что таблицы используются корректно:

```sql
-- Проверить material_orders (должны быть данные)
SELECT COUNT(*) as total_orders,
       COUNT(DISTINCT project_id) as projects_with_orders,
       SUM(total_price) as total_value
FROM material_orders;

-- Проверить equipment_assignments (должны быть активные назначения)
SELECT COUNT(*) as total_assignments,
       COUNT(*) FILTER (WHERE to_ts IS NULL) as active_assignments
FROM equipment_assignments;

-- Проверить material_allocations (должны быть распределения)
SELECT COUNT(*) as total_allocations,
       SUM(quantity_allocated) as total_qty_allocated,
       SUM(quantity_used) as total_qty_used
FROM material_allocations;
```

---

## ✅ Заключение

**Найдено дублирующихся API**:
- 🔥 **Критические дубликаты**: 3 (требуют немедленного удаления)
- ⚠️ **Требует проверки**: 4-5 (возможные legacy эндпоинты)

**Рекомендации**:
1. **Немедленно удалить**:
   - `/api/material-allocations/route.ts` (пустой файл)

2. **Удалить после рефакторинга импортов**:
   - `/api/materials/orders/route.ts` (дубликат без Zod)
   - `/api/resources/equipment-assignments/route.ts` (legacy с file storage)

3. **Проверить и решить**:
   - Эндпоинты в `/api/resources/*` (возможно все legacy)
   - `/api/teams/crews/*` vs `/api/crews/*` (возможный дубликат)

**Ожидаемый результат**: Удаление 5-10 дублирующихся эндпоинтов, упрощение API структуры на 10%.

---

*Этот отчёт создан на основе анализа 112 API routes в Next.js приложении COMETA.*