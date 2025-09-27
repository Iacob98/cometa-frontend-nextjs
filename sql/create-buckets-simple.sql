-- =============================================================================
-- ПРОСТОЕ СОЗДАНИЕ STORAGE BUCKETS
-- =============================================================================
-- Выполните этот скрипт в Supabase Dashboard → SQL Editor

-- Project Photos Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-photos',
  'project-photos',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Work Photos Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'work-photos',
  'work-photos',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Project Documents Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-documents',
  'project-documents',
  false,
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
) ON CONFLICT (id) DO NOTHING;

-- House Documents Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'house-documents',
  'house-documents',
  false,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
) ON CONFLICT (id) DO NOTHING;

-- User Avatars Bucket (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Reports Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  26214400, -- 25MB
  ARRAY[
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Проверка созданных bucket'ов
SELECT
    name,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as mime_types_count,
    created_at
FROM storage.buckets
WHERE name IN (
    'project-photos',
    'work-photos',
    'project-documents',
    'house-documents',
    'user-avatars',
    'reports'
)
ORDER BY name;