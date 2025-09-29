import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { uploadFile } from '@/lib/upload-utils';
import { generateFolderPath } from '@/lib/supabase-buckets';

// Service role client for bypassing RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get("project_id");

    if (!project_id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Get project plans from database
    const { data: plans, error } = await supabase
      .from('project_plans')
      .select(`
        id,
        title,
        description,
        plan_type,
        filename,
        file_size,
        file_url,
        file_path,
        uploaded_at
      `)
      .eq('project_id', project_id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Supabase project plans query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project plans' },
        { status: 500 }
      );
    }

    return NextResponse.json(plans || []);
  } catch (error) {
    console.error("Plans API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle both JSON and FormData requests
    const contentType = request.headers.get('content-type') || '';
    let project_id, title, description, plan_type, filename, file_size, file_url, file_path;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with file upload
      const formData = await request.formData();

      project_id = formData.get('project_id') as string;
      title = formData.get('title') as string;
      description = formData.get('description') as string;
      plan_type = formData.get('plan_type') as string;

      const file = formData.get('file') as File;

      if (!project_id || !title || !plan_type || !file) {
        return NextResponse.json(
          { error: "Project ID, title, plan type, and file are required" },
          { status: 400 }
        );
      }

      // Upload file to Supabase Storage
      console.log('Uploading file to Supabase Storage:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        projectId: project_id,
        planType: plan_type
      });

      // Generate folder path for project documents
      const folderPath = `projects/${project_id}/plans`;

      const uploadResult = await uploadFile(file, {
        bucketName: 'project-documents',
        folder: folderPath,
        metadata: {
          project_id,
          plan_type,
          title,
          description: description || '',
          uploaded_by: 'system', // You might want to get this from auth
          upload_source: 'project_preparation'
        }
      }, supabase); // Pass the service role client

      if (!uploadResult.success) {
        console.error('File upload failed:', uploadResult.error);
        return NextResponse.json(
          { error: `File upload failed: ${uploadResult.error}` },
          { status: 500 }
        );
      }

      console.log('File uploaded successfully:', uploadResult);

      // Set file info from upload result
      filename = file.name;
      file_size = file.size;
      file_url = uploadResult.url!;
      file_path = uploadResult.path!;

    } else {
      // Handle JSON requests
      const body = await request.json();
      ({ project_id, title, description, plan_type, filename, file_size, file_url, file_path } = body);

      if (!project_id || !title || !plan_type || !filename) {
        return NextResponse.json(
          { error: "Project ID, title, plan type, and filename are required" },
          { status: 400 }
        );
      }
    }

    // Create project plan in database
    const { data: plan, error } = await supabase
      .from('project_plans')
      .insert({
        project_id,
        title,
        description,
        plan_type,
        filename,
        file_size: file_size || 0,
        file_url: file_url || '',
        file_path: file_path || ''
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase project plan creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create project plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      plan_id: plan.id,
      message: "Project plan created successfully",
      plan
    }, { status: 201 });
  } catch (error) {
    console.error("Plans POST error:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}