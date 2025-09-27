import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateFileForBucket, generateFolderPath } from '@/lib/supabase-buckets'
import { generateSecureFileName } from '@/lib/supabase'
import { z } from 'zod'

// Validation schema for project photo uploads
const projectPhotoMetadataSchema = z.object({
  projectId: z.string().uuid(),
  category: z.enum(['before', 'progress', 'after', 'issues', 'materials', 'equipment']).optional().default('progress'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
  workEntryId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
})

/**
 * POST /api/upload/project-photos
 * Upload photos for project documentation
 */
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData()

    // Get metadata from form data
    const metadataJson = formData.get('metadata') as string
    if (!metadataJson) {
      return NextResponse.json(
        { error: 'Missing project photo metadata' },
        { status: 400 }
      )
    }

    let metadata
    try {
      metadata = projectPhotoMetadataSchema.parse(JSON.parse(metadataJson))
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid project photo metadata', details: error },
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
        { error: 'No photo files provided' },
        { status: 400 }
      )
    }

    // Validate all files are images
    const validationErrors: string[] = []
    for (const file of files) {
      const validation = validateFileForBucket(file, 'project-photos')
      if (!validation.isValid) {
        validationErrors.push(`${file.name}: ${validation.errors.join(', ')}`)
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Photo validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // TODO: Check if user has access to this project
    // This should check project membership, role permissions, etc.

    // Generate folder path for project photos
    const folderPath = generateFolderPath('project-photos', {
      projectId: metadata.projectId,
      category: metadata.category,
    })

    // Upload files
    const uploadResults = []
    const uploadErrors = []

    for (const file of files) {
      try {
        // Generate secure file name with project context
        const secureFileName = generateSecureFileName(file.name, metadata.userId)
        const filePath = `${folderPath}${secureFileName}`

        // Create file metadata for database storage
        const fileMetadata = {
          projectId: metadata.projectId,
          category: metadata.category,
          description: metadata.description,
          tags: metadata.tags,
          location: metadata.location,
          workEntryId: metadata.workEntryId,
          uploadedBy: metadata.userId,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        }

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('project-photos')
          .upload(filePath, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false,
            metadata: fileMetadata,
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
          .from('project-photos')
          .getPublicUrl(data.path)

        // Create upload result
        const uploadResult = {
          id: crypto.randomUUID(),
          fileName: secureFileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl,
          path: data.path,
          bucketName: 'project-photos',
          uploadedAt: new Date().toISOString(),
          metadata: fileMetadata,
        }

        uploadResults.push(uploadResult)

        // TODO: Save file metadata to database for querying and relationships
        // This should store file info in a files table linked to projects

        console.log(`✅ Project photo uploaded: ${file.name} -> ${data.path}`)
      } catch (error) {
        console.error(`❌ Error uploading project photo ${file.name}:`, error)
        uploadErrors.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Return results
    const response = {
      success: uploadResults.length > 0,
      message: `${uploadResults.length} project photo(s) uploaded successfully`,
      photos: uploadResults,
      errors: uploadErrors,
      totalFiles: files.length,
      successCount: uploadResults.length,
      errorCount: uploadErrors.length,
      projectId: metadata.projectId,
      category: metadata.category,
    }

    const statusCode = uploadResults.length === files.length ? 200 : 207

    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    console.error('Project photo upload API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during project photo upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload/project-photos?projectId=<id>&category=<category>
 * List project photos with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Build path for listing
    let path = `projects/${projectId}/`
    if (category) {
      path += `${category}/`
    }

    // List files in the specified path
    const { data, error } = await supabase.storage
      .from('project-photos')
      .list(path, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to list project photos', details: error.message },
        { status: 500 }
      )
    }

    // Transform file data and generate URLs
    const photos = []
    for (const file of data || []) {
      if (file.id && !file.name.endsWith('/')) {
        const filePath = `${path}${file.name}`

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('project-photos')
          .getPublicUrl(filePath)

        photos.push({
          id: file.id,
          name: file.name,
          size: file.metadata?.size || 0,
          type: file.metadata?.mimetype || 'image/jpeg',
          lastModified: file.updated_at || file.created_at,
          path: filePath,
          url: urlData.publicUrl,
          metadata: file.metadata || {},
        })
      }
    }

    return NextResponse.json({
      projectId,
      category,
      photos,
      total: photos.length,
      path,
    })
  } catch (error) {
    console.error('Project photos listing API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during project photos listing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}