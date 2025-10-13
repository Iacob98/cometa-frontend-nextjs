import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cabinetId } = await params;

    if (!cabinetId) {
      return NextResponse.json(
        { error: "Cabinet ID is required" },
        { status: 400 }
      );
    }

    // Check if cabinet exists
    const { data: cabinet, error: cabinetError } = await supabase
      .from('cabinets')
      .select('id, project_id, code, name')
      .eq('id', cabinetId)
      .single();

    if (cabinetError || !cabinet) {
      return NextResponse.json(
        { error: 'Cabinet not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const installationType = formData.get('installation_type') as string || 'connection_plan';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/dwg', 'application/dxf',
      'image/bmp', 'image/tiff'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Allowed types: images, PDF, Word, Excel, DWG, DXF',
          allowedTypes
        },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 50MB' },
        { status: 400 }
      );
    }

    console.log('Uploading cabinet file to Supabase Storage:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cabinetId,
      installationType
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .toLowerCase();
    const uniqueFileName = `${sanitizedName.replace(`.${fileExtension}`, '')}_${timestamp}_${randomSuffix}.${fileExtension}`;

    // Upload to Supabase Storage
    const filePath = `projects/${cabinet.project_id}/cabinets/${cabinetId}/${installationType}/${uniqueFileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-documents')
      .getPublicUrl(filePath);

    console.log('File uploaded successfully:', {
      success: true,
      url: publicUrl,
      path: filePath
    });

    // For now, we'll store file info in cabinet notes or use simple storage
    // Future enhancement: create cabinet_installation_files table
    console.log('File uploaded successfully, metadata not stored in database yet');

    const response = {
      success: true,
      message: `Installation file uploaded successfully for cabinet ${cabinet.code}`,
      file: {
        cabinet_id: cabinetId,
        installation_type: installationType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        file_type: file.type,
        uploaded_at: new Date().toISOString()
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Cabinet file upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cabinetId } = await params;
    const { searchParams } = new URL(request.url);
    const installationType = searchParams.get('installation_type') || 'connection_plan';

    if (!cabinetId) {
      return NextResponse.json(
        { error: "Cabinet ID is required" },
        { status: 400 }
      );
    }

    // Check if cabinet exists
    const { data: cabinet, error: cabinetError } = await supabase
      .from('cabinets')
      .select('id, project_id, code, name')
      .eq('id', cabinetId)
      .single();

    if (cabinetError || !cabinet) {
      return NextResponse.json(
        { error: 'Cabinet not found' },
        { status: 404 }
      );
    }

    // List files from storage
    const folderPath = `projects/${cabinet.project_id}/cabinets/${cabinetId}/${installationType}/`;
    const { data: files, error: listError } = await supabase.storage
      .from('project-documents')
      .list(folderPath);

    if (listError) {
      console.error('Storage list error:', listError);
      return NextResponse.json(
        { error: 'Failed to list files' },
        { status: 500 }
      );
    }

    // Transform file list to include URLs
    const fileList = (files || []).map(file => {
      const filePath = `${folderPath}${file.name}`;
      const { data: { publicUrl } } = supabase.storage
        .from('project-documents')
        .getPublicUrl(filePath);

      return {
        cabinet_id: cabinetId,
        installation_type: installationType,
        file_name: file.name,
        file_path: filePath, // Added for deletion functionality
        file_url: publicUrl,
        file_size: file.metadata?.size || 0,
        file_type: file.metadata?.mimetype || 'application/octet-stream',
        uploaded_at: file.created_at
      };
    });

    return NextResponse.json(fileList);
  } catch (error) {
    console.error("Cabinet files fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cabinetId } = await params;
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file_path');

    if (!cabinetId) {
      return NextResponse.json(
        { error: "Cabinet ID is required" },
        { status: 400 }
      );
    }

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    // Verify cabinet exists
    const { data: cabinet, error: cabinetError } = await supabase
      .from('cabinets')
      .select('id, project_id, code')
      .eq('id', cabinetId)
      .single();

    if (cabinetError || !cabinet) {
      return NextResponse.json(
        { error: 'Cabinet not found' },
        { status: 404 }
      );
    }

    // Verify file path belongs to this cabinet's project
    const expectedPathPrefix = `projects/${cabinet.project_id}/cabinets/${cabinetId}/`;
    if (!filePath.startsWith(expectedPathPrefix)) {
      return NextResponse.json(
        { error: 'Invalid file path for this cabinet' },
        { status: 403 }
      );
    }

    console.log('Attempting to delete file:', {
      filePath,
      cabinetId,
      cabinetCode: cabinet.code
    });

    // Delete file from Supabase Storage
    const { data: deleteData, error: deleteError } = await supabase.storage
      .from('project-documents')
      .remove([filePath]);

    if (deleteError) {
      console.error('Supabase storage deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete file from storage' },
        { status: 500 }
      );
    }

    console.log('File deleted successfully:', filePath);

    return NextResponse.json({
      success: true,
      message: `Installation file deleted successfully from cabinet ${cabinet.code}`,
      deleted_file: filePath
    });

  } catch (error) {
    console.error("Cabinet file deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}