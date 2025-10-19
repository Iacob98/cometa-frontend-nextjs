/**
 * Equipment Documents Hooks
 * TanStack Query hooks for equipment documents
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  EquipmentDocument,
  EquipmentDocumentFilters,
  PaginatedResponse,
} from '@/types/equipment-enhanced';

const API_BASE = '/api/equipment/documents';

// Query Keys
export const documentKeys = {
  all: ['equipment-documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (filters: EquipmentDocumentFilters) =>
    [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  expiring: (days: number) => [...documentKeys.all, 'expiring', days] as const,
};

// GET /api/equipment/documents
export function useEquipmentDocuments(filters: EquipmentDocumentFilters = {}) {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.equipment_id) params.append('equipment_id', filters.equipment_id);
      if (filters.document_type) params.append('document_type', filters.document_type);
      if (filters.expiring_within_days) params.append('expiring_within_days', String(filters.expiring_within_days));
      if (filters.expired_only !== undefined) params.append('expired_only', String(filters.expired_only));
      if (filters.active_only !== undefined) params.append('active_only', String(filters.active_only));

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment documents');
      }
      return response.json() as Promise<PaginatedResponse<EquipmentDocument>>;
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

// GET /api/equipment/documents/[id]
export function useEquipmentDocument(documentId: string | null) {
  return useQuery({
    queryKey: documentKeys.detail(documentId || ''),
    queryFn: async () => {
      if (!documentId) throw new Error('Document ID required');

      const response = await fetch(`${API_BASE}/${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      return response.json() as Promise<EquipmentDocument & { signed_url: string }>;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// POST /api/equipment/documents
export function useUploadEquipmentDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      equipment_id,
      document_type,
      document_name,
      file,
      issue_date,
      expiry_date,
      notes,
      uploaded_by_user_id,
    }: {
      equipment_id: string;
      document_type: string;
      document_name: string;
      file: File;
      issue_date?: string;
      expiry_date?: string;
      notes?: string;
      uploaded_by_user_id?: string;
    }) => {
      const formData = new FormData();
      formData.append('equipment_id', equipment_id);
      formData.append('document_type', document_type);
      formData.append('document_name', document_name);
      formData.append('file', file);
      if (issue_date) formData.append('issue_date', issue_date);
      if (expiry_date) formData.append('expiry_date', expiry_date);
      if (notes) formData.append('notes', notes);
      if (uploaded_by_user_id) formData.append('uploaded_by_user_id', uploaded_by_user_id);

      const response = await fetch(API_BASE, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload document');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all document lists
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      // Invalidate specific equipment's documents
      if (data.document?.equipment_id) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.list({ equipment_id: data.document.equipment_id }),
        });
      }
    },
  });
}

// DELETE /api/equipment/documents/[id]
export function useDeleteEquipmentDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      const response = await fetch(`${API_BASE}/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all document lists
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    },
  });
}

// Helper: Get expiring documents
export function useExpiringDocuments(days: number = 60) {
  return useQuery({
    queryKey: documentKeys.expiring(days),
    queryFn: async () => {
      const params = new URLSearchParams({
        expiring_within_days: String(days),
        active_only: 'true',
      });

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expiring documents');
      }
      return response.json() as Promise<PaginatedResponse<EquipmentDocument>>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper: Get expired documents
export function useExpiredDocuments() {
  return useQuery({
    queryKey: [...documentKeys.all, 'expired'] as const,
    queryFn: async () => {
      const params = new URLSearchParams({
        expired_only: 'true',
        active_only: 'true',
      });

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch expired documents');
      }
      return response.json() as Promise<PaginatedResponse<EquipmentDocument>>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// PUT /api/equipment/documents
export function useUpdateEquipmentDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      document_type,
      document_name,
      issue_date,
      expiry_date,
      notes,
    }: {
      id: string;
      document_type?: string;
      document_name?: string;
      issue_date?: string;
      expiry_date?: string;
      notes?: string;
    }) => {
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          document_type,
          document_name,
          issue_date,
          expiry_date,
          notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update document');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all document lists
      queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
      // Invalidate specific document
      if (data.document?.id) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.detail(data.document.id),
        });
      }
      // Invalidate equipment-specific documents
      if (data.document?.equipment_id) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.list({ equipment_id: data.document.equipment_id }),
        });
      }
    },
  });
}
