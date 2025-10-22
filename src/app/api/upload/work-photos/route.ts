import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateFileForBucket, generateFolderPath } from '@/lib/supabase-buckets'
import { generateSecureFileName } from '@/lib/supabase'
import { z } from 'zod'

// Validation schema for work photo uploads
const workPhotoMetadataSchema = z.object({
  workEntryId: z.string().uuid(),
  stage: z.enum(['before', 'during', 'after', 'quality_check', 'issue']).optional().default('after'),
  description: z.string().optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
    segmentId: z.string().uuid().optional(),
    cutId: z.string().uuid().optional(),
  }).optional(),
  userId: z.string().uuid().optional(),
  issueType: z.enum(['safety', 'quality', 'materials', 'equipment', 'weather', 'other']).optional(),
  tags: z.array(z.string()).optional(),
})

/**
 * POST /api/upload/work-photos
 * Upload photos for work entry documentation
 */
export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData()

    // Get metadata from form data
    const metadataJson = formData.get('metadata') as string
    if (!metadataJson) {
      return NextResponse.json(
        { error: 'Missing work photo metadata' },
        { status: 400 }
      )
    }

    let metadata
    try {
      metadata = workPhotoMetadataSchema.parse(JSON.parse(metadataJson))
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid work photo metadata', details: error },
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
      const validation = validateFileForBucket(file, 'work-photos')
      if (!validation.isValid) {
        validationErrors.push(`${file.name}: ${validation.errors.join(', ')}`)
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Work photo validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // TODO: Check if user has access to this work entry
    // This should verify the user created the work entry or has appropriate permissions

    // Generate folder path for work photos
    const folderPath = generateFolderPath('work-photos', {
      workEntryId: metadata.workEntryId,
    })

    // Upload files
    const uploadResults = []
    const uploadErrors = []

    for (const file of files) {
      try {
        // Generate secure file name with work context
        const secureFileName = generateSecureFileName(file.name, metadata.userId)
        const filePath = `${folderPath}${secureFileName}`

        // Create file metadata for database storage
        const fileMetadata = {
          workEntryId: metadata.workEntryId,
          stage: metadata.stage,
          description: metadata.description,
          qualityRating: metadata.qualityRating,
          location: metadata.location,
          issueType: metadata.issueType,
          tags: metadata.tags,
          uploadedBy: metadata.userId,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          timestamp: new Date().toISOString(),
        }

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('work-photos')
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
          .from('work-photos')
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
          bucketName: 'work-photos',
          uploadedAt: new Date().toISOString(),
          metadata: fileMetadata,
        }

        uploadResults.push(uploadResult)

        // Save photo metadata to database
        const photoId = uploadResult.id

        // Map stage to label for database
        let label = 'during'
        if (metadata.stage === 'before') label = 'before'
        else if (metadata.stage === 'after') label = 'after'
        else if (metadata.stage === 'issue') label = 'during'
        else if (metadata.stage === 'quality_check') label = 'during'

        const photoData = {
          id: photoId,
          work_entry_id: metadata.workEntryId,
          url: data.path,
          file_path: data.path,
          ts: new Date().toISOString(),
          gps_lat: metadata.location?.latitude,
          gps_lon: metadata.location?.longitude,
          label: label,
          author_user_id: metadata.userId,
          photo_type: metadata.stage === 'issue' ? 'issue' : metadata.stage || 'general',
          is_before_photo: metadata.stage === 'before',
          is_after_photo: metadata.stage === 'after',
          caption: metadata.description,
          taken_at: new Date().toISOString(),
          taken_by: metadata.userId,
        }

        const { error: dbError } = await supabase
          .from('photos')
          .insert(photoData)

        if (dbError) {
          console.error('⚠️ Failed to save photo metadata to database for ' + file.name + ':', dbError)
          // Don't fail entire upload, just log error
          // Add error info to uploadResult
          (uploadResult as any).dbSaveError = dbError.message
        } else {
          console.log('✅ Photo saved to database: ' + photoId)
          // Mark as successfully saved to DB
          (uploadResult as any).savedToDatabase = true
        }

        console.log(`✅ Work photo uploaded: ${file.name} -> ${data.path}`)
      } catch (error) {
        console.error(`❌ Error uploading work photo ${file.name}:`, error)
        uploadErrors.push({
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Return results
    const response = {
      success: uploadResults.length > 0,
      message: `${uploadResults.length} work photo(s) uploaded successfully`,
      photos: uploadResults,
      errors: uploadErrors,
      totalFiles: files.length,
      successCount: uploadResults.length,
      errorCount: uploadErrors.length,
      workEntryId: metadata.workEntryId,
      stage: metadata.stage,
    }

    const statusCode = uploadResults.length === files.length ? 200 : 207

    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    console.error('Work photo upload API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during work photo upload',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload/work-photos?workEntryId=<id>&stage=<stage>
 * List work photos with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workEntryId = searchParams.get('workEntryId')
    const stage = searchParams.get('stage')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!workEntryId) {
      return NextResponse.json(
        { error: 'Work Entry ID is required' },
        { status: 400 }
      )
    }

    // Build path for listing
    const path = `work-entries/${workEntryId}/`

    // List files in the specified path
    const { data, error } = await supabase.storage
      .from('work-photos')
      .list(path, {
        limit,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to list work photos', details: error.message },
        { status: 500 }
      )
    }

    // Transform file data and generate URLs, filter by stage if specified
    const photos = []
    for (const file of data || []) {
      if (file.id && !file.name.endsWith('/')) {
        const filePath = `${path}${file.name}`

        // Filter by stage if specified (check metadata)
        if (stage && file.metadata?.stage !== stage) {
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('work-photos')
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
          stage: file.metadata?.stage || 'unknown',
        })
      }
    }

    return NextResponse.json({
      workEntryId,
      stage: stage || 'all',
      photos,
      total: photos.length,
      path,
    })
  } catch (error) {
    console.error('Work photos listing API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error during work photos listing',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}