/**
 * Custom hooks for vehicle documents management
 * Handles fetching, uploading, updating, and deleting vehicle documents
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// ==============================================================================
// Types
// ==============================================================================

export type VehicleDocumentType =
  | 'fahrzeugschein'
  | 'fahrzeugbrief'
  | 'tuv'
  | 'versicherung'
  | 'au'
  | 'wartung'
  | 'sonstiges';

export type DocumentExpiryStatus = 'active' | 'expiring_warning' | 'expiring_soon' | 'expired' | null;

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: VehicleDocumentType;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  document_number?: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  notes?: string;
  is_verified: boolean;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  expiry_status?: DocumentExpiryStatus;
}

export interface VehicleDocumentsResponse {
  documents: VehicleDocument[];
  total: number;
}

export interface UploadDocumentData {
  vehicleId: string;
  documentType: VehicleDocumentType;
  files: File[];
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
  uploadedBy?: string;
}

export interface UpdateDocumentData {
  vehicleId: string;
  documentId: string;
  documentNumber?: string;
  issuingAuthority?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
  isVerified?: boolean;
}

// ==============================================================================
// Query Keys
// ==============================================================================

export const vehicleDocumentsKeys = {
  all: ['vehicle-documents'] as const,
  lists: () => [...vehicleDocumentsKeys.all, 'list'] as const,
  list: (vehicleId: string) => [...vehicleDocumentsKeys.lists(), vehicleId] as const,
  details: () => [...vehicleDocumentsKeys.all, 'detail'] as const,
  detail: (vehicleId: string, documentId: string) =>
    [...vehicleDocumentsKeys.details(), vehicleId, documentId] as const,
};

// ==============================================================================
// Hooks
// ==============================================================================

/**
 * Fetch all documents for a vehicle
 */
export function useVehicleDocuments(vehicleId: string | undefined) {
  return useQuery({
    queryKey: vehicleDocumentsKeys.list(vehicleId || ''),
    queryFn: async (): Promise<VehicleDocumentsResponse> => {
      if (!vehicleId) {
        return { documents: [], total: 0 };
      }

      const response = await fetch(`/api/vehicles/${vehicleId}/documents`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch vehicle documents');
      }

      return response.json();
    },
    enabled: !!vehicleId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch a single document
 */
export function useVehicleDocument(vehicleId: string | undefined, documentId: string | undefined) {
  return useQuery({
    queryKey: vehicleDocumentsKeys.detail(vehicleId || '', documentId || ''),
    queryFn: async (): Promise<VehicleDocument> => {
      if (!vehicleId || !documentId) {
        throw new Error('Vehicle ID and Document ID are required');
      }

      const response = await fetch(`/api/vehicles/${vehicleId}/documents/${documentId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch document');
      }

      return response.json();
    },
    enabled: !!vehicleId && !!documentId,
  });
}

/**
 * Upload vehicle documents
 */
export function useUploadVehicleDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadDocumentData) => {
      const formData = new FormData();

      // Add files
      data.files.forEach((file) => {
        formData.append('files', file);
      });

      // Add metadata
      formData.append('document_type', data.documentType);
      if (data.documentNumber) formData.append('document_number', data.documentNumber);
      if (data.issuingAuthority) formData.append('issuing_authority', data.issuingAuthority);
      if (data.issueDate) formData.append('issue_date', data.issueDate);
      if (data.expiryDate) formData.append('expiry_date', data.expiryDate);
      if (data.notes) formData.append('notes', data.notes);
      if (data.uploadedBy) formData.append('uploaded_by', data.uploadedBy);

      const response = await fetch(`/api/vehicles/${data.vehicleId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload documents');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate vehicle documents list
      queryClient.invalidateQueries({
        queryKey: vehicleDocumentsKeys.list(variables.vehicleId),
      });

      toast.success('Документы успешно загружены');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка загрузки: ${error.message}`);
    },
  });
}

/**
 * Update document metadata
 */
export function useUpdateVehicleDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateDocumentData) => {
      const response = await fetch(
        `/api/vehicles/${data.vehicleId}/documents/${data.documentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_number: data.documentNumber,
            issuing_authority: data.issuingAuthority,
            issue_date: data.issueDate,
            expiry_date: data.expiryDate,
            notes: data.notes,
            is_verified: data.isVerified,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update document');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({
        queryKey: vehicleDocumentsKeys.list(variables.vehicleId),
      });
      queryClient.invalidateQueries({
        queryKey: vehicleDocumentsKeys.detail(variables.vehicleId, variables.documentId),
      });

      toast.success('Документ успешно обновлён');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка обновления: ${error.message}`);
    },
  });
}

/**
 * Delete a document
 */
export function useDeleteVehicleDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, documentId }: { vehicleId: string; documentId: string }) => {
      const response = await fetch(`/api/vehicles/${vehicleId}/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate vehicle documents list
      queryClient.invalidateQueries({
        queryKey: vehicleDocumentsKeys.list(variables.vehicleId),
      });

      toast.success('Документ успешно удалён');
    },
    onError: (error: Error) => {
      toast.error(`Ошибка удаления: ${error.message}`);
    },
  });
}

// ==============================================================================
// Utility Functions
// ==============================================================================

/**
 * Get document type label in Russian
 */
export function getDocumentTypeLabel(type: VehicleDocumentType): string {
  const labels: Record<VehicleDocumentType, string> = {
    fahrzeugschein: 'СТС (Свидетельство о регистрации)',
    fahrzeugbrief: 'ПТС (Паспорт ТС)',
    tuv: 'Техосмотр',
    versicherung: 'Страховка',
    au: 'Экологическая проверка',
    wartung: 'Сервисная книжка',
    sonstiges: 'Прочее',
  };
  return labels[type] || type;
}

/**
 * Get expiry status color
 */
export function getExpiryStatusColor(status: DocumentExpiryStatus): string {
  const colors: Record<Exclude<DocumentExpiryStatus, null>, string> = {
    active: 'text-green-600 bg-green-50',
    expiring_warning: 'text-yellow-600 bg-yellow-50',
    expiring_soon: 'text-orange-600 bg-orange-50',
    expired: 'text-red-600 bg-red-50',
  };
  return status ? colors[status] : 'text-gray-600 bg-gray-50';
}

/**
 * Get expiry status label
 */
export function getExpiryStatusLabel(status: DocumentExpiryStatus): string {
  const labels: Record<Exclude<DocumentExpiryStatus, null>, string> = {
    active: 'Действителен',
    expiring_warning: 'Скоро истекает',
    expiring_soon: 'Скоро истекает',
    expired: 'Истёк',
  };
  return status ? labels[status] : 'Без срока действия';
}

/**
 * Check if document type requires expiry date
 */
export function requiresExpiryDate(type: VehicleDocumentType): boolean {
  return ['tuv', 'versicherung', 'au'].includes(type);
}

/**
 * Get download URL for document
 */
export function getDocumentDownloadUrl(
  vehicleId: string,
  documentId: string,
  mode: 'download' | 'view' = 'download'
): string {
  return `/api/vehicles/${vehicleId}/documents/${documentId}/download?mode=${mode}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date for display
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';

  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
