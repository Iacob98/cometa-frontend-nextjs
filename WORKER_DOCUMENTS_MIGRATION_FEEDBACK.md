# 📋 Worker Documents System - Migration Feedback & Action Plan

## 🎯 Executive Summary

**Текущее состояние**: Next.js приложение использует временное файловое хранилище (`.tmp/documents/`) для документов работников.

**Целевое состояние**: Worker PWA использует правильную архитектуру с Supabase Storage + таблица `files`.

**Задача**: Мигрировать Next.js систему документов к общему стандарту Worker PWA.

---

## ✅ Что уже готово (Worker PWA)

### 1. Database Infrastructure ✅
- **Таблица `files`** - существует с нужными полями:
  - `user_id` UUID - связь с работником
  - `bucket_name` VARCHAR - название bucket
  - `category` VARCHAR - категория документа
  - `title` VARCHAR - название
  - `description` TEXT - описание
  - `metadata` JSONB - дополнительные данные
  - `file_path`, `file_size`, `mime_type` - файловые атрибуты

### 2. Supabase Storage ✅
- **Bucket `worker-documents`**:
  - Private (не публичный)
  - 10 MB file size limit
  - Структура путей: `{user_id}/{category}/{filename}`

### 3. Security (RLS) ✅
- **Row Level Security policies**:
  - Работники видят только свои документы (`user_id = auth.uid()`)
  - Admin/PM видят все документы работников
  - Только Admin может загружать/удалять

### 4. TypeScript Types ✅
```typescript
type WorkerDocumentCategory =
  | 'contract'      // Договор
  | 'certificate'   // Сертификат
  | 'instruction'   // Инструкция
  | 'policy'        // Политика
  | 'safety'        // Безопасность
  | 'training'      // Обучение
  | 'personal'      // Личные
  | 'other'         // Прочее

interface WorkerDocument {
  id: string
  userId: string
  filename: string
  originalFilename: string
  fileSize: number
  mimeType: string
  bucketName: 'worker-documents'
  filePath: string
  category: WorkerDocumentCategory
  title: string
  description?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}
```

### 5. Offline Support ✅
- **IndexedDB cache** для работы без интернета
- **React Query** с автоматической синхронизацией
- Fallback на кэш при ошибках

---

## ❌ Проблемы в Next.js приложении

### 1. Временное хранилище ❌
**Текущая реализация**: [src/lib/document-storage.ts](src/lib/document-storage.ts)
```typescript
// ❌ ПРОБЛЕМА: Файлы в .tmp/documents/
const STORAGE_DIR = path.join(process.cwd(), '.tmp', 'documents');
const METADATA_FILE = path.join(STORAGE_DIR, 'metadata.json');

// ❌ ПРОБЛЕМА: Хранение в памяти
let uploadedDocuments: Record<string, any[]> = {};
```

**Проблемы**:
- Файлы теряются при перезапуске Docker контейнера
- Нет связи с базой данных
- Нет RLS защиты
- Не масштабируемо

### 2. Mock Categories ❌
**Текущая реализация**: [src/app/api/users/[id]/documents/route.ts](src/app/api/users/[id]/documents/route.ts:33-46)
```typescript
// ❌ ПРОБЛЕМА: Запрос идет в БД, но категории не связаны с реальной системой
const categoriesResult = await query(
  `SELECT id, code, name_en, name_ru, name_de, created_at
   FROM document_categories
   ORDER BY name_en`,
  []
);
```

**Проблема**: Категории из таблицы `document_categories` (passport, visa, etc.) **НЕ СОВПАДАЮТ** с категориями Worker PWA (contract, certificate, safety, etc.)

### 3. Разные системы категорий ❌
**Next.js** использует таблицу `document_categories`:
```sql
-- document_categories (для виз, паспортов, страховок)
- WORK_PERMIT
- RESIDENCE_PERMIT
- PASSPORT
- VISA
- HEALTH_INSURANCE
- DRIVER_LICENSE
- QUALIFICATION_CERT
- REGISTRATION_MELDEBESCHEINIGUNG ← Только что добавили
- OTHER
```

**Worker PWA** использует enum:
```typescript
// WorkerDocumentCategory (для внутренних документов)
- contract      // Трудовые договоры
- certificate   // Внутренние сертификаты
- instruction   // Инструкции компании
- policy        // Политики компании
- safety        // ТБ
- training      // Обучение
- personal      // Личные документы
- other
```

**Конфликт**: Это ДВЕ РАЗНЫЕ системы для РАЗНЫХ целей!

---

## 🎯 Решение: Унификация систем

### Концепция: Две категории документов

#### 1️⃣ **Legal Documents** (Юридические документы) ← Текущая `document_categories`
**Назначение**: Официальные документы для работы (паспорта, визы, разрешения)
**Владелец**: Admin загружает
**Таблица**: `document_categories`
**Категории**:
- WORK_PERMIT (Разрешение на работу)
- RESIDENCE_PERMIT (Вид на жительство)
- PASSPORT (Паспорт)
- VISA (Виза)
- HEALTH_INSURANCE (Медицинская страховка)
- DRIVER_LICENSE (Водительские права)
- QUALIFICATION_CERT (Квалификационный сертификат)
- REGISTRATION_MELDEBESCHEINIGUNG (Регистрация)
- OTHER (Прочее)

#### 2️⃣ **Company Documents** (Корпоративные документы) ← Worker PWA
**Назначение**: Внутренние документы компании (договоры, инструкции, ТБ)
**Владелец**: Admin загружает, Работник читает
**Bucket**: `worker-documents`
**Категории** (enum в коде):
- contract (Трудовой договор)
- certificate (Внутренние сертификаты)
- instruction (Инструкции)
- policy (Политики компании)
- safety (Техника безопасности)
- training (Обучающие материалы)
- personal (Личные документы)
- other (Прочее)

### Архитектура объединенной системы

```
┌─────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                      │
│  (Next.js - порт 3000)                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  Legal Documents │  │ Company Documents│            │
│  │                  │  │                  │            │
│  │ • Паспорта       │  │ • Договоры       │            │
│  │ • Визы           │  │ • Инструкции     │            │
│  │ • Разрешения     │  │ • ТБ             │            │
│  │ • Страховки      │  │ • Обучение       │            │
│  └──────────────────┘  └──────────────────┘            │
│         ↓                      ↓                        │
│    documents table        files table                  │
│  + document_categories  + worker-documents             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  SUPABASE DATABASE                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  documents table              files table              │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │ category_id  ────┼────────→│ user_id          │     │
│  │ (FK to           │         │ bucket_name      │     │
│  │  document_       │         │ category (enum)  │     │
│  │  categories)     │         │ title            │     │
│  └──────────────────┘         └──────────────────┘     │
│                                                         │
│  document_categories                                    │
│  ┌──────────────────┐                                   │
│  │ PASSPORT         │                                   │
│  │ VISA             │                                   │
│  │ WORK_PERMIT      │                                   │
│  └──────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│               SUPABASE STORAGE                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  worker-documents/                                      │
│  ├── {user_id}/                                         │
│  │   ├── contract/                                      │
│  │   │   └── employment_contract.pdf                    │
│  │   ├── safety/                                        │
│  │   │   └── safety_instructions.pdf                    │
│  │   └── training/                                      │
│  │       └── welding_course.pdf                         │
│  │                                                      │
│  documents/ (для legal documents)                       │
│  ├── {user_id}/                                         │
│  │   ├── passport/                                      │
│  │   │   └── passport_scan.pdf                          │
│  │   ├── visa/                                          │
│  │   │   └── work_visa.pdf                              │
│  │   └── insurance/                                     │
│  │       └── health_insurance.pdf                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   WORKER PWA                            │
│  (порт 3001)                                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📄 Мои документы                                       │
│  ┌─────────────────────────────────────────┐            │
│  │                                         │            │
│  │  [Корпоративные] [Юридические]         │            │
│  │                                         │            │
│  │  Корпоративные документы:               │            │
│  │  ✓ Трудовой договор          [Скачать] │            │
│  │  ✓ Инструкция ТБ             [Скачать] │            │
│  │                                         │            │
│  │  Юридические документы:                 │            │
│  │  ✓ Паспорт                   [Скачать] │            │
│  │  ✓ Виза                      [Скачать] │            │
│  │                                         │            │
│  └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Migration Action Plan

### Phase 1: Update Types & Constants ✅ QUICK WIN

#### 1.1 Update TypeScript Types
**File**: `src/types/index.ts`
```typescript
// Добавить к существующим типам:

// Company documents (Worker PWA style)
export type CompanyDocumentCategory =
  | 'contract'      // Трудовой договор
  | 'certificate'   // Внутренние сертификаты
  | 'instruction'   // Инструкции
  | 'policy'        // Политики компании
  | 'safety'        // Техника безопасности
  | 'training'      // Обучающие материалы
  | 'personal'      // Личные документы
  | 'other'         // Прочее

// Legal documents (existing document_categories)
export type LegalDocumentCategory =
  | 'WORK_PERMIT'
  | 'RESIDENCE_PERMIT'
  | 'PASSPORT'
  | 'VISA'
  | 'HEALTH_INSURANCE'
  | 'DRIVER_LICENSE'
  | 'QUALIFICATION_CERT'
  | 'REGISTRATION_MELDEBESCHEINIGUNG'
  | 'OTHER'

// Unified worker document
export interface WorkerDocument {
  id: string
  userId: string
  filename: string
  originalFilename: string
  fileSize: number
  mimeType: string
  bucketName: 'worker-documents' | 'documents'
  filePath: string

  // For company documents (files table)
  category?: CompanyDocumentCategory

  // For legal documents (documents table + document_categories)
  categoryId?: string  // FK to document_categories

  title: string
  description?: string | null
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}
```

#### 1.2 Create Constants File
**File**: `src/lib/constants/document-categories.ts` (NEW)
```typescript
export const COMPANY_DOCUMENT_CATEGORIES = {
  contract: {
    code: 'contract',
    label_en: 'Contract',
    label_ru: 'Договор',
    label_de: 'Vertrag',
    icon: 'FileText',
    description: 'Employment contracts and agreements'
  },
  certificate: {
    code: 'certificate',
    label_en: 'Certificate',
    label_ru: 'Сертификат',
    label_de: 'Zertifikat',
    icon: 'Award',
    description: 'Internal certifications'
  },
  safety: {
    code: 'safety',
    label_en: 'Safety',
    label_ru: 'Безопасность',
    label_de: 'Sicherheit',
    icon: 'AlertTriangle',
    description: 'Safety instructions and protocols'
  },
  training: {
    code: 'training',
    label_en: 'Training',
    label_ru: 'Обучение',
    label_de: 'Schulung',
    icon: 'GraduationCap',
    description: 'Training materials'
  },
  // ... остальные категории
} as const;
```

### Phase 2: Migrate API Routes 🔧 CRITICAL

#### 2.1 Replace Temporary Storage
**File**: `src/app/api/users/[id]/documents/route.ts`

**Current (REMOVE)**:
```typescript
// ❌ DELETE THIS
import {
  getUserDocuments,
  storeDocument,
  storeFile
} from '@/lib/document-storage';
```

**New (ADD)**:
```typescript
// ✅ ADD THIS
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

#### 2.2 Update GET endpoint
```typescript
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;

  // Fetch company documents from files table
  const { data: companyDocs, error: companyError } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', userId)
    .eq('bucket_name', 'worker-documents')
    .order('created_at', { ascending: false });

  // Fetch legal documents from documents table
  const { data: legalDocs, error: legalError } = await supabase
    .from('documents')
    .select(`
      *,
      category:document_categories(*)
    `)
    .eq('uploaded_by', userId)
    .order('created_at', { ascending: false });

  // Fetch categories from document_categories table
  const { data: legalCategories } = await supabase
    .from('document_categories')
    .select('*')
    .order('name_en');

  return Response.json({
    companyDocuments: companyDocs || [],
    legalDocuments: legalDocs || [],
    legalCategories: legalCategories || [],
    companyCategories: Object.values(COMPANY_DOCUMENT_CATEGORIES),
    stats: {
      total: (companyDocs?.length || 0) + (legalDocs?.length || 0),
      companyCount: companyDocs?.length || 0,
      legalCount: legalDocs?.length || 0
    }
  });
}
```

#### 2.3 Update POST endpoint (Upload)
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  const formData = await request.formData();

  const file = formData.get('file') as File;
  const documentType = formData.get('document_type') as 'company' | 'legal';
  const category = formData.get('category') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  // Validate inputs
  if (!file || !documentType || !category || !title) {
    return Response.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  if (documentType === 'company') {
    // Upload to worker-documents bucket
    const filePath = `${userId}/${category}/${Date.now()}_${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('worker-documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Insert into files table
    const { data: fileRecord, error: insertError } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        bucket_name: 'worker-documents',
        category: category,
        title: title,
        description: description,
        filename: uploadData.path.split('/').pop(),
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        file_path: uploadData.path,
        metadata: {}
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return Response.json({
      success: true,
      document: fileRecord
    });

  } else {
    // Upload to documents bucket (legal docs)
    const filePath = `${userId}/${category}/${Date.now()}_${file.name}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type
      });

    if (uploadError) throw uploadError;

    // Insert into documents table
    const { data: docRecord, error: insertError } = await supabase
      .from('documents')
      .insert({
        uploaded_by: userId,
        category_id: category, // FK to document_categories
        filename: uploadData.path.split('/').pop(),
        original_filename: file.name,
        file_size: file.size,
        file_type: file.type,
        description: description
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return Response.json({
      success: true,
      document: docRecord
    });
  }
}
```

### Phase 3: Add Download Endpoints 📥

#### 3.1 Download Company Document
**File**: `src/app/api/users/[id]/documents/[documentId]/download/route.ts`
```typescript
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const { id: userId, documentId } = await params;

  // Get document metadata from files table
  const { data: document, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', documentId)
    .eq('user_id', userId)
    .eq('bucket_name', 'worker-documents')
    .single();

  if (error || !document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  // Create signed URL (valid for 60 seconds)
  const { data: signedUrl, error: urlError } = await supabase
    .storage
    .from('worker-documents')
    .createSignedUrl(document.file_path, 60);

  if (urlError) throw urlError;

  return Response.json({
    url: signedUrl.signedUrl,
    filename: document.original_filename,
    mimeType: document.mime_type
  });
}
```

### Phase 4: Create React Hooks 🪝

#### 4.1 Worker Documents Hook
**File**: `src/hooks/use-worker-documents.ts` (NEW)
```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface UseWorkerDocumentsOptions {
  documentType?: 'company' | 'legal' | 'all';
  category?: string;
  search?: string;
}

export function useWorkerDocuments(
  userId: string,
  options: UseWorkerDocumentsOptions = {}
) {
  return useQuery({
    queryKey: ['worker-documents', userId, options],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: async ({
      userId,
      documentId
    }: {
      userId: string;
      documentId: string;
    }) => {
      const response = await fetch(
        `/api/users/${userId}/documents/${documentId}/download`
      );
      if (!response.ok) throw new Error('Download failed');

      const { url, filename } = await response.json();

      // Trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    },
  });
}
```

### Phase 5: UI Components 🎨

#### 5.1 Documents Page
**File**: `src/app/(dashboard)/dashboard/documents/page.tsx` (NEW)

**Location**: Create new route under dashboard

**Features**:
- Tabs: "Company Documents" | "Legal Documents"
- Search bar
- Category filters
- Document cards with download/view actions
- Loading states
- Empty states

#### 5.2 Document Card Component
**File**: `src/components/documents/worker-document-card.tsx` (NEW)

**Features**:
- Icon по категории
- Название + badge категории
- Размер файла + дата
- Кнопки "Просмотр" и "Скачать"
- Loading states

---

## 🚨 Critical Issues to Fix

### 1. Remove Temporary Storage ❌ HIGH PRIORITY
**File to DELETE or REFACTOR**: `src/lib/document-storage.ts`

**Action**: Replace with Supabase Storage calls

### 2. Separate Legal vs Company Documents ❌ HIGH PRIORITY
**Current problem**: API смешивает два типа документов

**Solution**:
- GET endpoint возвращает оба типа раздельно
- POST endpoint принимает `document_type` параметр

### 3. Add RLS Policies ❌ MEDIUM PRIORITY
**Files to verify**:
- Check if RLS enabled on `files` table
- Check if RLS enabled on `documents` table
- Verify Storage policies exist

### 4. Create Migration Scripts 🔧 MEDIUM PRIORITY
**New file**: `database/migrations/010_unify_worker_documents.sql`

```sql
-- Add company document categories to files table (if not exists)
ALTER TABLE files
ADD COLUMN IF NOT EXISTS document_type VARCHAR(10) DEFAULT 'company'
CHECK (document_type IN ('company', 'legal'));

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_files_user_document_type
ON files(user_id, document_type, category);

-- Verify bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('worker-documents', 'worker-documents', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Workers read own files
CREATE POLICY "worker_documents_read_own"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'worker-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS: Admin reads all files
CREATE POLICY "worker_documents_read_admin"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'worker-documents'
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'pm')
  )
);
```

---

## 📊 Implementation Checklist

### Phase 1: Foundation (Day 1) ✅
- [ ] Add TypeScript types (`CompanyDocumentCategory`, `LegalDocumentCategory`)
- [ ] Create constants file (`COMPANY_DOCUMENT_CATEGORIES`)
- [ ] Verify database schema (`files` table has needed columns)
- [ ] Verify Storage bucket (`worker-documents` exists)

### Phase 2: Backend (Day 2) 🔧
- [ ] Refactor GET `/api/users/[id]/documents` (fetch from Supabase)
- [ ] Refactor POST `/api/users/[id]/documents` (upload to Supabase)
- [ ] Create GET `/api/users/[id]/documents/[documentId]/download`
- [ ] Remove temporary storage (`document-storage.ts`)
- [ ] Add RLS policies verification

### Phase 3: Hooks (Day 3) 🪝
- [ ] Create `use-worker-documents.ts` hook
- [ ] Create `use-download-document.ts` hook
- [ ] Add React Query integration
- [ ] Add offline support (IndexedDB cache)

### Phase 4: UI (Day 4-5) 🎨
- [ ] Create `/dashboard/documents` page
- [ ] Create `WorkerDocumentCard` component
- [ ] Create `DocumentCategoryFilter` component
- [ ] Add search functionality
- [ ] Add loading/error/empty states

### Phase 5: Testing & Polish (Day 6) ✅
- [ ] Test upload flow (Admin → Worker)
- [ ] Test download flow (Worker downloads)
- [ ] Test RLS (Worker can't see other worker's docs)
- [ ] Test offline mode (IndexedDB fallback)
- [ ] Performance testing (large files)
- [ ] Write E2E tests

---

## 🎯 Expected Outcomes

### Before Migration ❌
```
Admin uploads → .tmp/documents/metadata.json
                (lost on restart)

Worker views → No API available
               (can't see documents)
```

### After Migration ✅
```
Admin uploads → Supabase Storage (worker-documents bucket)
              → files table (metadata)
              → RLS protects access

Worker views → React Query fetches from Supabase
             → IndexedDB caches for offline
             → Signed URLs for secure download
             → Real-time sync with Admin uploads
```

---

## 🔐 Security Considerations

### Current Issues ❌
1. **No RLS**: Temporary files не защищены RLS
2. **No authentication**: Любой может читать `.tmp/documents/`
3. **No audit**: Нет логов кто загрузил/скачал

### After Migration ✅
1. **RLS protected**: Работник видит только свои документы
2. **Signed URLs**: Временные ссылки с истечением (60 сек)
3. **Audit trail**: Все действия логируются в Supabase
4. **Role-based**: Admin/PM/Worker имеют разные права

---

## 📈 Performance Improvements

### Current ❌
- Нет кэширования
- Нет CDN
- Файлы на диске сервера

### After Migration ✅
- IndexedDB cache (offline)
- React Query cache (5 min)
- Supabase CDN (глобальный)
- Signed URLs (прямой доступ, без прокси)

---

## 💡 Recommendations

### Short Term (This Week)
1. ✅ **Priority 1**: Migrate API routes to Supabase (Phase 2)
2. ✅ **Priority 2**: Add TypeScript types (Phase 1)
3. ✅ **Priority 3**: Create React hooks (Phase 3)

### Medium Term (Next Week)
1. 🔧 Build UI components (Phase 4)
2. 🔧 Add RLS policies verification
3. 🔧 Write migration scripts

### Long Term (Next Month)
1. 📊 Add analytics (download tracking)
2. 📊 Add notifications (new document uploaded)
3. 📊 Add versioning (document history)

---

## 🤝 Alignment with Worker PWA

### What to Keep from Worker PWA ✅
1. **Supabase Storage** architecture
2. **RLS policies** approach
3. **Company document categories** (contract, safety, training, etc.)
4. **Signed URLs** for downloads
5. **IndexedDB caching** for offline
6. **React Query** integration

### What to Adapt for Next.js 🔄
1. **API Routes** instead of direct Supabase calls
2. **Server Components** for initial data loading
3. **Next.js App Router** structure
4. **Unified types** across Admin and Worker
5. **Dual system**: Legal (document_categories) + Company (enum)

---

## ✅ Summary

**Current State**:
- ❌ Temporary storage (.tmp/documents/)
- ❌ No database integration
- ❌ No RLS protection
- ❌ Mock categories only

**Target State**:
- ✅ Supabase Storage (worker-documents bucket)
- ✅ Database integration (files table)
- ✅ RLS protection (Row Level Security)
- ✅ Real categories (company + legal)
- ✅ Offline support (IndexedDB)
- ✅ Signed URLs for security

**Migration Path**: 6 phases, ~6 days of work

**Key Decision**: Keep TWO document systems:
1. **Legal Documents** (document_categories table) - для юридических документов
2. **Company Documents** (files table + enum) - для корпоративных документов

**Next Steps**: Start with Phase 1 (Types) → Phase 2 (API Migration)

---

**Generated**: 2025-10-30
**Author**: Claude Code
**Status**: Ready for Implementation
**Estimated Effort**: 6 days
