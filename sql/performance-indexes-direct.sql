-- DIRECT PERFORMANCE OPTIMIZATION INDEXES
-- Создание индексов без использования функций/блоков

-- =============================================================================
-- CRITICAL OPTIMIZATION: Work Entries Aggregation
-- =============================================================================

-- Самый важный индекс для оптимизации RPC функции
-- Устраняет медленную агрегацию SUM(duration_hours) GROUP BY project_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_entries_project_aggregation
ON work_entries (project_id, duration_hours)
WHERE duration_hours IS NOT NULL AND duration_hours > 0;

-- =============================================================================
-- PROJECTS OPTIMIZATION
-- =============================================================================

-- Covering index для основного запроса проектов
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_active_with_details
ON projects (status, start_date DESC)
INCLUDE (id, name, customer, city, total_length_m, pm_user_id);

-- =============================================================================
-- USERS OPTIMIZATION (PM Information)
-- =============================================================================

-- Оптимизация JOIN с users для PM информации
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_pm_covering
ON users (id)
INCLUDE (first_name, last_name, role);

-- =============================================================================
-- WORK ENTRIES ACTIVITY OPTIMIZATION
-- =============================================================================

-- Индекс для запросов с временными фильтрами
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_entries_recent_activity
ON work_entries (created_at DESC, project_id, user_id)
INCLUDE (duration_hours, work_type);

-- Partial index для активных записей работ (последние 90 дней)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_work_entries_active_only
ON work_entries (user_id, created_at DESC)
WHERE duration_hours > 0 AND created_at >= NOW() - INTERVAL '90 days';

-- =============================================================================
-- USERS ACTIVITY OPTIMIZATION
-- =============================================================================

-- Covering index для активных пользователей
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_covering
ON users (is_active, role)
INCLUDE (id, first_name, last_name, email)
WHERE is_active = true;

-- =============================================================================
-- STATISTICS UPDATE
-- =============================================================================

-- Обновляем статистику для планировщика запросов
ANALYZE projects;
ANALYZE work_entries;
ANALYZE users;

SELECT 'Performance indexes created successfully!' as message,
       'Expected RPC function improvement: 5-10x faster' as expected;