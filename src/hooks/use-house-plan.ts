import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface HousePlan {
  title: string;
  description?: string;
  plan_type: 'connection_plan' | 'wiring_diagram' | 'technical_drawing' | 'installation_guide' | 'as_built' | 'other';
  filename: string;
  file_size: number;
  file_url: string;
  file_path: string;
  uploaded_at: string;
}

export interface HousePlanResponse {
  house: {
    id: string;
    project_id: string;
    house_number?: string;
    street?: string;
    city?: string;
  };
  plan: HousePlan | null;
}

/**
 * Hook to fetch connection plan for a house
 */
export function useHousePlan(houseId: string) {
  return useQuery<HousePlanResponse>({
    queryKey: ['house-plan', houseId],
    queryFn: async () => {
      const response = await fetch(`/api/houses/${houseId}/plan`);
      if (!response.ok) {
        throw new Error('Failed to fetch house connection plan');
      }
      return response.json();
    },
    enabled: !!houseId,
  });
}

interface UploadHousePlanParams {
  houseId: string;
  title: string;
  description?: string;
  planType: string;
  file: File;
}

/**
 * Hook to upload connection plan for a house
 */
export function useUploadHousePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ houseId, title, description, planType, file }: UploadHousePlanParams) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }
      formData.append('plan_type', planType);

      const response = await fetch(`/api/houses/${houseId}/plan`, {
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
      queryClient.invalidateQueries({ queryKey: ['house-plan', variables.houseId] });
      queryClient.invalidateQueries({ queryKey: ['houses'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload connection plan');
    },
  });
}

/**
 * Hook to delete connection plan for a house
 */
export function useDeleteHousePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (houseId: string) => {
      const response = await fetch(`/api/houses/${houseId}/plan`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete connection plan');
      }

      return response.json();
    },
    onSuccess: (_, houseId) => {
      toast.success('Connection plan deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['house-plan', houseId] });
      queryClient.invalidateQueries({ queryKey: ['houses'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete connection plan');
    },
  });
}
