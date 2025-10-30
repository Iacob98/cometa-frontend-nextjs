-- Migration: Add Registration Meldebescheinigung document type
-- Date: 2025-10-30
-- Description: Adds German registration certificate (Meldebescheinigung) as a valid worker document type

-- Step 1: Drop the old constraint
ALTER TABLE document_categories
DROP CONSTRAINT IF EXISTS check_document_category_code;

-- Step 2: Add the new constraint with REGISTRATION_MELDEBESCHEINIGUNG
ALTER TABLE document_categories
ADD CONSTRAINT check_document_category_code
CHECK (code = ANY (ARRAY[
  'WORK_PERMIT'::text,
  'RESIDENCE_PERMIT'::text,
  'PASSPORT'::text,
  'VISA'::text,
  'HEALTH_INSURANCE'::text,
  'DRIVER_LICENSE'::text,
  'QUALIFICATION_CERT'::text,
  'REGISTRATION_MELDEBESCHEINIGUNG'::text,
  'OTHER'::text
]));

-- Step 3: Insert all standard document categories including Meldebescheinigung
INSERT INTO document_categories (id, code, name_en, name_ru, name_de, created_at)
VALUES
  (gen_random_uuid(), 'WORK_PERMIT', 'Work Permit', 'Разрешение на работу', 'Arbeitserlaubnis', NOW()),
  (gen_random_uuid(), 'RESIDENCE_PERMIT', 'Residence Permit', 'Вид на жительство', 'Aufenthaltserlaubnis', NOW()),
  (gen_random_uuid(), 'PASSPORT', 'Passport', 'Паспорт', 'Reisepass', NOW()),
  (gen_random_uuid(), 'VISA', 'Visa', 'Виза', 'Visum', NOW()),
  (gen_random_uuid(), 'HEALTH_INSURANCE', 'Health Insurance', 'Медицинская страховка', 'Krankenversicherung', NOW()),
  (gen_random_uuid(), 'DRIVER_LICENSE', 'Driver License', 'Водительские права', 'Führerschein', NOW()),
  (gen_random_uuid(), 'QUALIFICATION_CERT', 'Qualification Certificate', 'Квалификационное свидетельство', 'Qualifikationsbescheinigung', NOW()),
  (gen_random_uuid(), 'REGISTRATION_MELDEBESCHEINIGUNG', 'Registration Certificate (Meldebescheinigung)', 'Регистрационное свидетельство (Meldebescheinigung)', 'Meldebescheinigung', NOW()),
  (gen_random_uuid(), 'OTHER', 'Other Document', 'Другой документ', 'Sonstiges Dokument', NOW())
ON CONFLICT (code) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ru = EXCLUDED.name_ru,
  name_de = EXCLUDED.name_de;

-- Verification query - show all categories
SELECT
  code,
  name_en,
  name_ru,
  name_de
FROM document_categories
ORDER BY code;
