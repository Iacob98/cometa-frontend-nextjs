import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

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
    const url = new URL(request.url);
    const download = url.searchParams.get('download') === 'true';

    if (!id) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Get project plan from database
    const { data: plan, error } = await supabase
      .from('project_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase project plan query error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project plan not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch project plan' },
        { status: 500 }
      );
    }

    if (!plan.file_url) {
      return NextResponse.json(
        { error: 'File URL not found' },
        { status: 404 }
      );
    }

    // Fetch the file from Supabase Storage
    const fileResponse = await fetch(plan.file_url);

    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: 'File not found in storage' },
        { status: 404 }
      );
    }

    const fileBuffer = await fileResponse.arrayBuffer();

    // Determine content type based on file extension
    const extension = plan.filename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';

    switch (extension) {
      case 'pdf':
        contentType = 'application/pdf';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'dwg':
        contentType = 'application/dwg';
        break;
      case 'dxf':
        contentType = 'application/dxf';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    const headers: HeadersInit = {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.byteLength.toString(),
    };

    // If download parameter is true, force download
    if (download) {
      headers['Content-Disposition'] = `attachment; filename="${plan.filename}"`;
    } else {
      // For inline viewing (especially PDFs)
      headers['Content-Disposition'] = `inline; filename="${plan.filename}"`;
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Project plan download error:", error);
    return NextResponse.json(
      { error: "Failed to download project plan" },
      { status: 500 }
    );
  }
}