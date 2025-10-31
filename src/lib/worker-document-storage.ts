/**
 * Worker Document Storage - Supabase Storage Integration
 *
 * Replaces temporary .tmp/documents/ storage with Supabase Storage
 * Supports both legal documents (documents bucket) and company documents (worker-documents bucket)
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export interface UploadDocumentOptions {
  userId: string;
  categoryId: string;
  categoryCode: string;
  categoryType: 'legal' | 'company';
  file: File | Buffer;
  fileName: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface DocumentRecord {
  id: string;
  userId: string;
  categoryId: string;
  bucketName: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Upload a document to Supabase Storage
 * Automatically routes to correct bucket based on category type
 */
export async function uploadDocument(
  options: UploadDocumentOptions
): Promise<DocumentRecord> {
  const {
    userId,
    categoryId,
    categoryCode,
    categoryType,
    file,
    fileName,
    title,
    description,
    metadata = {},
  } = options;

  // Determine bucket and table based on category type
  const bucketName =
    categoryType === 'legal' ? 'documents' : 'worker-documents';
  const tableName = categoryType === 'legal' ? 'documents' : 'files';

  // Create file path: {userId}/{category}/{timestamp}_{fileName}
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${categoryCode.toLowerCase()}/${timestamp}_${sanitizedFileName}`;

  // Convert File to Buffer if needed
  let fileBuffer: Buffer;
  let fileSize: number;
  let mimeType: string;

  if (file instanceof Buffer) {
    fileBuffer = file;
    fileSize = file.length;
    mimeType = 'application/octet-stream'; // Default, should be provided
  } else {
    // File object from FormData
    const arrayBuffer = await file.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
    fileSize = file.size;
    mimeType = file.type;
  }

  // Determine safe content type for Supabase Storage
  // Some MIME types are restricted, use application/octet-stream as fallback
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const safeContentType = allowedMimeTypes.includes(mimeType)
    ? mimeType
    : 'application/octet-stream';

  console.log('📤 Uploading to Supabase Storage:', {
    bucket: bucketName,
    path: filePath,
    originalMimeType: mimeType,
    safeContentType,
    size: fileSize,
  });

  // Upload to Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType: safeContentType,
      upsert: false,
    });

  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  console.log('✅ File uploaded successfully to Storage:', filePath);

  // Insert metadata into appropriate table
  if (categoryType === 'legal') {
    // Insert into documents table
    const { data: docRecord, error: insertError } = await supabase
      .from('documents')
      .insert({
        uploaded_by: userId,
        category_id: categoryId,
        filename: sanitizedFileName,
        original_filename: fileName,
        file_size: fileSize,
        file_type: mimeType,
        file_path: filePath,
        description: description || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Clean up uploaded file
      await supabase.storage.from(bucketName).remove([filePath]);
      throw new Error(`Failed to save document metadata: ${insertError.message}`);
    }

    return {
      id: docRecord.id,
      userId,
      categoryId,
      bucketName,
      fileName: sanitizedFileName,
      originalFileName: fileName,
      fileSize,
      mimeType,
      filePath,
      title,
      description,
      metadata,
      createdAt: docRecord.created_at,
      updatedAt: docRecord.updated_at,
    };
  } else {
    // Insert into files table
    const { data: fileRecord, error: insertError } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        bucket_name: bucketName,
        category: categoryCode,
        title,
        description: description || null,
        filename: sanitizedFileName,
        original_filename: fileName,
        file_size: fileSize,
        mime_type: mimeType,
        file_path: filePath,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Clean up uploaded file
      await supabase.storage.from(bucketName).remove([filePath]);
      throw new Error(`Failed to save file metadata: ${insertError.message}`);
    }

    return {
      id: fileRecord.id,
      userId,
      categoryId,
      bucketName,
      fileName: sanitizedFileName,
      originalFileName: fileName,
      fileSize,
      mimeType,
      filePath,
      title,
      description,
      metadata,
      createdAt: fileRecord.created_at,
      updatedAt: fileRecord.updated_at,
    };
  }
}

/**
 * Calculate document status based on expiry date
 */
function calculateDocumentStatus(expiryDate?: string | null): 'active' | 'expired' | 'expiring_soon' | 'pending' {
  if (!expiryDate) {
    return 'active'; // No expiry date means always active
  }

  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return 'expired';
  } else if (daysUntilExpiry <= 30) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
}

/**
 * Get all documents for a user
 * Fetches from both documents and files tables
 */
export async function getUserDocuments(userId: string): Promise<{
  legalDocuments: any[];
  companyDocuments: any[];
}> {
  // Fetch legal documents with category
  const { data: legalDocs, error: legalError } = await supabase
    .from('documents')
    .select(
      `
      *,
      category:document_categories(*)
    `
    )
    .eq('uploaded_by', userId)
    .order('created_at', { ascending: false });

  if (legalError) {
    console.error('Error fetching legal documents:', legalError);
  }

  // Transform legal documents to include status and proper structure
  const transformedLegalDocs = (legalDocs || []).map((doc: any) => ({
    ...doc,
    file_name: doc.original_filename || doc.filename,
    user_id: doc.uploaded_by,
    category_id: doc.category_id,
    status: calculateDocumentStatus(doc.expiry_date),
    is_verified: doc.is_verified || false,
  }));

  // Fetch company documents from files table
  const { data: companyDocs, error: companyError } = await supabase
    .from('files')
    .select('*')
    .eq('user_id', userId)
    .eq('bucket_name', 'worker-documents')
    .order('created_at', { ascending: false });

  if (companyError) {
    console.error('Error fetching company documents:', companyError);
  }

  // Fetch categories for company documents
  const { data: categories } = await supabase
    .from('document_categories')
    .select('*')
    .eq('category_type', 'company');

  const categoryMap = new Map(
    (categories || []).map((cat: any) => [cat.code, cat])
  );

  // Transform company documents to match expected structure
  const transformedCompanyDocs = (companyDocs || []).map((doc: any) => {
    // Get category from map using the category code stored in files table
    const category = categoryMap.get(doc.category?.toUpperCase()) || {
      id: null,
      code: doc.category || 'PERSONAL_DOCUMENT',
      name_en: 'Personal Document',
      name_ru: 'Личный документ',
      name_de: 'Persönliches Dokument',
      color: '#6b7280',
      category_type: 'company',
    };

    return {
      id: doc.id,
      user_id: doc.user_id,
      category_id: category.id,
      document_number: doc.metadata?.document_number || null,
      issuing_authority: doc.metadata?.issuing_authority || null,
      issue_date: doc.metadata?.issue_date || null,
      expiry_date: doc.metadata?.expiry_date || null,
      status: calculateDocumentStatus(doc.metadata?.expiry_date),
      file_url: doc.file_url,
      file_name: doc.original_filename || doc.filename,
      file_size: doc.file_size,
      file_type: doc.mime_type,
      file_path: doc.file_path,
      bucket_name: doc.bucket_name,
      notes: doc.description || doc.metadata?.notes || null,
      is_verified: doc.metadata?.is_verified || false,
      verified_by: doc.metadata?.verified_by || null,
      verified_at: doc.metadata?.verified_at || null,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
      category,
    };
  });

  return {
    legalDocuments: transformedLegalDocs,
    companyDocuments: transformedCompanyDocs,
  };
}

/**
 * Create a signed URL for downloading/viewing a document
 */
export async function createSignedUrl(
  bucketName: string,
  filePath: string,
  expiresIn: number = 60
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a document from Storage and Database
 */
export async function deleteDocument(
  documentId: string,
  bucketName: string,
  filePath: string,
  categoryType: 'legal' | 'company'
): Promise<void> {
  // Delete from Storage
  const { error: storageError } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (storageError) {
    console.error('Storage delete error:', storageError);
    throw new Error(`Failed to delete file: ${storageError.message}`);
  }

  // Delete from Database
  const tableName = categoryType === 'legal' ? 'documents' : 'files';
  const { error: dbError } = await supabase
    .from(tableName)
    .delete()
    .eq('id', documentId);

  if (dbError) {
    console.error('Database delete error:', dbError);
    throw new Error(`Failed to delete document metadata: ${dbError.message}`);
  }
}

/**
 * Get document metadata by ID
 */
export async function getDocumentById(
  documentId: string,
  categoryType: 'legal' | 'company'
): Promise<any> {
  const tableName = categoryType === 'legal' ? 'documents' : 'files';

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) {
    throw new Error(`Document not found: ${error.message}`);
  }

  return data;
}
