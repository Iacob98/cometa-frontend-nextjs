import { supabase, generateSecureFileName, validateFile } from './supabase'
import type {
  FileUploadOptions,
  FileUploadResult,
  FileUploadError,
  BatchUploadResult,
  UploadedFile,
  FileValidationResult,
  FileMetadata,
} from '@/types/upload'

/**
 * Upload a single file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: FileUploadOptions
): Promise<FileUploadResult> {
  try {
    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      }
    }

    // Generate secure filename
    const fileName = options.fileName || generateSecureFileName(file.name)
    const filePath = options.folder ? `${options.folder}/${fileName}` : fileName

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(options.bucketName)
      .upload(filePath, file, {
        cacheControl: options.cacheControl || '3600',
        contentType: options.contentType || file.type,
        upsert: options.upsert || false,
        metadata: options.metadata,
      })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(options.bucketName)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Upload multiple files in batch
 */
export async function uploadMultipleFiles(
  files: File[],
  options: FileUploadOptions
): Promise<BatchUploadResult> {
  const results: BatchUploadResult = {
    successful: [],
    failed: [],
    totalFiles: files.length,
    successCount: 0,
    failureCount: 0,
  }

  // Process files concurrently (limit to avoid rate limiting)
  const CONCURRENT_UPLOADS = 3
  const batches = []

  for (let i = 0; i < files.length; i += CONCURRENT_UPLOADS) {
    batches.push(files.slice(i, i + CONCURRENT_UPLOADS))
  }

  for (const batch of batches) {
    const promises = batch.map(async (file) => {
      const result = await uploadFile(file, options)

      if (result.success) {
        const uploadedFile: UploadedFile = {
          id: crypto.randomUUID(),
          name: file.name,
          originalName: file.name,
          size: file.size,
          type: file.type,
          url: result.url!,
          path: result.path!,
          bucketName: options.bucketName,
          uploadedAt: new Date().toISOString(),
          metadata: options.metadata,
        }

        results.successful.push(uploadedFile)
        results.successCount++
      } else {
        results.failed.push({
          file,
          error: {
            code: 'UPLOAD_FAILED',
            message: result.error || 'Upload failed',
          },
        })
        results.failureCount++
      }
    })

    await Promise.all(promises)
  }

  return results
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucketName: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath])

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Get signed URL for secure file access
 */
export async function getSignedUrl(
  bucketName: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<{ url?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      return { error: error.message }
    }

    return { url: data.signedUrl }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * List files in a bucket folder
 */
export async function listFiles(
  bucketName: string,
  folder?: string,
  limit: number = 100,
  offset: number = 0
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folder, {
        limit,
        offset,
      })

    if (error) {
      return { files: [], error: error.message }
    }

    return { files: data || [], error: null }
  } catch (error) {
    return {
      files: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Get file information
 */
export async function getFileInfo(
  bucketName: string,
  filePath: string
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(filePath.split('/').slice(0, -1).join('/') || undefined, {
        search: filePath.split('/').pop(),
      })

    if (error) {
      return { info: null, error: error.message }
    }

    const fileInfo = data?.find(
      (item) => item.name === filePath.split('/').pop()
    )

    return { info: fileInfo || null, error: null }
  } catch (error) {
    return {
      info: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Create a presigned upload URL
 */
export async function createPresignedUploadUrl(
  bucketName: string,
  filePath: string
): Promise<{ token?: string; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(filePath)

    if (error) {
      return { error: error.message }
    }

    return { token: data.token }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Upload to a presigned URL
 */
export async function uploadToSignedUrl(
  bucketName: string,
  filePath: string,
  token: string,
  file: File
): Promise<FileUploadResult> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .uploadToSignedUrl(filePath, token, file)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path)

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Save file metadata to database (you'll need to implement the database table)
 */
export async function saveFileMetadata(metadata: Omit<FileMetadata, 'id' | 'uploaded_at' | 'updated_at'>) {
  // This would typically save to your PostgreSQL database
  // You'll need to create a files table and implement this function
  console.log('Saving file metadata:', metadata)

  // Placeholder implementation - replace with actual database call
  return {
    success: true,
    id: crypto.randomUUID(),
  }
}

/**
 * Validate multiple files
 */
export function validateFiles(files: File[]): FileValidationResult {
  const errors: string[] = []

  if (files.length === 0) {
    errors.push('No files selected')
    return { isValid: false, errors }
  }

  // Check batch size limit
  if (files.length > 5) {
    errors.push('Maximum 5 files allowed per batch')
  }

  // Validate each file
  files.forEach((file, index) => {
    const validation = validateFile(file)
    if (!validation.isValid) {
      errors.push(`File ${index + 1} (${file.name}): ${validation.errors.join(', ')}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}