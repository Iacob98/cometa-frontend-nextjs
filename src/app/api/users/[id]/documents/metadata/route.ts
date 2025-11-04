import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db-client';

/**
 * Create document metadata record WITHOUT file upload
 * This is useful for registering document information when the physical document exists elsewhere
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      category_id,
      title,
      description,
      document_number,
      issue_authority,
      issue_date,
      expiry_date,
      metadata,
    } = body;

    if (!category_id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
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
      `SELECT id, code, category_type, name_en, name_de, name_ru
       FROM document_categories
       WHERE id = $1`,
      [category_id]
    );

    if (categoryResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const category = categoryResult.rows[0];

    // Build metadata JSON
    const documentMetadata: Record<string, any> = {
      ...metadata,
      registered_without_file: true, // Mark this as metadata-only
      registration_date: new Date().toISOString(),
    };

    if (document_number) documentMetadata.document_number = document_number;
    if (issue_authority) documentMetadata.issue_authority = issue_authority;
    if (issue_date) documentMetadata.issue_date = issue_date;
    if (expiry_date) documentMetadata.expiry_date = expiry_date;

    // Determine table based on category type
    const isLegalDocument = category.category_type === 'legal';

    let documentRecord;

    if (isLegalDocument) {
      // Insert into 'documents' table (for legal documents)
      const result = await query(
        `INSERT INTO documents (
          uploaded_by,
          category_id,
          filename,
          original_filename,
          file_size,
          file_type,
          file_path,
          description
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          0,
          'metadata-only',
          NULL,
          $5
        )
        RETURNING *`,
        [
          userId,
          category_id,
          `${category.code.toLowerCase()}_${Date.now()}_metadata_only`,
          title,
          description || null,
        ]
      );

      documentRecord = result.rows[0];

      console.log('✅ Legal document metadata created:', {
        documentId: documentRecord.id,
        userId,
        category: category.code,
      });
    } else {
      // Insert into 'files' table (for company documents)
      const metadataFilename = `${category.code.toLowerCase()}_${Date.now()}_metadata_only`;
      const metadataPath = `metadata-only/${metadataFilename}`;

      const result = await query(
        `INSERT INTO files (
          filename,
          original_filename,
          file_size,
          mime_type,
          bucket_name,
          file_path,
          file_url,
          user_id,
          category,
          title,
          description,
          metadata
        ) VALUES (
          $1,
          $2,
          0,
          'application/metadata',
          'worker-documents',
          $3,
          NULL,
          $4,
          $5,
          $6,
          $7,
          $8
        )
        RETURNING *`,
        [
          metadataFilename,
          title,
          metadataPath,
          userId,
          category.code,
          title,
          description || null,
          JSON.stringify(documentMetadata),
        ]
      );

      documentRecord = result.rows[0];

      console.log('✅ Company document metadata created:', {
        documentId: documentRecord.id,
        userId,
        category: category.code,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Document metadata created successfully',
      document: {
        ...documentRecord,
        category,
        metadata: documentMetadata,
      },
    });
  } catch (error) {
    console.error('Document metadata creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create document metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
