import { supabase } from './supabase'
import type { StorageBucket } from '@/types/upload'

/**
 * Configuration for each Supabase Storage bucket
 */
export const BUCKET_CONFIGS = {
  'project-photos': {
    name: 'project-photos',
    public: false,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    description: 'Project construction photos and progress images',
    folderStructure: 'projects/{project_id}/{category}/{date}/',
    examplePath: 'projects/abc123/before/2024-01-15/',
  },
  'work-photos': {
    name: 'work-photos',
    public: false,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    description: 'Work entry photos showing completed work',
    folderStructure: 'work-entries/{work_entry_id}/{timestamp}/',
    examplePath: 'work-entries/we456/2024-01-15T10:30:00Z/',
  },
  'project-documents': {
    name: 'project-documents',
    public: false,
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/dwg',
      'application/dxf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
    ],
    fileSizeLimit: 50 * 1024 * 1024, // 50MB for documents
    description: 'Project documents, plans, and technical files',
    folderStructure: 'projects/{project_id}/{document_type}/',
    examplePath: 'projects/abc123/plans/',
  },
  'house-documents': {
    name: 'house-documents',
    public: false,
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ],
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    description: 'House-specific documents and certificates',
    folderStructure: 'houses/{project_id}/{house_id}/',
    examplePath: 'houses/abc123/house_001/',
  },
  'user-avatars': {
    name: 'user-avatars',
    public: true, // Avatars can be public
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 2 * 1024 * 1024, // 2MB for avatars
    description: 'User profile pictures and avatars',
    folderStructure: 'users/{user_id}/',
    examplePath: 'users/user789/',
  },
  'reports': {
    name: 'reports',
    public: false,
    allowedMimeTypes: [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ],
    fileSizeLimit: 25 * 1024 * 1024, // 25MB for reports
    description: 'Generated reports and analytics files',
    folderStructure: 'reports/{report_type}/{date}/',
    examplePath: 'reports/financial/2024-01-15/',
  },
} as const

/**
 * RLS Policies SQL for each bucket
 */
export const RLS_POLICIES = {
  'project-photos': `
    -- Enable RLS on storage.objects
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Policy for project photos: Users can access photos from projects they are assigned to
    CREATE POLICY "project_photos_select_policy" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'project-photos' AND
      (
        -- Allow if user is project manager
        (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]) = auth.uid()::text OR
        -- Allow if user is assigned to project crew
        EXISTS (
          SELECT 1 FROM crew_members cm
          JOIN crews c ON cm.crew_id = c.id
          WHERE c.project_id = (storage.foldername(name))[2]::uuid
          AND cm.user_id = auth.uid()
        ) OR
        -- Allow admins
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
      )
    );

    CREATE POLICY "project_photos_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'project-photos' AND
      (
        -- Same permissions as select
        (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]) = auth.uid()::text OR
        EXISTS (
          SELECT 1 FROM crew_members cm
          JOIN crews c ON cm.crew_id = c.id
          WHERE c.project_id = (storage.foldername(name))[2]::uuid
          AND cm.user_id = auth.uid()
        ) OR
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
      )
    );

    CREATE POLICY "project_photos_update_policy" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'project-photos' AND
      (
        (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]) = auth.uid()::text OR
        (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
      )
    );

    CREATE POLICY "project_photos_delete_policy" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'project-photos' AND
      (
        (SELECT pm_user_id FROM projects WHERE id = (storage.foldername(name))[2]) = auth.uid()::text OR
        (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
      )
    );
  `,

  'work-photos': `
    -- Policy for work photos: Users can access photos from work entries they created or are assigned to
    CREATE POLICY "work_photos_select_policy" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'work-photos' AND
      (
        -- Allow if user created the work entry
        (SELECT user_id FROM work_entries WHERE id = (storage.foldername(name))[2]) = auth.uid() OR
        -- Allow if user is project manager or foreman
        (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm', 'foreman') OR
        -- Allow if user is in the same project
        EXISTS (
          SELECT 1 FROM work_entries we
          JOIN crew_members cm ON we.crew_id = cm.crew_id
          WHERE we.id = (storage.foldername(name))[2]::uuid
          AND cm.user_id = auth.uid()
        )
      )
    );

    CREATE POLICY "work_photos_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'work-photos' AND
      (
        -- Allow if user created the work entry
        (SELECT user_id FROM work_entries WHERE id = (storage.foldername(name))[2]) = auth.uid() OR
        (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm', 'foreman', 'crew')
      )
    );
  `,

  'user-avatars': `
    -- Policy for user avatars: Users can only access their own avatars
    CREATE POLICY "user_avatars_select_policy" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'user-avatars' AND
      (
        -- Allow users to access their own avatars
        (storage.foldername(name))[1] = auth.uid()::text OR
        -- Allow admins to access all avatars
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
      )
    );

    CREATE POLICY "user_avatars_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'user-avatars' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );

    CREATE POLICY "user_avatars_update_policy" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'user-avatars' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );

    CREATE POLICY "user_avatars_delete_policy" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'user-avatars' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  `,

  'reports': `
    -- Policy for reports: Only admins and PMs can access reports
    CREATE POLICY "reports_select_policy" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'reports' AND
      (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
    );

    CREATE POLICY "reports_insert_policy" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'reports' AND
      (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
    );

    CREATE POLICY "reports_update_policy" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'reports' AND
      (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'pm')
    );

    CREATE POLICY "reports_delete_policy" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'reports' AND
      (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );
  `,
}

/**
 * Create a storage bucket with configuration
 */
export async function createBucket(
  bucketName: StorageBucket,
  config?: {
    public?: boolean
    fileSizeLimit?: number
    allowedMimeTypes?: string[]
  }
) {
  try {
    const bucketConfig = BUCKET_CONFIGS[bucketName]

    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: config?.public ?? bucketConfig.public,
      fileSizeLimit: config?.fileSizeLimit ?? bucketConfig.fileSizeLimit,
      allowedMimeTypes: config?.allowedMimeTypes ?? bucketConfig.allowedMimeTypes,
    })

    if (error) {
      // Bucket might already exist
      if (error.message.includes('already exists')) {
        console.log(`Bucket ${bucketName} already exists`)
        return { success: true, message: 'Bucket already exists' }
      }
      return { success: false, error: error.message }
    }

    return { success: true, data, message: `Bucket ${bucketName} created successfully` }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * List all buckets
 */
export async function listBuckets() {
  try {
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, buckets: data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get bucket configuration
 */
export function getBucketConfig(bucketName: StorageBucket) {
  return BUCKET_CONFIGS[bucketName]
}

/**
 * Validate file against bucket configuration
 */
export function validateFileForBucket(file: File, bucketName: StorageBucket) {
  const config = BUCKET_CONFIGS[bucketName]
  const errors: string[] = []

  // Check file size
  if (file.size > config.fileSizeLimit) {
    errors.push(`File size exceeds ${config.fileSizeLimit / (1024 * 1024)}MB limit for ${bucketName}`)
  }

  // Check MIME type
  if (!config.allowedMimeTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed for ${bucketName}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    config,
  }
}

/**
 * Generate folder path for a bucket
 */
export function generateFolderPath(
  bucketName: StorageBucket,
  context: {
    projectId?: string
    userId?: string
    workEntryId?: string
    houseId?: string
    reportType?: string
    category?: string
    date?: string
  }
): string {
  const config = BUCKET_CONFIGS[bucketName]
  let path = config.folderStructure

  // Replace placeholders with actual values
  if (context.projectId) {
    path = path.replace('{project_id}', context.projectId)
  }
  if (context.userId) {
    path = path.replace('{user_id}', context.userId)
  }
  if (context.workEntryId) {
    path = path.replace('{work_entry_id}', context.workEntryId)
  }
  if (context.houseId) {
    path = path.replace('{house_id}', context.houseId)
  }
  if (context.reportType) {
    path = path.replace('{report_type}', context.reportType)
  }
  if (context.category) {
    path = path.replace('{category}', context.category)
  }
  if (context.date) {
    path = path.replace('{date}', context.date)
  } else {
    // Default to current date
    const currentDate = new Date().toISOString().split('T')[0]
    path = path.replace('{date}', currentDate)
    path = path.replace('{timestamp}', new Date().toISOString())
  }

  return path
}