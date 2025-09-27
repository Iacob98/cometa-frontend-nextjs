-- =============================================================================
-- ПОЛНАЯ ОЧИСТКА SUPABASE БАЗЫ ДАННЫХ
-- =============================================================================
-- ВНИМАНИЕ: Это удалит ВСЕ данные и таблицы!

-- Отключить проверки foreign key для удаления
SET session_replication_role = replica;

-- Удалить все таблицы в правильном порядке (сначала зависимые, потом основные)
DROP TABLE IF EXISTS work_entries CASCADE;
DROP TABLE IF EXISTS material_assignments CASCADE;
DROP TABLE IF EXISTS vehicle_assignments CASCADE;
DROP TABLE IF EXISTS equipment_assignments CASCADE;
DROP TABLE IF EXISTS crew_members CASCADE;
DROP TABLE IF EXISTS crews CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS car_expenses CASCADE;
DROP TABLE IF EXISTS maintenances CASCADE;
DROP TABLE IF EXISTS penalties CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS characters CASCADE;
DROP TABLE IF EXISTS media_assets CASCADE;
DROP TABLE IF EXISTS kb_chunks CASCADE;
DROP TABLE IF EXISTS kb_documents CASCADE;
DROP TABLE IF EXISTS generation_jobs CASCADE;
DROP TABLE IF EXISTS artifacts CASCADE;
DROP TABLE IF EXISTS agent_versions CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Удалить последовательности (sequences)
DROP SEQUENCE IF EXISTS projects_id_seq CASCADE;
DROP SEQUENCE IF EXISTS materials_id_seq CASCADE;
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;

-- Удалить функции
DROP FUNCTION IF EXISTS update_equipment_status() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Включить обратно проверки foreign key
SET session_replication_role = DEFAULT;

-- Проверить, что все таблицы удалены
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT IN ('spatial_ref_sys'); -- PostGIS таблица, если есть