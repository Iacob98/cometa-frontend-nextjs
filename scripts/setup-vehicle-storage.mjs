#!/usr/bin/env node

/**
 * Setup Script: Create Supabase Storage bucket for vehicle documents
 * Date: 2025-10-18
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage for vehicle documents...\n');

  try {
    // Check if bucket already exists
    console.log('📋 Step 1: Checking existing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      throw listError;
    }

    const bucketName = 'vehicle-documents';
    const existingBucket = buckets.find(b => b.name === bucketName);

    if (existingBucket) {
      console.log(`✅ Bucket '${bucketName}' already exists\n`);
    } else {
      // Create new bucket
      console.log(`📋 Step 2: Creating bucket '${bucketName}'...`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: false, // Private bucket - requires authentication
        fileSizeLimit: 52428800, // 50MB limit
        allowedMimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        throw createError;
      }

      console.log(`✅ Bucket '${bucketName}' created successfully\n`);
    }

    // Note about RLS policies
    console.log('📋 Step 3: Storage RLS Policies');
    console.log('⚠️  Note: Storage policies need to be configured in Supabase Dashboard');
    console.log('   Navigate to: Storage > Policies > vehicle-documents\n');
    console.log('   Required policies:');
    console.log('   1. SELECT: Allow authenticated users to read files');
    console.log('   2. INSERT: Allow authenticated users to upload files');
    console.log('   3. UPDATE: Allow file owners to update');
    console.log('   4. DELETE: Allow admins and file owners to delete\n');

    // List all buckets for verification
    const { data: allBuckets } = await supabase.storage.listBuckets();
    console.log('📊 All storage buckets:');
    allBuckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });

    console.log('\n✅ Storage setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Configure storage policies in Supabase Dashboard');
    console.log('2. Create storage utility functions');
    console.log('3. Implement API endpoints\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupStorage();
