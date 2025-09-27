-- =============================================================================
-- СОЗДАНИЕ ТАБЛИЦ ДЛЯ СИСТЕМЫ УПРАВЛЕНИЯ ФАЙЛАМИ
-- =============================================================================
-- Выполните этот скрипт в Supabase Dashboard → SQL Editor

-- Таблица для хранения метаданных файлов
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    bucket_name VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,

    -- Metadata
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID,
    category VARCHAR(50) DEFAULT 'general',
    title VARCHAR(255),
    description TEXT,

    -- File specific metadata (JSON for flexibility)
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для планов проектов
CREATE TABLE IF NOT EXISTS project_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    plan_type VARCHAR(50) NOT NULL, -- 'site_plan', 'network_design', 'cable_routing', etc.
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT,
    file_path TEXT,

    -- Timestamps
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица для контактов коммунальных служб
CREATE TABLE IF NOT EXISTS utility_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    kind VARCHAR(50) NOT NULL, -- 'power', 'water', 'gas', 'telecom', etc.
    organization VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_files_project_id ON files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_bucket_name ON files(bucket_name);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);

CREATE INDEX IF NOT EXISTS idx_project_plans_project_id ON project_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_project_plans_type ON project_plans(plan_type);

CREATE INDEX IF NOT EXISTS idx_utility_contacts_project_id ON utility_contacts(project_id);
CREATE INDEX IF NOT EXISTS idx_utility_contacts_kind ON utility_contacts(kind);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_files_updated_at ON files;
CREATE TRIGGER update_files_updated_at
    BEFORE UPDATE ON files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_plans_updated_at ON project_plans;
CREATE TRIGGER update_project_plans_updated_at
    BEFORE UPDATE ON project_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_utility_contacts_updated_at ON utility_contacts;
CREATE TRIGGER update_utility_contacts_updated_at
    BEFORE UPDATE ON utility_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Проверка созданных таблиц
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('files', 'project_plans', 'utility_contacts')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;