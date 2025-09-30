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
      // ✅ OPTIMIZED: Мгновенное добавление в кэш

      // 1. Добавить заказ в кэш детали
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);

      // 2. Добавить в списки заказов оптимистично
      queryClient.setQueriesData(
        { queryKey: orderKeys.lists() },
        (oldData: any) => {
          if (!oldData?.orders) return oldData;
          return {
            ...oldData,
            orders: [newOrder, ...oldData.orders],
          };
        }
      );

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
      // ✅ OPTIMIZED: Мгновенное обновление + точечная инвалидация

      // 1. Обновить заказ в кэше детали
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);

      // 2. Обновить заказ в списках
      queryClient.setQueriesData(
        { queryKey: orderKeys.lists() },
        (oldData: any) => {
          if (!oldData?.orders) return oldData;
          return {
            ...oldData,
            orders: oldData.orders.map((o: any) =>
              o.id === updatedOrder.id ? updatedOrder : o
            ),
          };
        }
      );

      // 3. Если заказ доставлен, обновить stock материала
      if (updatedOrder.status === "delivered" && updatedOrder.material_id) {
        // Обновить конкретный материал (увеличить stock)
        queryClient.setQueryData(
          materialKeys.detail(updatedOrder.material_id),
          (oldMaterial: any) => {
            if (!oldMaterial) return oldMaterial;
            return {
              ...oldMaterial,
              available_qty: oldMaterial.available_qty + updatedOrder.quantity,
              total_qty: oldMaterial.total_qty + updatedOrder.quantity,
            };
          }
        );

        // Инвалидировать списки материалов для consistency
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