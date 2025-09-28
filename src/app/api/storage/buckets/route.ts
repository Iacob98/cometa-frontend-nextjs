import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    console.log('Listing Supabase storage buckets...');

    // List all buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Error listing buckets:', error);
      return NextResponse.json(
        { error: 'Failed to list buckets', details: error },
        { status: 500 }
      );
    }

    console.log('Available buckets:', buckets);

    return NextResponse.json({
      success: true,
      buckets: buckets || [],
      project_documents_exists: buckets?.some(b => b.name === 'project-documents') || false
    });
  } catch (error) {
    console.error('Storage buckets API error:', error);
    return NextResponse.json(
      { error: 'Failed to check storage buckets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { bucket_name, is_public = true } = await request.json();

    if (!bucket_name) {
      return NextResponse.json(
        { error: 'Bucket name is required' },
        { status: 400 }
      );
    }

    console.log(`Creating bucket: ${bucket_name}, public: ${is_public}`);

    // Create bucket
    const { data, error } = await supabase.storage.createBucket(bucket_name, {
      public: is_public,
      allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/dwg', 'application/dxf'
      ],
      fileSizeLimit: 52428800 // 50MB
    });

    if (error) {
      console.error('Error creating bucket:', error);
      return NextResponse.json(
        { error: 'Failed to create bucket', details: error },
        { status: 500 }
      );
    }

    console.log('Bucket created successfully:', data);

    return NextResponse.json({
      success: true,
      message: `Bucket "${bucket_name}" created successfully`,
      bucket: data
    }, { status: 201 });
  } catch (error) {
    console.error('Storage bucket creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create storage bucket' },
      { status: 500 }
    );
  }
}