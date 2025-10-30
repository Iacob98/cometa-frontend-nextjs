'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
export interface WorkerDocument {
  id: string;
  userId: string;
  categoryId: string;
  categoryCode: string;
  categoryType: 'legal' | 'company';
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

export interface DocumentCategory {
  id: string;
  code: string;
  name_en: string;
  name_ru: string;
  name_de: string;
  category_type: 'legal' | 'company';
  created_at: string;
}

export interface UserDocumentsResponse {
  documents: {
    legal: any[];
    company: any[];
    all: any[];
  };
  categories: {
    legal: DocumentCategory[];
    company: DocumentCategory[];
    all: DocumentCategory[];
  };
  stats: {
    total: number;
    legalCount: number;
    companyCount: number;
  };
}

export interface UploadDocumentRequest {
  file: File;
  category_id: string;
  title: string;
  description?: string;
}

export interface DownloadDocumentResponse {
  url: string;
  filename: string;
  mimeType: string;
}

// Query keys
export const workerDocumentKeys = {
  all: ['worker-documents'] as const,
  user: (userId: string) => [...workerDocumentKeys.all, 'user', userId] as const,
  categories: () => [...workerDocumentKeys.all, 'categories'] as const,
  download: (userId: string, documentId: string) =>
    [...workerDocumentKeys.all, 'download', userId, documentId] as const,
};

/**
 * Fetch all documents for a specific user
 * Returns documents split by category type (legal/company)
 */
export function useWorkerDocuments(userId?: string) {
  return useQuery({
    queryKey: userId ? workerDocumentKeys.user(userId) : [],
    queryFn: async (): Promise<UserDocumentsResponse> => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await fetch(`/api/users/${userId}/documents`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch user documents');
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Upload a new document for a user
 * Automatically routes to correct Supabase Storage bucket based on category type
 */
export function useUploadWorkerDocument(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadDocumentRequest) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('category_id', data.category_id);
      formData.append('title', data.title);
      if (data.description) {
        formData.append('description', data.description);
      }

      console.log('📤 Uploading document:', {
        userId,
        fileName: data.file.name,
        fileSize: data.file.size,
        fileType: data.file.type,
        categoryId: data.category_id,
        title: data.title,
      });

      const response = await fetch(`/api/users/${userId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.details || 'Failed to upload document');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate user documents query to refresh
      if (userId) {
        queryClient.invalidateQueries({ queryKey: workerDocumentKeys.user(userId) });
      }
      queryClient.invalidateQueries({ queryKey: workerDocumentKeys.all });
      toast.success('Document uploaded successfully');
    },
    onError: (error: Error) => {
      console.error('Failed to upload document:', error);
      toast.error(error.message || 'Failed to upload document');
    },
  });
}

/**
 * Get download URL for a document
 * Returns a signed URL valid for 60 seconds
 */
export function useDownloadWorkerDocument(userId?: string, documentId?: string) {
  return useQuery({
    queryKey: userId && documentId ? workerDocumentKeys.download(userId, documentId) : [],
    queryFn: async (): Promise<DownloadDocumentResponse> => {
      if (!userId || !documentId) {
        throw new Error('User ID and Document ID are required');
      }

      const response = await fetch(`/api/users/${userId}/documents/${documentId}/download`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate download URL');
      }

      return response.json();
    },
    enabled: !!userId && !!documentId,
    staleTime: 0, // Always fetch fresh signed URL
    cacheTime: 0, // Don't cache signed URLs
  });
}

/**
 * Download a document by triggering browser download
 */
export function useDownloadDocument(userId?: string) {
  return useMutation({
    mutationFn: async ({ documentId, filename }: { documentId: string; filename: string }) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await fetch(`/api/users/${userId}/documents/${documentId}/download`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download document');
      }

      const data: DownloadDocumentResponse = await response.json();

      // Download file from signed URL
      const fileResponse = await fetch(data.url);
      if (!fileResponse.ok) {
        throw new Error('Failed to download file from storage');
      }

      const blob = await fileResponse.blob();

      // Trigger browser download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return data;
    },
    onError: (error: Error) => {
      console.error('Failed to download document:', error);
      toast.error(error.message || 'Failed to download document');
    },
  });
}

/**
 * Get document categories with filtering by type
 */
export function useDocumentCategories(categoryType?: 'legal' | 'company') {
  return useQuery({
    queryKey: [...workerDocumentKeys.categories(), categoryType],
    queryFn: async (): Promise<DocumentCategory[]> => {
      // Get categories from any user endpoint (they're the same for all users)
      const response = await fetch('/api/users/any/documents');

      if (!response.ok) {
        throw new Error('Failed to fetch document categories');
      }

      const data: UserDocumentsResponse = await response.json();

      if (categoryType === 'legal') {
        return data.categories.legal;
      } else if (categoryType === 'company') {
        return data.categories.company;
      } else {
        return data.categories.all;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - categories don't change often
  });
}

// Helper functions

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type icon based on MIME type
 */
export function getFileTypeIcon(mimeType: string): string {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📺';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
  return '📎';
}

/**
 * Get category label in specified language
 */
export function getCategoryLabel(
  category: DocumentCategory,
  language: 'en' | 'ru' | 'de' = 'en'
): string {
  const labelMap = {
    en: category.name_en,
    ru: category.name_ru,
    de: category.name_de,
  };

  return labelMap[language] || category.name_en;
}

/**
 * Get category type badge color
 */
export function getCategoryTypeBadgeColor(categoryType: 'legal' | 'company'): string {
  return categoryType === 'legal'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-green-100 text-green-800';
}

/**
 * Get category type label
 */
export function getCategoryTypeLabel(categoryType: 'legal' | 'company'): string {
  return categoryType === 'legal' ? 'Legal Document' : 'Company Document';
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type (allow common document and image types)
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload PDF, image, or Office document.',
    };
  }

  return { valid: true };
}

/**
 * Get document statistics summary
 */
export function getDocumentStats(documents: UserDocumentsResponse): {
  totalDocuments: number;
  legalDocuments: number;
  companyDocuments: number;
  totalSize: number;
  formattedSize: string;
} {
  const totalDocuments = documents.stats.total;
  const legalDocuments = documents.stats.legalCount;
  const companyDocuments = documents.stats.companyCount;

  const totalSize = documents.documents.all.reduce((sum, doc) => sum + (doc.file_size || 0), 0);

  return {
    totalDocuments,
    legalDocuments,
    companyDocuments,
    totalSize,
    formattedSize: formatFileSize(totalSize),
  };
}
