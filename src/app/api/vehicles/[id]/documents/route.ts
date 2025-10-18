/**
 * API Route: /api/vehicles/[id]/documents
 * Handles listing and uploading vehicle documents
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadVehicleDocument } from '@/lib/vehicle-document-storage';

// Service role client for bypassing RLS
const supabaseService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ==============================================================================
// GET: List all documents for a vehicle
// ==============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    // Fetch documents from database
    const { data: documents, error } = await supabaseService
      .from('vehicle_documents')
      .select(`
        id,
        vehicle_id,
        document_type,
        file_name,
        file_path,
        file_size,
        file_type,
        document_number,
        issuing_authority,
        issue_date,
        expiry_date,
        notes,
        is_verified,
        uploaded_by,
        created_at,
        updated_at
      `)
      .eq('vehicle_id', vehicleId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching vehicle documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vehicle documents' },
        { status: 500 }
      );
    }

    // Calculate expiry status for each document
    const documentsWithStatus = documents.map(doc => ({
      ...doc,
      expiry_status: calculateExpiryStatus(doc.expiry_date),
    }));

    console.log('✅ Vehicle documents fetched:', {
      vehicleId,
      count: documents.length,
    });

    return NextResponse.json({
      documents: documentsWithStatus,
      total: documents.length,
    });
  } catch (error) {
    console.error('❌ GET documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ==============================================================================
// POST: Upload new vehicle document(s)
// ==============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: vehicleId } = await params;

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();

    // Extract document metadata
    const documentType = formData.get('document_type') as string;
    const documentNumber = formData.get('document_number') as string | null;
    const issuingAuthority = formData.get('issuing_authority') as string | null;
    const issueDate = formData.get('issue_date') as string | null;
    const expiryDate = formData.get('expiry_date') as string | null;
    const notes = formData.get('notes') as string | null;
    const uploadedBy = formData.get('uploaded_by') as string | null;

    // Validate required fields
    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
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

    // Get uploaded file(s)
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'At least one file is required' },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    for (const file of files) {
      if (file.size > maxFileSize) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds maximum size of 50MB` },
          { status: 400 }
        );
      }

      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `File ${file.name} has invalid type. Only PDF and images are allowed.` },
          { status: 400 }
        );
      }
    }

    // Upload files and create database records
    const uploadedDocuments = [];

    for (const file of files) {
      try {
        // Upload file to Supabase storage
        const uploadResult = await uploadVehicleDocument({
          vehicleId,
          documentType: documentType as any,
          file,
        });

        // Create database record
        const { data: document, error: dbError } = await supabaseService
          .from('vehicle_documents')
          .insert({
            vehicle_id: vehicleId,
            document_type: documentType,
            file_name: file.name,
            file_path: uploadResult.path,
            file_size: file.size,
            file_type: file.type,
            document_number: documentNumber,
            issuing_authority: issuingAuthority,
            issue_date: issueDate,
            expiry_date: expiryDate,
            notes,
            uploaded_by: uploadedBy,
          })
          .select()
          .single();

        if (dbError) {
          console.error('❌ Database insert error:', dbError);
          throw new Error(`Failed to save document metadata: ${dbError.message}`);
        }

        uploadedDocuments.push({
          ...document,
          expiry_status: calculateExpiryStatus(document.expiry_date),
        });

        console.log('✅ Document uploaded:', {
          vehicleId,
          fileName: file.name,
          documentType,
        });
      } catch (uploadError) {
        console.error('❌ Upload failed for file:', file.name, uploadError);
        // Continue with other files
      }
    }

    if (uploadedDocuments.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload any documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedDocuments.length} document(s)`,
      documents: uploadedDocuments,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ POST documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ==============================================================================
// Helper Functions
// ==============================================================================

/**
 * Calculate expiry status for a document
 * Returns: 'active', 'expiring_soon', 'expired', or null
 */
function calculateExpiryStatus(expiryDate: string | null): string | null {
  if (!expiryDate) {
    return null;
  }

  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.floor(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry < 0) {
    return 'expired'; // Document has expired
  } else if (daysUntilExpiry <= 30) {
    return 'expiring_soon'; // Expires in 30 days or less
  } else if (daysUntilExpiry <= 60) {
    return 'expiring_warning'; // Expires in 60 days or less
  } else {
    return 'active'; // Document is valid
  }
}
