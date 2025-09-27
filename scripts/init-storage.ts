#!/usr/bin/env tsx

/**
 * COMETA Storage Initialization Script
 *
 * This script initializes the Supabase storage buckets and tests their configuration.
 *
 * Usage:
 *   npm run init:storage
 *   or
 *   npx tsx scripts/init-storage.ts
 *
 * Prerequisites:
 *   - Valid Supabase credentials in .env.local
 *   - Supabase project with authentication enabled
 */

import 'dotenv/config'
import { initializeStorageSystem } from '../src/lib/setup-buckets'

async function main() {
  console.log('🚀 COMETA Storage Initialization')
  console.log('================================')
  console.log('')

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('')
    console.error('Please create a .env.local file with your Supabase credentials.')
    process.exit(1)
  }

  console.log('✅ Environment variables configured')
  console.log(`   - Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
  console.log('')

  try {
    // Run the full initialization
    const result = await initializeStorageSystem()

    console.log('')
    console.log('📊 INITIALIZATION RESULTS')
    console.log('=========================')
    console.log('')

    // Setup results
    console.log('🛠️  BUCKET SETUP:')
    console.log(`   Status: ${result.setup.success ? '✅ Success' : '❌ Failed'}`)
    console.log(`   Message: ${result.setup.message}`)
    result.setup.buckets.forEach(bucket => {
      const status = bucket.exists
        ? (bucket.created ? '🆕 Created' : '✅ Exists')
        : (bucket.error ? '❌ Failed' : '❓ Unknown')
      console.log(`   - ${bucket.name}: ${status}`)
      if (bucket.error) {
        console.log(`     Error: ${bucket.error}`)
      }
    })
    console.log('')

    // Access test results
    console.log('🔍 ACCESS TESTS:')
    console.log(`   Status: ${result.access.success ? '✅ Success' : '❌ Failed'}`)
    console.log(`   Message: ${result.access.message}`)
    result.access.tests.forEach(test => {
      const status = test.success ? '✅ Pass' : '❌ Fail'
      console.log(`   - ${test.bucket} (${test.operation}): ${status}`)
      if (test.error) {
        console.log(`     Error: ${test.error}`)
      }
    })
    console.log('')

    // Configuration verification results
    console.log('⚙️  CONFIGURATION VERIFICATION:')
    console.log(`   Status: ${result.verification.success ? '✅ Success' : '❌ Issues Found'}`)
    console.log(`   Message: ${result.verification.message}`)
    result.verification.buckets.forEach(bucket => {
      const status = bucket.isCorrect ? '✅ Correct' : '⚠️  Issues'
      console.log(`   - ${bucket.name}: ${status}`)
      if (bucket.issues.length > 0) {
        bucket.issues.forEach(issue => {
          console.log(`     • ${issue}`)
        })
      }
    })
    console.log('')

    // Final summary
    if (result.success) {
      console.log('🎉 STORAGE INITIALIZATION COMPLETE!')
      console.log('')
      console.log('Next steps:')
      console.log('1. Run the SQL script in your Supabase dashboard to set up RLS policies:')
      console.log('   sql/setup-storage-buckets.sql')
      console.log('2. Test file uploads using the API endpoints')
      console.log('3. Verify permissions work correctly for different user roles')
      console.log('')
      process.exit(0)
    } else {
      console.log('❌ STORAGE INITIALIZATION COMPLETED WITH ISSUES')
      console.log('')
      console.log('Please review the errors above and:')
      console.log('1. Check your Supabase credentials')
      console.log('2. Verify your Supabase project permissions')
      console.log('3. Ensure the database schema is set up correctly')
      console.log('')
      process.exit(1)
    }
  } catch (error) {
    console.error('💥 FATAL ERROR during initialization:')
    console.error(error)
    console.error('')
    console.error('Please check your Supabase configuration and try again.')
    process.exit(1)
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error)
  process.exit(1)
})