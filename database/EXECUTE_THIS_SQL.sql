-- =========================================
-- СОЗДАНИЕ ТАБЛИЦЫ FACILITIES
-- Выполните этот SQL в Supabase Dashboard
-- =========================================

-- Удаление старой таблицы (если существует)
DROP TABLE IF EXISTS public.facilities CASCADE;

-- Создание новой таблицы facilities
CREATE TABLE public.facilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    type VARCHAR(255) NOT NULL,
    rent_daily_eur NUMERIC(10,2) NOT NULL,
    service_freq VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
    start_date DATE,
    end_date DATE,
    location_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для производительности
CREATE INDEX idx_facilities_project_id ON public.facilities(project_id);
CREATE INDEX idx_facilities_status ON public.facilities(status);
CREATE INDEX idx_facilities_created_at ON public.facilities(created_at);

-- Включение Row Level Security
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- Создание политик доступа
CREATE POLICY "Enable all operations for authenticated users" ON public.facilities
    FOR ALL USING (true) WITH CHECK (true);

-- Создание функции для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для updated_at
CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON public.facilities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Проверка создания таблицы
SELECT 'Таблица facilities успешно создана!'::text as result;

-- =========================================
-- ИНСТРУКЦИЯ ПО ВЫПОЛНЕНИЮ:
--
-- 1. Откройте Supabase Dashboard:
--    https://supabase.com/dashboard/project/oijmohlhdxoawzvctnxx/sql
--
-- 2. Скопируйте и вставьте весь SQL код выше
--
-- 3. Нажмите "RUN" для выполнения
--
-- 4. После успешного выполнения, таблица facilities
--    будет готова для использования в API
-- =========================================