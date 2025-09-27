import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Storage bucket names from environment
export const STORAGE_BUCKETS = {
  PROJECT_PHOTOS: process.env.SUPABASE_PROJECT_PHOTOS_BUCKET || 'project-photos',
  WORK_PHOTOS: process.env.SUPABASE_WORK_PHOTOS_BUCKET || 'work-photos',
  PROJECT_DOCUMENTS: process.env.SUPABASE_PROJECT_DOCUMENTS_BUCKET || 'project-documents',
  HOUSE_DOCUMENTS: process.env.SUPABASE_HOUSE_DOCUMENTS_BUCKET || 'house-documents',
  USER_AVATARS: process.env.SUPABASE_USER_AVATARS_BUCKET || 'user-avatars',
  REPORTS: process.env.SUPABASE_REPORTS_BUCKET || 'reports',
} as const

// File upload configuration
export const FILE_UPLOAD_CONFIG = {
  // Maximum file size: 10MB
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  // Maximum files per batch upload
  MAX_FILES_PER_BATCH: 5,

  // Allowed file types
  ALLOWED_FILE_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    PLANS: ['application/pdf', 'application/dwg', 'application/dxf'],
  },

  // Get all allowed MIME types
  getAllowedTypes: () => [
    ...FILE_UPLOAD_CONFIG.ALLOWED_FILE_TYPES.IMAGES,
    ...FILE_UPLOAD_CONFIG.ALLOWED_FILE_TYPES.DOCUMENTS,
    ...FILE_UPLOAD_CONFIG.ALLOWED_FILE_TYPES.SPREADSHEETS,
    ...FILE_UPLOAD_CONFIG.ALLOWED_FILE_TYPES.PLANS,
  ],
} as const

// File validation utilities
export const validateFile = (file: File) => {
  const errors: string[] = []

  // Check file size
  if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    errors.push(`File size must be less than ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`)
  }

  // Check file type
  const allowedTypes = FILE_UPLOAD_CONFIG.getAllowedTypes()
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Generate secure file name
export const generateSecureFileName = (originalFileName: string, userId?: string) => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExtension = originalFileName.split('.').pop()
  const baseName = originalFileName.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')

  const prefix = userId ? `${userId}_` : ''
  return `${prefix}${baseName}_${timestamp}_${randomString}.${fileExtension}`
}

// Get file category based on bucket
export const getFileCategoryFromBucket = (bucketName: string) => {
  const bucketMap = {
    [STORAGE_BUCKETS.PROJECT_PHOTOS]: 'project-photo',
    [STORAGE_BUCKETS.WORK_PHOTOS]: 'work-photo',
    [STORAGE_BUCKETS.PROJECT_DOCUMENTS]: 'project-document',
    [STORAGE_BUCKETS.HOUSE_DOCUMENTS]: 'house-document',
    [STORAGE_BUCKETS.USER_AVATARS]: 'user-avatar',
    [STORAGE_BUCKETS.REPORTS]: 'report',
  } as const

  return bucketMap[bucketName as keyof typeof bucketMap] || 'unknown'
}