import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getUserDocuments,
  storeDocument,
  storeFile
} from '@/lib/document-storage';

// Service role client for bypassing RLS
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
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get documents from shared storage
    const documents = getUserDocuments(id);

    const categories = [
      // Mock categories for testing - replace with actual database query when implemented
      {
        id: "work_permit",
        code: "WORK_PERMIT",
        name_en: "Work Permit",
        name_ru: "Разрешение на работу",
        name_de: "Arbeitserlaubnis",
        required_for_work: true,
        color: "#22c55e",
        created_at: new Date().toISOString()
      },
      {
        id: "passport",
        code: "PASSPORT",
        name_en: "Passport",
        name_ru: "Паспорт",
        name_de: "Reisepass",
        required_for_work: true,
        color: "#3b82f6",
        created_at: new Date().toISOString()
      },
      {
        id: "driver_license",
        code: "DRIVER_LICENSE",
        name_en: "Driver's License",
        name_ru: "Водительские права",
        name_de: "Führerschein",
        required_for_work: false,
        color: "#f59e0b",
        created_at: new Date().toISOString()
      },
      {
        id: "medical_certificate",
        code: "MEDICAL_CERT",
        name_en: "Medical Certificate",
        name_ru: "Медицинская справка",
        name_de: "Ärztliches Attest",
        required_for_work: true,
        color: "#ef4444",
        created_at: new Date().toISOString()
      },
      {
        id: "contract",
        code: "CONTRACT",
        name_en: "Employment Contract",
        name_ru: "Трудовой договор",
        name_de: "Arbeitsvertrag",
        required_for_work: true,
        color: "#8b5cf6",
        created_at: new Date().toISOString()
      }
    ];

    const stats = {
      total: documents.length,
      active: documents.filter(d => d.status === 'active').length,
      expired: documents.filter(d => d.status === 'expired').length,
      expiring_soon: documents.filter(d => d.status === 'expiring_soon').length,
      critical_count: documents.filter(d => d.warningLevel === 'critical').length,
      urgent_count: documents.filter(d => d.priority === 'urgent').length,
      high_priority_count: documents.filter(d => d.priority === 'high').length
    };

    return NextResponse.json({
      documents,
      categories,
      stats
    });
  } catch (error) {
    console.error('User documents GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user documents' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Parse the form data for file upload
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('category_id') as string;
    const documentNumber = formData.get('document_number') as string;
    const issuingAuthority = formData.get('issuing_authority') as string;
    const issueDate = formData.get('issue_date') as string;
    const expiryDate = formData.get('expiry_date') as string;
    const notes = formData.get('notes') as string;

    // Log received file data for debugging
    console.log('📄 API: Получен документ для загрузки:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      fileConstructor: file?.constructor?.name,
      hasArrayBuffer: typeof file?.arrayBuffer === 'function',
      hasStream: typeof file?.stream === 'function',
      isFile: file instanceof File,
      categoryId,
      documentNumber,
      issuingAuthority,
      issueDate,
      expiryDate,
      notes,
      userId: id
    });

    console.log('📋 API: Все FormData ключи:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(name="${value.name}", size=${value.size}, type="${value.type}")`);
      } else {
        console.log(`  ${key}: "${value}"`);
      }
    }

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // Convert file to buffer and store it
    let fileBuffer: Buffer;
    try {
      // First try arrayBuffer method
      if (file.arrayBuffer && typeof file.arrayBuffer === 'function') {
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      } else if (file.stream && typeof file.stream === 'function') {
        // Fallback to stream method
        const chunks: Uint8Array[] = [];
        const reader = file.stream().getReader();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
        } finally {
          reader.releaseLock();
        }

        // Combine all chunks into a single buffer
        const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          combined.set(chunk, offset);
          offset += chunk.length;
        }
        fileBuffer = Buffer.from(combined);
      } else {
        // If neither method is available, try direct buffer conversion
        if (file instanceof Buffer) {
          fileBuffer = file;
        } else if (file instanceof Uint8Array) {
          fileBuffer = Buffer.from(file);
        } else {
          throw new Error('File object does not have supported read methods');
        }
      }
    } catch (error) {
      console.error('Error reading file content:', error);
      return NextResponse.json(
        { error: 'Failed to read file content' },
        { status: 400 }
      );
    }

    // Create document with proper category information
    const documentId = `doc-${Date.now()}`;

    // Store the actual file content
    storeFile(documentId, fileBuffer);

    // Define categories (same as in GET method)
    const categories = [
      // Mock categories for testing - replace with actual database query when implemented
      {
        id: "work_permit",
        code: "WORK_PERMIT",
        name_en: "Work Permit",
        name_ru: "Разрешение на работу",
        name_de: "Arbeitserlaubnis",
        required_for_work: true,
        color: "#22c55e",
        created_at: new Date().toISOString()
      },
      {
        id: "passport",
        code: "PASSPORT",
        name_en: "Passport",
        name_ru: "Паспорт",
        name_de: "Reisepass",
        required_for_work: true,
        color: "#3b82f6",
        created_at: new Date().toISOString()
      },
      {
        id: "driver_license",
        code: "DRIVER_LICENSE",
        name_en: "Driver's License",
        name_ru: "Водительские права",
        name_de: "Führerschein",
        required_for_work: false,
        color: "#f59e0b",
        created_at: new Date().toISOString()
      },
      {
        id: "medical_certificate",
        code: "MEDICAL_CERT",
        name_en: "Medical Certificate",
        name_ru: "Медицинская справка",
        name_de: "Ärztliches Attest",
        required_for_work: true,
        color: "#ef4444",
        created_at: new Date().toISOString()
      },
      {
        id: "contract",
        code: "CONTRACT",
        name_en: "Employment Contract",
        name_ru: "Трудовой договор",
        name_de: "Arbeitsvertrag",
        required_for_work: true,
        color: "#8b5cf6",
        created_at: new Date().toISOString()
      }
    ];

    // Find matching category
    const matchingCategory = categories.find(cat => cat.id === categoryId);

    const newDocument = {
      id: documentId,
      user_id: id,
      category_id: categoryId,
      document_number: documentNumber || '',
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
      file_url: `/api/users/${id}/documents/${documentId}/download`,
      status: 'active',
      notes: notes || '',
      issuing_authority: issuingAuthority || '',
      issue_date: issueDate || null,
      expiry_date: expiryDate || null,
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: matchingCategory || {
        id: categoryId,
        code: categoryId.toUpperCase(),
        name_en: categoryId,
        name_ru: categoryId,
        name_de: categoryId,
        required_for_work: false,
        color: "#6b7280",
        created_at: new Date().toISOString()
      }
    };

    // Store document metadata
    storeDocument(id, newDocument);

    console.log('✅ Документ сохранен:', {
      documentId: newDocument.id,
      fileName: newDocument.file_name,
      userId: id,
      category: newDocument.category.name_ru || newDocument.category.name_en,
      totalUserDocs: getUserDocuments(id).length
    });

    return NextResponse.json({
      message: 'Document uploaded successfully',
      document: newDocument
    });
  } catch (error) {
    console.error('User documents POST API error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}