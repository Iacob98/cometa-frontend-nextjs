import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface HousingUnitPlan {
  title: string;
  description?: string;
  plan_type: 'connection_plan' | 'wiring_diagram' | 'technical_drawing' | 'installation_guide' | 'as_built' | 'other';
  filename: string;
  file_size: number;
  file_url: string;
  file_path: string;
  uploaded_at: string;
}

export interface HousingUnitPlanResponse {
  housingUnit: {
    id: string;
    project_id: string;
    unit_number?: string;
    address?: string;
    unit_type: string;
  };
  plan: HousingUnitPlan | null;
}

/**
 * Fetch connection plan for a specific housing unit
 */
export function useHousingUnitPlan(housingUnitId: string) {
  return useQuery<HousingUnitPlanResponse>({
    queryKey: ['housing-unit-plan', housingUnitId],
    queryFn: async () => {
      const response = await fetch(`/api/housing-units/${housingUnitId}/plan`);
      if (!response.ok) {
        throw new Error('Failed to fetch housing unit plan');
      }
      return response.json();
    },
    enabled: !!housingUnitId,
  });
}

/**
 * Upload connection plan for a specific housing unit
 */
export function useUploadHousingUnitPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      housingUnitId,
      title,
      description,
      planType,
      file,
    }: {
      housingUnitId: string;
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

      console.log(`📤 Uploading connection plan for housing unit ${housingUnitId}:`, {
        title,
        planType,
        filename: file.name,
        size: file.size,
      });

      const response = await fetch(`/api/housing-units/${housingUnitId}/plan`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload connection plan');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      toast.success('Connection plan uploaded successfully');
      queryClient.invalidateQueries({
        queryKey: ['housing-unit-plan', variables.housingUnitId],
      });
    },
    onError: (error: Error) => {
      console.error('Upload connection plan error:', error);
      toast.error(`Failed to upload connection plan: ${error.message}`);
    },
  });
}

/**
 * Delete connection plan from a specific housing unit
 */
export function useDeleteHousingUnitPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (housingUnitId: string) => {
      console.log(`🗑️ Deleting connection plan for housing unit ${housingUnitId}`);

      const response = await fetch(`/api/housing-units/${housingUnitId}/plan`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete connection plan');
      }

      return response.json();
    },
    onSuccess: (_, housingUnitId) => {
      toast.success('Connection plan deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['housing-unit-plan', housingUnitId],
      });
    },
    onError: (error: Error) => {
      console.error('Delete connection plan error:', error);
      toast.error(`Failed to delete connection plan: ${error.message}`);
    },
  });
}
