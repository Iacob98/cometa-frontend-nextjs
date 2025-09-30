import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { suppliersApi } from "@/lib/api-client";
import { supplierKeys } from "./query-keys";
import type { Supplier } from "@/lib/api-client";

// Supplier Query Hooks
export function useSuppliers() {
  return useQuery({
    queryKey: supplierKeys.lists(),
    queryFn: () => suppliersApi.getSuppliers(),
    staleTime: 10 * 60 * 1000, // 10 minutes - suppliers change less frequently
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: supplierKeys.detail(id),
    queryFn: () => suppliersApi.getSupplier(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// Supplier Mutation Hooks
export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Supplier>) => suppliersApi.createSupplier(data),
    onSuccess: (newSupplier) => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      queryClient.setQueryData(supplierKeys.detail(newSupplier.id), newSupplier);
      toast.success("Supplier created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create supplier: ${error.message}`);
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Supplier> }) =>
      suppliersApi.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      toast.success("Supplier updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update supplier: ${error.message}`);
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => suppliersApi.deleteSupplier(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: supplierKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: supplierKeys.lists() });
      toast.success("Supplier deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete supplier: ${error.message}`);
    },
  });
}