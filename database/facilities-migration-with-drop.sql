-- Удаление существующей таблицы facilities (если есть)
DROP TABLE IF EXISTS public.facilities CASCADE;

-- Создание таблицы facilities с правильной структурой
CREATE TABLE public.facilities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    type CHARACTER VARYING(255) NOT NULL,
    rent_daily_eur NUMERIC(10,2) NOT NULL,
    service_freq CHARACTER VARYING(100),
    status CHARACTER VARYING(50) DEFAULT 'planned'::character varying,
    start_date DATE,
    end_date DATE,
    location_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT facilities_status_check CHECK ((status)::text = ANY ((ARRAY['planned'::character varying, 'active'::character varying, 'completed'::character varying])::text[]))
);

-- Создание индексов для производительности
CREATE INDEX idx_facilities_project_id ON public.facilities USING btree (project_id);
CREATE INDEX idx_facilities_supplier_id ON public.facilities USING btree (supplier_id);
CREATE INDEX idx_facilities_status ON public.facilities USING btree (status);
CREATE INDEX idx_facilities_created_at ON public.facilities USING btree (created_at);

-- Включение Row Level Security
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

-- Создание политик RLS
DROP POLICY IF EXISTS "Enable read access for all users" ON public.facilities;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.facilities;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.facilities;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.facilities;

CREATE POLICY "Enable read access for all users" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.facilities FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.facilities FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON public.facilities FOR DELETE USING (true);

-- Создание функции для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггера для автоматического обновления updated_at
DROP TRIGGER IF EXISTS update_facilities_updated_at ON public.facilities;
CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON public.facilities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Проверка создания таблицы
SELECT 'Таблица facilities успешно создана'::text as result;