import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'house-documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: house_id } = await params;

    if (!house_id) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      );
    }

    // Fetch documents linked to this house
    const { data: houseDocuments, error } = await supabase
      .from('house_documents')
      .select(`
        id,
        house_id,
        document_id,
        document_type,
        created_at,
        document:documents(
          id,
          filename,
          original_filename,
          file_type,
          file_size,
          document_type,
          description,
          upload_date,
          uploaded_by,
          is_active
        )
      `)
      .eq('house_id', house_id)
      .eq('documents.is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching house documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch house documents' },
        { status: 500 }
      );
    }

    // Transform data to include download URLs
    const documentsWithUrls = await Promise.all(
      (houseDocuments || []).map(async (hd: any) => {
        if (!hd.document) return null;

        const { data: signedUrl } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(hd.document.filename, 3600); // 1 hour expiry

        return {
          id: hd.id,
          document_id: hd.document_id,
          house_id: hd.house_id,
          document_type: hd.document_type,
          filename: hd.document.original_filename || hd.document.filename,
          file_type: hd.document.file_type,
          file_size: hd.document.file_size,
          description: hd.document.description,
          upload_date: hd.document.upload_date,
          uploaded_by: hd.document.uploaded_by,
          download_url: signedUrl?.signedUrl || null,
          created_at: hd.created_at
        };
      })
    );

    const validDocuments = documentsWithUrls.filter(doc => doc !== null);

    return NextResponse.json({
      items: validDocuments,
      total: validDocuments.length
    });
  } catch (error) {
    console.error('House documents API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: house_id } = await params;

    if (!house_id) {
      return NextResponse.json(
        { error: 'House ID is required' },
        { status: 400 }
      );
    }

    // Verify house exists
    const { data: house, error: houseError } = await supabase
      .from('houses')
      .select('id, project_id')
      .eq('id', house_id)
      .single();

    if (houseError || !house) {
      return NextResponse.json(
        { error: 'House not found' },
        { status: 404 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const document_type = (formData.get('document_type') as string) || 'connection_plan';
    const description = (formData.get('description') as string) || null;
    const uploaded_by = formData.get('uploaded_by') as string || null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (accept common document types)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed. Please upload PDF, image, or Office document.` },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const filename = `${house_id}/${timestamp}-${file.name}`;

    // Upload file to Supabase storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log('File uploaded successfully:', uploadData.path);

    // Create document record
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert([{
        project_id: house.project_id,
        filename: uploadData.path,
        original_filename: file.name,
        file_type: file.type,
        file_size: file.size,
        document_type: document_type,
        description: description,
        uploaded_by: uploaded_by,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (documentError) {
      console.error('Document creation error:', documentError);
      // Clean up uploaded file
      await supabase.storage.from(BUCKET_NAME).remove([uploadData.path]);
      return NextResponse.json(
        { error: `Failed to create document record: ${documentError.message}` },
        { status: 500 }
      );
    }

    console.log('Document record created:', document.id);

    // Link document to house
    const { data: houseDocument, error: linkError } = await supabase
      .from('house_documents')
      .insert([{
        house_id: house_id,
        document_id: document.id,
        document_type: document_type,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (linkError) {
      console.error('House-document link error:', linkError);
      // Clean up document and file
      await supabase.from('documents').delete().eq('id', document.id);
      await supabase.storage.from(BUCKET_NAME).remove([uploadData.path]);
      return NextResponse.json(
        { error: `Failed to link document to house: ${linkError.message}` },
        { status: 500 }
      );
    }

    console.log('Document linked to house:', houseDocument.id);

    // Generate download URL
    const { data: signedUrl } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(uploadData.path, 3600);

    return NextResponse.json({
      id: houseDocument.id,
      document_id: document.id,
      house_id: house_id,
      document_type: document_type,
      filename: file.name,
      file_type: file.type,
      file_size: file.size,
      description: description,
      upload_date: document.upload_date,
      uploaded_by: uploaded_by,
      download_url: signedUrl?.signedUrl || null,
      created_at: houseDocument.created_at
    }, { status: 201 });

  } catch (error) {
    console.error('Upload house document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
