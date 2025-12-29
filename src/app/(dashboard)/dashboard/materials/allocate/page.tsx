"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, X, Package, Calculator, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useMaterials } from "@/hooks/use-materials";
import { useProjects } from "@/hooks/use-projects";
import { useCreateAllocation } from "@/hooks/materials/use-material-allocations";

const createAllocationSchema = z.object({
  material_id: z.string().min(1, "Материал обязателен"),
  project_id: z.string().min(1, "Проект обязателен"),
  quantity_allocated: z.coerce.number().min(0.001, "Количество должно быть больше 0"),
  allocated_date: z.string().min(1, "Дата распределения обязательна"),
  notes: z.string().optional(),
});

type CreateAllocationFormData = z.infer<typeof createAllocationSchema>;

export default function MaterialsAllocatePage() {
  const router = useRouter();
  const createAllocation = useCreateAllocation();
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);

  const { data: materialsResponse } = useMaterials({ per_page: 1000 });
  const { data: projectsResponse } = useProjects({ page: 1, per_page: 100 });

  const materials = materialsResponse?.items || [];
  const projects = projectsResponse?.items || [];

  const form = useForm<CreateAllocationFormData>({
    resolver: zodResolver(createAllocationSchema),
    defaultValues: {
      material_id: "",
      project_id: "",
      quantity_allocated: 0,
      allocated_date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const watchedValues = form.watch();
  const { material_id, quantity_allocated } = watchedValues;

  // Find selected material and calculate values
  const material = materials.find((m) => m.id === material_id);
  const availableQty = material ? (material.current_stock_qty - material.reserved_qty) : 0;
  const totalCost = material && quantity_allocated ? quantity_allocated * material.default_price_eur : 0;
  const remainingStock = availableQty - (quantity_allocated || 0);

  const handleMaterialChange = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    setSelectedMaterial(material);
    form.setValue("material_id", materialId);
    form.setValue("quantity_allocated", 0);
  };

  const handleCreateAllocation = async (data: CreateAllocationFormData) => {
    try {
      await createAllocation.mutateAsync({
        material_id: data.material_id,
        project_id: data.project_id,
        quantity_allocated: data.quantity_allocated,
        allocated_date: data.allocated_date,
        notes: data.notes,
        allocated_by: "admin-user", // TODO: Get from auth context
      });
      router.push("/dashboard/materials/inventory?tab=allocations");
    } catch (error) {
      console.error("Failed to create allocation:", error);
    }
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Распределить материал</h1>
            <p className="text-muted-foreground">
              Назначить материалы со склада на проект
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
                <Package className="h-5 w-5" />
                <span>Детали распределения</span>
              </CardTitle>
              <CardDescription>
                Выберите материал и проект для распределения
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateAllocation)} className="space-y-6">
                  {/* Material Selection */}
                  <FormField
                    control={form.control}
                    name="material_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Материал *</FormLabel>
                        <Select onValueChange={handleMaterialChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите материал" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materials
                              .filter((material) => (material.current_stock_qty - material.reserved_qty) > 0)
                              .map((material) => {
                                const available = material.current_stock_qty - material.reserved_qty;
                                return (
                                  <SelectItem key={material.id} value={material.id}>
                                    <div className="flex justify-between items-center w-full">
                                      <span>{material.name}</span>
                                      <span className="text-sm text-muted-foreground ml-2">
                                        {available.toFixed(2)} {material.unit} доступно
                                      </span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Material Info */}
                  {material && (
                    <div className="rounded-lg border p-4 bg-muted/50">
                      <h4 className="font-medium mb-2">Информация о материале</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Единица:</span> {material.unit}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Цена:</span> €{material.default_price_eur.toFixed(2)}/{material.unit}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Доступно:</span> {availableQty.toFixed(2)} {material.unit}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Категория:</span> {material.category}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <FormField
                    control={form.control}
                    name="quantity_allocated"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Количество для распределения *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            max={availableQty}
                            placeholder="0"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Максимум доступно: {availableQty.toFixed(3)} {material?.unit || 'ед.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Project Selection */}
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
                                <div className="flex flex-col">
                                  <span>{project.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {project.city} • {project.status}
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

                  {/* Allocation Date */}
                  <FormField
                    control={form.control}
                    name="allocated_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата распределения *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Примечания (необязательно)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Дополнительные примечания к распределению..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Buttons */}
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAllocation.isPending || !material || quantity_allocated <= 0 || remainingStock < 0}
                    >
                      {createAllocation.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Распределить материал
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calculation Summary */}
          {material && quantity_allocated > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Сводка распределения</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Материал:</span>
                    <span className="text-sm font-medium">{material.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Количество:</span>
                    <span className="text-sm font-medium">{quantity_allocated} {material.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Цена за единицу:</span>
                    <span className="text-sm font-medium">€{material.default_price_eur.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Общая стоимость:</span>
                      <span className="text-sm font-bold">€{totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Влияние на запас</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Сейчас доступно:</span>
                      <span>{availableQty.toFixed(2)} {material.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">После распределения:</span>
                      <span className={remainingStock < 0 ? "text-red-600 font-medium" : ""}>
                        {remainingStock.toFixed(2)} {material.unit}
                      </span>
                    </div>
                  </div>
                </div>

                {remainingStock < 0 && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800 font-medium">Недостаточно запасов</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Запрошенное количество превышает доступный запас.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Полезные советы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium">Выбор материала</h4>
                <p className="text-muted-foreground">
                  В списке отображаются только материалы с доступным запасом.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Отслеживание запасов</h4>
                <p className="text-muted-foreground">
                  Распределённые материалы автоматически резервируются и вычитаются из доступного запаса.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Назначение на проект</h4>
                <p className="text-muted-foreground">
                  Материалы назначаются на конкретные проекты для лучшего отслеживания и управления затратами.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
