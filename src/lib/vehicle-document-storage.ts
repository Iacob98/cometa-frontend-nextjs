/**
 * Vehicle Document Storage Utilities
 * Handles file operations for vehicle documents in Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role for storage operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'vehicle-documents';

// ==============================================================================
// TypeScript Interfaces
// ==============================================================================

export interface UploadVehicleDocumentParams {
  vehicleId: string;
  documentType: VehicleDocumentType;
  file: File | Buffer;
  fileName?: string;
}

export interface VehicleDocumentMetadata {
  vehicleId: string;
  documentType: VehicleDocumentType;
  fileName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
}

export type VehicleDocumentType =
  | 'fahrzeugschein'  // Vehicle Registration Certificate (Part I)
  | 'fahrzeugbrief'   // Vehicle Title (Part II)
  | 'tuv'             // Technical Inspection (TÜV/HU)
  | 'versicherung'    // Insurance
  | 'au'              // Emissions Test
  | 'wartung'         // Service Records
  | 'sonstiges';      // Other

export interface UploadResult {
  path: string;
  url: string;
  fileSize: number;
  fileType: string;
}

// ==============================================================================
// Helper Functions
// ==============================================================================

/**
 * Sanitize filename to remove special characters
 */
function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * Generate storage path for vehicle document
 * Pattern: {vehicleId}/{documentType}/{timestamp}_{fileName}
 */
function generateFilePath(
  vehicleId: string,
  documentType: VehicleDocumentType,
  fileName: string
): string {
  const timestamp = Date.now();
  const sanitized = sanitizeFileName(fileName);
  return `${vehicleId}/${documentType}/${timestamp}_${sanitized}`;
}

/**
 * Get file type from File or Buffer
 */
function getFileType(file: File | Buffer): string {
  if (file instanceof File) {
    return file.type;
  }
  // For Buffer, try to detect from file extension or return generic
  return 'application/octet-stream';
}

/**
 * Get file size from File or Buffer
 */
function getFileSize(file: File | Buffer): number {
  if (file instanceof File) {
    return file.size;
  }
  return file.length;
}

// ==============================================================================
// Storage Operations
// ==============================================================================

/**
 * Upload a vehicle document to Supabase storage
 *
 * @example
 * const result = await uploadVehicleDocument({
 *   vehicleId: 'abc-123',
 *   documentType: 'tuv',
 *   file: uploadedFile
 * });
 */
export async function uploadVehicleDocument({
  vehicleId,
  documentType,
  file,
  fileName,
}: UploadVehicleDocumentParams): Promise<UploadResult> {
  try {
    // Get file name
    const actualFileName = fileName || (file instanceof File ? file.name : 'document');

    // Generate unique file path
    const filePath = generateFilePath(vehicleId, documentType, actualFileName);

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: getFileType(file),
      });

    if (error) {
      console.error('❌ Upload error:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }

    // Get signed URL (bucket is private)
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    console.log('✅ Document uploaded:', {
      vehicleId,
      documentType,
      filePath,
      fileSize: getFileSize(file),
    });

    return {
      path: filePath,
      url: urlData?.signedUrl || '',
      fileSize: getFileSize(file),
      fileType: getFileType(file),
    };
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
}

/**
 * Download a vehicle document from Supabase storage
 * Returns the file as a Blob
 */
export async function downloadVehicleDocument(filePath: string): Promise<Blob> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      console.error('❌ Download error:', error);
      throw new Error(`Failed to download document: ${error.message}`);
    }

    console.log('✅ Document downloaded:', { filePath });
    return data;
  } catch (error) {
    console.error('❌ Download failed:', error);
    throw error;
  }
}

/**
 * Delete a vehicle document from Supabase storage
 */
export async function deleteVehicleDocument(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('❌ Delete error:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }

    console.log('✅ Document deleted:', { filePath });
  } catch (error) {
    console.error('❌ Delete failed:', error);
    throw error;
  }
}

/**
 * Get signed URL for viewing/downloading document
 * Default expiry: 1 hour (3600 seconds)
 *
 * @param filePath - The storage path of the document
 * @param expiresIn - Expiry time in seconds (default: 3600)
 */
export async function getVehicleDocumentSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('❌ Signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    console.error('❌ Signed URL generation failed:', error);
    throw error;
  }
}

/**
 * List all documents for a specific vehicle
 *
 * @param vehicleId - The vehicle ID
 * @param documentType - Optional: filter by document type
 */
export async function listVehicleDocuments(
  vehicleId: string,
  documentType?: VehicleDocumentType
): Promise<string[]> {
  try {
    const prefix = documentType
      ? `${vehicleId}/${documentType}/`
      : `${vehicleId}/`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(prefix, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('❌ List error:', error);
      throw new Error(`Failed to list documents: ${error.message}`);
    }

    const filePaths = data.map(file => `${prefix}${file.name}`);

    console.log('✅ Documents listed:', {
      vehicleId,
      documentType,
      count: filePaths.length,
    });

    return filePaths;
  } catch (error) {
    console.error('❌ List failed:', error);
    throw error;
  }
}

/**
 * Delete all documents for a vehicle
 * Useful when deleting a vehicle
 */
export async function deleteAllVehicleDocuments(vehicleId: string): Promise<void> {
  try {
    // List all documents for the vehicle
    const filePaths = await listVehicleDocuments(vehicleId);

    if (filePaths.length === 0) {
      console.log('ℹ️ No documents to delete for vehicle:', vehicleId);
      return;
    }

    // Delete all documents
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (error) {
      console.error('❌ Bulk delete error:', error);
      throw new Error(`Failed to delete vehicle documents: ${error.message}`);
    }

    console.log('✅ All vehicle documents deleted:', {
      vehicleId,
      count: filePaths.length,
    });
  } catch (error) {
    console.error('❌ Bulk delete failed:', error);
    throw error;
  }
}

/**
 * Get document type label in German
 */
export function getDocumentTypeLabel(type: VehicleDocumentType): string {
  const labels: Record<VehicleDocumentType, string> = {
    fahrzeugschein: 'Fahrzeugschein (Zulassungsbescheinigung Teil I)',
    fahrzeugbrief: 'Fahrzeugbrief (Zulassungsbescheinigung Teil II)',
    tuv: 'TÜV/HU (Hauptuntersuchung)',
    versicherung: 'Versicherung',
    au: 'AU (Abgasuntersuchung)',
    wartung: 'Wartungsnachweis',
    sonstiges: 'Sonstiges',
  };
  return labels[type] || type;
}

/**
 * Check if document type requires expiry date
 */
export function requiresExpiryDate(type: VehicleDocumentType): boolean {
  return ['tuv', 'versicherung', 'au'].includes(type);
}

/**
 * Validate file size (max 50MB)
 */
export function validateFileSize(file: File | Buffer): boolean {
  const maxSize = 50 * 1024 * 1024; // 50MB
  return getFileSize(file) <= maxSize;
}

/**
 * Validate file type (PDF and images only)
 */
export function validateFileType(file: File): boolean {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  return allowedTypes.includes(file.type);
}
