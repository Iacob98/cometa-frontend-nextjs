import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';
import {
  getUserDocuments as getSupabaseDocuments,
  uploadDocument,
} from '@/lib/worker-document-storage';

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

    // Fetch documents from Supabase (both legal and company)
    const { legalDocuments, companyDocuments } = await getSupabaseDocuments(id);

    // Fetch categories from database (both legal and company types)
    const categoriesResult = await query(
      `SELECT
        id,
        code,
        name_en,
        name_ru,
        name_de,
        category_type,
        created_at
      FROM document_categories
      ORDER BY category_type, name_en`,
      []
    );

    const allCategories = categoriesResult.rows;

    // Split categories by type for easier filtering
    const categories = {
      legal: allCategories.filter((c: any) => c.category_type === 'legal'),
      company: allCategories.filter((c: any) => c.category_type === 'company'),
      all: allCategories
    };

    // Calculate statistics
    const allDocuments = [...legalDocuments, ...companyDocuments];
    const stats = {
      total: allDocuments.length,
      legalCount: legalDocuments.length,
      companyCount: companyDocuments.length,
    };

    return NextResponse.json({
      documents: {
        legal: legalDocuments,
        company: companyDocuments,
        all: allDocuments,
      },
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
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    // Log received file data for debugging
    console.log('📄 API: Receiving document for upload:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      categoryId,
      title,
      description,
      userId: id
    });

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

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Fetch category details to determine type and code
    const categoryResult = await query(
      `SELECT id, code, category_type
       FROM document_categories
       WHERE id = $1`,
      [categoryId]
    );

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const category = categoryResult.rows[0];

    // Upload document to Supabase Storage
    const document = await uploadDocument({
      userId: id,
      categoryId: category.id,
      categoryCode: category.code,
      categoryType: category.category_type,
      file,
      fileName: file.name,
      title,
      description: description || undefined,
      metadata: {},
    });

    console.log('✅ Document uploaded successfully:', {
      documentId: document.id,
      fileName: document.fileName,
      userId: id,
      category: category.code,
      categoryType: category.category_type,
    });

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('User documents POST API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
