import { createClient } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { BUCKET_CONFIGS } from './supabase-buckets'
import type { StorageBucket } from '@/types/upload'

// Admin client with service_role key for bucket creation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

interface SetupResult {
  success: boolean
  message: string
  buckets: {
    name: string
    exists: boolean
    created: boolean
    error?: string
  }[]
}

/**
 * Set up all required Supabase storage buckets
 * This function will create buckets that don't exist and report on their status
 */
export async function setupStorageBuckets(): Promise<SetupResult> {
  const results: SetupResult = {
    success: true,
    message: '',
    buckets: [],
  }

  try {
    // First, list existing buckets
    const { success: listSuccess, buckets: existingBuckets, error: listError } = await listBuckets()

    if (!listSuccess) {
      throw new Error(`Failed to list buckets: ${listError}`)
    }

    const existingBucketNames = existingBuckets?.map(b => b.name) || []
    console.log('Existing buckets:', existingBucketNames)

    // Check each required bucket
    const requiredBuckets = Object.keys(BUCKET_CONFIGS) as StorageBucket[]

    for (const bucketName of requiredBuckets) {
      const bucketExists = existingBucketNames.includes(bucketName)
      const bucketResult = {
        name: bucketName,
        exists: bucketExists,
        created: false,
        error: undefined as string | undefined,
      }

      if (!bucketExists) {
        // Create the bucket
        console.log(`Creating bucket: ${bucketName}`)
        const createResult = await createBucket(bucketName)

        if (createResult.success) {
          bucketResult.created = true
          console.log(`✅ Created bucket: ${bucketName}`)
        } else {
          bucketResult.error = createResult.error
          results.success = false
          console.error(`❌ Failed to create bucket ${bucketName}:`, createResult.error)
        }
      } else {
        console.log(`✅ Bucket already exists: ${bucketName}`)
      }

      results.buckets.push(bucketResult)
    }

    // Generate summary message
    const createdCount = results.buckets.filter(b => b.created).length
    const existingCount = results.buckets.filter(b => b.exists && !b.created).length
    const failedCount = results.buckets.filter(b => b.error).length

    results.message = `Setup complete: ${createdCount} created, ${existingCount} already existed, ${failedCount} failed`

    return results
  } catch (error) {
    results.success = false
    results.message = `Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    return results
  }
}

/**
 * Test bucket access and permissions
 * This function tests basic read/write operations on each bucket
 */
export async function testBucketAccess(): Promise<{
  success: boolean
  message: string
  tests: Array<{
    bucket: string
    operation: string
    success: boolean
    error?: string
  }>
}> {
  const testResults = {
    success: true,
    message: '',
    tests: [] as Array<{
      bucket: string
      operation: string
      success: boolean
      error?: string
    }>,
  }

  const requiredBuckets = Object.keys(BUCKET_CONFIGS) as StorageBucket[]

  for (const bucketName of requiredBuckets) {
    // Test list operation
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1 })

      const testResult = {
        bucket: bucketName,
        operation: 'list',
        success: !error,
        error: error?.message,
      }

      testResults.tests.push(testResult)

      if (error) {
        testResults.success = false
        console.error(`❌ List test failed for ${bucketName}:`, error.message)
      } else {
        console.log(`✅ List test passed for ${bucketName}`)
      }
    } catch (error) {
      testResults.tests.push({
        bucket: bucketName,
        operation: 'list',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      testResults.success = false
    }
  }

  const passedTests = testResults.tests.filter(t => t.success).length
  const totalTests = testResults.tests.length
  testResults.message = `${passedTests}/${totalTests} tests passed`

  return testResults
}

/**
 * Verify bucket configuration matches expected settings
 */
export async function verifyBucketConfiguration(): Promise<{
  success: boolean
  message: string
  buckets: Array<{
    name: string
    isCorrect: boolean
    issues: string[]
  }>
}> {
  const verificationResults = {
    success: true,
    message: '',
    buckets: [] as Array<{
      name: string
      isCorrect: boolean
      issues: string[]
    }>,
  }

  try {
    const { success: listSuccess, buckets: existingBuckets, error: listError } = await listBuckets()

    if (!listSuccess) {
      throw new Error(`Failed to list buckets: ${listError}`)
    }

    const requiredBuckets = Object.keys(BUCKET_CONFIGS) as StorageBucket[]

    for (const bucketName of requiredBuckets) {
      const bucket = existingBuckets?.find(b => b.name === bucketName)
      const expectedConfig = BUCKET_CONFIGS[bucketName]
      const issues: string[] = []

      if (!bucket) {
        issues.push('Bucket does not exist')
      } else {
        // Check public setting
        if (bucket.public !== expectedConfig.public) {
          issues.push(`Public setting mismatch: expected ${expectedConfig.public}, got ${bucket.public}`)
        }

        // Check file size limit
        if (bucket.file_size_limit !== expectedConfig.fileSizeLimit) {
          issues.push(`File size limit mismatch: expected ${expectedConfig.fileSizeLimit}, got ${bucket.file_size_limit}`)
        }

        // Check allowed MIME types (if available)
        if (bucket.allowed_mime_types) {
          const expectedTypes = expectedConfig.allowedMimeTypes.sort()
          const actualTypes = bucket.allowed_mime_types.sort()

          if (JSON.stringify(expectedTypes) !== JSON.stringify(actualTypes)) {
            issues.push('MIME types mismatch')
          }
        }
      }

      const bucketVerification = {
        name: bucketName,
        isCorrect: issues.length === 0,
        issues,
      }

      verificationResults.buckets.push(bucketVerification)

      if (issues.length > 0) {
        verificationResults.success = false
        console.error(`❌ Configuration issues for ${bucketName}:`, issues)
      } else {
        console.log(`✅ Configuration correct for ${bucketName}`)
      }
    }

    const correctBuckets = verificationResults.buckets.filter(b => b.isCorrect).length
    const totalBuckets = verificationResults.buckets.length
    verificationResults.message = `${correctBuckets}/${totalBuckets} buckets configured correctly`

    return verificationResults
  } catch (error) {
    verificationResults.success = false
    verificationResults.message = `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    return verificationResults
  }
}

/**
 * Full setup and verification workflow
 */
export async function initializeStorageSystem(): Promise<{
  success: boolean
  message: string
  setup: SetupResult
  access: Awaited<ReturnType<typeof testBucketAccess>>
  verification: Awaited<ReturnType<typeof verifyBucketConfiguration>>
}> {
  console.log('🚀 Starting Supabase Storage System initialization...')

  // Step 1: Setup buckets
  console.log('📦 Setting up storage buckets...')
  const setup = await setupStorageBuckets()

  // Step 2: Test access
  console.log('🔍 Testing bucket access...')
  const access = await testBucketAccess()

  // Step 3: Verify configuration
  console.log('✅ Verifying bucket configuration...')
  const verification = await verifyBucketConfiguration()

  const allSuccess = setup.success && access.success && verification.success

  const result = {
    success: allSuccess,
    message: allSuccess
      ? '✅ Storage system initialized successfully'
      : '❌ Storage system initialization completed with issues',
    setup,
    access,
    verification,
  }

  console.log(`🏁 Initialization complete: ${result.message}`)
  return result
}