-- Migration: Unify document categories for Admin + Worker App
-- Date: 2025-10-30
-- Description: Add Worker App company document categories to document_categories table

-- Step 1: Drop the old CHECK constraint
ALTER TABLE document_categories
DROP CONSTRAINT IF EXISTS check_document_category_code;

-- Step 2: Add the new constraint with ALL categories (Legal + Company)
ALTER TABLE document_categories
ADD CONSTRAINT check_document_category_code
CHECK (code = ANY (ARRAY[
  -- Legal Documents (existing)
  'WORK_PERMIT'::text,
  'RESIDENCE_PERMIT'::text,
  'PASSPORT'::text,
  'VISA'::text,
  'HEALTH_INSURANCE'::text,
  'DRIVER_LICENSE'::text,
  'QUALIFICATION_CERT'::text,
  'REGISTRATION_MELDEBESCHEINIGUNG'::text,

  -- Company Documents (Worker App categories)
  'EMPLOYMENT_CONTRACT'::text,      -- Трудовой договор
  'COMPANY_CERTIFICATE'::text,      -- Внутренние сертификаты компании
  'WORK_INSTRUCTION'::text,         -- Рабочие инструкции
  'COMPANY_POLICY'::text,           -- Политики компании
  'SAFETY_INSTRUCTION'::text,       -- Инструкции по технике безопасности
  'TRAINING_MATERIAL'::text,        -- Обучающие материалы
  'PERSONAL_DOCUMENT'::text,        -- Личные документы

  'OTHER'::text
]));

-- Step 3: Insert Worker App company document categories
INSERT INTO document_categories (id, code, name_en, name_ru, name_de, created_at)
VALUES
  -- Company Documents
  (gen_random_uuid(), 'EMPLOYMENT_CONTRACT', 'Employment Contract', 'Трудовой договор', 'Arbeitsvertrag', NOW()),
  (gen_random_uuid(), 'COMPANY_CERTIFICATE', 'Company Certificate', 'Внутренний сертификат', 'Firmenzertifikat', NOW()),
  (gen_random_uuid(), 'WORK_INSTRUCTION', 'Work Instruction', 'Рабочая инструкция', 'Arbeitsanweisung', NOW()),
  (gen_random_uuid(), 'COMPANY_POLICY', 'Company Policy', 'Политика компании', 'Unternehmensrichtlinie', NOW()),
  (gen_random_uuid(), 'SAFETY_INSTRUCTION', 'Safety Instruction', 'Инструкция по ТБ', 'Sicherheitsanweisung', NOW()),
  (gen_random_uuid(), 'TRAINING_MATERIAL', 'Training Material', 'Обучающий материал', 'Schulungsmaterial', NOW()),
  (gen_random_uuid(), 'PERSONAL_DOCUMENT', 'Personal Document', 'Личный документ', 'Persönliches Dokument', NOW())
ON CONFLICT (code) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ru = EXCLUDED.name_ru,
  name_de = EXCLUDED.name_de;

-- Step 4: Add category_type column to differentiate Legal vs Company
ALTER TABLE document_categories
ADD COLUMN IF NOT EXISTS category_type VARCHAR(20) DEFAULT 'legal'
CHECK (category_type IN ('legal', 'company'));

-- Step 5: Update category types
UPDATE document_categories
SET category_type = 'legal'
WHERE code IN (
  'WORK_PERMIT', 'RESIDENCE_PERMIT', 'PASSPORT', 'VISA',
  'HEALTH_INSURANCE', 'DRIVER_LICENSE', 'QUALIFICATION_CERT',
  'REGISTRATION_MELDEBESCHEINIGUNG'
);

UPDATE document_categories
SET category_type = 'company'
WHERE code IN (
  'EMPLOYMENT_CONTRACT', 'COMPANY_CERTIFICATE', 'WORK_INSTRUCTION',
  'COMPANY_POLICY', 'SAFETY_INSTRUCTION', 'TRAINING_MATERIAL',
  'PERSONAL_DOCUMENT'
);

-- Step 6: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_categories_type
ON document_categories(category_type);

CREATE INDEX IF NOT EXISTS idx_document_categories_code
ON document_categories(code);

-- Verification query - show all categories by type
SELECT
  category_type,
  code,
  name_en,
  name_ru,
  name_de
FROM document_categories
ORDER BY category_type, code;
