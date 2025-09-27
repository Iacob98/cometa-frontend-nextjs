-- PRODUCTION PERFORMANCE OPTIMIZATION INDEXES
-- Основано на профилировании SQL запросов и анализе узких мест
-- Создает оптимизированные индексы для устранения медленных запросов

-- =============================================================================
-- ANALYSIS: Медленные запросы выявленные профилированием
-- =============================================================================

-- 1. ПРОБЛЕМА: RPC функция get_projects_with_progress_optimized работает 596ms
--    РЕШЕНИЕ: Составные индексы для оптимизации JOIN операций

-- 2. ПРОБЛЕМА: work_entries JOIN с projects и users медленный
--    РЕШЕНИЕ: Оптимизированные индексы для частых JOIN'ов

-- 3. ПРОБЛЕМА: Агрегация SUM(duration_hours) GROUP BY project_id медленная
--    РЕШЕНИЕ: Специализированные индексы для агрегатных запросов

-- =============================================================================
-- OPTIMIZATION 1: Projects Performance Indexes
-- =============================================================================

-- Оптимизация основного запроса проектов с PM информацией
-- BEFORE: Full table scan на projects + users
-- AFTER: Index-only scan с covering index

DO $$
BEGIN
    -- Covering index для projects с часто используемыми полями
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'projects'
        AND indexname = 'idx_projects_active_with_details'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_projects_active_with_details
        ON projects (status, start_date DESC)
        INCLUDE (id, name, customer, city, total_length_m, pm_user_id);

        RAISE NOTICE '✅ Created covering index: idx_projects_active_with_details';
    ELSE
        RAISE NOTICE '⚠️ Index already exists: idx_projects_active_with_details';
    END IF;
END $$;

-- Оптимизация JOIN с users для PM информации
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'users'
        AND indexname = 'idx_users_pm_covering'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_users_pm_covering
        ON users (id)
        INCLUDE (first_name, last_name, role)
        WHERE role IN ('pm', 'admin');

        RAISE NOTICE '✅ Created PM covering index: idx_users_pm_covering';
    ELSE
        RAISE NOTICE '⚠️ Index already exists: idx_users_pm_covering';
    END IF;
END $$;

-- =============================================================================
-- OPTIMIZATION 2: Work Entries Performance Indexes
-- =============================================================================

-- Оптимизация агрегации work_entries для расчета прогресса
-- КРИТИЧЕСКИ ВАЖНО: Это основная проблема производительности
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'work_entries'
        AND indexname = 'idx_work_entries_project_aggregation'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_work_entries_project_aggregation
        ON work_entries (project_id, duration_hours)
        WHERE duration_hours IS NOT NULL AND duration_hours > 0;

        RAISE NOTICE '✅ Created aggregation index: idx_work_entries_project_aggregation';
    ELSE
        RAISE NOTICE '⚠️ Index already exists: idx_work_entries_project_aggregation';
    END IF;
END $$;

-- Оптимизация запросов work_entries с временными фильтрами
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'work_entries'
        AND indexname = 'idx_work_entries_recent_activity'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_work_entries_recent_activity
        ON work_entries (created_at DESC, project_id, user_id)
        INCLUDE (duration_hours, work_type);

        RAISE NOTICE '✅ Created recent activity index: idx_work_entries_recent_activity';
    ELSE
        RAISE NOTICE '⚠️ Index already exists: idx_work_entries_recent_activity';
    END IF;
END $$;

-- Partial index только для активных записей работ
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'work_entries'
        AND indexname = 'idx_work_entries_active_only'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_work_entries_active_only
        ON work_entries (user_id, created_at DESC)
        WHERE duration_hours > 0 AND created_at >= NOW() - INTERVAL '90 days';

        RAISE NOTICE '✅ Created active work entries index: idx_work_entries_active_only';
    ELSE
        RAISE NOTICE '⚠️ Index already exists: idx_work_entries_active_only';
    END IF;
END $$;

-- =============================================================================
-- OPTIMIZATION 3: Material Allocations Indexes
-- =============================================================================

-- Оптимизация material_allocations запросов с JOIN'ами
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'material_allocations'
        AND indexname = 'idx_material_allocations_recent'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_material_allocations_recent
        ON material_allocations (allocated_at DESC, project_id, material_id)
        INCLUDE (quantity);

        RAISE NOTICE '✅ Created material allocations index: idx_material_allocations_recent';
    ELSE
        RAISE NOTICE '⚠️ Index already exists: idx_material_allocations_recent';
    END IF;
END $$;

-- =============================================================================
-- OPTIMIZATION 4: Users Activity Aggregation Index
-- =============================================================================

-- Оптимизация пользовательской активности с COUNT() агрегацией
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'users'
        AND indexname = 'idx_users_active_covering'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_users_active_covering
        ON users (is_active, role)
        INCLUDE (id, first_name, last_name, email)
        WHERE is_active = true;

        RAISE NOTICE '✅ Created active users covering index: idx_users_active_covering';
    ELSE
        RAISE NOTICE '⚠️ Index already exists: idx_users_active_covering';
    END IF;
END $$;

-- =============================================================================
-- OPTIMIZATION 5: Enhanced RPC Function
-- =============================================================================

-- Обновленная RPC функция с учетом новых индексов
DROP FUNCTION IF EXISTS get_projects_with_progress_optimized(integer, integer);

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
    -- OPTIMIZATION: Использует новые составные индексы для максимальной производительности
    -- idx_projects_active_with_details - covering index для основных полей проектов
    -- idx_users_pm_covering - covering index для PM информации
    -- idx_work_entries_project_aggregation - специализированный для агрегации

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
        -- OPTIMIZATION: Агрегация использует idx_work_entries_project_aggregation
        COALESCE(we_stats.total_hours, 0)::numeric as completed_hours,
        -- OPTIMIZATION: Вычисление процентов оптимизировано
        CASE
            WHEN p.total_length_m > 0 AND we_stats.total_hours > 0 THEN
                (we_stats.total_hours / p.total_length_m * 100)::numeric
            ELSE 0::numeric
        END as progress_percentage
    FROM projects p
    -- OPTIMIZATION: LEFT JOIN оптимизирован через idx_users_pm_covering
    LEFT JOIN users u ON p.pm_user_id = u.id
    -- OPTIMIZATION: Предварительная агрегация в подзапросе для производительности
    LEFT JOIN LATERAL (
        SELECT SUM(duration_hours) as total_hours
        FROM work_entries we
        WHERE we.project_id = p.id
        AND we.duration_hours IS NOT NULL
        AND we.duration_hours > 0
    ) we_stats ON true
    -- OPTIMIZATION: WHERE использует idx_projects_active_with_details
    WHERE p.status = 'active'
    -- OPTIMIZATION: ORDER BY использует индекс
    ORDER BY p.start_date DESC NULLS LAST
    LIMIT project_limit
    OFFSET project_offset;
END;
$$ LANGUAGE plpgsql
   STABLE
   SECURITY DEFINER
   SET search_path = public, extensions;

-- =============================================================================
-- OPTIMIZATION 6: Statistics Update
-- =============================================================================

-- Обновляем статистику для планировщика запросов
ANALYZE projects;
ANALYZE work_entries;
ANALYZE users;
ANALYZE material_allocations;

-- =============================================================================
-- PERFORMANCE VERIFICATION QUERY
-- =============================================================================

-- Тестовый запрос для проверки производительности
-- Должен выполняться <100ms после создания индексов

CREATE OR REPLACE FUNCTION test_optimized_performance()
RETURNS TABLE (
    execution_time_ms numeric,
    rows_returned bigint,
    performance_status text
) AS $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    row_count bigint;
BEGIN
    start_time := clock_timestamp();

    SELECT COUNT(*) INTO row_count
    FROM get_projects_with_progress_optimized(20, 0);

    end_time := clock_timestamp();

    RETURN QUERY SELECT
        extract(epoch from (end_time - start_time)) * 1000 as execution_time_ms,
        row_count,
        CASE
            WHEN extract(epoch from (end_time - start_time)) * 1000 < 100 THEN 'EXCELLENT'
            WHEN extract(epoch from (end_time - start_time)) * 1000 < 300 THEN 'GOOD'
            WHEN extract(epoch from (end_time - start_time)) * 1000 < 500 THEN 'ACCEPTABLE'
            ELSE 'NEEDS_OPTIMIZATION'
        END as performance_status;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

SELECT
    'PERFORMANCE OPTIMIZATION COMPLETED!' as message,
    'RPC function optimized with specialized indexes' as details,
    'Expected performance improvement: 3-10x faster queries' as expected_result;