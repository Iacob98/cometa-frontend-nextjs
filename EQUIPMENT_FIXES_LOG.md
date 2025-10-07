# Equipment System Fixes Log

## Дата: 2025-10-07

---

## ✅ Задача 1: Удаление дублирующих API endpoints (ВЫПОЛНЕНО)

### Проблема
Найдены дублирующие endpoints для equipment assignments:
- `/api/equipment/assignments` - временный endpoint с файловым хранилищем
- `/api/resources/equipment-assignments` - правильный endpoint с Supabase

### Решение
1. ✅ Обновлен хук `use-equipment.ts` для использования `/api/resources/equipment-assignments`
2. ✅ Удалён файл `src/app/api/equipment/assignments/route.ts`
3. ✅ Commit: `89eb61a` - "fix: remove duplicate equipment assignments API endpoint"

### Результат
- Убрана путаница с endpoints
- Все запросы идут через унифицированный endpoint
- Удалено временное файловое хранилище

---

## ✅ Задача 2: Исправление несоответствий схемы БД (ВЫПОЛНЕНО)

### Проблема
В формах создания/редактирования equipment есть поля которых НЕТ в database schema:
- `purchase_price_eur` - нет в таблице equipment
- `rental_price_per_hour_eur` - нет в таблице equipment
- `current_location` - нет в таблице equipment

Эти поля игнорируются API при создании/обновлении, что создаёт путаницу.

### База данных (актуальная схема)
```sql
CREATE TABLE equipment (
    id uuid PRIMARY KEY,
    type text,  -- machine, tool, measuring_device
    name text NOT NULL,
    inventory_no text,
    status text,  -- available, in_use, maintenance, broken, assigned
    rental_cost_per_day numeric,  -- ✅ ЕСТЬ только daily rate
    purchase_date date,
    warranty_until date,
    description text,
    owned boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp,
    updated_at timestamp
)
```

### Файлы требующие исправления

#### 1. `/src/app/(dashboard)/dashboard/equipment/new/page.tsx`
Найдены проблемные места:
- Строка 47: `purchase_price_eur` в Zod схеме
- Строка 49: `rental_price_per_hour_eur` в Zod схеме
- Строка 50: `current_location` в Zod схеме
- Строка 83: `current_location` в defaultValues
- Строки 99-102: Все три поля в submission data
- Строка 283-295: FormField для current_location
- Строка 342-358: FormField для purchase_price_eur
- Строка 390-406: FormField для rental_price_per_hour_eur

#### 2. `/src/app/(dashboard)/dashboard/equipment/[id]/edit/page.tsx`
Нужно проверить и исправить аналогично

#### 3. `/src/app/(dashboard)/dashboard/equipment/page.tsx`
Проверить отображение данных

### Решение
1. ✅ Удалено из схемы валидации (equipmentFormSchema)
   - Удалено: `purchase_price_eur`, `rental_price_per_hour_eur`, `current_location`
   - Добавлено: `rental_cost_per_day` (соответствует БД)
2. ✅ Удалено из defaultValues
3. ✅ Удалено из submission data
4. ✅ Удалены FormField компоненты из UI
   - Удалено поле "Current Location" из основной вкладки
   - Удалено поле "Purchase Price" из финансовой вкладки
   - Удалено поле "Hourly Rental Rate" из финансовой вкладки
5. ✅ Исправлен edit form (идентичные изменения)
6. ✅ Обновлены TypeScript интерфейсы в `use-equipment.ts`
   - Интерфейс `Equipment` обновлен под схему БД
   - Интерфейс `CreateEquipmentData` обновлен под схему БД

### Файлы изменены
- `src/app/(dashboard)/dashboard/equipment/new/page.tsx`
- `src/app/(dashboard)/dashboard/equipment/[id]/edit/page.tsx`
- `src/hooks/use-equipment.ts`

### Результат
- Формы теперь полностью соответствуют schema базы данных
- Убрана путаница с несуществующими полями
- TypeScript типы синхронизированы с БД
- Нет попыток отправить несуществующие данные в API

---

## 📋 Задача 3: Создание отдельной страницы /dashboard/vehicles (ОЖИДАНИЕ)

### Проблема
Нет выделенной страницы для управления транспортом (vehicles).
Vehicles смешаны с equipment на главной странице equipment.

### План
1. Создать `/dashboard/vehicles/page.tsx` - главная страница с табами
2. Использовать существующие формы создания/редактирования
3. Добавить в sidebar навигацию
4. Обновить routes

---

## 📄 Задача 4: Финальная документация (ОЖИДАНИЕ)

Создать полную документацию со всеми изменениями и инструкциями по использованию.

---

## Команды для проверки

```bash
# Проверить что endpoint работает
curl http://localhost:3000/api/resources/equipment-assignments

# Проверить equipment form
open http://localhost:3000/dashboard/equipment/new

# Проверить git log
git log --oneline -5
```

## Контакты
- Файл с отчетом агента: `COMPREHENSIVE_EQUIPMENT_ANALYSIS.md` (будет создан)
- Этот лог: `EQUIPMENT_FIXES_LOG.md`
