-- МАКСИМАЛЬНО ОПТИМИЗИРОВАННАЯ RPC ФУНКЦИЯ ДЛЯ PROJECTS
-- Основано на изученных Context7 паттернах для Supabase оптимизации
-- Устраняет последние узкие места в performance

-- Удаляем старую версию если существует
DROP FUNCTION IF EXISTS get_projects_with_progress_optimized(integer, integer);

-- Создаем функцию с максимальными оптимизациями
CREATE OR REPLACE FUNCTION get_projects_with_progress_optimized(
    project_limit integer DEFAULT 20,
    project_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    name text,
    customer text,
    city text,
    address text,
    contact_24h text,
    start_date timestamp with time zone,
    end_date_plan timestamp with time zone,
    status text,
    total_length_m numeric,
    base_rate_per_m numeric,
    pm_user_id uuid,
    language_default text,
    pm_first_name text,
    pm_last_name text,
    completed_hours numeric,
    progress_percentage numeric
) AS $$
BEGIN
    -- ОПТИМИЗАЦИЯ 1: Один запрос с агрегацией и JOINs
    -- Избегаем N+1 проблему полностью
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.customer,
        p.city,
        p.address,
        p.contact_24h,
        p.start_date,
        p.end_date_plan,
        p.status,
        p.total_length_m,
        p.base_rate_per_m,
        p.pm_user_id,
        p.language_default,
        u.first_name as pm_first_name,
        u.last_name as pm_last_name,
        -- ОПТИМИЗАЦИЯ 2: Агрегация на уровне SQL
        COALESCE(SUM(we.duration_hours), 0)::numeric as completed_hours,
        -- ОПТИМИЗАЦИЯ 3: Вычисление процентов в SQL
        CASE
            WHEN p.total_length_m > 0 THEN
                (COALESCE(SUM(we.duration_hours), 0) / p.total_length_m * 100)::numeric
            ELSE 0::numeric
        END as progress_percentage
    FROM projects p
    -- ОПТИМИЗАЦИЯ 4: LEFT JOIN для сохранения всех проектов
    LEFT JOIN users u ON p.pm_user_id = u.id
    -- ОПТИМИЗАЦИЯ 5: LEFT JOIN с фильтрацией для работ
    LEFT JOIN work_entries we ON p.id = we.project_id
        AND we.duration_hours IS NOT NULL
        AND we.duration_hours > 0
    WHERE p.status = 'active'
    GROUP BY
        p.id, p.name, p.customer, p.city, p.address,
        p.contact_24h, p.start_date, p.end_date_plan,
        p.status, p.total_length_m, p.base_rate_per_m,
        p.pm_user_id, p.language_default,
        u.first_name, u.last_name
    -- ОПТИМИЗАЦИЯ 6: Сортировка по индексу
    ORDER BY p.start_date DESC NULLS LAST, p.created_at DESC
    -- ОПТИМИЗАЦИЯ 7: Пагинация на уровне SQL
    LIMIT project_limit
    OFFSET project_offset;
END;
$$ LANGUAGE plpgsql
   STABLE          -- Функция не изменяет данные - позволяет кэширование
   SECURITY DEFINER -- Безопасность как в Context7 примерах
   SET search_path = public, extensions; -- Безопасность пути поиска

-- КОММЕНТАРИИ ДЛЯ ОПТИМИЗАЦИИ
COMMENT ON FUNCTION get_projects_with_progress_optimized IS
'Максимально оптимизированная функция для получения проектов с прогрессом.
Устраняет N+1 проблему, использует агрегацию SQL, поддерживает пагинацию.
Основана на Supabase Context7 best practices для production performance.';

-- СОЗДАЕМ ИНДЕКСЫ ДЛЯ МАКСИМАЛЬНОЙ ПРОИЗВОДИТЕЛЬНОСТИ
-- Проверяем и создаем только если не существуют

-- Индекс для фильтра по статусу и сортировки
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'projects'
        AND indexname = 'idx_projects_status_start_date_created'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_projects_status_start_date_created
        ON projects (status, start_date DESC NULLS LAST, created_at DESC);

        RAISE NOTICE 'Создан индекс: idx_projects_status_start_date_created';
    ELSE
        RAISE NOTICE 'Индекс уже существует: idx_projects_status_start_date_created';
    END IF;
END $$;

-- Индекс для JOIN с work_entries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'work_entries'
        AND indexname = 'idx_work_entries_project_id_duration'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_work_entries_project_id_duration
        ON work_entries (project_id, duration_hours)
        WHERE duration_hours IS NOT NULL AND duration_hours > 0;

        RAISE NOTICE 'Создан индекс: idx_work_entries_project_id_duration';
    ELSE
        RAISE NOTICE 'Индекс уже существует: idx_work_entries_project_id_duration';
    END IF;
END $$;

-- Индекс для JOIN с users (PM)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'users'
        AND indexname = 'idx_users_id_names'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_users_id_names
        ON users (id, first_name, last_name);

        RAISE NOTICE 'Создан индекс: idx_users_id_names';
    ELSE
        RAISE NOTICE 'Индекс уже существует: idx_users_id_names';
    END IF;
END $$;

-- ТЕСТОВАЯ ФУНКЦИЯ ДЛЯ АНАЛИЗА ПРОИЗВОДИТЕЛЬНОСТИ
CREATE OR REPLACE FUNCTION analyze_projects_query_performance()
RETURNS TABLE (
    execution_time_ms numeric,
    rows_returned bigint,
    query_plan text
) AS $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    row_count bigint;
    plan_result text;
BEGIN
    -- Запускаем EXPLAIN ANALYZE
    SELECT string_agg(line, E'\n') INTO plan_result
    FROM (
        SELECT unnest(string_to_array(
            (SELECT string_agg(explanation, E'\n')
             FROM (SELECT explanation FROM explain (analyze, buffers)
                   SELECT * FROM get_projects_with_progress_optimized(20, 0)
                  ) t), E'\n'
        )) as line
    ) t;

    -- Измеряем время выполнения
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO row_count FROM get_projects_with_progress_optimized(20, 0);
    end_time := clock_timestamp();

    RETURN QUERY SELECT
        extract(epoch from (end_time - start_time)) * 1000,
        row_count,
        plan_result;
END;
$$ LANGUAGE plpgsql;

-- ФИНАЛЬНОЕ СООБЩЕНИЕ
SELECT 'Оптимизированная RPC функция создана успешно! Теперь можно использовать get_projects_with_progress_optimized() для максимальной производительности.' as message;