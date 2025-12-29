"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2, Package, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { useCreateMaterialOrderWithBudget } from "@/hooks/use-material-orders";
import { useProjects } from "@/hooks/use-projects";
import { useSuppliers } from "@/hooks/use-suppliers";
import { useSupplierMaterials } from "@/hooks/use-suppliers";
import type { CreateMaterialOrderRequest } from "@/types";

const createOrderSchema = z.object({
  destination_type: z.enum(["project", "warehouse"], {
    required_error: "Тип назначения обязателен",
  }).default("warehouse"),
  project_id: z.string().optional(),
  warehouse_location: z.string().optional(),
  supplier_id: z.string().min(1, "Поставщик обязателен"),
  expected_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  deduct_from_budget: z.boolean().default(false),
  items: z.array(z.object({
    material_id: z.string().min(1, "Материал обязателен"),
    quantity: z.coerce.number().positive("Количество должно быть положительным"),
    unit_cost: z.coerce.number().positive("Цена за единицу должна быть положительной").optional(),
  })).min(1, "Требуется хотя бы одна позиция"),
}).refine((data) => {
  if (data.destination_type === "project" && !data.project_id) {
    return false;
  }
  if (data.destination_type === "warehouse" && !data.warehouse_location) {
    return false;
  }
  return true;
}, {
  message: "Пожалуйста, выберите назначение",
  path: ["project_id"],
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

export default function OrderMaterialsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('project_id') || '';

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');

  const createOrder = useCreateMaterialOrderWithBudget();
  const { data: projectsResponse } = useProjects();
  const { data: suppliersResponse } = useSuppliers();
  const { data: supplierMaterials = [] } = useSupplierMaterials(selectedSupplierId);

  const projects = projectsResponse?.items || [];
  const suppliers = suppliersResponse || [];

  const form = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      destination_type: "warehouse",
      project_id: initialProjectId,
      warehouse_location: "",
      supplier_id: "",
      expected_delivery_date: "",
      notes: "",
      deduct_from_budget: false,
      items: [{ material_id: "", quantity: 1, unit_cost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedSupplierId = form.watch("supplier_id");

  // Update selected supplier when form changes
  if (watchedSupplierId !== selectedSupplierId) {
    setSelectedSupplierId(watchedSupplierId);
    // Clear existing items when supplier changes
    if (selectedSupplierId && watchedSupplierId !== selectedSupplierId) {
      form.setValue("items", [{ material_id: "", quantity: 1, unit_cost: 0 }]);
    }
  }

  const handleCreateOrder = async (data: CreateOrderFormData) => {
    try {
      // Create separate orders for each item since API expects one material per order
      for (const item of data.items) {
        const orderData: CreateMaterialOrderRequest & { deduct_from_budget?: boolean } = {
          project_id: data.destination_type === "project" ? data.project_id : undefined,
          supplier_material_id: item.material_id,
          quantity: item.quantity,
          unit_price_eur: item.unit_cost || undefined,
          expected_delivery_date: data.expected_delivery_date || undefined,
          notes: data.destination_type === "warehouse"
            ? `СКЛАД: ${data.warehouse_location || 'Основной склад'}${data.notes ? ` | ${data.notes}` : ''}`
            : data.notes || undefined,
          deduct_from_budget: data.destination_type === "project" ? data.deduct_from_budget : false,
        };

        await createOrder.mutateAsync(orderData);
      }

      router.push("/dashboard/materials");
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  const addItem = () => {
    append({ material_id: "", quantity: 1, unit_cost: 0 });
  };

  const calculateTotal = () => {
    const items = form.getValues("items");
    return items.reduce((total, item) => {
      return total + (item.quantity * (item.unit_cost || 0));
    }, 0);
  };

  const selectedProject = projects.find(p => p.id === form.watch("project_id"));
  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Назад</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Заказать материалы</h1>
            <p className="text-muted-foreground">
              Создать заказ материалов для доставки на проект или склад
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Детали заказа</span>
              </CardTitle>
              <CardDescription>
                Выберите назначение, поставщика и материалы для заказа
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateOrder)} className="space-y-6">
                  {/* Destination Type Selection */}
                  <FormField
                    control={form.control}
                    name="destination_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Назначение поставки *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите назначение" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="warehouse">Склад</SelectItem>
                            <SelectItem value="project">Конкретный проект</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Выберите, куда доставить материалы: на общий склад или на конкретный проект
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Project and Supplier Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {form.watch("destination_type") === "project" && (
                      <FormField
                        control={form.control}
                        name="project_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Проект *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите проект" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {projects.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch("destination_type") === "warehouse" && (
                      <FormField
                        control={form.control}
                        name="warehouse_location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Адрес склада *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Введите адрес склада (например: Основной склад)"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Укажите адрес или название склада для доставки
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}


                    <FormField
                      control={form.control}
                      name="supplier_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Поставщик *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите поставщика" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {suppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.org_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expected_delivery_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ожидаемая дата доставки</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Materials List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Материалы</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addItem}
                        disabled={!selectedSupplierId}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Добавить позицию
                      </Button>
                    </div>

                    {!selectedSupplierId && (
                      <div className="text-center py-8 text-muted-foreground">
                        Выберите поставщика для добавления материалов
                      </div>
                    )}

                    {selectedSupplierId && supplierMaterials.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        У этого поставщика нет доступных материалов
                      </div>
                    )}

                    {selectedSupplierId && supplierMaterials.length > 0 && (
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Материал</TableHead>
                              <TableHead>Количество</TableHead>
                              <TableHead>Цена за ед. (€)</TableHead>
                              <TableHead>Сумма (€)</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fields.map((field, index) => {
                              const selectedMaterial = supplierMaterials.find(
                                m => m.id === form.watch(`items.${index}.material_id`)
                              );
                              const quantity = form.watch(`items.${index}.quantity`) || 0;
                              const unitCost = form.watch(`items.${index}.unit_cost`) || selectedMaterial?.unit_price || 0;
                              const total = quantity * unitCost;

                              return (
                                <TableRow key={field.id}>
                                  <TableCell>
                                    <FormField
                                      control={form.control}
                                      name={`items.${index}.material_id`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <Select onValueChange={(value) => {
                                            field.onChange(value);
                                            // Auto-fill unit cost from supplier material
                                            const material = supplierMaterials.find(m => m.id === value);
                                            if (material) {
                                              form.setValue(`items.${index}.unit_cost`, material.unit_price);
                                            }
                                          }} value={field.value}>
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Выберите материал" />
                                              </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                              {supplierMaterials.map((material) => (
                                                <SelectItem key={material.id} value={material.id}>
                                                  <div className="flex flex-col">
                                                    <span>{material.material?.name || material.material_name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                      €{material.unit_price}/{material.material?.unit || material.material_unit}
                                                    </span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    {selectedMaterial && (
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        Ед.: {selectedMaterial.unit}
                                        {selectedMaterial.min_order_quantity > 1 && (
                                          <span className="ml-1">
                                            (Мин.: {selectedMaterial.min_order_quantity})
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <FormField
                                      control={form.control}
                                      name={`items.${index}.quantity`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              step="0.001"
                                              min={selectedMaterial?.min_order_quantity || 1}
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <FormField
                                      control={form.control}
                                      name={`items.${index}.unit_cost`}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <Input
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              {...field}
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-medium">
                                      €{total.toFixed(2)}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {fields.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => remove(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Примечания</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Дополнительные примечания к заказу..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Budget Deduction - Only for project orders */}
                  {form.watch("destination_type") === "project" && (
                    <FormField
                      control={form.control}
                      name="deduct_from_budget"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Автоматически списать с бюджета проекта
                            </FormLabel>
                            <FormDescription>
                              Если включено, стоимость заказа будет автоматически списана с бюджета проекта как расходная операция. Вы можете управлять этим вручную позже, если отключено.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      disabled={createOrder.isPending}
                    >
                      {createOrder.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                      ) : (
                        <Package className="mr-2 h-4 w-4" />
                      )}
                      Создать заказ
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Сводка заказа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedProject && (
                <div>
                  <h4 className="font-medium text-sm">Проект</h4>
                  <p className="text-sm text-muted-foreground">{selectedProject.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedProject.customer}</p>
                </div>
              )}

              {selectedSupplier && (
                <div>
                  <h4 className="font-medium text-sm">Поставщик</h4>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.org_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedSupplier.contact_person}</p>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Общая стоимость</span>
                  <span className="text-lg font-bold">€{calculateTotal().toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Без учёта стоимости доставки
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Help */}
          <Card>
            <CardHeader>
              <CardTitle>Информация о заказе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium">Процесс заказа</h4>
                <p className="text-muted-foreground">
                  Заказы создаются со статусом «Ожидает» и могут отслеживаться до доставки
                </p>
              </div>
              <div>
                <h4 className="font-medium">Затраты</h4>
                <p className="text-muted-foreground">
                  Стоимость заказа будет автоматически списана с бюджета проекта
                </p>
              </div>
              <div>
                <h4 className="font-medium">Доставка</h4>
                <p className="text-muted-foreground">
                  Уточните у поставщика стоимость доставки и минимальные требования к заказу
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}