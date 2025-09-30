import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialOrdersApi } from "@/lib/api-client";
import { orderKeys, materialKeys } from "./query-keys";
import type { OrderFilters, MaterialOrder, MaterialOrderStatus } from "@/lib/api-client";

// Order Query Hooks
export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: orderKeys.list(filters || {}),
    queryFn: () => materialOrdersApi.getOrders(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => materialOrdersApi.getOrder(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
}

// Order Mutation Hooks
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<MaterialOrder>) => materialOrdersApi.createOrder(data),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);
      toast.success("Order created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create order: ${error.message}`);
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MaterialOrderStatus }) =>
      materialOrdersApi.updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

      // If order is delivered, update material stock levels
      if (updatedOrder.status === "delivered") {
        queryClient.invalidateQueries({ queryKey: materialKeys.lists() });
        queryClient.invalidateQueries({ queryKey: materialKeys.lowStock() });
      }

      toast.success("Order status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update order status: ${error.message}`);
    },
  });
}

// Specialized Order Hooks
export function usePendingOrders() {
  return useOrders({ status: "pending" });
}

export function useSupplierOrders(supplierId: string) {
  return useOrders({ supplier_id: supplierId });
}