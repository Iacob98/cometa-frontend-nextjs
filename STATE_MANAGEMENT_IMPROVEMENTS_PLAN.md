# 🎯 Plan for State Management Improvements

**Дата**: 2025-09-30
**Базируется на**: STATE_MANAGEMENT_ANALYSIS_REPORT.md
**Текущая оценка**: 8.5/10
**Целевая оценка**: 9.5/10

---

## 📋 Этапы реализации

### Этап 1: Разбиение use-materials.ts (КРИТИЧНО) 🔴

**Приоритет**: HIGH
**Время**: 4-6 часов
**Текущая проблема**: Файл `src/hooks/use-materials.ts` содержит 750 строк с множественными ответственностями

#### Структура после рефакторинга:

```
src/hooks/materials/
├── index.ts                      # Re-exports всех hooks
├── use-materials.ts              # Базовый CRUD (100 строк)
│   - useMaterials() - список материалов
│   - useMaterial(id) - один материал
│   - useCreateMaterial()
│   - useUpdateMaterial()
│   - useDeleteMaterial()
│
├── use-material-allocations.ts   # Назначение материалов (80 строк)
│   - useProjectMaterials(projectId)
│   - useAllocateMaterial()
│   - useUpdateAllocation()
│   - useRemoveAllocation()
│
├── use-material-orders.ts        # Заказы поставщикам (120 строк)
│   - useMaterialOrders()
│   - useMaterialOrder(id)
│   - useCreateOrder()
│   - useUpdateOrder()
│   - useApproveOrder()
│
├── use-material-consumption.ts   # Расход материалов (100 строк)
│   - useConsumeMaterial()
│   - useMaterialConsumptionHistory()
│   - useRevertConsumption()
│
├── use-material-reservations.ts  # Резервирование (80 строк)
│   - useReserveMaterial()
│   - useReleaseReservation()
│   - useProjectReservations()
│
├── use-material-movements.ts     # Перемещения (60 строк)
│   - useMaterialMovements()
│   - useTransferMaterial()
│   - useMovementHistory()
│
├── use-supplier-materials.ts     # Материалы поставщиков (80 строк)
│   - useSupplierMaterials(supplierId)
│   - useSupplierMaterialPricing()
│
└── use-unified-warehouse.ts      # Объединённый склад (80 строк)
    - useUnifiedWarehouseMaterials()
    - useWarehouseStats()
```

#### План действий:

1. **Создать директорию** `src/hooks/materials/`
2. **Экстракт базового CRUD** в `use-materials.ts`
3. **Переместить allocations** в `use-material-allocations.ts`
4. **Переместить orders** в `use-material-orders.ts`
5. **Переместить consumption** в `use-material-consumption.ts`
6. **Переместить reservations** в `use-material-reservations.ts`
7. **Переместить movements** в `use-material-movements.ts`
8. **Переместить supplier logic** в `use-supplier-materials.ts`
9. **Переместить unified warehouse** в `use-unified-warehouse.ts`
10. **Создать index.ts** с re-exports
11. **Обновить импорты** в компонентах (find & replace)
12. **Удалить старый файл** `src/hooks/use-materials.ts`

#### Пример кода для index.ts:

```typescript
// src/hooks/materials/index.ts
export * from './use-materials';
export * from './use-material-allocations';
export * from './use-material-orders';
export * from './use-material-consumption';
export * from './use-material-reservations';
export * from './use-material-movements';
export * from './use-supplier-materials';
export * from './use-unified-warehouse';

// Centralized cache invalidation
import { useQueryClient } from '@tanstack/react-query';
import { materialKeys } from './use-materials';

export function useInvalidateAllMaterialQueries() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: materialKeys.all });
    queryClient.invalidateQueries({ queryKey: ['material-allocations'] });
    queryClient.invalidateQueries({ queryKey: ['material-orders'] });
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
  };
}
```

#### Тестирование:

```bash
# После рефакторинга
npm run type-check          # Проверить TypeScript ошибки
npm run lint               # Проверить ESLint
npm run dev --turbopack    # Запустить и проверить работу
curl http://localhost:3000/dashboard/materials  # Проверить страницу материалов
```

---

### Этап 2: Оптимизация инвалидации кэша (СРЕДНИЙ) 🟡

**Приоритет**: MEDIUM
**Время**: 2-3 часа
**Проблема**: Избыточная инвалидация кэша - обновляются данные, которые не изменились

#### Примеры оптимизации:

##### Было (широкая инвалидация):

```typescript
// src/hooks/use-work-entries.ts
export function useCreateWorkEntry() {
  return useMutation({
    onSuccess: (workEntry) => {
      // ❌ TOO BROAD - инвалидирует ВСЕ проекты
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["work-entries"] });
    },
  });
}
```

##### Стало (точечная инвалидация):

```typescript
// src/hooks/use-work-entries.ts
export function useCreateWorkEntry() {
  return useMutation({
    onSuccess: (workEntry) => {
      // ✅ BETTER - инвалидировать только затронутые данные
      queryClient.invalidateQueries({
        queryKey: ["projects", "detail", workEntry.project_id]
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", "detail", workEntry.project_id, "stats"]
      });
      queryClient.invalidateQueries({
        queryKey: ["work-entries", "list", { projectId: workEntry.project_id }]
      });
    },
  });
}
```

#### Файлы для оптимизации:

1. `src/hooks/use-work-entries.ts` - useCreateWorkEntry, useUpdateWorkEntry
2. `src/hooks/use-materials.ts` (после разбиения - use-material-consumption.ts) - useConsumeMaterial
3. `src/hooks/use-projects.ts` - useUpdateProject
4. `src/hooks/use-equipment.ts` - useAssignEquipment
5. `src/hooks/use-crews.ts` - useAssignCrew

#### План действий:

1. **Найти все мутации** с широкой инвалидацией:
   ```bash
   grep -r "invalidateQueries.*\[\"projects\"\]" src/hooks/
   grep -r "invalidateQueries.*\[\"materials\"\]" src/hooks/
   ```

2. **Заменить на точечную инвалидацию** для каждой мутации

3. **Добавить setQueryData** для мгновенных обновлений:
   ```typescript
   onSuccess: (data, variables) => {
     // Обновить кэш напрямую вместо инвалидации
     queryClient.setQueryData(
       ["projects", "detail", variables.id],
       (old) => ({ ...old, ...data })
     );
   }
   ```

---

### Этап 3: Retry strategy для мутаций (СРЕДНИЙ) 🟡

**Приоритет**: MEDIUM
**Время**: 1-2 часа
**Проблема**: Мутации не повторяются при сетевых ошибках

#### Реализация:

##### 1. Создать утилиту для retry:

```typescript
// src/lib/query-utils.ts
export const mutationRetryConfig = {
  retry: 3,
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
};

export function getMutationConfig(onRetryExhausted?: () => void) {
  return {
    ...mutationRetryConfig,
    onError: (error: Error, variables: any, context: any) => {
      const retries = (context as any)?.failureCount || 0;
      if (retries >= 3) {
        // Показать toast с возможностью повтора
        toast.error(`Failed after ${retries} attempts`, {
          action: {
            label: 'Retry',
            onClick: onRetryExhausted,
          },
        });
      }
    },
  };
}
```

##### 2. Применить к критичным мутациям:

```typescript
// src/hooks/use-projects.ts
export function useCreateProject() {
  return useMutation({
    mutationFn: createProject,
    ...getMutationConfig(() => {
      // Retry callback
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    }),
    onSuccess: (data) => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
```

#### Файлы для обновления:

1. `src/hooks/use-projects.ts` - useCreateProject, useUpdateProject
2. `src/hooks/use-work-entries.ts` - useCreateWorkEntry
3. `src/hooks/materials/use-material-orders.ts` - useCreateOrder
4. `src/hooks/use-equipment.ts` - useAssignEquipment

---

### Этап 4: Унификация query keys (НИЗКИЙ) 🟢

**Приоритет**: LOW
**Время**: 1-2 часа
**Проблема**: 5-10% query keys определены inline без фабрик

#### План действий:

1. **Создать централизованную директорию**:
   ```
   src/lib/query-keys/
   ├── index.ts          # Re-exports
   ├── projects.ts       # projectKeys
   ├── materials.ts      # materialKeys
   ├── work-entries.ts   # workEntryKeys
   ├── users.ts          # userKeys
   ├── crews.ts          # crewKeys
   ├── equipment.ts      # equipmentKeys
   └── suppliers.ts      # supplierKeys
   ```

2. **Переместить существующие фабрики** из hooks в query-keys

3. **Создать фабрики для inline ключей**:
   ```typescript
   // src/lib/query-keys/users.ts
   export const userKeys = {
     all: ['users'] as const,
     lists: () => [...userKeys.all, 'list'] as const,
     list: (filters: UserFilters) => [...userKeys.lists(), { filters }] as const,
     active: () => [...userKeys.all, 'active'] as const,
     details: () => [...userKeys.all, 'detail'] as const,
     detail: (id: string) => [...userKeys.details(), id] as const,
   };
   ```

4. **Обновить импорты** в hooks и компонентах

---

### Этап 5: Агрессивный Garbage Collection (НИЗКИЙ) 🟢

**Приоритет**: LOW
**Время**: 30 минут
**Проблема**: Кэш может расти бесконтрольно

#### Реализация:

```typescript
// src/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // ✅ NEW: 10 minutes garbage collection
      retry: (failureCount, error) => {
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        return failureCount < 3;
      },
    },
  },
});

// ✅ NEW: Мониторинг размера кэша
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    console.log(`Query cache size: ${queries.length} queries`);

    if (queries.length > 100) {
      console.warn('⚠️ Query cache is growing large. Consider more aggressive GC.');
    }
  }, 60000); // Каждую минуту
}
```

---

## 🎯 Порядок выполнения (рекомендуемый)

### День 1 (4-6 часов):
1. ✅ **Этап 1**: Разбить `use-materials.ts` на модули
   - Создать структуру директорий
   - Экстракт каждой группы функций
   - Создать index.ts
   - Обновить импорты
   - **Тестировать после каждого шага!**

### День 2 (2-3 часа):
2. ✅ **Этап 2**: Оптимизировать инвалидацию кэша
   - Найти все широкие инвалидации
   - Заменить на точечные
   - Добавить setQueryData где возможно
   - **Тестировать производительность!**

### День 3 (1-2 часа):
3. ✅ **Этап 3**: Добавить retry strategy
   - Создать утилиту getMutationConfig
   - Применить к критичным мутациям
   - **Тестировать retry механизм!**

### День 4 (1-2 часа):
4. ✅ **Этап 4**: Унифицировать query keys
   - Создать src/lib/query-keys/
   - Переместить фабрики
   - Создать недостающие
   - Обновить импорты

### День 5 (30 минут):
5. ✅ **Этап 5**: Настроить GC
   - Добавить gcTime в queryClient
   - Добавить мониторинг (для dev)

---

## ✅ Критерии успеха

### После Этапа 1:
- [ ] `src/hooks/materials/` содержит 8 модулей
- [ ] Старый `use-materials.ts` удалён
- [ ] Все импорты обновлены
- [ ] Приложение запускается без ошибок
- [ ] Страница `/dashboard/materials` работает корректно
- [ ] TypeScript проверка проходит
- [ ] ESLint проверка проходит

### После Этапа 2:
- [ ] Все мутации используют точечную инвалидацию
- [ ] Нет широких `invalidateQueries({ queryKey: ["projects"] })`
- [ ] Используется `setQueryData` для мгновенных обновлений
- [ ] Меньше сетевых запросов при мутациях (проверить в DevTools)

### После Этапа 3:
- [ ] Критичные мутации имеют retry
- [ ] Toast показывает retry action после 3 попыток
- [ ] Работает exponential backoff
- [ ] Мутации восстанавливаются при кратковременных сбоях сети

### После Этапа 4:
- [ ] Все query keys используют фабрики
- [ ] `src/lib/query-keys/` содержит все фабрики
- [ ] Нет inline query keys в компонентах
- [ ] Единообразный стиль во всех hooks

### После Этапа 5:
- [ ] `gcTime` настроен в queryClient
- [ ] Мониторинг кэша работает в dev mode
- [ ] Кэш не растёт бесконтрольно

---

## 📊 Ожидаемые результаты

### Метрики до оптимизации:
- **Размер кода**: `use-materials.ts` - 750 строк
- **Когнитивная сложность**: Высокая (все в одном файле)
- **Инвалидация кэша**: Избыточная (лишние запросы)
- **Надёжность**: Нет retry для мутаций
- **Консистентность**: 10% inline query keys

### Метрики после оптимизации:
- **Размер кода**: 8 модулей по 60-120 строк
- **Когнитивная сложность**: Низкая (разделение ответственности)
- **Инвалидация кэша**: Точечная (минимум запросов)
- **Надёжность**: Retry с exponential backoff
- **Консистентность**: 100% query key фабрики

### Оценка качества:
- **До**: 8.5/10
- **После Этапа 1**: 9.0/10 (+0.5)
- **После Этапа 2**: 9.2/10 (+0.2)
- **После Этапа 3**: 9.4/10 (+0.2)
- **После Этапов 4-5**: 9.5/10 (+0.1)

---

## ⚠️ Важные предупреждения

### Во время рефакторинга:

1. **Сохраняйте Git commits** после каждого этапа:
   ```bash
   git add .
   git commit -m "refactor: Split use-materials.ts into modules (Step 1/5)"
   ```

2. **Тестируйте после каждого изменения**:
   ```bash
   npm run type-check  # TypeScript
   npm run lint       # ESLint
   npm run dev        # Запуск приложения
   ```

3. **Проверяйте функциональность вручную**:
   - Создание материала
   - Назначение материала проекту
   - Расход материала
   - Заказ у поставщика
   - Резервирование материала

4. **Используйте React Query DevTools**:
   - Проверяйте invalidations
   - Смотрите на количество запросов
   - Проверяйте cache entries

5. **Мониторьте production** (после деплоя):
   - Нет увеличения ошибок
   - Время ответа API не ухудшилось
   - Пользователи не жалуются на баги

---

## 📚 Ресурсы и документация

- [TanStack Query - Query Keys](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [TanStack Query - Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [TanStack Query - Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [TanStack Query - Garbage Collection](https://tanstack.com/query/latest/docs/react/guides/caching)
- [React Hook Design Patterns](https://kentcdodds.com/blog/how-to-use-react-context-effectively)

---

*План создан автоматически на основе STATE_MANAGEMENT_ANALYSIS_REPORT.md*