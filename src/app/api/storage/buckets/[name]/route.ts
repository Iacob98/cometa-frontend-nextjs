import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name: bucketName } = await params;
    const { public: isPublic } = await request.json();

    console.log(`Updating bucket ${bucketName} to public: ${isPublic}`);

    // Update bucket to be public
    const { data, error } = await supabase.storage.updateBucket(bucketName, {
      public: isPublic
    });

    if (error) {
      console.error('Error updating bucket:', error);
      return NextResponse.json(
        { error: 'Failed to update bucket', details: error },
        { status: 500 }
      );
    }

    console.log('Bucket updated successfully:', data);

    return NextResponse.json({
      success: true,
      message: `Bucket "${bucketName}" updated successfully`,
      bucket: data
    });
  } catch (error) {
    console.error('Bucket update error:', error);
    return NextResponse.json(
      { error: 'Failed to update bucket' },
      { status: 500 }
    );
  }
}