import { describe, it, expect } from 'vitest'
import {
  BUCKET_CONFIGS,
  getBucketConfig,
  validateFileForBucket,
  generateFolderPath
} from '../supabase-buckets'
import type { StorageBucket } from '@/types/upload'

describe('Supabase Buckets Configuration', () => {
  describe('BUCKET_CONFIGS', () => {
    it('should have all required buckets', () => {
      const expectedBuckets: StorageBucket[] = [
        'project-photos',
        'work-photos',
        'project-documents',
        'house-documents',
        'user-avatars',
        'reports'
      ]

      expectedBuckets.forEach(bucketName => {
        expect(BUCKET_CONFIGS[bucketName]).toBeDefined()
        expect(BUCKET_CONFIGS[bucketName].name).toBe(bucketName)
      })
    })

    it('should have correct configuration for project-photos', () => {
      const config = BUCKET_CONFIGS['project-photos']

      expect(config.public).toBe(false)
      expect(config.fileSizeLimit).toBe(10 * 1024 * 1024) // 10MB
      expect(config.allowedMimeTypes).toContain('image/jpeg')
      expect(config.allowedMimeTypes).toContain('image/png')
      expect(config.folderStructure).toBe('projects/{project_id}/{category}/{date}/')
    })

    it('should have correct configuration for work-photos', () => {
      const config = BUCKET_CONFIGS['work-photos']

      expect(config.public).toBe(false)
      expect(config.fileSizeLimit).toBe(10 * 1024 * 1024) // 10MB
      expect(config.folderStructure).toBe('work-entries/{work_entry_id}/{timestamp}/')
    })

    it('should have correct configuration for project-documents', () => {
      const config = BUCKET_CONFIGS['project-documents']

      expect(config.public).toBe(false)
      expect(config.fileSizeLimit).toBe(50 * 1024 * 1024) // 50MB
      expect(config.allowedMimeTypes).toContain('application/pdf')
      expect(config.allowedMimeTypes).toContain('application/dwg')
    })

    it('should have correct configuration for user-avatars', () => {
      const config = BUCKET_CONFIGS['user-avatars']

      expect(config.public).toBe(true) // Avatars are public
      expect(config.fileSizeLimit).toBe(2 * 1024 * 1024) // 2MB
      expect(config.folderStructure).toBe('users/{user_id}/')
    })

    it('should have correct configuration for reports', () => {
      const config = BUCKET_CONFIGS['reports']

      expect(config.public).toBe(false)
      expect(config.fileSizeLimit).toBe(25 * 1024 * 1024) // 25MB
      expect(config.allowedMimeTypes).toContain('text/csv')
      expect(config.allowedMimeTypes).toContain('application/pdf')
    })
  })

  describe('getBucketConfig', () => {
    it('should return correct config for each bucket', () => {
      const buckets: StorageBucket[] = [
        'project-photos',
        'work-photos',
        'project-documents',
        'house-documents',
        'user-avatars',
        'reports'
      ]

      buckets.forEach(bucketName => {
        const config = getBucketConfig(bucketName)
        expect(config.name).toBe(bucketName)
        expect(config).toHaveProperty('allowedMimeTypes')
        expect(config).toHaveProperty('fileSizeLimit')
        expect(config).toHaveProperty('folderStructure')
      })
    })
  })

  describe('validateFileForBucket', () => {
    it('should validate file size correctly', () => {
      const largeFile = new File([''], 'large-file.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })

      // Mock file size to be larger than project-photos limit (10MB)
      Object.defineProperty(largeFile, 'size', {
        value: 15 * 1024 * 1024, // 15MB
        writable: false,
      })

      const result = validateFileForBucket(largeFile, 'project-photos')
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('File size exceeds 10MB')
    })

    it('should validate MIME type correctly', () => {
      const invalidFile = new File([''], 'document.exe', {
        type: 'application/x-executable',
        lastModified: Date.now(),
      })

      Object.defineProperty(invalidFile, 'size', {
        value: 1024, // 1KB
        writable: false,
      })

      const result = validateFileForBucket(invalidFile, 'project-photos')
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toContain('File type application/x-executable is not allowed')
    })

    it('should pass validation for valid files', () => {
      const validFile = new File(['test'], 'image.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })

      Object.defineProperty(validFile, 'size', {
        value: 1024, // 1KB
        writable: false,
      })

      const result = validateFileForBucket(validFile, 'project-photos')
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate different buckets with different rules', () => {
      // PDF should be valid for project-documents but not project-photos
      const pdfFile = new File(['test'], 'document.pdf', {
        type: 'application/pdf',
        lastModified: Date.now(),
      })

      Object.defineProperty(pdfFile, 'size', {
        value: 1024, // 1KB
        writable: false,
      })

      const projectPhotosResult = validateFileForBucket(pdfFile, 'project-photos')
      expect(projectPhotosResult.isValid).toBe(false)

      const projectDocsResult = validateFileForBucket(pdfFile, 'project-documents')
      expect(projectDocsResult.isValid).toBe(true)
    })
  })

  describe('generateFolderPath', () => {
    it('should generate correct path for project-photos', () => {
      const path = generateFolderPath('project-photos', {
        projectId: 'project123',
        category: 'progress',
        date: '2024-01-15'
      })

      expect(path).toBe('projects/project123/progress/2024-01-15/')
    })

    it('should generate correct path for work-photos', () => {
      const timestamp = '2024-01-15T10:30:00Z'
      const path = generateFolderPath('work-photos', {
        workEntryId: 'we456',
        date: timestamp
      })

      expect(path).toBe('work-entries/we456/2024-01-15T10:30:00Z/')
    })

    it('should generate correct path for user-avatars', () => {
      const path = generateFolderPath('user-avatars', {
        userId: 'user789'
      })

      expect(path).toBe('users/user789/')
    })

    it('should generate correct path for reports', () => {
      const path = generateFolderPath('reports', {
        reportType: 'financial',
        date: '2024-01-15'
      })

      expect(path).toBe('reports/financial/2024-01-15/')
    })

    it('should use current date when date is not provided', () => {
      const currentDate = new Date().toISOString().split('T')[0]
      const path = generateFolderPath('project-photos', {
        projectId: 'project123',
        category: 'progress'
      })

      expect(path).toBe(`projects/project123/progress/${currentDate}/`)
    })

    it('should handle house-documents path generation', () => {
      const path = generateFolderPath('house-documents', {
        projectId: 'project123',
        houseId: 'house001'
      })

      expect(path).toBe('houses/project123/house001/')
    })
  })

  describe('File Size Limits', () => {
    it('should have appropriate size limits for each bucket type', () => {
      expect(BUCKET_CONFIGS['project-photos'].fileSizeLimit).toBe(10 * 1024 * 1024) // 10MB for images
      expect(BUCKET_CONFIGS['work-photos'].fileSizeLimit).toBe(10 * 1024 * 1024) // 10MB for images
      expect(BUCKET_CONFIGS['project-documents'].fileSizeLimit).toBe(50 * 1024 * 1024) // 50MB for documents
      expect(BUCKET_CONFIGS['house-documents'].fileSizeLimit).toBe(10 * 1024 * 1024) // 10MB
      expect(BUCKET_CONFIGS['user-avatars'].fileSizeLimit).toBe(2 * 1024 * 1024) // 2MB for avatars
      expect(BUCKET_CONFIGS['reports'].fileSizeLimit).toBe(25 * 1024 * 1024) // 25MB for reports
    })
  })

  describe('MIME Types', () => {
    it('should have correct MIME types for image buckets', () => {
      const imageBuckets: StorageBucket[] = ['project-photos', 'work-photos', 'user-avatars']

      imageBuckets.forEach(bucketName => {
        const config = BUCKET_CONFIGS[bucketName]
        expect(config.allowedMimeTypes).toContain('image/jpeg')
        expect(config.allowedMimeTypes).toContain('image/png')
      })
    })

    it('should have correct MIME types for document buckets', () => {
      const docBuckets: StorageBucket[] = ['project-documents', 'house-documents', 'reports']

      docBuckets.forEach(bucketName => {
        const config = BUCKET_CONFIGS[bucketName]
        expect(config.allowedMimeTypes).toContain('application/pdf')
      })
    })

    it('should have specialized MIME types for technical documents', () => {
      const config = BUCKET_CONFIGS['project-documents']
      expect(config.allowedMimeTypes).toContain('application/dwg')
      expect(config.allowedMimeTypes).toContain('application/dxf')
    })

    it('should have CSV support for reports', () => {
      const config = BUCKET_CONFIGS['reports']
      expect(config.allowedMimeTypes).toContain('text/csv')
    })
  })
})