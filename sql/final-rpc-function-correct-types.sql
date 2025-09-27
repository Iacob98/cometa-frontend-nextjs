-- Финальная версия RPC функции с правильными типами данных

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
    start_date date,
    end_date_plan date,
    status text,
    total_length_m numeric,
    base_rate_per_m numeric,
    pm_user_id uuid,
    language_default text,
    pm_first_name character varying(100),  -- Исправлено: varchar(100)
    pm_last_name character varying(100),   -- Исправлено: varchar(100)
    completed_hours numeric,
    progress_percentage numeric
) AS $$
BEGIN
    -- OPTIMIZATION: Использует созданные индексы для максимальной производительности
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

-- КОММЕНТАРИИ ДЛЯ ОПТИМИЗАЦИИ
COMMENT ON FUNCTION get_projects_with_progress_optimized IS
'OPTIMIZED function for getting projects with progress.
Uses specialized indexes:
- idx_projects_active_with_details: covering index for projects
- idx_users_pm_covering: covering index for PM info
- idx_work_entries_project_aggregation: specialized for SUM aggregation
Expected performance: <100ms for 20 projects';

SELECT 'Final RPC function created with correct types!' as message;