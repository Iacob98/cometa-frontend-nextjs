# Vehicle Documents Management System - Implementation Plan

**Project**: COMETA - Fiber Optic Construction Management System
**Date**: 2025-10-18
**Author**: Claude Code
**Feature**: Vehicle Documents Management with German Standards

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Supabase Storage Setup](#supabase-storage-setup)
4. [API Endpoints](#api-endpoints)
5. [Frontend Components](#frontend-components)
6. [Integration Points](#integration-points)
7. [File Structure](#file-structure)
8. [Implementation Steps](#implementation-steps)
9. [Testing Strategy](#testing-strategy)
10. [Edge Cases & Validation](#edge-cases--validation)

---

## Overview

### Purpose
Implement a comprehensive vehicle documents management system for tracking German vehicle documentation including TÜV, insurance, registration, and service records with expiry date tracking and visual indicators.

### Key Features
- Multi-file upload support for vehicle documents
- German vehicle document type classification
- Expiry date tracking with warnings (expired/expiring soon)
- Document preview and download functionality
- Edit metadata (expiry dates, notes, document numbers)
- Delete documents with confirmation
- Sort and filter by type, expiry date, upload date
- Visual indicators for expired documents in vehicles table

### Based on Existing Patterns
- User documents system: `/src/components/documents/worker-documents-dialog.tsx`
- Document upload component: `/src/components/documents/document-upload.tsx`
- Document storage utilities: `/src/lib/document-storage.ts`
- User documents API: `/src/app/api/users/[id]/documents/`

---

## Database Schema

### 1. New Table: `vehicle_documents`

```sql
-- Create vehicle_documents table
CREATE TABLE vehicle_documents (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,

    -- Document classification
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'fahrzeugschein',      -- Vehicle Registration Certificate (Part I)
        'fahrzeugbrief',       -- Vehicle Title (Part II)
        'tuv',                 -- Technical Inspection (TÜV/HU)
        'versicherung',        -- Insurance
        'au',                  -- Emissions Test (Abgasuntersuchung)
        'wartung',             -- Service Records
        'sonstiges'            -- Other
    )),

    -- File information
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100),

    -- Document metadata
    document_number VARCHAR(100),
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    notes TEXT,

    -- Status and tracking
    is_verified BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_vehicle_documents_vehicle_id ON vehicle_documents(vehicle_id);
CREATE INDEX idx_vehicle_documents_document_type ON vehicle_documents(document_type);
CREATE INDEX idx_vehicle_documents_expiry_date ON vehicle_documents(expiry_date);
CREATE INDEX idx_vehicle_documents_created_at ON vehicle_documents(created_at DESC);

-- Create composite index for common query patterns
CREATE INDEX idx_vehicle_documents_vehicle_type_expiry
    ON vehicle_documents(vehicle_id, document_type, expiry_date);

-- Add comment for documentation
COMMENT ON TABLE vehicle_documents IS 'Vehicle documents with German standards support (TÜV, Insurance, Registration, etc.)';
COMMENT ON COLUMN vehicle_documents.document_type IS 'German vehicle document types: fahrzeugschein, fahrzeugbrief, tuv, versicherung, au, wartung, sonstiges';
COMMENT ON COLUMN vehicle_documents.expiry_date IS 'Expiry date for tracking document expiration (TÜV, Insurance, AU)';
```

### 2. Document Categories Enum

```typescript
// Add to src/types/index.ts
export type VehicleDocumentType =
  | 'fahrzeugschein'   // Vehicle Registration Certificate (Part I)
  | 'fahrzeugbrief'    // Vehicle Title (Part II)
  | 'tuv'              // Technical Inspection (TÜV/HU)
  | 'versicherung'     // Insurance
  | 'au'               // Emissions Test
  | 'wartung'          // Service Records
  | 'sonstiges';       // Other

export interface VehicleDocument {
  id: UUID;
  vehicle_id: UUID;
  document_type: VehicleDocumentType;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type?: string;
  document_number?: string;
  issuing_authority?: string;
  issue_date?: string; // ISO date
  expiry_date?: string; // ISO date
  notes?: string;
  is_verified: boolean;
  uploaded_by?: UUID;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  // Computed fields
  status?: DocumentStatus; // 'active' | 'expired' | 'expiring_soon'
  days_until_expiry?: number;
  warning_level?: 'none' | 'warning' | 'critical';
}

export interface VehicleDocumentCategory {
  id: VehicleDocumentType;
  code: string;
  name_de: string;
  name_en: string;
  name_ru: string;
  requires_expiry: boolean;
  color: string;
  description_de: string;
}

export interface VehicleDocumentsResponse {
  documents: VehicleDocument[];
  categories: VehicleDocumentCategory[];
  stats: {
    total: number;
    active: number;
    expired: number;
    expiring_soon: number;
    by_type: Record<VehicleDocumentType, number>;
  };
}
```

### 3. Migration SQL File

**File**: `/database/migrations/003_create_vehicle_documents.sql`

```sql
-- Migration: Create vehicle_documents table
-- Date: 2025-10-18
-- Description: Add vehicle documents management with German standards

BEGIN;

-- Create vehicle_documents table
CREATE TABLE IF NOT EXISTS vehicle_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'fahrzeugschein', 'fahrzeugbrief', 'tuv', 'versicherung',
        'au', 'wartung', 'sonstiges'
    )),
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100),
    document_number VARCHAR(100),
    issuing_authority VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    notes TEXT,
    is_verified BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_vehicle_documents_vehicle_id ON vehicle_documents(vehicle_id);
CREATE INDEX idx_vehicle_documents_document_type ON vehicle_documents(document_type);
CREATE INDEX idx_vehicle_documents_expiry_date ON vehicle_documents(expiry_date);
CREATE INDEX idx_vehicle_documents_created_at ON vehicle_documents(created_at DESC);
CREATE INDEX idx_vehicle_documents_vehicle_type_expiry
    ON vehicle_documents(vehicle_id, document_type, expiry_date);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_vehicle_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vehicle_documents_updated_at
    BEFORE UPDATE ON vehicle_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_vehicle_documents_updated_at();

-- Add comments
COMMENT ON TABLE vehicle_documents IS 'Vehicle documents with German standards support';
COMMENT ON COLUMN vehicle_documents.document_type IS 'German vehicle document types';
COMMENT ON COLUMN vehicle_documents.expiry_date IS 'Expiry date for tracking document expiration';

COMMIT;
```

---

## Supabase Storage Setup

### 1. Create Storage Bucket

**File**: `/sql/create-vehicle-documents-bucket.sql`

```sql
-- Create storage bucket for vehicle documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-documents', 'vehicle-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for vehicle documents
-- Policy: Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload vehicle documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vehicle-documents');

-- Policy: Allow authenticated users to view vehicle documents
CREATE POLICY "Allow authenticated users to view vehicle documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'vehicle-documents');

-- Policy: Allow authenticated users to update their uploaded documents
CREATE POLICY "Allow authenticated users to update vehicle documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'vehicle-documents');

-- Policy: Allow authenticated users to delete vehicle documents
CREATE POLICY "Allow authenticated users to delete vehicle documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'vehicle-documents');
```

### 2. Storage Folder Structure

```
vehicle-documents/
├── {vehicle_id}/
│   ├── fahrzeugschein/
│   │   ├── registration-2024.pdf
│   │   └── registration-old.pdf
│   ├── fahrzeugbrief/
│   │   └── title-document.pdf
│   ├── tuv/
│   │   ├── tuv-2024-10.pdf
│   │   └── tuv-2022-10.pdf
│   ├── versicherung/
│   │   ├── insurance-2024.pdf
│   │   └── insurance-certificate.pdf
│   ├── au/
│   │   └── emissions-test-2024.pdf
│   ├── wartung/
│   │   ├── service-2024-01.pdf
│   │   └── service-2023-06.pdf
│   └── sonstiges/
│       └── other-document.pdf
```

### 3. Storage Helper Functions

**File**: `/src/lib/vehicle-document-storage.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'vehicle-documents';

export interface UploadVehicleDocumentParams {
  vehicleId: string;
  documentType: string;
  file: File;
}

export interface VehicleDocumentMetadata {
  vehicleId: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

/**
 * Upload a vehicle document to Supabase storage
 */
export async function uploadVehicleDocument({
  vehicleId,
  documentType,
  file,
}: UploadVehicleDocumentParams): Promise<{ path: string; url: string }> {
  // Generate unique filename to avoid conflicts
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${vehicleId}/${documentType}/${timestamp}_${sanitizedFileName}`;

  // Upload file to Supabase storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Failed to upload document: ${error.message}`);
  }

  // Get public URL (or signed URL if bucket is private)
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: urlData.publicUrl,
  };
}

/**
 * Download a vehicle document from Supabase storage
 */
export async function downloadVehicleDocument(filePath: string): Promise<Blob> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error) {
    console.error('Download error:', error);
    throw new Error(`Failed to download document: ${error.message}`);
  }

  return data;
}

/**
 * Delete a vehicle document from Supabase storage
 */
export async function deleteVehicleDocument(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}

/**
 * Get signed URL for viewing document (for private buckets)
 */
export async function getVehicleDocumentSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    console.error('Signed URL error:', error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Calculate document status based on expiry date
 */
export function calculateDocumentStatus(expiryDate?: string): {
  status: 'active' | 'expired' | 'expiring_soon' | 'no_expiry';
  daysUntilExpiry?: number;
  warningLevel: 'none' | 'warning' | 'critical';
} {
  if (!expiryDate) {
    return { status: 'no_expiry', warningLevel: 'none' };
  }

  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { status: 'expired', daysUntilExpiry: diffDays, warningLevel: 'critical' };
  } else if (diffDays <= 30) {
    return { status: 'expiring_soon', daysUntilExpiry: diffDays, warningLevel: 'critical' };
  } else if (diffDays <= 60) {
    return { status: 'expiring_soon', daysUntilExpiry: diffDays, warningLevel: 'warning' };
  } else {
    return { status: 'active', daysUntilExpiry: diffDays, warningLevel: 'none' };
  }
}
```

---

## API Endpoints

### 1. GET `/api/vehicles/[id]/documents`

**File**: `/src/app/api/vehicles/[id]/documents/route.ts`

**Purpose**: List all documents for a specific vehicle

**Request**:
- Method: `GET`
- Params: `id` (vehicle UUID)
- Query: None

**Response**:
```typescript
{
  documents: VehicleDocument[];
  categories: VehicleDocumentCategory[];
  stats: {
    total: number;
    active: number;
    expired: number;
    expiring_soon: number;
    by_type: Record<VehicleDocumentType, number>;
  };
}
```

**Implementation**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateDocumentStatus } from '@/lib/vehicle-document-storage';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    // Fetch documents from database
    const { data: documents, error } = await supabase
      .from('vehicle_documents')
      .select('*')
      .eq('vehicle_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicle documents' },
        { status: 500 }
      );
    }

    // Calculate status for each document
    const documentsWithStatus = documents.map(doc => {
      const statusInfo = calculateDocumentStatus(doc.expiry_date);
      return {
        ...doc,
        ...statusInfo,
      };
    });

    // Calculate statistics
    const stats = {
      total: documents.length,
      active: documentsWithStatus.filter(d => d.status === 'active').length,
      expired: documentsWithStatus.filter(d => d.status === 'expired').length,
      expiring_soon: documentsWithStatus.filter(d => d.status === 'expiring_soon').length,
      by_type: documents.reduce((acc, doc) => {
        acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // German vehicle document categories
    const categories = [
      {
        id: 'fahrzeugschein',
        code: 'FAHRZEUGSCHEIN',
        name_de: 'Fahrzeugschein (Teil I)',
        name_en: 'Vehicle Registration Certificate',
        name_ru: 'Свидетельство о регистрации ТС',
        requires_expiry: false,
        color: '#3b82f6',
        description_de: 'Zulassungsbescheinigung Teil I',
      },
      {
        id: 'fahrzeugbrief',
        code: 'FAHRZEUGBRIEF',
        name_de: 'Fahrzeugbrief (Teil II)',
        name_en: 'Vehicle Title',
        name_ru: 'Технический паспорт ТС',
        requires_expiry: false,
        color: '#8b5cf6',
        description_de: 'Zulassungsbescheinigung Teil II',
      },
      {
        id: 'tuv',
        code: 'TUV',
        name_de: 'TÜV / HU',
        name_en: 'Technical Inspection',
        name_ru: 'Технический осмотр',
        requires_expiry: true,
        color: '#22c55e',
        description_de: 'Hauptuntersuchung (TÜV)',
      },
      {
        id: 'versicherung',
        code: 'VERSICHERUNG',
        name_de: 'Versicherung',
        name_en: 'Insurance',
        name_ru: 'Страховка',
        requires_expiry: true,
        color: '#ef4444',
        description_de: 'Kfz-Versicherung',
      },
      {
        id: 'au',
        code: 'AU',
        name_de: 'AU (Abgasuntersuchung)',
        name_en: 'Emissions Test',
        name_ru: 'Тест на выбросы',
        requires_expiry: true,
        color: '#f59e0b',
        description_de: 'Abgasuntersuchung',
      },
      {
        id: 'wartung',
        code: 'WARTUNG',
        name_de: 'Wartungsnachweis',
        name_en: 'Service Records',
        name_ru: 'Сервисные записи',
        requires_expiry: false,
        color: '#06b6d4',
        description_de: 'Serviceheft / Wartungsnachweise',
      },
      {
        id: 'sonstiges',
        code: 'SONSTIGES',
        name_de: 'Sonstiges',
        name_en: 'Other',
        name_ru: 'Прочее',
        requires_expiry: false,
        color: '#6b7280',
        description_de: 'Sonstige Dokumente',
      },
    ];

    return NextResponse.json({
      documents: documentsWithStatus,
      categories,
      stats,
    });
  } catch (error) {
    console.error('Vehicle documents GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle documents' },
      { status: 500 }
    );
  }
}
```

### 2. POST `/api/vehicles/[id]/documents`

**Purpose**: Upload new document(s) for a vehicle

**Request**:
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  ```
  file: File (required)
  document_type: VehicleDocumentType (required)
  document_number: string (optional)
  issuing_authority: string (optional)
  issue_date: string (optional, ISO date)
  expiry_date: string (optional, ISO date)
  notes: string (optional)
  ```

**Response**:
```typescript
{
  message: string;
  document: VehicleDocument;
}
```

**Implementation**:
```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id')
      .eq('id', id)
      .single();

    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('document_type') as string;
    const documentNumber = formData.get('document_number') as string;
    const issuingAuthority = formData.get('issuing_authority') as string;
    const issueDate = formData.get('issue_date') as string;
    const expiryDate = formData.get('expiry_date') as string;
    const notes = formData.get('notes') as string;

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'File and document type are required' },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = ['fahrzeugschein', 'fahrzeugbrief', 'tuv', 'versicherung', 'au', 'wartung', 'sonstiges'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Upload file to Supabase storage
    const { path, url } = await uploadVehicleDocument({
      vehicleId: id,
      documentType,
      file,
    });

    // Insert document record into database
    const { data: document, error: dbError } = await supabase
      .from('vehicle_documents')
      .insert({
        vehicle_id: id,
        document_type: documentType,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        file_type: file.type,
        document_number: documentNumber || null,
        issuing_authority: issuingAuthority || null,
        issue_date: issueDate || null,
        expiry_date: expiryDate || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Clean up uploaded file on error
      await deleteVehicleDocument(path);
      return NextResponse.json(
        { error: 'Failed to save document metadata' },
        { status: 500 }
      );
    }

    // Calculate status
    const statusInfo = calculateDocumentStatus(document.expiry_date);

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: {
        ...document,
        ...statusInfo,
      },
    });
  } catch (error) {
    console.error('Vehicle documents POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
```

### 3. GET `/api/vehicles/[id]/documents/[documentId]`

**Purpose**: Get specific document details

**File**: `/src/app/api/vehicles/[id]/documents/[documentId]/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;

    const { data: document, error } = await supabase
      .from('vehicle_documents')
      .select('*')
      .eq('id', documentId)
      .eq('vehicle_id', id)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const statusInfo = calculateDocumentStatus(document.expiry_date);

    return NextResponse.json({
      ...document,
      ...statusInfo,
    });
  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
  }
}
```

### 4. PUT `/api/vehicles/[id]/documents/[documentId]`

**Purpose**: Update document metadata

```typescript
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;
    const body = await request.json();

    // Update only allowed fields
    const { data: document, error } = await supabase
      .from('vehicle_documents')
      .update({
        document_number: body.document_number,
        issuing_authority: body.issuing_authority,
        issue_date: body.issue_date || null,
        expiry_date: body.expiry_date || null,
        notes: body.notes,
      })
      .eq('id', documentId)
      .eq('vehicle_id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    const statusInfo = calculateDocumentStatus(document.expiry_date);

    return NextResponse.json({
      message: 'Document updated successfully',
      document: {
        ...document,
        ...statusInfo,
      },
    });
  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}
```

### 5. DELETE `/api/vehicles/[id]/documents/[documentId]`

**Purpose**: Delete a document

```typescript
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;

    // Get document to retrieve file path
    const { data: document, error: fetchError } = await supabase
      .from('vehicle_documents')
      .select('file_path')
      .eq('id', documentId)
      .eq('vehicle_id', id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from storage first
    await deleteVehicleDocument(document.file_path);

    // Delete from database
    const { error: deleteError } = await supabase
      .from('vehicle_documents')
      .delete()
      .eq('id', documentId)
      .eq('vehicle_id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
```

### 6. GET `/api/vehicles/[id]/documents/[documentId]/download`

**Purpose**: Download document file

**File**: `/src/app/api/vehicles/[id]/documents/[documentId]/download/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { downloadVehicleDocument } from '@/lib/vehicle-document-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;

    // Get document metadata
    const { data: document, error } = await supabase
      .from('vehicle_documents')
      .select('file_path, file_name, file_type')
      .eq('id', documentId)
      .eq('vehicle_id', id)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Download file from storage
    const fileBlob = await downloadVehicleDocument(document.file_path);

    // Return file with proper headers
    return new NextResponse(fileBlob, {
      headers: {
        'Content-Type': document.file_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${document.file_name}"`,
      },
    });
  } catch (error) {
    console.error('Download document error:', error);
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    );
  }
}
```

### 7. GET `/api/vehicles/[id]/documents/[documentId]/view`

**Purpose**: View document in browser (not download)

**File**: `/src/app/api/vehicles/[id]/documents/[documentId]/view/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const { id, documentId } = await params;

    const { data: document, error } = await supabase
      .from('vehicle_documents')
      .select('file_path, file_name, file_type')
      .eq('id', documentId)
      .eq('vehicle_id', id)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    const fileBlob = await downloadVehicleDocument(document.file_path);

    // Return file for inline viewing
    return new NextResponse(fileBlob, {
      headers: {
        'Content-Type': document.file_type || 'application/pdf',
        'Content-Disposition': `inline; filename="${document.file_name}"`,
      },
    });
  } catch (error) {
    console.error('View document error:', error);
    return NextResponse.json(
      { error: 'Failed to view document' },
      { status: 500 }
    );
  }
}
```

---

## Frontend Components

### 1. Vehicle Documents Dialog

**File**: `/src/components/vehicles/vehicle-documents-dialog.tsx`

**Purpose**: Main dialog component for viewing and managing vehicle documents

**Key Features**:
- Display all documents grouped by category
- Show statistics (total, active, expired, expiring soon)
- Tabs for filtering documents by status
- Integration with upload component
- Document cards with metadata and actions

**Implementation Pattern**: Based on `worker-documents-dialog.tsx`

```typescript
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  X,
  Plus,
  Edit,
  Car,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleDocumentUpload } from "./vehicle-document-upload";
import { VehicleDocumentCard } from "./vehicle-document-card";

import type { VehicleDocumentsResponse } from "@/types";

interface VehicleDocumentsDialogProps {
  vehicleId: string;
  vehicleName: string;
  trigger?: React.ReactNode;
}

async function fetchVehicleDocuments(vehicleId: string): Promise<VehicleDocumentsResponse> {
  const response = await fetch(`/api/vehicles/${vehicleId}/documents`);
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  return response.json();
}

export default function VehicleDocumentsDialog({
  vehicleId,
  vehicleName,
  trigger
}: VehicleDocumentsDialogProps) {
  const [open, setOpen] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicle-documents', vehicleId],
    queryFn: () => fetchVehicleDocuments(vehicleId),
    enabled: open,
  });

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <FileText className="h-4 w-4 mr-1" />
      Dokumente
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Fahrzeugdokumente: {vehicleName}
              </DialogTitle>
              <DialogDescription>
                Alle Dokumente für dieses Fahrzeug (TÜV, Versicherung, Fahrzeugschein, etc.)
              </DialogDescription>
            </div>
            <Button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Dokument hinzufügen
            </Button>
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">Fehler beim Laden der Dokumente</p>
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{data.stats.total}</div>
                  <div className="text-sm text-muted-foreground">Gesamt</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{data.stats.active}</div>
                  <div className="text-sm text-muted-foreground">Gültig</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{data.stats.expiring_soon}</div>
                  <div className="text-sm text-muted-foreground">Läuft bald ab</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{data.stats.expired}</div>
                  <div className="text-sm text-muted-foreground">Abgelaufen</div>
                </CardContent>
              </Card>
            </div>

            {/* Documents List */}
            {data.documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Keine Dokumente</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Für dieses Fahrzeug wurden noch keine Dokumente hochgeladen.
                </p>
              </div>
            ) : (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">Alle ({data.stats.total})</TabsTrigger>
                  <TabsTrigger value="active">Gültig ({data.stats.active})</TabsTrigger>
                  <TabsTrigger value="expiring">Läuft ab ({data.stats.expiring_soon})</TabsTrigger>
                  <TabsTrigger value="expired">Abgelaufen ({data.stats.expired})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  {data.documents.map(doc => (
                    <VehicleDocumentCard
                      key={doc.id}
                      document={doc}
                      vehicleId={vehicleId}
                      categories={data.categories}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="active" className="mt-6">
                  {data.documents
                    .filter(doc => doc.status === 'active')
                    .map(doc => (
                      <VehicleDocumentCard
                        key={doc.id}
                        document={doc}
                        vehicleId={vehicleId}
                        categories={data.categories}
                      />
                    ))}
                </TabsContent>

                <TabsContent value="expiring" className="mt-6">
                  {data.documents
                    .filter(doc => doc.status === 'expiring_soon')
                    .map(doc => (
                      <VehicleDocumentCard
                        key={doc.id}
                        document={doc}
                        vehicleId={vehicleId}
                        categories={data.categories}
                      />
                    ))}
                </TabsContent>

                <TabsContent value="expired" className="mt-6">
                  {data.documents
                    .filter(doc => doc.status === 'expired')
                    .map(doc => (
                      <VehicleDocumentCard
                        key={doc.id}
                        document={doc}
                        vehicleId={vehicleId}
                        categories={data.categories}
                      />
                    ))}
                </TabsContent>
              </Tabs>
            )}
          </div>
        )}
      </DialogContent>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dokument hochladen für {vehicleName}</DialogTitle>
            <DialogDescription>
              Laden Sie ein neues Dokument hoch (TÜV, Versicherung, Fahrzeugschein, etc.)
            </DialogDescription>
          </DialogHeader>
          <VehicleDocumentUpload
            vehicleId={vehicleId}
            onUploadComplete={() => {
              setShowUpload(false);
              queryClient.invalidateQueries({
                queryKey: ['vehicle-documents', vehicleId]
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
```

### 2. Vehicle Document Card

**File**: `/src/components/vehicles/vehicle-document-card.tsx`

**Purpose**: Individual document card with metadata and actions

```typescript
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Shield,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  X,
  Edit,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { VehicleDocument, VehicleDocumentCategory } from "@/types";

interface VehicleDocumentCardProps {
  document: VehicleDocument;
  vehicleId: string;
  categories: VehicleDocumentCategory[];
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-500';
    case 'expired':
      return 'bg-red-500';
    case 'expiring_soon':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4" />;
    case 'expired':
      return <AlertTriangle className="h-4 w-4" />;
    case 'expiring_soon':
      return <Clock className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'active':
      return 'Gültig';
    case 'expired':
      return 'Abgelaufen';
    case 'expiring_soon':
      return 'Läuft bald ab';
    case 'no_expiry':
      return 'Kein Ablaufdatum';
    default:
      return 'Unbekannt';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function VehicleDocumentCard({ document, vehicleId, categories }: VehicleDocumentCardProps) {
  const statusColor = getStatusColor(document.status || 'active');
  const statusIcon = getStatusIcon(document.status || 'active');
  const statusText = getStatusText(document.status || 'active');
  const queryClient = useQueryClient();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    document_number: document.document_number || '',
    issuing_authority: document.issuing_authority || '',
    issue_date: document.issue_date || '',
    expiry_date: document.expiry_date || '',
    notes: document.notes || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const category = categories.find(cat => cat.id === document.document_type);

  const handleView = () => {
    const viewUrl = `/api/vehicles/${vehicleId}/documents/${document.id}/view`;
    window.open(viewUrl, '_blank');
  };

  const handleDownload = async () => {
    try {
      const downloadUrl = `/api/vehicles/${vehicleId}/documents/${document.id}/download`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Failed to download document');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Fehler beim Herunterladen des Dokuments');
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/documents/${document.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update document');

      queryClient.invalidateQueries({
        queryKey: ['vehicle-documents', vehicleId]
      });

      setShowEditDialog(false);
      alert('Dokument erfolgreich aktualisiert');
    } catch (error) {
      console.error('Update failed:', error);
      alert('Fehler beim Aktualisieren des Dokuments');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Möchten Sie das Dokument "${document.file_name}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/documents/${document.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete document');

      queryClient.invalidateQueries({
        queryKey: ['vehicle-documents', vehicleId]
      });

      alert('Dokument erfolgreich gelöscht');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Fehler beim Löschen des Dokuments');
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category?.color || '#6b7280' }}
            />
            {category?.name_de || document.document_type}
          </CardTitle>
          <Badge
            variant="secondary"
            className={`${statusColor} text-white flex items-center gap-1`}
          >
            {statusIcon}
            {statusText}
            {document.days_until_expiry !== undefined && document.days_until_expiry >= 0 && (
              <span className="ml-1">({document.days_until_expiry} Tage)</span>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {document.document_number && (
            <div>
              <span className="font-medium text-muted-foreground">Dokumentennummer:</span>
              <p>{document.document_number}</p>
            </div>
          )}

          {document.issuing_authority && (
            <div>
              <span className="font-medium text-muted-foreground">Ausstellende Behörde:</span>
              <p>{document.issuing_authority}</p>
            </div>
          )}

          {document.issue_date && (
            <div>
              <span className="font-medium text-muted-foreground">Ausstellungsdatum:</span>
              <p>{new Date(document.issue_date).toLocaleDateString('de-DE')}</p>
            </div>
          )}

          {document.expiry_date && (
            <div>
              <span className="font-medium text-muted-foreground">Ablaufdatum:</span>
              <p className={document.status === 'expired' ? 'text-red-600 font-medium' : document.status === 'expiring_soon' ? 'text-yellow-600 font-medium' : ''}>
                {new Date(document.expiry_date).toLocaleDateString('de-DE')}
              </p>
            </div>
          )}
        </div>

        {document.notes && (
          <div>
            <span className="font-medium text-muted-foreground">Notizen:</span>
            <p className="text-sm mt-1">{document.notes}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{document.file_name}</span>
            <span>({formatFileSize(document.file_size)})</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleView}>
              <Eye className="h-4 w-4 mr-1" />
              Ansehen
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              Herunterladen
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Bearbeiten
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <X className="h-4 w-4 mr-1" />
              Löschen
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dokument bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="document_number">Dokumentennummer</Label>
              <Input
                id="document_number"
                value={editForm.document_number}
                onChange={(e) => setEditForm({ ...editForm, document_number: e.target.value })}
                placeholder="Dokumentennummer eingeben..."
              />
            </div>

            <div>
              <Label htmlFor="issuing_authority">Ausstellende Behörde</Label>
              <Input
                id="issuing_authority"
                value={editForm.issuing_authority}
                onChange={(e) => setEditForm({ ...editForm, issuing_authority: e.target.value })}
                placeholder="Ausstellende Behörde eingeben..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue_date">Ausstellungsdatum</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={editForm.issue_date}
                  onChange={(e) => setEditForm({ ...editForm, issue_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="expiry_date">Ablaufdatum</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={editForm.expiry_date}
                  onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notizen</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Notizen eingeben..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                disabled={isUpdating}
              >
                Abbrechen
              </Button>
              <Button onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating ? 'Wird gespeichert...' : 'Speichern'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
```

### 3. Vehicle Document Upload

**File**: `/src/components/vehicles/vehicle-document-upload.tsx`

**Purpose**: Upload component for vehicle documents

**Implementation Pattern**: Based on `document-upload.tsx`

```typescript
"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { VehicleDocumentType } from "@/types";

interface VehicleDocumentUploadProps {
  vehicleId: string;
  onUploadComplete?: () => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}

interface FileWithMetadata {
  file: File;
  documentType?: VehicleDocumentType;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
}

const GERMAN_DOCUMENT_TYPES = [
  { id: 'fahrzeugschein', label: 'Fahrzeugschein (Teil I)', requiresExpiry: false },
  { id: 'fahrzeugbrief', label: 'Fahrzeugbrief (Teil II)', requiresExpiry: false },
  { id: 'tuv', label: 'TÜV / HU', requiresExpiry: true },
  { id: 'versicherung', label: 'Versicherung', requiresExpiry: true },
  { id: 'au', label: 'AU (Abgasuntersuchung)', requiresExpiry: true },
  { id: 'wartung', label: 'Wartungsnachweis', requiresExpiry: false },
  { id: 'sonstiges', label: 'Sonstiges', requiresExpiry: false },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function VehicleDocumentUpload({
  vehicleId,
  onUploadComplete,
  maxFiles = 10,
  maxFileSize = 50 * 1024 * 1024, // 50MB
}: VehicleDocumentUploadProps) {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > maxFiles) {
        toast.error(`Maximal ${maxFiles} Dateien erlaubt`);
        return;
      }

      const newFiles: FileWithMetadata[] = acceptedFiles.map((file) => ({
        file,
        documentType: undefined,
        documentNumber: '',
        issuingAuthority: '',
        issueDate: '',
        expiryDate: '',
        notes: '',
      }));

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
    },
    maxSize: maxFileSize,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFileMetadata = (
    index: number,
    field: keyof FileWithMetadata,
    value: any
  ) => {
    setFiles((prev) =>
      prev.map((file, i) =>
        i === index ? { ...file, [field]: value } : file
      )
    );
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Bitte wählen Sie mindestens eine Datei aus");
      return;
    }

    // Check if all files have document types
    const filesWithoutType = files.filter(file => !file.documentType);
    if (filesWithoutType.length > 0) {
      toast.error("Bitte wählen Sie für alle Dateien einen Dokumententyp aus");
      return;
    }

    setUploading(true);

    for (const [index, fileData] of files.entries()) {
      const fileName = fileData.file.name;

      try {
        setUploadProgress((prev) => ({ ...prev, [fileName]: 0 }));

        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => ({
            ...prev,
            [fileName]: Math.min(prev[fileName] + 10, 90),
          }));
        }, 100);

        // Create FormData
        const formData = new FormData();
        formData.append('file', fileData.file);
        formData.append('document_type', fileData.documentType!);
        if (fileData.documentNumber) formData.append('document_number', fileData.documentNumber);
        if (fileData.issuingAuthority) formData.append('issuing_authority', fileData.issuingAuthority);
        if (fileData.issueDate) formData.append('issue_date', fileData.issueDate);
        if (fileData.expiryDate) formData.append('expiry_date', fileData.expiryDate);
        if (fileData.notes) formData.append('notes', fileData.notes);

        // Upload
        const response = await fetch(`/api/vehicles/${vehicleId}/documents`, {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        setUploadProgress((prev) => ({ ...prev, [fileName]: 100 }));
        toast.success(`${fileName} erfolgreich hochgeladen`);
      } catch (error) {
        console.error('Upload failed for', fileName, error);
        setUploadProgress((prev) => ({ ...prev, [fileName]: -1 }));
        toast.error(`Fehler beim Hochladen von ${fileName}`);
      }
    }

    setUploading(false);
    setFiles([]);
    setUploadProgress({});
    onUploadComplete?.();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dokumente hochladen</CardTitle>
        <CardDescription>
          Ziehen Sie Dateien per Drag & Drop oder klicken Sie zum Auswählen. Maximal {maxFiles} Dateien,{" "}
          {formatFileSize(maxFileSize)} pro Datei.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-primary">Dateien hier ablegen...</p>
          ) : (
            <div>
              <p className="text-muted-foreground mb-2">
                Dateien per Drag & Drop hier ablegen oder klicken zum Auswählen
              </p>
              <p className="text-sm text-muted-foreground">
                Unterstützt: PDF, JPG, PNG (max. {formatFileSize(maxFileSize)})
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Dateien zum Hochladen ({files.length})</h4>
            {files.map((fileData, index) => {
              const progress = uploadProgress[fileData.file.name] || 0;
              const isError = progress === -1;
              const docType = GERMAN_DOCUMENT_TYPES.find(t => t.id === fileData.documentType);

              return (
                <Card key={`${fileData.file.name}-${index}`} className="p-4">
                  <div className="space-y-3">
                    {/* File Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium truncate max-w-xs">
                          {fileData.file.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(fileData.file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Metadata Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Label htmlFor={`type-${index}`}>Dokumententyp *</Label>
                        <Select
                          value={fileData.documentType || ""}
                          onValueChange={(value) =>
                            updateFileMetadata(index, "documentType", value as VehicleDocumentType)
                          }
                          disabled={uploading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Dokumententyp auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {GERMAN_DOCUMENT_TYPES.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`doc-number-${index}`}>Dokumentennummer</Label>
                        <Input
                          id={`doc-number-${index}`}
                          placeholder="Nummer..."
                          value={fileData.documentNumber || ""}
                          onChange={(e) =>
                            updateFileMetadata(index, "documentNumber", e.target.value)
                          }
                          disabled={uploading}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`authority-${index}`}>Ausstellende Behörde</Label>
                        <Input
                          id={`authority-${index}`}
                          placeholder="Behörde..."
                          value={fileData.issuingAuthority || ""}
                          onChange={(e) =>
                            updateFileMetadata(index, "issuingAuthority", e.target.value)
                          }
                          disabled={uploading}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`issue-date-${index}`}>Ausstellungsdatum</Label>
                        <Input
                          id={`issue-date-${index}`}
                          type="date"
                          value={fileData.issueDate || ""}
                          onChange={(e) =>
                            updateFileMetadata(index, "issueDate", e.target.value)
                          }
                          disabled={uploading}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`expiry-date-${index}`}>
                          Ablaufdatum {docType?.requiresExpiry && '*'}
                        </Label>
                        <Input
                          id={`expiry-date-${index}`}
                          type="date"
                          value={fileData.expiryDate || ""}
                          onChange={(e) =>
                            updateFileMetadata(index, "expiryDate", e.target.value)
                          }
                          disabled={uploading}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`notes-${index}`}>Notizen</Label>
                      <Textarea
                        id={`notes-${index}`}
                        placeholder="Optionale Notizen..."
                        value={fileData.notes || ""}
                        onChange={(e) =>
                          updateFileMetadata(index, "notes", e.target.value)
                        }
                        disabled={uploading}
                        rows={2}
                      />
                    </div>

                    {/* Upload Progress */}
                    {uploading && progress >= 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>Wird hochgeladen...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {/* Error State */}
                    {isError && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>Upload fehlgeschlagen</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

            {/* Upload Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="min-w-32"
              >
                {uploading ? "Wird hochgeladen..." : `${files.length} Datei(en) hochladen`}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Integration Points

### 1. Add Documents Button to Vehicles Table

**File**: `/src/app/(dashboard)/dashboard/vehicles/page.tsx`

**Location**: In the Actions column of the vehicles table

**Changes**:

```typescript
// Import the dialog component
import VehicleDocumentsDialog from '@/components/vehicles/vehicle-documents-dialog';

// In the TableRow actions section, add:
<TableCell className="text-right">
  <div className="flex justify-end gap-2">
    {/* Existing buttons */}
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}/edit`)}
    >
      <Edit className="h-4 w-4" />
    </Button>

    {/* NEW: Documents button with badge */}
    <VehicleDocumentsDialog
      vehicleId={vehicle.id}
      vehicleName={`${vehicle.brand} ${vehicle.model}`}
      trigger={
        <Button variant="ghost" size="sm" className="relative">
          <FileText className="h-4 w-4" />
          {vehicle.document_count > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              {vehicle.document_count}
            </Badge>
          )}
        </Button>
      }
    />

    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
    >
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  </div>
</TableCell>
```

### 2. Add Document Count to Vehicle API Response

**File**: `/src/app/api/vehicles/route.ts` (or wherever vehicles are fetched)

**Add document count to query**:

```sql
SELECT
  v.*,
  (SELECT COUNT(*) FROM vehicle_documents vd WHERE vd.vehicle_id = v.id) as document_count,
  (SELECT COUNT(*) FROM vehicle_documents vd
   WHERE vd.vehicle_id = v.id AND vd.expiry_date < CURRENT_DATE) as expired_documents_count
FROM vehicles v
```

### 3. Add Visual Indicator for Expired Documents

**In the vehicles table row**, add a warning badge for vehicles with expired documents:

```typescript
{vehicle.expired_documents_count > 0 && (
  <Badge variant="destructive" className="ml-2">
    <AlertTriangle className="h-3 w-3 mr-1" />
    {vehicle.expired_documents_count} abgelaufen
  </Badge>
)}
```

### 4. Optional: Add Documents Section to Vehicle Form

**File**: `/src/app/(dashboard)/dashboard/vehicles/[id]/edit/page.tsx`

**Add a documents section at the bottom of the form**:

```typescript
{/* Documents Section */}
<Card>
  <CardHeader>
    <CardTitle>Dokumente</CardTitle>
    <CardDescription>
      Verwalten Sie alle Dokumente für dieses Fahrzeug
    </CardDescription>
  </CardHeader>
  <CardContent>
    <VehicleDocumentsDialog
      vehicleId={vehicleId}
      vehicleName={vehicleName}
      trigger={
        <Button variant="outline" className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          Dokumente verwalten
        </Button>
      }
    />
  </CardContent>
</Card>
```

### 5. Add Document Expiry Notifications

**Create a new component for dashboard warnings**:

**File**: `/src/components/vehicles/vehicle-expiry-warnings.tsx`

```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Car } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function fetchExpiringDocuments() {
  const response = await fetch('/api/vehicles/documents/expiring');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

export function VehicleExpiryWarnings() {
  const { data, isLoading } = useQuery({
    queryKey: ['expiring-vehicle-documents'],
    queryFn: fetchExpiringDocuments,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading || !data || data.length === 0) return null;

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Ablaufende Fahrzeugdokumente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((doc: any) => (
            <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{doc.vehicle_name}</span>
                <span className="text-sm text-muted-foreground">- {doc.document_type_label}</span>
              </div>
              <Badge variant={doc.days_until_expiry < 0 ? 'destructive' : 'secondary'}>
                {doc.days_until_expiry < 0
                  ? `${Math.abs(doc.days_until_expiry)} Tage überfällig`
                  : `${doc.days_until_expiry} Tage verbleibend`
                }
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

**API endpoint for expiring documents**:

**File**: `/src/app/api/vehicles/documents/expiring/route.ts`

```typescript
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('vehicle_documents')
      .select(`
        id,
        document_type,
        expiry_date,
        vehicle:vehicles(id, brand, model)
      `)
      .not('expiry_date', 'is', null)
      .lte('expiry_date', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()) // Next 60 days
      .order('expiry_date', { ascending: true });

    if (error) throw error;

    const formattedData = data.map(doc => ({
      ...doc,
      vehicle_name: `${doc.vehicle.brand} ${doc.vehicle.model}`,
      days_until_expiry: Math.ceil(
        (new Date(doc.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Expiring documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
```

---

## File Structure

### New Files to Create

```
src/
├── app/
│   └── api/
│       └── vehicles/
│           ├── [id]/
│           │   └── documents/
│           │       ├── route.ts                          # GET, POST
│           │       └── [documentId]/
│           │           ├── route.ts                      # GET, PUT, DELETE
│           │           ├── download/
│           │           │   └── route.ts                  # GET (download)
│           │           └── view/
│           │               └── route.ts                  # GET (view)
│           └── documents/
│               └── expiring/
│                   └── route.ts                          # GET (expiring warnings)
│
├── components/
│   └── vehicles/
│       ├── vehicle-documents-dialog.tsx                  # Main dialog
│       ├── vehicle-document-card.tsx                     # Document card
│       ├── vehicle-document-upload.tsx                   # Upload component
│       └── vehicle-expiry-warnings.tsx                   # Dashboard warnings
│
├── lib/
│   └── vehicle-document-storage.ts                      # Storage utilities
│
├── types/
│   └── index.ts                                          # Update with vehicle document types
│
├── hooks/
│   └── use-vehicle-documents.ts                         # React Query hooks (optional)
│
└── database/
    └── migrations/
        └── 003_create_vehicle_documents.sql              # Database migration

sql/
└── create-vehicle-documents-bucket.sql                   # Supabase storage setup
```

### Files to Modify

```
src/
├── app/
│   └── (dashboard)/
│       └── dashboard/
│           └── vehicles/
│               ├── page.tsx                              # Add documents button
│               └── [id]/
│                   └── edit/
│                       └── page.tsx                      # Optional: add documents section
│
└── types/
    └── index.ts                                          # Add vehicle document types
```

---

## Implementation Steps

### Phase 1: Database Setup (Day 1)

1. **Create database migration**
   - [ ] Create `/database/migrations/003_create_vehicle_documents.sql`
   - [ ] Add table creation with all fields
   - [ ] Add indexes for performance
   - [ ] Add trigger for `updated_at`
   - [ ] Execute migration on Supabase

2. **Setup Supabase storage**
   - [ ] Create `/sql/create-vehicle-documents-bucket.sql`
   - [ ] Create `vehicle-documents` bucket
   - [ ] Configure storage policies (RLS)
   - [ ] Execute SQL on Supabase
   - [ ] Test bucket access

3. **Add TypeScript types**
   - [ ] Update `/src/types/index.ts`
   - [ ] Add `VehicleDocumentType` enum
   - [ ] Add `VehicleDocument` interface
   - [ ] Add `VehicleDocumentCategory` interface
   - [ ] Add `VehicleDocumentsResponse` interface

### Phase 2: Storage Layer (Day 1-2)

4. **Create storage utilities**
   - [ ] Create `/src/lib/vehicle-document-storage.ts`
   - [ ] Implement `uploadVehicleDocument()`
   - [ ] Implement `downloadVehicleDocument()`
   - [ ] Implement `deleteVehicleDocument()`
   - [ ] Implement `getVehicleDocumentSignedUrl()`
   - [ ] Implement `calculateDocumentStatus()`
   - [ ] Add unit tests

### Phase 3: API Layer (Day 2-3)

5. **Create API routes**
   - [ ] Create `/src/app/api/vehicles/[id]/documents/route.ts`
     - [ ] Implement GET (list documents)
     - [ ] Implement POST (upload document)
     - [ ] Add validation with Zod
     - [ ] Add error handling

   - [ ] Create `/src/app/api/vehicles/[id]/documents/[documentId]/route.ts`
     - [ ] Implement GET (get document)
     - [ ] Implement PUT (update metadata)
     - [ ] Implement DELETE (delete document)

   - [ ] Create `/src/app/api/vehicles/[id]/documents/[documentId]/download/route.ts`
     - [ ] Implement GET (download file)

   - [ ] Create `/src/app/api/vehicles/[id]/documents/[documentId]/view/route.ts`
     - [ ] Implement GET (view file inline)

   - [ ] Create `/src/app/api/vehicles/documents/expiring/route.ts`
     - [ ] Implement GET (expiring documents)

6. **Test API endpoints**
   - [ ] Test with Postman/Thunder Client
   - [ ] Verify file upload works
   - [ ] Verify file download works
   - [ ] Verify metadata updates work
   - [ ] Verify deletion works

### Phase 4: Frontend Components (Day 3-4)

7. **Create upload component**
   - [ ] Create `/src/components/vehicles/vehicle-document-upload.tsx`
   - [ ] Implement drag & drop with react-dropzone
   - [ ] Add document type selector
   - [ ] Add metadata fields (dates, numbers, notes)
   - [ ] Add validation (required fields)
   - [ ] Add progress indicators
   - [ ] Test multi-file upload

8. **Create document card component**
   - [ ] Create `/src/components/vehicles/vehicle-document-card.tsx`
   - [ ] Display document metadata
   - [ ] Add status badges (expired/expiring/active)
   - [ ] Add action buttons (view, download, edit, delete)
   - [ ] Implement edit dialog
   - [ ] Add confirmation for deletion
   - [ ] Test all actions

9. **Create documents dialog**
   - [ ] Create `/src/components/vehicles/vehicle-documents-dialog.tsx`
   - [ ] Add statistics cards
   - [ ] Add tabs (all, active, expiring, expired)
   - [ ] Group documents by category
   - [ ] Integrate upload component
   - [ ] Add loading states
   - [ ] Add empty states

### Phase 5: Integration (Day 4-5)

10. **Integrate into vehicles page**
    - [ ] Modify `/src/app/(dashboard)/dashboard/vehicles/page.tsx`
    - [ ] Add documents button to actions column
    - [ ] Add document count badge
    - [ ] Add expired documents indicator
    - [ ] Update vehicle API to include document counts
    - [ ] Test integration

11. **Add expiry warnings**
    - [ ] Create `/src/components/vehicles/vehicle-expiry-warnings.tsx`
    - [ ] Add to dashboard page
    - [ ] Implement auto-refresh
    - [ ] Add navigation to documents
    - [ ] Test warnings display

12. **Optional: Add to vehicle edit form**
    - [ ] Modify `/src/app/(dashboard)/dashboard/vehicles/[id]/edit/page.tsx`
    - [ ] Add documents section
    - [ ] Integrate documents dialog
    - [ ] Test form integration

### Phase 6: Testing & QA (Day 5-6)

13. **Write tests**
    - [ ] Unit tests for storage utilities
    - [ ] Integration tests for API routes
    - [ ] Component tests for UI
    - [ ] E2E tests for complete flow
    - [ ] Test edge cases (large files, invalid formats, etc.)

14. **Manual testing**
    - [ ] Test upload multiple documents
    - [ ] Test download documents
    - [ ] Test view documents in browser
    - [ ] Test edit metadata
    - [ ] Test delete documents
    - [ ] Test expiry calculations
    - [ ] Test status indicators
    - [ ] Test on different browsers
    - [ ] Test on mobile devices

15. **Performance testing**
    - [ ] Test with large files (50MB)
    - [ ] Test with many documents (100+)
    - [ ] Test concurrent uploads
    - [ ] Optimize queries if needed
    - [ ] Add pagination if needed

### Phase 7: Documentation & Deployment (Day 6-7)

16. **Create documentation**
    - [ ] Document API endpoints
    - [ ] Document component props
    - [ ] Create user guide
    - [ ] Add code comments
    - [ ] Update README

17. **Deployment checklist**
    - [ ] Run database migrations on production
    - [ ] Create storage bucket on production
    - [ ] Configure storage policies
    - [ ] Test on staging environment
    - [ ] Deploy to production
    - [ ] Verify production functionality
    - [ ] Monitor for errors

---

## Testing Strategy

### Unit Tests

**File**: `/src/lib/__tests__/vehicle-document-storage.test.ts`

```typescript
import { calculateDocumentStatus } from '../vehicle-document-storage';

describe('calculateDocumentStatus', () => {
  it('should return no_expiry for documents without expiry date', () => {
    const result = calculateDocumentStatus(undefined);
    expect(result.status).toBe('no_expiry');
    expect(result.warningLevel).toBe('none');
  });

  it('should return expired for past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);
    const result = calculateDocumentStatus(pastDate.toISOString());
    expect(result.status).toBe('expired');
    expect(result.warningLevel).toBe('critical');
  });

  it('should return expiring_soon for dates within 30 days', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const result = calculateDocumentStatus(futureDate.toISOString());
    expect(result.status).toBe('expiring_soon');
    expect(result.warningLevel).toBe('critical');
  });

  it('should return active for dates beyond 60 days', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);
    const result = calculateDocumentStatus(futureDate.toISOString());
    expect(result.status).toBe('active');
    expect(result.warningLevel).toBe('none');
  });
});
```

### Integration Tests

**File**: `/src/app/api/vehicles/__tests__/documents.test.ts`

```typescript
import { POST, GET } from '../[id]/documents/route';

describe('Vehicle Documents API', () => {
  describe('POST /api/vehicles/[id]/documents', () => {
    it('should upload a document successfully', async () => {
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.pdf'));
      formData.append('document_type', 'tuv');
      formData.append('expiry_date', '2025-12-31');

      const request = new Request('http://localhost/api/vehicles/test-id/documents', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'test-id' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Document uploaded successfully');
      expect(data.document).toBeDefined();
    });

    it('should reject upload without document type', async () => {
      const formData = new FormData();
      formData.append('file', new File(['test'], 'test.pdf'));

      const request = new Request('http://localhost/api/vehicles/test-id/documents', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'test-id' }) });
      expect(response.status).toBe(400);
    });
  });
});
```

### Component Tests

**File**: `/src/components/vehicles/__tests__/vehicle-document-card.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { VehicleDocumentCard } from '../vehicle-document-card';

describe('VehicleDocumentCard', () => {
  const mockDocument = {
    id: '1',
    vehicle_id: 'vehicle-1',
    document_type: 'tuv',
    file_name: 'tuv-2024.pdf',
    file_size: 1024000,
    expiry_date: '2025-12-31',
    status: 'active',
    days_until_expiry: 400,
    warning_level: 'none',
  };

  const mockCategories = [
    {
      id: 'tuv',
      name_de: 'TÜV / HU',
      color: '#22c55e',
    },
  ];

  it('should render document information', () => {
    render(
      <VehicleDocumentCard
        document={mockDocument}
        vehicleId="vehicle-1"
        categories={mockCategories}
      />
    );

    expect(screen.getByText('TÜV / HU')).toBeInTheDocument();
    expect(screen.getByText('tuv-2024.pdf')).toBeInTheDocument();
  });

  it('should open edit dialog when edit button is clicked', () => {
    render(
      <VehicleDocumentCard
        document={mockDocument}
        vehicleId="vehicle-1"
        categories={mockCategories}
      />
    );

    fireEvent.click(screen.getByText('Bearbeiten'));
    expect(screen.getByText('Dokument bearbeiten')).toBeInTheDocument();
  });
});
```

### E2E Tests

**File**: `/e2e/vehicle-documents.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Vehicle Documents Management', () => {
  test('should upload a document', async ({ page }) => {
    await page.goto('/dashboard/vehicles');

    // Click documents button for first vehicle
    await page.click('[data-testid="vehicle-documents-button"]');

    // Wait for dialog to open
    await expect(page.locator('[data-testid="documents-dialog"]')).toBeVisible();

    // Click add document button
    await page.click('[data-testid="add-document-button"]');

    // Upload file
    await page.setInputFiles('[data-testid="file-input"]', 'test-files/tuv.pdf');

    // Select document type
    await page.selectOption('[data-testid="document-type-select"]', 'tuv');

    // Set expiry date
    await page.fill('[data-testid="expiry-date-input"]', '2025-12-31');

    // Submit
    await page.click('[data-testid="upload-button"]');

    // Verify success
    await expect(page.locator('.toast')).toContainText('erfolgreich hochgeladen');
  });

  test('should show expired document warning', async ({ page }) => {
    await page.goto('/dashboard/vehicles');

    // Should show warning badge for vehicles with expired documents
    await expect(page.locator('[data-testid="expired-badge"]')).toBeVisible();
  });
});
```

---

## Edge Cases & Validation

### File Upload Validation

1. **File size limits**
   - Max 50MB per file
   - Show error if exceeded
   - Prevent upload button if oversized

2. **File type restrictions**
   - Allow: PDF, JPG, PNG, GIF, BMP, WebP
   - Reject: Executable files, scripts
   - Validate MIME type on server

3. **Duplicate files**
   - Allow duplicates (different timestamps)
   - Warn user if similar file exists
   - Use unique filenames with timestamps

4. **Concurrent uploads**
   - Handle multiple file uploads sequentially
   - Show individual progress for each
   - Continue on partial failures

### Document Metadata Validation

1. **Required fields**
   - Document type: Required
   - File: Required
   - Expiry date: Required for TÜV, Insurance, AU
   - Other fields: Optional

2. **Date validation**
   - Issue date must be in the past
   - Expiry date must be after issue date
   - Show warning for suspicious dates

3. **Document number validation**
   - Allow alphanumeric + special chars
   - Max length: 100 characters
   - No SQL injection attempts

### Database Constraints

1. **Foreign key validation**
   - Verify vehicle exists before upload
   - Show 404 if vehicle not found
   - Cascade delete on vehicle removal

2. **Storage cleanup**
   - Delete files when document deleted
   - Handle orphaned files
   - Periodic cleanup job

3. **Transaction handling**
   - Upload file first, then DB record
   - Rollback file if DB insert fails
   - Ensure consistency

### Status Calculation Edge Cases

1. **Timezone handling**
   - Use UTC for all dates
   - Convert to local for display
   - Handle DST transitions

2. **Leap years**
   - Account for February 29
   - Use proper date math

3. **Missing expiry dates**
   - Mark as "no expiry"
   - Don't show in warnings
   - Allow null in database

### Security Considerations

1. **Authentication**
   - Require authentication for all endpoints
   - Verify user has access to vehicle
   - Check role permissions (admin, pm)

2. **File validation**
   - Scan for malware (future)
   - Validate file headers
   - Sanitize filenames

3. **SQL injection**
   - Use parameterized queries
   - Validate all inputs
   - Use Supabase RLS policies

4. **Path traversal**
   - Validate file paths
   - Use UUIDs for filenames
   - Prevent directory listing

### Performance Optimization

1. **Large files**
   - Stream uploads (don't load in memory)
   - Show progress indicator
   - Handle timeouts gracefully

2. **Many documents**
   - Implement pagination (100 per page)
   - Lazy load images
   - Use virtual scrolling

3. **Query optimization**
   - Use indexes on common queries
   - Avoid N+1 queries
   - Cache document counts

### Error Handling

1. **Network failures**
   - Retry failed uploads (3 times)
   - Show detailed error messages
   - Allow manual retry

2. **Storage failures**
   - Handle bucket quota exceeded
   - Handle permission errors
   - Fallback to error state

3. **Database failures**
   - Handle connection timeouts
   - Handle constraint violations
   - Show user-friendly messages

---

## Summary

This implementation plan provides a complete, production-ready vehicle documents management system for the COMETA project, following German vehicle documentation standards and patterns established in the existing codebase.

**Key Features**:
- German vehicle document types (TÜV, Versicherung, Fahrzeugschein, etc.)
- Expiry date tracking with visual warnings
- Multi-file upload with drag & drop
- Document preview and download
- Metadata editing
- Integration with existing vehicles page
- Supabase storage and PostgreSQL database
- Comprehensive testing strategy

**Estimated Timeline**: 6-7 days
- Day 1: Database + Storage setup
- Day 2-3: API layer
- Day 3-4: Frontend components
- Day 4-5: Integration
- Day 5-6: Testing
- Day 6-7: Documentation + Deployment

**Next Steps**:
1. Review and approve this plan
2. Create database migration
3. Setup Supabase storage bucket
4. Begin implementation following the steps outlined
5. Test thoroughly at each phase
6. Deploy to production

---

**End of Implementation Plan**
