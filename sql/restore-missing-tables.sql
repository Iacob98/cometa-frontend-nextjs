-- =========================================================================
-- COMETA - Восстановление недостающих таблиц в Supabase
-- =========================================================================
-- КРИТИЧНО: Восстанавливаем 48 недостающих таблиц из 63 в оригинальной схеме
-- Текущее состояние: 15/63 таблиц
-- =========================================================================

-- 1. Основная структура проектов
-- =========================================================================

-- Cabinets (сетевые шкафы) - критично для проектной структуры
CREATE TABLE IF NOT EXISTS public.cabinets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    code text,
    name text,
    address text,
    geom_point jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Segments (сегменты кабелей между шкафами)
CREATE TABLE IF NOT EXISTS public.segments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cabinet_id uuid NOT NULL REFERENCES cabinets(id) ON DELETE CASCADE,
    code text,
    length_planned_m numeric(10,2) NOT NULL DEFAULT 0,
    length_done_m numeric(10,2) NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'open',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_segment_status CHECK (status = ANY (ARRAY['open'::text, 'in_progress'::text, 'done'::text]))
);

-- Cuts (участки рытья траншей)
CREATE TABLE IF NOT EXISTS public.cuts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    segment_id uuid NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
    code text,
    length_planned_m numeric(10,2) NOT NULL DEFAULT 0,
    length_done_m numeric(10,2) NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'open',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_cut_status CHECK (status = ANY (ARRAY['open'::text, 'in_progress'::text, 'done'::text]))
);

-- 2. Финансовая система
-- =========================================================================

-- Costs (расходы проекта) - критично для финансового учета
CREATE TABLE IF NOT EXISTS public.costs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    cost_type text NOT NULL,
    ref_id uuid,
    date date NOT NULL DEFAULT CURRENT_DATE,
    amount_eur numeric(12,2) NOT NULL DEFAULT 0,
    description text,
    reference_type text,
    reference_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_cost_type CHECK (cost_type = ANY (ARRAY['facility'::text, 'equipment_rental'::text, 'material'::text, 'transport'::text, 'housing'::text, 'other'::text]))
);

-- Transactions (транзакции)
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount numeric(12,2) NOT NULL DEFAULT 0,
    transaction_type text NOT NULL DEFAULT 'expense',
    description text,
    date date NOT NULL DEFAULT CURRENT_DATE,
    reference_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_transaction_type CHECK (transaction_type = ANY (ARRAY['income'::text, 'expense'::text]))
);

-- 3. Управление документами
-- =========================================================================

-- Document categories
CREATE TABLE IF NOT EXISTS public.document_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    name_de text NOT NULL,
    name_ru text NOT NULL,
    name_en text,
    created_at timestamptz DEFAULT now()
);

-- Documents (документы проекта) - критично для управления документами
CREATE TABLE IF NOT EXISTS public.documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    filename text NOT NULL,
    original_filename text,
    file_type text,
    file_size bigint,
    document_type text DEFAULT 'general',
    category_id uuid REFERENCES document_categories(id),
    description text,
    upload_date timestamptz DEFAULT now(),
    uploaded_by uuid REFERENCES users(id),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 4. Структура домов и помещений
-- =========================================================================

-- Houses (дома в проектах)
CREATE TABLE IF NOT EXISTS public.houses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    house_number text,
    street text,
    city text,
    postal_code text,
    latitude numeric(10,8),
    longitude numeric(11,8),
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_house_status CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text]))
);

-- Facilities (объекты/помещения)
CREATE TABLE IF NOT EXISTS public.facilities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    house_id uuid REFERENCES houses(id) ON DELETE CASCADE,
    name text NOT NULL,
    type text DEFAULT 'apartment',
    floor integer,
    access_info text,
    contact_info text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 5. Улучшенное управление материалами
-- =========================================================================

-- Company warehouse (центральный склад)
CREATE TABLE IF NOT EXISTS public.company_warehouse (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    total_qty numeric(14,3) NOT NULL DEFAULT 0,
    reserved_qty numeric(14,3) NOT NULL DEFAULT 0,
    min_stock_level numeric(14,3),
    last_updated timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Material orders (заказы материалов)
CREATE TABLE IF NOT EXISTS public.material_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    quantity numeric(14,3) NOT NULL DEFAULT 0,
    unit_price numeric(12,2),
    total_price numeric(12,2),
    status text DEFAULT 'pending',
    order_date date DEFAULT CURRENT_DATE,
    delivery_date date,
    supplier text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_material_order_status CHECK (status = ANY (ARRAY['pending'::text, 'ordered'::text, 'delivered'::text, 'cancelled'::text]))
);

-- 6. Улучшенное управление оборудованием
-- =========================================================================

-- Equipment maintenance (обслуживание оборудования)
CREATE TABLE IF NOT EXISTS public.equipment_maintenance (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_type text NOT NULL DEFAULT 'routine',
    description text,
    date date NOT NULL DEFAULT CURRENT_DATE,
    cost numeric(10,2),
    performed_by text,
    next_maintenance_date date,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_maintenance_type CHECK (maintenance_type = ANY (ARRAY['routine'::text, 'repair'::text, 'inspection'::text, 'calibration'::text]))
);

-- 7. Управление процессом работ
-- =========================================================================

-- Work stages (этапы работ)
CREATE TABLE IF NOT EXISTS public.work_stages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    sequence_order integer NOT NULL DEFAULT 1,
    estimated_hours integer,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_work_stage_status CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]))
);

-- Cut stages (этапы выполнения участков)
CREATE TABLE IF NOT EXISTS public.cut_stages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cut_id uuid NOT NULL REFERENCES cuts(id) ON DELETE CASCADE,
    stage_name text NOT NULL,
    status text DEFAULT 'pending',
    started_at timestamptz,
    completed_at timestamptz,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_cut_stage_status CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text]))
);

-- 8. Уведомления и события
-- =========================================================================

-- Notifications (уведомления системы)
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'info',
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT check_notification_type CHECK (type = ANY (ARRAY['info'::text, 'warning'::text, 'error'::text, 'success'::text]))
);

-- Activities (действия пользователей) - расширенная версия activity_logs
CREATE TABLE IF NOT EXISTS public.activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
    activity_type text NOT NULL,
    object_type text,
    object_id uuid,
    action text NOT NULL,
    description text,
    metadata jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT check_activity_type CHECK (activity_type = ANY (ARRAY['project'::text, 'work_entry'::text, 'material'::text, 'equipment'::text, 'user'::text, 'document'::text, 'auth'::text]))
);

-- 9. Индексы для производительности
-- =========================================================================

-- Основные индексы для быстрой работы
CREATE INDEX IF NOT EXISTS idx_cabinets_project_id ON public.cabinets(project_id);
CREATE INDEX IF NOT EXISTS idx_segments_cabinet_id ON public.segments(cabinet_id);
CREATE INDEX IF NOT EXISTS idx_cuts_segment_id ON public.cuts(segment_id);
CREATE INDEX IF NOT EXISTS idx_costs_project_id ON public.costs(project_id);
CREATE INDEX IF NOT EXISTS idx_costs_date ON public.costs(date);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON public.documents(upload_date);
CREATE INDEX IF NOT EXISTS idx_houses_project_id ON public.houses(project_id);
CREATE INDEX IF NOT EXISTS idx_facilities_project_id ON public.facilities(project_id);
CREATE INDEX IF NOT EXISTS idx_facilities_house_id ON public.facilities(house_id);
CREATE INDEX IF NOT EXISTS idx_material_orders_project_id ON public.material_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_material_orders_material_id ON public.material_orders(material_id);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_equipment_id ON public.equipment_maintenance(equipment_id);
CREATE INDEX IF NOT EXISTS idx_work_stages_project_id ON public.work_stages(project_id);
CREATE INDEX IF NOT EXISTS idx_cut_stages_cut_id ON public.cut_stages(cut_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_project_id ON public.activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at);

-- 10. Вставка базовых данных
-- =========================================================================

-- Document categories
INSERT INTO public.document_categories (code, name_de, name_ru, name_en) VALUES
    ('plan', 'Projektplan', 'План проекта', 'Project Plan'),
    ('permit', 'Genehmigung', 'Разрешение', 'Permit'),
    ('report', 'Bericht', 'Отчет', 'Report'),
    ('photo', 'Foto', 'Фото', 'Photo'),
    ('contract', 'Vertrag', 'Договор', 'Contract'),
    ('invoice', 'Rechnung', 'Счет', 'Invoice')
ON CONFLICT (code) DO NOTHING;

-- 11. Row Level Security (RLS)
-- =========================================================================

-- Включаем RLS для всех таблиц
ALTER TABLE public.cabinets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_warehouse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cut_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Базовые политики RLS (можно настроить позже)
CREATE POLICY "Enable all operations for authenticated users" ON public.cabinets FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.segments FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.cuts FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.costs FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.houses FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.facilities FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.company_warehouse FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.material_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.equipment_maintenance FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.work_stages FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.cut_stages FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.notifications FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON public.activities FOR ALL TO authenticated USING (true);

-- 12. Функции обновления timestamps
-- =========================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создаем триггеры для автоматического обновления updated_at
CREATE TRIGGER update_cabinets_updated_at BEFORE UPDATE ON public.cabinets FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON public.segments FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cuts_updated_at BEFORE UPDATE ON public.cuts FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_costs_updated_at BEFORE UPDATE ON public.costs FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON public.houses FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON public.facilities FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_material_orders_updated_at BEFORE UPDATE ON public.material_orders FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_equipment_maintenance_updated_at BEFORE UPDATE ON public.equipment_maintenance FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_work_stages_updated_at BEFORE UPDATE ON public.work_stages FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_cut_stages_updated_at BEFORE UPDATE ON public.cut_stages FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- =========================================================================
-- РЕЗУЛЬТАТ: Добавлено 16 критически важных таблиц
-- Новое состояние: 31/63 таблиц (было 15/63)
-- Покрытие: Проектная структура, финансы, документы, дома, склад, оборудование
-- =========================================================================