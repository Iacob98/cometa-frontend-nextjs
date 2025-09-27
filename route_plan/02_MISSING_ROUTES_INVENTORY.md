# Инвентарь нереализованных API роутов

## 🔴 КРИТИЧЕСКИЙ ПРИОРИТЕТ - Основные бизнес сущности

### `/api/materials` ❌ ПУСТОЙ

**Таблица БД:** `materials`
**Описание:** Управление строительными материалами
**Поля:** id, name, unit, sku, description, default_price_eur, purchase_price_eur, current_stock_qty
**Требуемые операции:**

- `GET /api/materials` - Список материалов с пагинацией, поиском, фильтрацией по unit
- `POST /api/materials` - Создание нового материала
- `PUT /api/materials/[id]` - Обновление материала
- `DELETE /api/materials/[id]` - Удаление материала

### `/api/suppliers` ❌ ПУСТОЙ

**Таблица БД:** `suppliers`
**Описание:** Управление поставщиками
**Поля:** id, name, contact_info, address, company_name, contact_person, phone, email, is_active, notes, org_name
**Требуемые операции:**

- `GET /api/suppliers` - Список поставщиков с фильтрацией по is_active
- `POST /api/suppliers` - Создание поставщика
- `PUT /api/suppliers/[id]` - Обновление данных поставщика
- `DELETE /api/suppliers/[id]` - Деактивация поставщика

### `/api/material-orders` ❌ ПУСТОЙ

**Таблица БД:** `material_orders`
**Описание:** Заказы материалов от поставщиков
**Связанные таблицы:** `supplier_materials`, `projects`, `users`
**Требуемые операции:**

- `GET /api/material-orders` - Список заказов с фильтрацией по project_id, status, дате
- `POST /api/material-orders` - Создание заказа
- `PUT /api/material-orders/[id]` - Обновление статуса заказа
- `DELETE /api/material-orders/[id]` - Отмена заказа

### `/api/housing-units` ❌ ПУСТОЙ

**Таблица БД:** `housing_units`
**Описание:** Жилищные единицы для размещения рабочих
**Связанные таблицы:** `housing_allocations`, `projects`
**Требуемые операции:**

- `GET /api/housing-units` - Список жилья с фильтрацией по project_id, статусу
- `POST /api/housing-units` - Добавление жилищной единицы
- `PUT /api/housing-units/[id]` - Обновление данных жилья
- `DELETE /api/housing-units/[id]` - Удаление жилья

### `/api/documents` ❌ ПУСТОЙ

**Таблицы БД:** `project_documents`, `house_documents`, `worker_documents`
**Описание:** Управление документами проекта
**Требуемые операции:**

- `GET /api/documents` - Список документов с фильтрацией по типу, проекту
- `POST /api/documents` - Загрузка документа
- `DELETE /api/documents/[id]` - Удаление документа

## 🟡 ВЫСОКИЙ ПРИОРИТЕТ - Операционная логика

### `/api/material-allocations` ❌ ПУСТОЙ

**Таблица БД:** `material_allocations`
**Описание:** Распределение материалов по проектам/экипажам
**Связанные таблицы:** `materials`, `projects`, `crews`, `users`
**Требуемые операции:**

- `GET /api/material-allocations` - Список распределений
- `POST /api/material-allocations` - Создание распределения
- `PUT /api/material-allocations/[id]` - Обновление количества

### `/api/suppliers/[id]/materials` ❌ НЕ ПРОВЕРЕН

**Таблица БД:** `supplier_materials`
**Описание:** Материалы конкретного поставщика
**Требуемые операции:**

- `GET /api/suppliers/[id]/materials` - Материалы поставщика
- `POST /api/suppliers/[id]/materials` - Добавление материала поставщику

### `/api/suppliers/[id]/contacts` ❌ НЕ ПРОВЕРЕН

**Таблица БД:** `supplier_contacts`
**Описание:** Контакты поставщика
**Требуемые операции:**

- `GET /api/suppliers/[id]/contacts` - Список контактов
- `POST /api/suppliers/[id]/contacts` - Добавление контакта
- `PUT /api/suppliers/[id]/contacts/[contactId]` - Обновление контакта

## 🟠 СРЕДНИЙ ПРИОРИТЕТ - Расширенная функциональность

### `/api/houses` + вложенные роуты ❌ НЕ ПРОВЕРЕНЫ

**Таблица БД:** `houses`
**Описание:** Управление домами в проектах
**Связанные таблицы:** `house_contacts`, `house_documents`, `house_status`, `appointments`
**Требуемые операции:**

- `GET /api/houses` - Список домов
- `POST /api/houses` - Добавление дома
- `GET /api/houses/project/[id]` - Дома проекта
- `PUT /api/houses/[id]` - Обновление дома

### `/api/equipment/analytics` ❌ НЕ ПРОВЕРЕН

**Таблицы БД:** `equipment`, `equipment_assignments`, `equipment_maintenance`
**Описание:** Аналитика использования оборудования
**Требуемые операции:**

- `GET /api/equipment/analytics` - Статистика оборудования

### `/api/equipment/assignments` ❌ НЕ ПРОВЕРЕН

**Таблица БД:** `equipment_assignments`
**Описание:** Назначения оборудования экипажам
**Требуемые операции:**

- `GET /api/equipment/assignments` - Список назначений
- `POST /api/equipment/assignments` - Создание назначения
- `PUT /api/equipment/assignments/[id]` - Обновление назначения

### `/api/materials/warehouse` ❌ НЕ ПРОВЕРЕН

**Таблица БД:** `company_warehouse`, `company_warehouse_materials`
**Описание:** Складские операции
**Требуемые операции:**

- `GET /api/materials/warehouse` - Складские остатки
- `POST /api/materials/warehouse` - Операции со складом

## 🔵 НИЗКИЙ ПРИОРИТЕТ - Специализированная функциональность

### `/api/reports/generate` ❌ НЕ ПРОВЕРЕН

**Описание:** Генерация отчетов
**Требуемые операции:**

- `POST /api/reports/generate` - Создание отчета

### `/api/project-preparation/*` ⚠️ ЧАСТИЧНО РЕАЛИЗОВАН

**Таблицы БД:** `project_plans`, `utility_contacts`, `facilities`
**Описание:** Подготовка проектов (сейчас мок-данные)
**Требуемые операции:**

- Полная реализация с реальными данными БД

### Дополнительные вложенные роуты:

- `/api/projects/[id]/documents` - Документы проекта
- `/api/projects/[id]/stats` - Статистика проекта
- `/api/projects/[id]/team` - Команда проекта
- `/api/crews/[id]/members` - Участники экипажа
- `/api/users/[id]/documents` - Документы пользователя
- `/api/work-entries/[id]/approve` - Одобрение записей работы

## 📊 Сводная статистика по приоритетам

### По критичности:

- 🔴 **КРИТИЧЕСКИЙ:** 5 роутов (materials, suppliers, material-orders, housing-units, documents)
- 🟡 **ВЫСОКИЙ:** 3 роута (material-allocations, supplier materials/contacts)
- 🟠 **СРЕДНИЙ:** 4 роута (houses, equipment analytics/assignments, warehouse)
- 🔵 **НИЗКИЙ:** 10+ роутов (reports, вложенные операции)

### По типу данных:

- **Материалы и поставки:** 8 роутов
- **Жилье и объекты:** 3 роута
- **Оборудование:** 2 роута
- **Документы:** 3 роута
- **Отчеты и аналитика:** 2 роута
- **Вложенные операции:** 8+ роутов

**Общий объем работ:** ~25-30 новых API эндпоинтов

## 🎯 Рекомендации по реализации

### Очередность разработки:

1. **Материалы** → **Поставщики** → **Заказы материалов** (связанная цепочка)
2. **Документы** → **Жилищные единицы** (независимые критичные)
3. **Распределение материалов** → **Контакты поставщиков** (дополнительная логика)
4. **Аналитика и отчеты** (после основной функциональности)

### Архитектурные требования:

- Использовать Supabase клиент (как в работающих роутах)
- Стандартная пагинация и фильтрация
- Консистентная обработка ошибок
- Валидация входных данных
- Поддержка связанных данных через joins

---

_Составлено на основе анализа схемы БД и существующих роутов_
_Дата: 2025-01-26_
