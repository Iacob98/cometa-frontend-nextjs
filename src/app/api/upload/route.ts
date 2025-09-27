import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateFileForBucket, generateFolderPath, BUCKET_CONFIGS } from '@/lib/supabase-buckets'
import { generateSecureFileName } from '@/lib/supabase'
import type { StorageBucket } from '@/types/upload'
import { z } from 'zod'

// Validation schema for upload metadata
const uploadMetadataSchema = z.object({
  bucketName: z.enum(['project-photos', 'work-photos', 'project-documents', 'house-documents', 'user-avatars', 'reports']),
  projectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  workEntryId: z.string().uuid().optional(),
  houseId: z.string().uuid().optional(),
  reportType: z.string().optional(),
  category: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

interface FileUploadResult {
  id: string
  fileName: string
  originalName: string
  size: number
  type: string
  url: string
  path: string
  bucketName: string
  uploadedAt: string
  metadata?: Record<string, any>
}

/**
 * POST /api/upload
 * Upload files to Supabase Storage with validation and organization
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔥 Upload API called')

    // Parse multipart form data
    const formData = await request.formData()
    console.log('📋 FormData keys:', Array.from(formData.keys()))

    // Get metadata from form data
    const metadataJson = formData.get('metadata') as string
    console.log('📦 Metadata JSON:', metadataJson)

    if (!metadataJson) {
      console.log('❌ Missing metadata')
      return NextResponse.json(
        { error: 'Missing upload metadata' },
        { status: 400 }
      )
    }

    let uploadMetadata
    try {
      const parsedMetadata = JSON.parse(metadataJson)
      console.log('🔍 Parsed metadata:', parsedMetadata)
      uploadMetadata = uploadMetadataSchema.parse(parsedMetadata)
      console.log('✅ Metadata validation passed:', uploadMetadata)
    } catch (error) {
      console.log('❌ Metadata validation failed:', error)
      return NextResponse.json(
        { error: 'Invalid upload metadata', details: error },
        { status: 400 }
      )
    }

    // Get files from form data
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        files.push(value)
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const bucketName = uploadMetadata.bucketName as StorageBucket
    const bucketConfig = BUCKET_CONFIGS[bucketName]

    // Check maximum files per batch
    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 files per upload batch' },
        { status: 400 }
      )
    }

    // Validate all files before uploading
    const validationErrors: string[] = []
    for (const file of files) {
      const validation = validateFileForBucket(file, bucketName)
      if (!validation.isValid) {
        validationErrors.push(`${file.name}: ${validation.errors.join(', ')}`)
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'File validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Generate folder path
    const folderPath = generateFolderPath(bucketName, {
      projectId: uploadMetadata.projectId,
      userId: uploadMetadata.userId,
      workEntryId: uploadMetadata.workEntryId,
      houseId: uploadMetadata.houseId,
      reportType: uploadMetadata.reportType,
      category: uploadMetadata.category,
    })

    // Upload files
    const uploadResults: FileUploadResult[] = []
    const uploadErrors: Array<{ fileName: string; error: string }> = []

    for (const file of files) {
      try {
        // Generate secure file name
        const secureFileName = generateSecureFileName(file.name, uploadMetadata.userId)
        const filePath = `${folderPath}${secureFileName}`

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
          })

        if (error) {
          uploadErrors.push({
            fileName: file.name,
            error: error.message,
          })
          continue
        }

        // Get public URL for the uploaded file
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(data.path)

        // Create upload result
        const uploadResult: FileUploadResult = {
          id: crypto.randomUUID(),
          fileName: secureFileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          path: data.path,
          bucketName,
          uploadedAt: new Date().toISOString(),
          metadata: uploadMetadata.metadata,
        }

        uploadResults.push(uploadResult)

        console.log(`✅ File uploaded successfully: ${file.name} -> ${data.path}`)
      } catch (error) {
        console.error(`❌ Error uploading file ${file.name}:`, error)
        uploadErrors.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Return results
    const response = {
      success: uploadResults.length > 0,
      message: `${uploadResults.length} file(s) uploaded successfully`,
      files: uploadResults,
      errors: uploadErrors,
      totalFiles: files.length,
      successCount: uploadResults.length,
      errorCount: uploadErrors.length,
    }

    const statusCode = uploadResults.length === files.length ? 200 : 207 // 207 Multi-Status for partial success

    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    console.error('File upload API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during file upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload?bucketName=<bucket>&path=<path>
 * Get file information or list files in a bucket
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bucketName = searchParams.get('bucketName') as StorageBucket
    const path = searchParams.get('path') || ''
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!bucketName || !BUCKET_CONFIGS[bucketName]) {
      return NextResponse.json(
        { error: 'Invalid bucket name' },
        { status: 400 }
      )
    }

    // List files in the specified bucket and path
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(path, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to list files', details: error.message },
        { status: 500 }
      )
    }

    // Transform file data
    const files = data?.map(file => ({
      id: file.id,
      name: file.name,
      size: file.metadata?.size || 0,
      type: file.metadata?.mimetype || 'unknown',
      lastModified: file.updated_at || file.created_at,
      path: `${path}${file.name}`,
      isFolder: file.id === null, // Folders have null id
    })) || []

    return NextResponse.json({
      bucketName,
      path,
      files,
      total: files.length,
    })
  } catch (error) {
    console.error('File listing API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during file listing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload?bucketName=<bucket>&path=<path>
 * Delete a file from Supabase Storage
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bucketName = searchParams.get('bucketName') as StorageBucket
    const path = searchParams.get('path')

    if (!bucketName || !BUCKET_CONFIGS[bucketName]) {
      return NextResponse.json(
        { error: 'Invalid bucket name' },
        { status: 400 }
      )
    }

    if (!path) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      )
    }

    // Delete the file
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([path])

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete file', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `File deleted successfully: ${path}`,
      bucketName,
      path,
    })
  } catch (error) {
    console.error('File deletion API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during file deletion',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}