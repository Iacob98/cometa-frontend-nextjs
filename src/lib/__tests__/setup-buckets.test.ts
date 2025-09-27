import { describe, it, expect, beforeAll } from 'vitest'
import { initializeStorageSystem, setupStorageBuckets, testBucketAccess, verifyBucketConfiguration } from '../setup-buckets'
import { BUCKET_CONFIGS } from '../supabase-buckets'

// Note: These tests require valid Supabase credentials in environment variables
// Run with: npm run test src/lib/__tests__/setup-buckets.test.ts

describe('Supabase Storage Setup', () => {
  describe('setupStorageBuckets', () => {
    it('should setup all required buckets', async () => {
      const result = await setupStorageBuckets()

      expect(result).toBeDefined()
      expect(result.buckets).toHaveLength(6) // We have 6 buckets configured
      expect(result.message).toContain('Setup complete')

      // Check that all required buckets are present
      const requiredBuckets = Object.keys(BUCKET_CONFIGS)
      const resultBucketNames = result.buckets.map(b => b.name)

      requiredBuckets.forEach(bucketName => {
        expect(resultBucketNames).toContain(bucketName)
      })
    }, 30000) // 30 second timeout for network operations
  })

  describe('testBucketAccess', () => {
    it('should test access to all buckets', async () => {
      const result = await testBucketAccess()

      expect(result).toBeDefined()
      expect(result.tests).toHaveLength(6)
      expect(result.message).toContain('tests passed')

      // Each test should have required properties
      result.tests.forEach(test => {
        expect(test).toHaveProperty('bucket')
        expect(test).toHaveProperty('operation')
        expect(test).toHaveProperty('success')
        expect(typeof test.success).toBe('boolean')
      })
    }, 30000)
  })

  describe('verifyBucketConfiguration', () => {
    it('should verify bucket configurations', async () => {
      const result = await verifyBucketConfiguration()

      expect(result).toBeDefined()
      expect(result.buckets).toHaveLength(6)
      expect(result.message).toContain('buckets configured')

      // Each bucket verification should have required properties
      result.buckets.forEach(bucket => {
        expect(bucket).toHaveProperty('name')
        expect(bucket).toHaveProperty('isCorrect')
        expect(bucket).toHaveProperty('issues')
        expect(Array.isArray(bucket.issues)).toBe(true)
      })
    }, 30000)
  })

  describe('initializeStorageSystem', () => {
    it('should run full initialization workflow', async () => {
      const result = await initializeStorageSystem()

      expect(result).toBeDefined()
      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('message')
      expect(result).toHaveProperty('setup')
      expect(result).toHaveProperty('access')
      expect(result).toHaveProperty('verification')

      // Setup results
      expect(result.setup.buckets).toHaveLength(6)
      expect(Array.isArray(result.setup.buckets)).toBe(true)

      // Access test results
      expect(result.access.tests).toHaveLength(6)
      expect(Array.isArray(result.access.tests)).toBe(true)

      // Verification results
      expect(result.verification.buckets).toHaveLength(6)
      expect(Array.isArray(result.verification.buckets)).toBe(true)

      console.log('Full initialization result:', result)
    }, 60000) // 1 minute timeout for full workflow
  })
})

// Manual test runner - uncomment to run individual tests
// (async () => {
//   console.log('Running manual bucket setup test...')
//   const result = await initializeStorageSystem()
//   console.log('Result:', JSON.stringify(result, null, 2))
// })()