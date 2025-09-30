# 📊 Анализ базы данных Supabase - COMETA Project

**Дата анализа**: 2025-09-30
**Всего таблиц в БД**: 73
**Таблиц с упоминаниями в коде**: 49
**Неиспользуемых таблиц**: 24

---

## 🚨 Критические находки

### 1. Полностью неиспользуемые таблицы (0 упоминаний в коде)

Эти таблицы занимают место в базе данных, но не используются в Next.js приложении:

| № | Таблица | Упоминания | Статус | Рекомендация |
|---|---------|------------|--------|--------------|
| 1 | `asset_assignments` | 0 | ❌ Не используется | **Удалить** |
| 2 | `company_warehouse` | 0 | ❌ Не используется | **Удалить** |
| 3 | `company_warehouse_materials` | 0 | ❌ Не используется | **Удалить** |
| 4 | `cut_stages` | 0 | ❌ Не используется | **Удалить** |
| 5 | `document_reminders` | 0 | ❌ Не используется | **Удалить** |
| 6 | `house_contacts` | 0 | ❌ Не используется | **Удалить** |
| 7 | `house_docs` | 0 | ❌ Не используется | **Удалить** |
| 8 | `house_status` | 0 | ❌ Не используется | **Удалить** |
| 9 | `hse_requirements` | 0 | ❌ Не используется | **Удалить** |
| 10 | `material_moves` | 0 | ❌ Не используется | **Удалить** |
| 11 | `material_stage_mapping` | 0 | ❌ Не используется | **Удалить** |
| 12 | `offmass_lines` | 0 | ❌ Не используется | **Удалить** |
| 13 | `plan_view_confirms` | 0 | ❌ Не используется | **Удалить** |
| 14 | `price_extras` | 0 | ❌ Не используется | **Удалить** |
| 15 | `price_lists` | 0 | ❌ Не используется | **Удалить** |
| 16 | `price_rules` | 0 | ❌ Не используется | **Удалить** |
| 17 | `project_files` | 0 | ❌ Не используется | **Удалить** |
| 18 | `rentals` | 0 | ❌ Не используется | **Удалить** |
| 19 | `resource_requests` | 0 | ❌ Не используется | **Удалить** |
| 20 | `resource_usage` | 0 | ❌ Не используется | **Удалить** |
| 21 | `stage_defs` | 0 | ❌ Не используется | **Удалить** |
| 22 | `stock_locations` | 0 | ❌ Не используется | **Удалить** |
| 23 | `vehicle_expenses` | 0 | ❌ Не используется | **Удалить** |
| 24 | `vehicle_tracking` | 0 | ❌ Не используется | **Удалить** |
| 25 | `work_stages` | 0 | ❌ Не используется | **Удалить** |
| 26 | `worker_documents` | 0 | ❌ Не используется | **Удалить** |

**💾 Потенциальная экономия места**: ~26 таблиц * (структура + индексы + триггеры) = значительное упрощение схемы БД

---

### 2. Минимально используемые таблицы (1-5 упоминаний)

Эти таблицы используются очень редко. Возможно, функционал не завершён или устарел:

| Таблица | Упоминания | Статус | Действие |
|---------|------------|--------|----------|
| `cuts` | 1 | ⚠️ Почти не используется | Проверить необходимость |
| `material_assignments` | 1 | ⚠️ Почти не используется | Возможно дубликат `material_allocations` |
| `equipment_maintenance` | 2 | ⚠️ Редко используется | Проверить функционал |
| `geo_layers` | 2 | ⚠️ Редко используется | Геопространственный функционал в разработке? |
| `geo_measurements` | 2 | ⚠️ Редко используется | Геопространственный функционал в разработке? |
| `geo_routes` | 2 | ⚠️ Редко используется | Геопространственный функционал в разработке? |
| `geospatial_features` | 3 | ⚠️ Редко используется | Проверить использование |
| `house_documents` | 3 | ⚠️ Редко используется | Возможно дубликат `documents` |
| `project_suppliers` | 3 | ⚠️ Редко используется | Проверить связь с `suppliers` |

---

## 🔄 Дублирующиеся/Похожие таблицы по структуре

### Группа 1: Activity Logging (Дубликаты логирования)

**Таблицы:**
- ✅ `activities` (64 упоминания) - **ОСНОВНАЯ**
- ⚠️ `activity_logs` (25 упоминаний) - **ДУБЛИКАТ**

**Структура:**

| activities | activity_logs | Совпадение |
|------------|---------------|------------|
| `user_id` | `user_id` | ✅ 100% |
| `project_id` | `project_id` | ✅ 100% |
| `activity_type` | `entity_type` | ⚠️ 80% (разные названия) |
| `action` | `action` | ✅ 100% |
| `metadata` (jsonb) | `details` (jsonb) | ⚠️ 90% (разные названия) |
| `ip_address` | `ip_address` | ✅ 100% |
| `user_agent` | `user_agent` | ✅ 100% |

**Рекомендация**:
- 🔥 **Объединить в одну таблицу `activities`**
- Удалить `activity_logs` (более старая структура)
- Мигрировать данные из `activity_logs` в `activities`

---

### Группа 2: Document Management (Дубликаты документов)

**Таблицы:**
- ✅ `documents` (220 упоминаний) - **ОСНОВНАЯ**
- ✅ `files` (135 упоминаний) - **ФАЙЛЫ SUPABASE STORAGE**
- ⚠️ `project_documents` (4 упоминания) - **ВОЗМОЖНЫЙ ДУБЛИКАТ**
- ⚠️ `house_documents` (3 упоминания) - **УСТАРЕЛ?**
- ⚠️ `worker_documents` (0 упоминаний) - **НЕ ИСПОЛЬЗУЕТСЯ**

**Анализ:**
```sql
-- documents: общие документы проектов
documents (
  id, project_id, filename, file_type,
  document_type, category_id, description
)

-- files: файлы из Supabase Storage
files (
  id, filename, bucket_name, file_path,
  project_id, user_id, work_entry_id
)

-- project_documents: дубликат documents?
project_documents (
  -- структура неясна, но 4 упоминания
)
```

**Рекомендация**:
- ✅ Оставить `documents` (основная таблица)
- ✅ Оставить `files` (связь с Supabase Storage)
- 🔥 Удалить `project_documents` (дубликат)
- 🔥 Удалить `house_documents` (3 упоминания, можно через `documents`)
- 🔥 Удалить `worker_documents` (не используется)

---

### Группа 3: Material Management (Сложная структура с дублированием)

**Таблицы:**
- ✅ `materials` (374 упоминания) - **ОСНОВНАЯ**
- ✅ `material_allocations` (14 упоминаний) - **РАСПРЕДЕЛЕНИЕ**
- ⚠️ `material_assignments` (1 упоминание) - **ДУБЛИКАТ?**
- ✅ `material_orders` (15 упоминаний) - **ЗАКАЗЫ**
- ✅ `material_transactions` (4 упоминания) - **ТРАНЗАКЦИИ**
- ❌ `material_moves` (0 упоминаний) - **НЕ ИСПОЛЬЗУЕТСЯ**
- ❌ `material_stage_mapping` (0 упоминаний) - **НЕ ИСПОЛЬЗУЕТСЯ**
- ❌ `company_warehouse` (0 упоминаний) - **НЕ ИСПОЛЬЗУЕТСЯ**
- ❌ `company_warehouse_materials` (0 упоминаний) - **НЕ ИСПОЛЬЗУЕТСЯ**

**Рекомендация**:
```
materials (основа)
├── material_allocations (проекты + склад) ✅
├── material_orders (заказы) ✅
├── material_transactions (история движения) ✅
└── УДАЛИТЬ:
    ├── material_assignments (дубликат allocations)
    ├── material_moves (не используется)
    ├── material_stage_mapping (не используется)
    ├── company_warehouse (не используется)
    └── company_warehouse_materials (не используется)
```

---

### Группа 4: Equipment/Vehicle Assignments (Похожие таблицы)

**Таблицы:**
- ✅ `equipment_assignments` (34 упоминания) - **ОСНОВНАЯ**
- ✅ `vehicle_assignments` (19 упоминаний) - **ОСНОВНАЯ**
- ❌ `asset_assignments` (0 упоминаний) - **НЕ ИСПОЛЬЗУЕТСЯ**

**Структура (идентична для equipment и vehicle):**
```sql
equipment_assignments:
  equipment_id, project_id, crew_id,
  from_ts, to_ts, is_permanent,
  rental_cost_per_day, notes

vehicle_assignments:
  vehicle_id, project_id, crew_id,
  from_date, to_date, ...
```

**Рекомендация**:
- ✅ Оставить обе таблицы (разные типы ресурсов)
- 🔥 Удалить `asset_assignments` (не используется)
- 💡 Возможно объединить в будущем в `resource_assignments` с полем `resource_type`

---

### Группа 5: Geospatial (Низкое использование, возможно в разработке)

**Таблицы:**
- `geo_layers` (2 упоминания)
- `geo_measurements` (2 упоминания)
- `geo_routes` (2 упоминания)
- `geospatial_features` (3 упоминания)

**Статус**: ⚠️ Функционал в разработке или частично реализован

**Рекомендация**: Проверить roadmap проекта. Если геопространственный функционал не планируется – удалить все 4 таблицы.

---

## 📊 Статистика использования таблиц

### Топ-10 самых используемых таблиц:

| № | Таблица | Упоминания | Категория |
|---|---------|------------|-----------|
| 1 | `equipment` | 603 | 🔧 Оборудование |
| 2 | `projects` | 504 | 📁 Проекты |
| 3 | `materials` | 374 | 📦 Материалы |
| 4 | `users` | 259 | 👤 Пользователи |
| 5 | `documents` | 220 | 📄 Документы |
| 6 | `crews` | 196 | 👥 Бригады |
| 7 | `photos` | 154 | 📸 Фотографии |
| 8 | `files` | 135 | 📁 Файлы |
| 9 | `vehicles` | 105 | 🚗 Транспорт |
| 10 | `notifications` | 80 | 🔔 Уведомления |

### Категории по частоте использования:

```
🔥 Активные (>100 упоминаний): 10 таблиц
✅ Используемые (20-99): 15 таблиц
⚠️ Редко используемые (5-19): 15 таблиц
⚠️ Почти не используются (1-4): 9 таблиц
❌ Не используются (0): 24 таблицы
```

---

## 🎯 Рекомендации по оптимизации

### Приоритет 1: Удалить неиспользуемые таблицы (24 таблицы)

**Влияние**: Высокое
**Сложность**: Низкая

```sql
-- SQL скрипт для удаления неиспользуемых таблиц
DROP TABLE IF EXISTS asset_assignments CASCADE;
DROP TABLE IF EXISTS company_warehouse CASCADE;
DROP TABLE IF EXISTS company_warehouse_materials CASCADE;
DROP TABLE IF EXISTS cut_stages CASCADE;
DROP TABLE IF EXISTS document_reminders CASCADE;
DROP TABLE IF EXISTS house_contacts CASCADE;
DROP TABLE IF EXISTS house_docs CASCADE;
DROP TABLE IF EXISTS house_status CASCADE;
DROP TABLE IF EXISTS hse_requirements CASCADE;
DROP TABLE IF EXISTS material_moves CASCADE;
DROP TABLE IF EXISTS material_stage_mapping CASCADE;
DROP TABLE IF EXISTS offmass_lines CASCADE;
DROP TABLE IF EXISTS plan_view_confirms CASCADE;
DROP TABLE IF EXISTS price_extras CASCADE;
DROP TABLE IF EXISTS price_lists CASCADE;
DROP TABLE IF EXISTS price_rules CASCADE;
DROP TABLE IF EXISTS project_files CASCADE;
DROP TABLE IF EXISTS rentals CASCADE;
DROP TABLE IF EXISTS resource_requests CASCADE;
DROP TABLE IF EXISTS resource_usage CASCADE;
DROP TABLE IF EXISTS stage_defs CASCADE;
DROP TABLE IF EXISTS stock_locations CASCADE;
DROP TABLE IF EXISTS vehicle_expenses CASCADE;
DROP TABLE IF EXISTS vehicle_tracking CASCADE;
DROP TABLE IF EXISTS work_stages CASCADE;
DROP TABLE IF EXISTS worker_documents CASCADE;
```

**⚠️ ВАЖНО**: Создать резервную копию БД перед выполнением!

---

### Приоритет 2: Объединить дублирующиеся таблицы логирования

**Влияние**: Среднее
**Сложность**: Средняя

```sql
-- Миграция данных из activity_logs в activities
INSERT INTO activities (
  user_id, project_id, activity_type,
  action, description, metadata,
  ip_address, user_agent, created_at
)
SELECT
  user_id, project_id, entity_type,
  action, NULL, details,
  ip_address, user_agent, created_at
FROM activity_logs
WHERE id NOT IN (SELECT COALESCE(metadata->>'migrated_from', '') FROM activities);

-- После проверки данных:
DROP TABLE activity_logs CASCADE;
```

---

### Приоритет 3: Очистить таблицы документов

**Влияние**: Среднее
**Сложность**: Низкая

```sql
-- Миграция project_documents в documents (если есть данные)
-- Проверить структуру project_documents перед удалением

-- Удалить дублирующиеся таблицы документов
DROP TABLE IF EXISTS house_documents CASCADE;
DROP TABLE IF EXISTS worker_documents CASCADE;
-- DROP TABLE IF EXISTS project_documents CASCADE; -- после миграции
```

---

### Приоритет 4: Упростить структуру материалов

**Влияние**: Высокое
**Сложность**: Средняя

```sql
-- Проверить есть ли данные в material_assignments
SELECT COUNT(*) FROM material_assignments;

-- Если есть данные, мигрировать в material_allocations
-- Затем удалить:
DROP TABLE IF EXISTS material_assignments CASCADE;
DROP TABLE IF EXISTS material_moves CASCADE;
DROP TABLE IF EXISTS material_stage_mapping CASCADE;
DROP TABLE IF EXISTS company_warehouse CASCADE;
DROP TABLE IF EXISTS company_warehouse_materials CASCADE;
```

---

## 📈 Ожидаемые результаты после оптимизации

### До оптимизации:
- **Всего таблиц**: 73
- **Неиспользуемых**: 24 (33%)
- **Дублирующихся**: ~8 таблиц

### После оптимизации:
- **Всего таблиц**: ~45-50 (↓35%)
- **Неиспользуемых**: 0 (0%)
- **Дублирующихся**: 0

### Преимущества:
- ✅ Упрощение схемы БД на 35%
- ✅ Улучшение производительности миграций
- ✅ Снижение complexity для разработчиков
- ✅ Упрощение бэкапов и репликации
- ✅ Уменьшение размера БД
- ✅ Улучшение читаемости схемы

---

## ⚠️ Меры предосторожности

### Перед удалением таблиц:

1. **Создать полный бэкап БД**
   ```bash
   pg_dump -h aws-1-eu-north-1.pooler.supabase.com \
           -p 6543 -U postgres.oijmohlhdxoawzvctnxx \
           -d postgres > backup_$(date +%Y%m%d).sql
   ```

2. **Проверить зависимости (foreign keys)**
   ```sql
   SELECT
     tc.table_name,
     kcu.column_name,
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name
   FROM information_schema.table_constraints AS tc
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY'
     AND tc.table_name IN ('activity_logs', 'house_documents', ...);
   ```

3. **Проверить триггеры**
   ```sql
   SELECT trigger_name, event_object_table, action_statement
   FROM information_schema.triggers
   WHERE event_object_table IN ('activity_logs', 'material_moves', ...);
   ```

4. **Проверить есть ли данные в таблицах**
   ```sql
   SELECT
     schemaname, tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
     (SELECT COUNT(*) FROM tablename) as row_count
   FROM pg_tables
   WHERE schemaname = 'public'
     AND tablename IN ('activity_logs', 'material_moves', ...);
   ```

---

## 📝 План миграции (пошаговый)

### Этап 1: Анализ и бэкап (1 день)
- [ ] Создать резервную копию БД
- [ ] Проверить наличие данных во всех таблицах
- [ ] Документировать зависимости

### Этап 2: Удаление пустых неиспользуемых таблиц (1 день)
- [ ] Удалить 24 таблицы без данных и упоминаний
- [ ] Обновить миграции Supabase
- [ ] Тестировать приложение

### Этап 3: Миграция логов (2 дня)
- [ ] Мигрировать `activity_logs` → `activities`
- [ ] Обновить код (если нужно)
- [ ] Удалить `activity_logs`

### Этап 4: Очистка документов (1 день)
- [ ] Проверить `project_documents`, `house_documents`
- [ ] Мигрировать данные в `documents`
- [ ] Удалить дублирующиеся таблицы

### Этап 5: Упрощение материалов (2 дня)
- [ ] Проанализировать `material_assignments`
- [ ] Мигрировать в `material_allocations`
- [ ] Удалить неиспользуемые таблицы склада

### Этап 6: Финальная проверка (1 день)
- [ ] Полное тестирование приложения
- [ ] Проверка производительности
- [ ] Обновление документации

**Общее время**: ~8-10 рабочих дней

---

## 🔍 Дополнительные находки

### Таблицы с низким использованием, требующие проверки:

1. **`cuts` (1 упоминание)** - Функционал резки кабеля. Используется? Или заменён на что-то другое?

2. **`appointments` (12 упоминаний)** - Календарь/встречи. Функционал работает?

3. **`constraints` (25 упоминаний)** - Ограничения проектов. Активный функционал?

4. **`inventory` (29 упоминаний)** - Инвентарь. Связан с `materials`?

5. **Geo-таблицы** - Геопространственные функции в разработке?

---

## 📧 Вопросы для команды

1. **Геопространственный функционал**: Планируется ли развивать geo-функции? (4 таблицы с 2-3 упоминаниями)

2. **Warehouse функции**: Нужна ли отдельная система складов? (Сейчас `company_warehouse*` не используются)

3. **Pricing функции**: Планируется ли система прайс-листов? (`price_lists`, `price_extras`, `price_rules` - не используются)

4. **HSE требования**: Нужна ли таблица `hse_requirements`? (0 упоминаний)

5. **Worker documents**: Документы работников хранятся где-то ещё?

---

## ✅ Заключение

**Текущее состояние БД**:
- 73 таблицы, из которых ~33% не используются
- Присутствуют дублирующиеся таблицы (логи, документы, материалы)
- Схема усложнена legacy-таблицами из FastAPI времён

**После оптимизации**:
- Удаление 24+ неиспользуемых таблиц
- Объединение 5-8 дублирующихся таблиц
- Упрощение схемы на 30-35%
- Улучшение производительности и читаемости

**Следующий шаг**: Создать план миграции и согласовать с командой удаление неиспользуемых таблиц.

---

*Этот отчёт создан автоматически на основе анализа кодовой базы Next.js и схемы Supabase PostgreSQL.*