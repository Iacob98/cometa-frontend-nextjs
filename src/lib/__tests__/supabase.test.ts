import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock environment variables for testing
vi.mock('../../lib/supabase', async () => {
  const actual = await vi.importActual('../../lib/supabase') as any
  return {
    ...actual,
    supabase: {
      storage: {
        from: () => ({
          upload: vi.fn(),
          getPublicUrl: vi.fn(),
        })
      }
    }
  }
})

import { validateFile, generateSecureFileName, getFileCategoryFromBucket, FILE_UPLOAD_CONFIG, STORAGE_BUCKETS } from '../supabase'

describe('Supabase Configuration', () => {
  describe('validateFile', () => {
    it('should validate file size correctly', () => {
      // Create a mock file that exceeds size limit
      const largeFile = new File([''], 'large-file.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })

      // Mock file size to be larger than limit
      Object.defineProperty(largeFile, 'size', {
        value: FILE_UPLOAD_CONFIG.MAX_FILE_SIZE + 1,
        writable: false,
      })

      const result = validateFile(largeFile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File size must be less than 10MB')
    })

    it('should validate file type correctly', () => {
      const invalidFile = new File([''], 'document.exe', {
        type: 'application/x-executable',
        lastModified: Date.now(),
      })

      Object.defineProperty(invalidFile, 'size', {
        value: 1024, // Small file size
        writable: false,
      })

      const result = validateFile(invalidFile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('File type application/x-executable is not allowed')
    })

    it('should pass validation for valid files', () => {
      const validFile = new File(['test content'], 'image.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now(),
      })

      Object.defineProperty(validFile, 'size', {
        value: 1024, // 1KB
        writable: false,
      })

      const result = validateFile(validFile)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('generateSecureFileName', () => {
    it('should generate secure file name with timestamp and random string', () => {
      const originalName = 'My Document.pdf'
      const result = generateSecureFileName(originalName)

      expect(result).toMatch(/^my-document_\d+_[a-z0-9]+\.pdf$/)
    })

    it('should include user ID when provided', () => {
      const originalName = 'image.jpg'
      const userId = 'user123'
      const result = generateSecureFileName(originalName, userId)

      expect(result).toMatch(/^user123_image_\d+_[a-z0-9]+\.jpg$/)
    })

    it('should handle files without extension', () => {
      const originalName = 'README'
      const result = generateSecureFileName(originalName)

      expect(result).toMatch(/^readme_\d+_[a-z0-9]+\.undefined$/)
    })
  })

  describe('getFileCategoryFromBucket', () => {
    it('should return correct category for each bucket', () => {
      expect(getFileCategoryFromBucket(STORAGE_BUCKETS.PROJECT_PHOTOS)).toBe('project-photo')
      expect(getFileCategoryFromBucket(STORAGE_BUCKETS.WORK_PHOTOS)).toBe('work-photo')
      expect(getFileCategoryFromBucket(STORAGE_BUCKETS.PROJECT_DOCUMENTS)).toBe('project-document')
      expect(getFileCategoryFromBucket(STORAGE_BUCKETS.HOUSE_DOCUMENTS)).toBe('house-document')
      expect(getFileCategoryFromBucket(STORAGE_BUCKETS.USER_AVATARS)).toBe('user-avatar')
      expect(getFileCategoryFromBucket(STORAGE_BUCKETS.REPORTS)).toBe('report')
    })

    it('should return "unknown" for invalid bucket', () => {
      expect(getFileCategoryFromBucket('invalid-bucket')).toBe('unknown')
    })
  })

  describe('FILE_UPLOAD_CONFIG', () => {
    it('should have correct configuration values', () => {
      expect(FILE_UPLOAD_CONFIG.MAX_FILE_SIZE).toBe(10 * 1024 * 1024) // 10MB
      expect(FILE_UPLOAD_CONFIG.MAX_FILES_PER_BATCH).toBe(5)
    })

    it('should have all required file types', () => {
      const allTypes = FILE_UPLOAD_CONFIG.getAllowedTypes()

      expect(allTypes).toContain('image/jpeg')
      expect(allTypes).toContain('image/png')
      expect(allTypes).toContain('application/pdf')
      expect(allTypes).toContain('application/msword')
    })
  })

  describe('STORAGE_BUCKETS', () => {
    it('should have all required bucket names', () => {
      expect(STORAGE_BUCKETS.PROJECT_PHOTOS).toBe('project-photos')
      expect(STORAGE_BUCKETS.WORK_PHOTOS).toBe('work-photos')
      expect(STORAGE_BUCKETS.PROJECT_DOCUMENTS).toBe('project-documents')
      expect(STORAGE_BUCKETS.HOUSE_DOCUMENTS).toBe('house-documents')
      expect(STORAGE_BUCKETS.USER_AVATARS).toBe('user-avatars')
      expect(STORAGE_BUCKETS.REPORTS).toBe('reports')
    })
  })
})