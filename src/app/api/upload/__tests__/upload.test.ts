import { describe, it, expect, beforeAll, vi } from 'vitest'
import { POST, GET, DELETE } from '../route'
import { NextRequest } from 'next/server'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        list: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/test-bucket/test-file.jpg' }
        })
      })
    }
  }
}))

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn().mockReturnValue('test-uuid-123')
})

describe('File Upload API', () => {
  describe('POST /api/upload', () => {
    it('should return error when no metadata is provided', async () => {
      const formData = new FormData()
      formData.append('file0', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Missing upload metadata')
    })

    it('should return error when no files are provided', async () => {
      const formData = new FormData()
      const metadata = {
        bucketName: 'project-photos',
        projectId: '123e4567-e89b-12d3-a456-426614174000'
      }
      formData.append('metadata', JSON.stringify(metadata))

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('No files provided')
    })

    it('should return error for invalid bucket name', async () => {
      const formData = new FormData()
      const metadata = {
        bucketName: 'invalid-bucket',
        projectId: '123e4567-e89b-12d3-a456-426614174000'
      }
      formData.append('metadata', JSON.stringify(metadata))
      formData.append('file0', new File(['test'], 'test.jpg', { type: 'image/jpeg' }))

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Invalid upload metadata')
    })

    it('should return error for files exceeding size limit', async () => {
      const formData = new FormData()
      const metadata = {
        bucketName: 'project-photos',
        projectId: '123e4567-e89b-12d3-a456-426614174000'
      }
      formData.append('metadata', JSON.stringify(metadata))

      // Create a file larger than 10MB (project-photos limit)
      const largeFileBuffer = new ArrayBuffer(11 * 1024 * 1024) // 11MB
      const largeFile = new File([largeFileBuffer], 'large.jpg', { type: 'image/jpeg' })
      formData.append('file0', largeFile)

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('File validation failed')
      expect(result.details).toContain('File size exceeds 10MB limit')
    })

    it('should return error for invalid file type', async () => {
      const formData = new FormData()
      const metadata = {
        bucketName: 'project-photos',
        projectId: '123e4567-e89b-12d3-a456-426614174000'
      }
      formData.append('metadata', JSON.stringify(metadata))

      // Create a file with invalid type for project-photos
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      formData.append('file0', invalidFile)

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('File validation failed')
      expect(result.details).toContain('File type text/plain is not allowed')
    })

    it('should return error when exceeding maximum files per batch', async () => {
      const formData = new FormData()
      const metadata = {
        bucketName: 'project-photos',
        projectId: '123e4567-e89b-12d3-a456-426614174000'
      }
      formData.append('metadata', JSON.stringify(metadata))

      // Add 6 files (exceeds limit of 5)
      for (let i = 0; i < 6; i++) {
        formData.append(`file${i}`, new File(['test'], `test${i}.jpg`, { type: 'image/jpeg' }))
      }

      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Maximum 5 files per upload batch')
    })
  })

  describe('GET /api/upload', () => {
    it('should return error for invalid bucket name', async () => {
      const request = new NextRequest('http://localhost:3000/api/upload?bucketName=invalid-bucket')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Invalid bucket name')
    })

    it('should list files in valid bucket', async () => {
      const mockFiles = [
        {
          id: 'file1',
          name: 'test1.jpg',
          metadata: { size: 1024, mimetype: 'image/jpeg' },
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]

      // Mock Supabase storage list method
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.storage.from).mockReturnValue({
        list: vi.fn().mockResolvedValue({
          data: mockFiles,
          error: null
        }),
        upload: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/test.jpg' }
        })
      } as any)

      const request = new NextRequest('http://localhost:3000/api/upload?bucketName=project-photos')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.bucketName).toBe('project-photos')
      expect(result.files).toHaveLength(1)
      expect(result.files[0].name).toBe('test1.jpg')
    })
  })

  describe('DELETE /api/upload', () => {
    it('should return error for invalid bucket name', async () => {
      const request = new NextRequest('http://localhost:3000/api/upload?bucketName=invalid-bucket&path=test.jpg')

      const response = await DELETE(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Invalid bucket name')
    })

    it('should return error when path is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/upload?bucketName=project-photos')

      const response = await DELETE(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('File path is required')
    })

    it('should successfully delete file', async () => {
      // Mock Supabase storage remove method
      const { supabase } = await import('@/lib/supabase')
      vi.mocked(supabase.storage.from).mockReturnValue({
        remove: vi.fn().mockResolvedValue({
          data: null,
          error: null
        }),
        upload: vi.fn(),
        list: vi.fn(),
        getPublicUrl: vi.fn()
      } as any)

      const request = new NextRequest('http://localhost:3000/api/upload?bucketName=project-photos&path=test.jpg')

      const response = await DELETE(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.message).toContain('File deleted successfully')
    })
  })
})