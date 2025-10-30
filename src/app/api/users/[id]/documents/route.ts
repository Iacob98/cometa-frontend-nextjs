import { NextRequest, NextResponse } from 'next/server';
import {
  getUserDocuments,
  storeDocument,
  storeFile
} from '@/lib/document-storage';
import { query } from '@/lib/db-client';

export async function GET(
  _request: NextRequest,
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

    // Fetch categories from database
    const categoriesResult = await query(
      `SELECT
        id,
        code,
        name_en,
        name_ru,
        name_de,
        created_at
      FROM document_categories
      ORDER BY name_en`,
      []
    );

    const categories = categoriesResult.rows;

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

// Configure this API route to handle larger file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

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
      // Use the modern async arrayBuffer method which is standard for File objects
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);

      console.log('📁 File successfully converted to buffer:', {
        originalSize: file.size,
        bufferSize: fileBuffer.length,
        fileName: file.name
      });
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

    // Fetch categories from database
    const categoriesResult = await query(
      `SELECT
        id,
        code,
        name_en,
        name_ru,
        name_de,
        created_at
      FROM document_categories
      WHERE id = $1`,
      [categoryId]
    );

    // Find matching category
    const matchingCategory = categoriesResult.rows[0];

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