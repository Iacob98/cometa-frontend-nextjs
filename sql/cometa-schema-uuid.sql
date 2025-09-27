-- =============================================================================
-- COMETA DATABASE SCHEMA WITH UUID
-- Создание полной схемы базы данных COMETA для Supabase PostgreSQL
-- =============================================================================

-- Включить UUID расширение
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ОСНОВНЫЕ ТАБЛИЦЫ
-- =============================================================================

-- Пользователи
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    pin_code VARCHAR(6) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'worker' CHECK (role IN ('admin', 'pm', 'foreman', 'crew', 'worker', 'viewer')),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    language_preference VARCHAR(10) DEFAULT 'de',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Проекты
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    customer TEXT,
    city TEXT,
    address TEXT,
    contact_24h TEXT,
    start_date DATE,
    end_date_plan DATE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'active', 'waiting_invoice', 'closed')),
    total_length_m NUMERIC(10,2) DEFAULT 0,
    base_rate_per_m NUMERIC(12,2) DEFAULT 0,
    pm_user_id UUID REFERENCES users(id),
    language_default TEXT DEFAULT 'de',
    approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Команды/бригады
CREATE TABLE crews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'disbanded')),
    leader_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Состав команд
CREATE TABLE crew_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('leader', 'member', 'trainee')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(crew_id, user_id)
);

-- Материалы
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(50) DEFAULT 'pcs',
    unit_price_eur NUMERIC(10,2) DEFAULT 0,
    supplier_name VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Оборудование
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    inventory_no VARCHAR(100) UNIQUE,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'broken')),
    rental_cost_per_day NUMERIC(8,2) DEFAULT 0,
    purchase_date DATE,
    warranty_until DATE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Транспорт
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(100),
    model VARCHAR(100),
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'truck' CHECK (type IN ('car', 'truck', 'van', 'trailer')),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'broken')),
    rental_cost_per_day NUMERIC(8,2) DEFAULT 0,
    fuel_type VARCHAR(20) DEFAULT 'diesel',
    year_manufactured INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- РАБОЧИЕ ЗАПИСИ И НАЗНАЧЕНИЯ
-- =============================================================================

-- Записи о работах
CREATE TABLE work_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    crew_id UUID REFERENCES crews(id),

    -- Информация о работе
    work_type VARCHAR(100) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_hours NUMERIC(6,2),

    -- Геолокация
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    location_accuracy NUMERIC(6,2),

    -- Статус и одобрение
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,

    -- Фотографии и заметки
    photos JSONB DEFAULT '[]',
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Назначения оборудования
CREATE TABLE equipment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    project_id UUID REFERENCES projects(id),
    crew_id UUID REFERENCES crews(id),
    user_id UUID REFERENCES users(id),

    from_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    to_ts TIMESTAMP WITH TIME ZONE,
    is_permanent BOOLEAN DEFAULT false,
    rental_cost_per_day NUMERIC(8,2) DEFAULT 0,

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Назначения транспорта
CREATE TABLE vehicle_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    project_id UUID REFERENCES projects(id),
    crew_id UUID REFERENCES crews(id),
    user_id UUID REFERENCES users(id),

    from_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    to_ts TIMESTAMP WITH TIME ZONE,
    is_permanent BOOLEAN DEFAULT false,
    rental_cost_per_day NUMERIC(8,2) DEFAULT 0,

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Назначения материалов
CREATE TABLE material_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES materials(id),
    project_id UUID REFERENCES projects(id),
    user_id UUID REFERENCES users(id),
    crew_id UUID REFERENCES crews(id),

    quantity NUMERIC(10,2) NOT NULL,
    unit_price_eur NUMERIC(10,2),
    total_cost_eur NUMERIC(12,2),
    assignment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- СИСТЕМА ФАЙЛОВ
-- =============================================================================

-- Файлы (общая таблица для всех файлов)
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    bucket_name VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,

    -- Связи
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    work_entry_id UUID REFERENCES work_entries(id) ON DELETE CASCADE,

    -- Метаданные
    category VARCHAR(50) DEFAULT 'general',
    title VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Планы проектов
CREATE TABLE project_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    plan_type VARCHAR(50) NOT NULL, -- 'site_plan', 'network_design', etc.
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_url TEXT,
    file_path TEXT,

    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Контакты коммунальных служб
CREATE TABLE utility_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    kind VARCHAR(50) NOT NULL, -- 'power', 'water', 'gas', etc.
    organization VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Логи активности
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ
-- =============================================================================

-- Индексы для работы с проектами
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_pm_user_id ON projects(pm_user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Индексы для пользователей
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Индексы для записей о работах
CREATE INDEX idx_work_entries_project_id ON work_entries(project_id);
CREATE INDEX idx_work_entries_user_id ON work_entries(user_id);
CREATE INDEX idx_work_entries_crew_id ON work_entries(crew_id);
CREATE INDEX idx_work_entries_status ON work_entries(status);
CREATE INDEX idx_work_entries_start_time ON work_entries(start_time);

-- Индексы для команд
CREATE INDEX idx_crew_members_crew_id ON crew_members(crew_id);
CREATE INDEX idx_crew_members_user_id ON crew_members(user_id);
CREATE INDEX idx_crew_members_is_active ON crew_members(is_active);

-- Индексы для файлов
CREATE INDEX idx_files_project_id ON files(project_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_bucket_name ON files(bucket_name);
CREATE INDEX idx_files_category ON files(category);

-- Индексы для назначений
CREATE INDEX idx_equipment_assignments_equipment_id ON equipment_assignments(equipment_id);
CREATE INDEX idx_equipment_assignments_project_id ON equipment_assignments(project_id);
CREATE INDEX idx_vehicle_assignments_vehicle_id ON vehicle_assignments(vehicle_id);
CREATE INDEX idx_vehicle_assignments_project_id ON vehicle_assignments(project_id);

-- Индексы для логов активности
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- =============================================================================
-- ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ
-- =============================================================================

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Применить триггеры к таблицам
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON crews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_entries_updated_at BEFORE UPDATE ON work_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_plans_updated_at BEFORE UPDATE ON project_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_utility_contacts_updated_at BEFORE UPDATE ON utility_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ФУНКЦИИ ДЛЯ АВТОМАТИЗАЦИИ
-- =============================================================================

-- Функция для обновления статуса оборудования
CREATE OR REPLACE FUNCTION update_equipment_status() RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE equipment
    SET status = CASE
        WHEN equipment.id IN (
            SELECT DISTINCT equipment_id
            FROM equipment_assignments
            WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
            AND (to_ts IS NULL OR to_ts > NOW())
        ) THEN 'in_use'
        ELSE 'available'
    END
    WHERE id = COALESCE(NEW.equipment_id, OLD.equipment_id)
    AND status IN ('available', 'in_use');

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Функция для обновления статуса транспорта
CREATE OR REPLACE FUNCTION update_vehicle_status() RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE vehicles
    SET status = CASE
        WHEN vehicles.id IN (
            SELECT DISTINCT vehicle_id
            FROM vehicle_assignments
            WHERE vehicle_id = COALESCE(NEW.vehicle_id, OLD.vehicle_id)
            AND (to_ts IS NULL OR to_ts > NOW())
        ) THEN 'in_use'
        ELSE 'available'
    END
    WHERE id = COALESCE(NEW.vehicle_id, OLD.vehicle_id)
    AND status IN ('available', 'in_use');

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Применить триггеры для статусов
CREATE TRIGGER equipment_status_trigger AFTER INSERT OR UPDATE OR DELETE ON equipment_assignments
    FOR EACH ROW EXECUTE FUNCTION update_equipment_status();

CREATE TRIGGER vehicle_status_trigger AFTER INSERT OR UPDATE OR DELETE ON vehicle_assignments
    FOR EACH ROW EXECUTE FUNCTION update_vehicle_status();

-- =============================================================================
-- ТЕСТОВЫЕ ДАННЫЕ
-- =============================================================================

-- Вставка тестовых пользователей
INSERT INTO users (email, pin_code, first_name, last_name, role) VALUES
('admin@cometa.de', '1234', 'Admin', 'User', 'admin'),
('pm@cometa.de', '2345', 'Project', 'Manager', 'pm'),
('foreman@cometa.de', '3456', 'Team', 'Leader', 'foreman'),
('worker@cometa.de', '4567', 'Construction', 'Worker', 'worker'),
('viewer@cometa.de', '5678', 'View', 'Only', 'viewer');

-- Вставка тестовых проектов
INSERT INTO projects (name, customer, city, address, status, total_length_m, base_rate_per_m) VALUES
('Glasfaser Mitte', 'Telekom Deutschland', 'Berlin', 'Alexanderplatz 1', 'active', 2500.00, 45.50),
('Fiber Network Nord', 'Vodafone', 'Hamburg', 'Hafenstraße 15', 'planning', 1800.00, 42.00),
('Cable Installation Süd', 'O2 Telefonica', 'München', 'Marienplatz 3', 'draft', 3200.00, 48.75),
('Network Expansion Ost', 'Deutsche Telekom', 'Dresden', 'Neumarkt 12', 'active', 1500.00, 44.25);

-- Вставка тестовой команды
INSERT INTO crews (name, description, status) VALUES
('Team Alpha', 'Primary installation crew for Berlin region', 'active'),
('Team Beta', 'Secondary crew for Hamburg operations', 'active');

-- Проверка созданных таблиц
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;