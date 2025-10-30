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

-- Step 3: Insert the new document category
INSERT INTO document_categories (
  id,
  code,
  name_en,
  name_ru,
  name_de,
  description,
  icon,
  color,
  required_for_work,
  max_validity_years,
  renewal_notice_days,
  created_at
) VALUES (
  gen_random_uuid(),
  'REGISTRATION_MELDEBESCHEINIGUNG',
  'Registration Certificate (Meldebescheinigung)',
  'Регистрационное свидетельство (Meldebescheinigung)',
  'Meldebescheinigung',
  'German residence registration certificate required for legal work',
  'FileText',
  '#10b981', -- Green color for registration documents
  true, -- Required for work in Germany
  NULL, -- No expiry (registration is ongoing)
  90, -- 90 days notice before renewal needed
  NOW()
) ON CONFLICT (code) DO NOTHING;

-- Verification query
SELECT
  code,
  name_en,
  name_ru,
  name_de,
  color,
  required_for_work
FROM document_categories
WHERE code = 'REGISTRATION_MELDEBESCHEINIGUNG';
