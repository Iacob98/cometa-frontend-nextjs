export interface FileUploadConfig {
  bucketName: string
  maxFileSize: number
  maxFiles: number
  allowedTypes: string[]
  allowedExtensions?: string[]
}

export interface FileUploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface FileUploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface UploadedFile {
  id: string
  name: string
  originalName: string
  size: number
  type: string
  url: string
  path: string
  bucketName: string
  uploadedAt: string
  uploadedBy?: string
  metadata?: Record<string, any>
}

export interface FileValidationResult {
  isValid: boolean
  errors: string[]
}

export type FileCategory =
  | 'project-photo'
  | 'work-photo'
  | 'project-document'
  | 'house-document'
  | 'user-avatar'
  | 'report'
  | 'plan'

export type StorageBucket =
  | 'project-photos'
  | 'work-photos'
  | 'project-documents'
  | 'house-documents'
  | 'user-avatars'
  | 'reports'

export interface FileUploadOptions {
  bucketName: StorageBucket
  folder?: string
  fileName?: string
  metadata?: Record<string, any>
  cacheControl?: string
  contentType?: string
  upsert?: boolean
}

export interface FileUploadError {
  code: string
  message: string
  details?: any
}

export interface BatchUploadResult {
  successful: UploadedFile[]
  failed: Array<{
    file: File
    error: FileUploadError
  }>
  totalFiles: number
  successCount: number
  failureCount: number
}

export interface FileUploadHookOptions {
  bucketName: StorageBucket
  folder?: string
  maxFiles?: number
  maxFileSize?: number
  allowedTypes?: string[]
  onProgress?: (progress: FileUploadProgress) => void
  onSuccess?: (result: FileUploadResult) => void
  onError?: (error: FileUploadError) => void
}

export interface FileUploadState {
  isUploading: boolean
  progress: FileUploadProgress
  uploadedFiles: UploadedFile[]
  error: FileUploadError | null
}

// Drag and drop types
export interface DragAndDropState {
  isDragOver: boolean
  isDragActive: boolean
  files: File[]
}

// File preview types
export interface FilePreview {
  file: File
  preview?: string
  isImage: boolean
  isDocument: boolean
}

// File metadata for database storage
export interface FileMetadata {
  id: string
  project_id?: string
  user_id?: string
  category: FileCategory
  original_name: string
  file_name: string
  file_size: number
  mime_type: string
  bucket_name: StorageBucket
  storage_path: string
  public_url?: string
  metadata: Record<string, any>
  uploaded_at: string
  updated_at: string
}