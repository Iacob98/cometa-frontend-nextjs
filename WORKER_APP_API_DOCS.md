# Worker App API Documentation
# Документация API для Worker App

## 📋 Overview / Обзор

Этот документ описывает все API эндпоинты и переменные, которые Worker App должен использовать для получения документов проекта и работы с ними.

---

## 🔐 Конфигурация / Configuration

### Environment Variables / Переменные окружения

```bash
# API Base URL
API_BASE_URL=http://localhost:3000  # или production URL

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://oijmohlhdxoawzvctnxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📁 Документы проекта / Project Documents

### 1. Получить все документы проекта / Get Project Documents

**Эндпоинт:**
```
GET /api/projects/{project_id}/documents
```

**Параметры URL / URL Parameters:**
- `project_id` (UUID, обязательно) - ID проекта

**Параметры запроса / Query Parameters:**
- `page` (number, опционально) - номер страницы, по умолчанию 1
- `per_page` (number, опционально) - элементов на странице, по умолчанию 20

**Пример запроса / Request Example:**
```bash
curl -X GET "http://localhost:3000/api/projects/8cd3a97f-e911-42c3-b145-f9f5c1c6340a/documents?page=1&per_page=20"
```

**Ответ / Response:**
```json
{
  "documents": [
    {
      "id": "doc-uuid",
      "project_id": "8cd3a97f-e911-42c3-b145-f9f5c1c6340a",
      "document_type": "permit",
      "file_name": "building-permit.pdf",
      "file_path": "projects/8cd3a97f.../permits/building-permit.pdf",
      "file_url": "https://...supabase.co/storage/v1/object/public/...",
      "file_size": 1048576,
      "uploaded_at": "2025-10-30T10:00:00Z",
      "uploaded_by": "admin@example.com",
      "uploaded_by_name": "John Admin",
      "notes": "Утверженное разрешение на строительство",
      "status": "active",
      "source": "documents"
    },
    {
      "id": "plan-uuid",
      "project_id": "8cd3a97f-e911-42c3-b145-f9f5c1c6340a",
      "document_type": "plan",
      "file_name": "site-plan-v2.dwg",
      "file_path": "/api/project-preparation/plans/plan-uuid/download",
      "file_size": 2097152,
      "uploaded_at": "2025-10-29T15:30:00Z",
      "notes": "План участка версия 2",
      "status": "active",
      "source": "plans",
      "plan_type": "site_plan"
    }
  ],
  "summary": {
    "document_count": 15,
    "active_count": 14,
    "pending_count": 1,
    "plans_count": 5,
    "permits_count": 3,
    "reports_count": 4,
    "photos_count": 3
  },
  "categories": [
    {
      "id": "plans",
      "name": "Plans",
      "count": 5,
      "color": "#3b82f6"
    },
    {
      "id": "permits",
      "name": "Permits",
      "count": 3,
      "color": "#22c55e"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 15,
    "total_pages": 1
  }
}
```

**Типы документов / Document Types:**
- `plan` - планы проекта
- `permit` - разрешения
- `report` - отчеты
- `photo` - фотографии
- `general` - общие документы

**Статусы / Document Status:**
- `active` - активный документ
- `pending` - ожидает проверки
- `inactive` - неактивный

---

### 2. Скачать документ / Download Document

#### Для документов из таблицы `documents`:

**Метод 1: Прямой URL (публичные файлы)**
```javascript
// Используй file_url напрямую
const downloadUrl = document.file_url;
window.open(downloadUrl, '_blank');
```

**Метод 2: Через API (приватные файлы)**
```bash
GET /api/documents/{document_id}/download
```

#### Для планов проекта из таблицы `project_plans`:

**Эндпоинт:**
```bash
GET /api/project-preparation/plans/{plan_id}/download
```

**Пример:**
```javascript
// Для плана проекта
const planId = "plan-uuid";
const downloadUrl = `/api/project-preparation/plans/${planId}/download`;

// Скачивание
fetch(downloadUrl)
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = document.file_name;
    a.click();
    window.URL.revokeObjectURL(url);
  });
```

---

## 👷 Документы работников / Worker Documents

### 3. Получить документы работника / Get Worker Documents

**Эндпоинт:**
```
GET /api/users/{user_id}/documents
```

**Параметры URL:**
- `user_id` (UUID, обязательно) - ID работника

**Пример запроса:**
```bash
curl -X GET "http://localhost:3000/api/users/c3b270f6-4233-48d7-b6b4-109119d4ce4c/documents"
```

**Ответ:**
```json
{
  "documents": {
    "legal": [
      {
        "id": "doc-uuid",
        "user_id": "c3b270f6-4233-48d7-b6b4-109119d4ce4c",
        "category_id": "cat-uuid",
        "category_code": "PASSPORT",
        "category_type": "legal",
        "bucket_name": "documents",
        "file_name": "passport_2025.pdf",
        "original_file_name": "паспорт.pdf",
        "file_size": 524288,
        "mime_type": "application/pdf",
        "file_path": "c3b270f6.../passport/1730285120_passport_2025.pdf",
        "title": "Паспорт РФ",
        "description": "Копия паспорта",
        "created_at": "2025-10-30T10:12:00Z"
      }
    ],
    "company": [
      {
        "id": "doc-uuid-2",
        "user_id": "c3b270f6-4233-48d7-b6b4-109119d4ce4c",
        "category_id": "cat-uuid-2",
        "category_code": "EMPLOYMENT_CONTRACT",
        "category_type": "company",
        "bucket_name": "worker-documents",
        "file_name": "contract_2025.pdf",
        "file_size": 1048576,
        "mime_type": "application/pdf",
        "file_path": "c3b270f6.../employment_contract/1730285240_contract_2025.pdf",
        "title": "Трудовой договор",
        "created_at": "2025-10-30T10:14:00Z"
      }
    ],
    "all": [
      // ... все документы вместе
    ]
  },
  "categories": {
    "legal": [
      {
        "id": "cat-uuid",
        "code": "PASSPORT",
        "name_en": "Passport",
        "name_ru": "Паспорт",
        "name_de": "Reisepass",
        "category_type": "legal"
      }
    ],
    "company": [
      {
        "id": "cat-uuid-2",
        "code": "EMPLOYMENT_CONTRACT",
        "name_en": "Employment Contract",
        "name_ru": "Трудовой договор",
        "name_de": "Arbeitsvertrag",
        "category_type": "company"
      }
    ],
    "all": [
      // ... все категории вместе
    ]
  },
  "stats": {
    "total": 15,
    "legalCount": 9,
    "companyCount": 6
  }
}
```

---

### 4. Скачать документ работника / Download Worker Document

**Эндпоинт:**
```
GET /api/users/{user_id}/documents/{document_id}/download
```

**Параметры URL:**
- `user_id` (UUID, обязательно) - ID работника
- `document_id` (UUID, обязательно) - ID документа

**Ответ:**
```json
{
  "url": "https://...supabase.co/storage/v1/object/sign/documents/c3b270f6.../passport_2025.pdf?token=...",
  "filename": "паспорт.pdf",
  "mimeType": "application/pdf"
}
```

**Важно:** URL действителен только 60 секунд!

**Пример использования:**
```javascript
async function downloadWorkerDocument(userId, documentId, filename) {
  const response = await fetch(`/api/users/${userId}/documents/${documentId}/download`);
  const data = await response.json();

  // Скачать файл по signed URL
  const fileResponse = await fetch(data.url);
  const blob = await fileResponse.blob();

  // Сохранить файл
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || data.filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
```

---

## 📤 Загрузка документов / Upload Documents

### 5. Загрузить документ проекта / Upload Project Document

**Эндпоинт:**
```
POST /api/projects/{project_id}/documents
```

**Content-Type:** `multipart/form-data`

**Параметры FormData:**
- `file` (File, обязательно) - файл для загрузки
- `document_type` (string, обязательно) - тип документа (plan, permit, report, photo, general)
- `notes` (string, опционально) - заметки к документу
- `uploaded_by` (UUID, опционально) - ID загрузившего пользователя

**Пример:**
```javascript
async function uploadProjectDocument(projectId, file, documentType, notes) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  formData.append('notes', notes || '');

  const response = await fetch(`/api/projects/${projectId}/documents`, {
    method: 'POST',
    body: formData
  });

  return response.json();
}
```

---

### 6. Загрузить документ работника / Upload Worker Document

**Эндпоинт:**
```
POST /api/users/{user_id}/documents
```

**Content-Type:** `multipart/form-data`

**Параметры FormData:**
- `file` (File, обязательно) - файл для загрузки
- `category_id` (UUID, обязательно) - ID категории документа
- `title` (string, обязательно) - название документа
- `description` (string, опционально) - описание

**Пример:**
```javascript
async function uploadWorkerDocument(userId, file, categoryId, title, description) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category_id', categoryId);
  formData.append('title', title);
  if (description) {
    formData.append('description', description);
  }

  const response = await fetch(`/api/users/${userId}/documents`, {
    method: 'POST',
    body: formData
  });

  return response.json();
}
```

---

## 🏷️ Категории документов работников / Worker Document Categories

### Легальные документы / Legal Documents (9 категорий):
1. `PASSPORT` - Паспорт
2. `VISA` - Виза
3. `WORK_PERMIT` - Разрешение на работу
4. `RESIDENCE_PERMIT` - Вид на жительство
5. `HEALTH_INSURANCE` - Медицинская страховка
6. `DRIVER_LICENSE` - Водительское удостоверение
7. `QUALIFICATION_CERTIFICATE` - Сертификат квалификации
8. `REGISTRATION_MELDEBESCHEINIGUNG` - Регистрационное свидетельство
9. `OTHER` - Другое

### Корпоративные документы / Company Documents (7 категорий):
1. `EMPLOYMENT_CONTRACT` - Трудовой договор
2. `COMPANY_CERTIFICATE` - Корпоративный сертификат
3. `WORK_INSTRUCTION` - Рабочая инструкция
4. `COMPANY_POLICY` - Политика компании
5. `SAFETY_INSTRUCTION` - Инструкция по ТБ
6. `TRAINING_MATERIAL` - Материалы обучения
7. `PERSONAL_DOCUMENT` - Личный документ

---

## 🗂️ Структура хранилища / Storage Structure

### Supabase Storage Buckets:

#### 1. `project-documents`
Документы проектов от админа
```
project-documents/
└── projects/
    └── {project_id}/
        ├── plans/
        │   └── site-plan-v2.dwg
        ├── permits/
        │   └── building-permit.pdf
        ├── reports/
        │   └── monthly-report.pdf
        └── photos/
            └── site-photo.jpg
```

#### 2. `documents`
Легальные документы работников
```
documents/
└── {user_id}/
    ├── passport/
    │   └── 1730285120_passport_2025.pdf
    ├── visa/
    │   └── 1730285180_visa_2025.pdf
    └── work_permit/
        └── 1730285240_permit_2025.pdf
```

#### 3. `worker-documents`
Корпоративные документы работников (лимит 10 MB)
```
worker-documents/
└── {user_id}/
    ├── employment_contract/
    │   └── 1730285300_contract_2025.pdf
    ├── safety_instruction/
    │   └── 1730285360_safety_2025.pdf
    └── training_material/
        └── 1730285420_training_2025.pdf
```

---

## ⚠️ Важные замечания / Important Notes

### 1. Signed URLs
- URLs из `/download` эндпоинтов действительны только **60 секунд**
- Нужно скачивать файл сразу после получения URL
- Не кешировать signed URLs

### 2. Размеры файлов
- `project-documents`: без лимита
- `documents`: без лимита
- `worker-documents`: **максимум 10 MB**

### 3. Типы файлов
Поддерживаются:
- PDF (application/pdf)
- Изображения (image/jpeg, image/png, image/gif)
- Office документы (docx, xlsx)

### 4. Безопасность
- Все эндпоинты требуют аутентификации
- Worker App может видеть только свои документы
- Admin может видеть все документы

### 5. Источники документов
Поле `source` показывает откуда документ:
- `"documents"` - из таблицы `documents` (основные документы)
- `"plans"` - из таблицы `project_plans` (планы подготовки проекта)

---

## 🔄 React Query / TanStack Query Hooks

Worker App может использовать готовые хуки:

### Для документов работника:
```typescript
import {
  useWorkerDocuments,
  useUploadWorkerDocument,
  useDownloadDocument,
  useDocumentCategories
} from '@/hooks/use-worker-documents';

// Получить все документы работника
const { data, isLoading } = useWorkerDocuments(userId);

// Загрузить документ
const uploadMutation = useUploadWorkerDocument(userId);
uploadMutation.mutate({
  file: selectedFile,
  category_id: categoryId,
  title: 'Паспорт',
  description: 'Копия паспорта'
});

// Скачать документ
const downloadMutation = useDownloadDocument(userId);
downloadMutation.mutate({
  documentId: doc.id,
  filename: doc.file_name
});

// Получить категории
const { data: categories } = useDocumentCategories('legal'); // или 'company'
```

---

## 📊 Примеры интеграции / Integration Examples

### TypeScript Interface
```typescript
interface ProjectDocument {
  id: string;
  project_id: string;
  document_type: 'plan' | 'permit' | 'report' | 'photo' | 'general';
  file_name: string;
  file_path: string;
  file_url?: string;
  file_size: number;
  uploaded_at: string;
  uploaded_by: string | null;
  uploaded_by_name: string;
  notes: string;
  status: 'active' | 'pending' | 'inactive';
  source: 'documents' | 'plans';
  plan_type?: string;
}

interface WorkerDocument {
  id: string;
  user_id: string;
  category_id: string;
  category_code: string;
  category_type: 'legal' | 'company';
  bucket_name: string;
  file_name: string;
  original_file_name: string;
  file_size: number;
  mime_type: string;
  file_path: string;
  title: string;
  description?: string;
  created_at: string;
}
```

---

## 🚀 Быстрый старт / Quick Start

### 1. Получить документы проекта
```javascript
const projectId = '8cd3a97f-e911-42c3-b145-f9f5c1c6340a';
const response = await fetch(`/api/projects/${projectId}/documents`);
const data = await response.json();
console.log('Документы проекта:', data.documents);
```

### 2. Получить документы работника
```javascript
const userId = 'c3b270f6-4233-48d7-b6b4-109119d4ce4c';
const response = await fetch(`/api/users/${userId}/documents`);
const data = await response.json();
console.log('Легальные документы:', data.documents.legal);
console.log('Корпоративные документы:', data.documents.company);
```

### 3. Скачать документ
```javascript
// Для проекта
const downloadUrl = document.file_url;
window.open(downloadUrl, '_blank');

// Для работника (с signed URL)
const response = await fetch(`/api/users/${userId}/documents/${documentId}/download`);
const { url } = await response.json();
window.open(url, '_blank');
```

---

**Дата обновления:** 2025-10-30
**Версия API:** v1
