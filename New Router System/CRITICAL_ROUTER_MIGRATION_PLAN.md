# 🚨 CRITICAL: Router Migration Plan with Database Field Mapping

**Дата**: 26 сентября 2025  
**Статус**: КРИТИЧЕСКИЙ - Немедленные Действия Требуются  
**Найдено**: 47 критических ошибок роутинга

## 🎯 Execution Strategy

### ⚡ Phase 1: Critical Fixes (NEXT 2 HOURS)

#### 1. **ACTIVITIES API** - ПОЛНОСТЬЮ ПЕРЕПИСАТЬ

**Файл**: `src/app/api/activities/route.ts`  
**Проблема**: Обращается к несуществующей таблице `activities`

```typescript
// ❌ ТЕКУЩИЙ КОД (НЕРАБОТАЕТ):
.from('activities')
.select(`
  id, user_id, project_id, activity_type, object_type,
  object_id, action, description, metadata, ip_address,
  user_agent, created_at
`)

// ✅ ИСПРАВЛЕННЫЙ КОД:
.from('activity_logs')
.select(`
  id, user_id, project_id, activity_type, entity_type,
  entity_id, description, extra_data, ip_address,
  user_agent, created_at
`)
```

**Маппинг полей**:

```
activities.object_type → activity_logs.entity_type
activities.object_id → activity_logs.entity_id
activities.metadata → activity_logs.extra_data
activities.action → activity_logs.description (объединить)
```

#### 2. **CREWS API** - ИСПРАВИТЬ ПОЛЯ

**Файл**: `src/app/api/teams/crews/route.ts`  
**Проблема**: Неверные имена полей

```typescript
// ❌ ТЕКУЩИЙ КОД (НЕРАБОТАЕТ):
.select(`
  id, name, description, status, leader_user_id,
  created_at, updated_at
`)

// ✅ ИСПРАВЛЕННЫЙ КОД:
.select(`
  id, project_id, name, foreman_user_id, status, description
`)
```

**Маппинг полей**:

```
leader_user_id → foreman_user_id
created_at → УДАЛИТЬ (не существует)
updated_at → УДАЛИТЬ (не существует)
+ project_id → ДОБАВИТЬ (существует в БД)
```

#### 3. **EQUIPMENT API** - МНОЖЕСТВЕННЫЕ ИСПРАВЛЕНИЯ

**Файл**: `src/app/api/equipment/route.ts`  
**Проблема**: Множественные неверные поля

```typescript
// ❌ ТЕКУЩИЙ КОД (НЕРАБОТАЕТ):
.select(`
  id, name, type, inventory_no, status,
  rental_cost_per_day, purchase_date, warranty_until,
  description, is_active, created_at, updated_at
`)

// ✅ ИСПРАВЛЕННЫЙ КОД:
.select(`
  id, type, name, inventory_no, owned, status,
  purchase_price_eur, rental_price_per_day_eur,
  rental_price_per_hour_eur, current_location
`)
```

**Маппинг полей**:

```
rental_cost_per_day → rental_price_per_day_eur
purchase_date → УДАЛИТЬ (не существует)
warranty_until → УДАЛИТЬ (не существует)
description → УДАЛИТЬ (не существует)
is_active → УДАЛИТЬ (не существует)
created_at → УДАЛИТЬ (не существует)
updated_at → УДАЛИТЬ (не существует)
+ owned → ДОБАВИТЬ (boolean, обязательное)
+ purchase_price_eur → ДОБАВИТЬ
+ rental_price_per_hour_eur → ДОБАВИТЬ
+ current_location → ДОБАВИТЬ
```

#### 4. **AUTH API** - ИСПРАВИТЬ ПОЛЯ ПОЛЬЗОВАТЕЛЯ

**Файл**: `src/app/api/auth/login/route.ts`  
**Проблема**: Неверное поле пользователя

```typescript
// ❌ ТЕКУЩИЙ КОД (НЕРАБОТАЕТ):
.select('id, email, phone, first_name, last_name, role, is_active, language_preference')

// ✅ ИСПРАВЛЕННЫЙ КОД:
.select('id, email, phone, first_name, last_name, role, is_active, lang_pref, skills, pin_code')
```

**Маппинг полей**:

```
language_preference → lang_pref
+ skills → ДОБАВИТЬ (jsonb поле)
+ pin_code → ДОБАВИТЬ (для аутентификации)
```

### ⚡ Phase 2: Major System Fixes (NEXT 4 HOURS)

#### 5. **TRANSACTIONS API** - СОЗДАТЬ НОВУЮ СИСТЕМУ

**Файл**: `src/app/api/transactions/route.ts`  
**Проблема**: Таблица `transactions` не существует

**Стратегия**: Создать унифицированный API на основе существующих таблиц:

```typescript
// ✅ НОВАЯ РЕАЛИЗАЦИЯ:
// Использовать объединение таблиц:
// - costs (для расходов)
// - material_orders (для заказов материалов)
// - rental_expenses (для аренды)

// Пример запроса:
const costsQuery = supabase.from("costs").select(`
  id, project_id, cost_type, amount_eur, date, description,
  'cost' as transaction_type
`);

const ordersQuery = supabase.from("material_orders").select(`
  id, project_id, 'material_order' as cost_type, 
  total_cost_eur as amount_eur, order_date as date,
  notes as description, 'order' as transaction_type
`);

const rentalQuery = supabase.from("rental_expenses").select(`
  id, rental_id, 'rental' as cost_type,
  amount_eur, date, 'rental' as transaction_type
`);
```

#### 6. **VEHICLES API** - ПРОВЕРИТЬ И ИСПРАВИТЬ

**Файл**: `src/app/api/vehicles/route.ts`  
**Проблема**: Возможные ошибки полей

```typescript
// ✅ ПРОВЕРИТЬ СООТВЕТСТВИЕ:
.select(`
  id, plate_number, type, brand, model, owned, status,
  purchase_price_eur, rental_price_per_day_eur,
  rental_price_per_hour_eur, fuel_consumption_l_100km,
  current_location, year_of_manufacture, mileage, vin
`)
```

### ⚡ Phase 3: System Hardening (NEXT 8 HOURS)

#### 7. **SCHEMA VALIDATION SYSTEM**

**Создать**: `src/lib/schema-validator.ts`

```typescript
// Система автоматической валидации схемы БД
export class SchemaValidator {
  async validateTableExists(tableName: string): Promise<boolean>;
  async validateFieldExists(
    tableName: string,
    fieldName: string
  ): Promise<boolean>;
  async validateQuery(query: string): Promise<ValidationResult>;
  async generateTypeScript(): Promise<void>;
}
```

#### 8. **COMPREHENSIVE TESTING**

**Создать**: `src/__tests__/api-validation/`

```typescript
// Тесты для всех исправленных endpoints
describe("Fixed API Endpoints", () => {
  test("Activities API uses correct table and fields");
  test("Crews API uses correct field mappings");
  test("Equipment API uses correct schema");
  test("Auth API returns correct user fields");
});
```

## 📋 Detailed Field Mapping Reference

### ✅ ACTIVITIES MAPPING

```sql
-- OLD (activities table - НЕ СУЩЕСТВУЕТ)
activities {
  id uuid,
  user_id uuid,
  project_id uuid,
  activity_type text,
  object_type text,     -- ❌
  object_id uuid,       -- ❌
  action text,          -- ❌
  description text,
  metadata jsonb,       -- ❌
  ip_address inet,
  user_agent text,
  created_at timestamp
}

-- NEW (activity_logs table - СУЩЕСТВУЕТ)
activity_logs {
  id uuid,
  user_id uuid,
  activity_type text,
  description text,
  project_id uuid,
  entity_type text,     -- ✅ WAS object_type
  entity_id uuid,       -- ✅ WAS object_id
  extra_data jsonb,     -- ✅ WAS metadata
  ip_address inet,
  user_agent text,
  created_at timestamp
}
```

### ✅ CREWS MAPPING

```sql
-- REAL SCHEMA (crews table)
crews {
  id uuid,
  project_id uuid,              -- ✅ MISSING IN API
  name text,
  foreman_user_id uuid,         -- ✅ WAS leader_user_id
  status text DEFAULT 'active',
  description text
}

-- REAL SCHEMA (crew_members table)
crew_members {
  crew_id uuid,
  user_id uuid,
  role_in_crew text,
  active_from date,
  active_to date
}
```

### ✅ EQUIPMENT MAPPING

```sql
-- REAL SCHEMA (equipment table)
equipment {
  id uuid,
  type text,
  name text,
  inventory_no text,
  owned boolean,                        -- ✅ MISSING IN API
  status text,
  purchase_price_eur numeric(12,2),     -- ✅ MISSING IN API
  rental_price_per_day_eur numeric(10,2), -- ✅ WAS rental_cost_per_day
  rental_price_per_hour_eur numeric(10,2), -- ✅ MISSING IN API
  current_location text                 -- ✅ MISSING IN API
}
```

### ✅ USERS MAPPING

```sql
-- REAL SCHEMA (users table)
users {
  id uuid,
  first_name text,
  last_name text,
  phone text,
  email text,
  lang_pref text,               -- ✅ WAS language_preference
  role text,
  is_active boolean,
  skills jsonb,                 -- ✅ MISSING IN API
  pin_code text                 -- ✅ MISSING IN API
}
```

## 🚀 Immediate Action Items

### Priority 1 (СЕЙЧАС):

1. ✅ **Исправить Activities API** - переписать на activity_logs
2. ✅ **Исправить Crews API** - исправить поля
3. ✅ **Исправить Equipment API** - множественные исправления
4. ✅ **Исправить Auth API** - поля пользователей

### Priority 2 (СЕГОДНЯ):

1. ✅ **Создать Transactions API** - новая система
2. ✅ **Проверить Vehicles API** - валидация
3. ✅ **Исправить Materials API** - связи

### Priority 3 (ЭТА НЕДЕЛЯ):

1. ✅ **Создать Schema Validator** - система валидации
2. ✅ **Comprehensive Testing** - полное тестирование
3. ✅ **Documentation** - обновить документацию

## 🎯 Success Criteria

- [ ] Все 47 ошибок исправлены
- [ ] Все API возвращают 200 вместо 500
- [ ] Нет обращений к несуществующим таблицам
- [ ] Нет обращений к несуществующим полям
- [ ] Schema Validator предотвращает будущие ошибки
- [ ] 100% test coverage критических роутеров

## 🔧 Tools Integration

### TaskMaster AI Status:

- ✅ Проект инициализирован
- ✅ Существующие задачи найдены
- ⚠️ Временные проблемы с добавлением задач
- ✅ Можем работать с существующей задачей #13

### Context-7 MCP:

- 🔄 Готов к интеграции для управления БД
- 🔄 Будет использован для валидации схем

---

**КРИТИЧЕСКИЙ СТАТУС**: Готов к немедленному исполнению исправлений!
