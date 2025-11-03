import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface CabinetPlan {
  id: string;
  title: string;
  description?: string;
  plan_type: string;
  filename: string;
  file_size: number;
  file_url: string;
  file_path: string;
  uploaded_at: string;
}

export interface CabinetPlanResponse {
  cabinet: {
    id: string;
    project_id: string;
    code?: string;
    name?: string;
    address?: string;
  };
  plans: CabinetPlan[];
}

/**
 * Fetch installation plan for a specific NVT point (cabinet)
 */
export function useCabinetPlan(cabinetId: string) {
  return useQuery<CabinetPlanResponse>({
    queryKey: ['cabinet-plan', cabinetId],
    queryFn: async () => {
      const response = await fetch(`/api/cabinets/${cabinetId}/plan`);
      if (!response.ok) {
        throw new Error('Failed to fetch cabinet plan');
      }
      return response.json();
    },
    enabled: !!cabinetId,
  });
}

/**
 * Upload installation plan for a specific NVT point (cabinet)
 */
export function useUploadCabinetPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cabinetId,
      title,
      description,
      planType,
      file,
    }: {
      cabinetId: string;
      title: string;
      description?: string;
      planType: string;
      file: File;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }
      formData.append('plan_type', planType);

      console.log(`📤 Uploading plan for NVT ${cabinetId}:`, {
        title,
        planType,
        filename: file.name,
        size: file.size,
      });

      const response = await fetch(`/api/cabinets/${cabinetId}/plan`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload plan');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      toast.success('Plan uploaded successfully');
      queryClient.invalidateQueries({
        queryKey: ['cabinet-plan', variables.cabinetId],
      });
    },
    onError: (error: Error) => {
      console.error('Upload plan error:', error);
      toast.error(`Failed to upload plan: ${error.message}`);
    },
  });
}

/**
 * Delete specific installation plan from a NVT point (cabinet)
 */
export function useDeleteCabinetPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ cabinetId, planId }: { cabinetId: string; planId: string }) => {
      console.log(`🗑️ Deleting plan ${planId} for NVT ${cabinetId}`);

      const response = await fetch(`/api/cabinets/${cabinetId}/plan/${planId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete plan');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      toast.success('Plan deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['cabinet-plan', variables.cabinetId],
      });
    },
    onError: (error: Error) => {
      console.error('Delete plan error:', error);
      toast.error(`Failed to delete plan: ${error.message}`);
    },
  });
}
