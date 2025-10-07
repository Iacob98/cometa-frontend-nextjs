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
  material_id: z.string().min(1, "Material is required"),
  project_id: z.string().min(1, "Project is required"),
  quantity_allocated: z.coerce.number().min(0.001, "Quantity must be greater than 0"),
  allocated_date: z.string().min(1, "Allocation date is required"),
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
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Allocate Material</h1>
            <p className="text-muted-foreground">
              Assign materials from inventory to a project
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
                <span>Allocation Details</span>
              </CardTitle>
              <CardDescription>
                Select material and project for allocation
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
                        <FormLabel>Material *</FormLabel>
                        <Select onValueChange={handleMaterialChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select material" />
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
                                        {available.toFixed(2)} {material.unit} available
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
                      <h4 className="font-medium mb-2">Material Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Unit:</span> {material.unit}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Price:</span> €{material.default_price_eur.toFixed(2)}/{material.unit}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Available:</span> {availableQty.toFixed(2)} {material.unit}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Category:</span> {material.category}
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
                        <FormLabel>Quantity to Allocate *</FormLabel>
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
                          Maximum available: {availableQty.toFixed(3)} {material?.unit || 'units'}
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
                        <FormLabel>Project *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project" />
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
                        <FormLabel>Allocation Date *</FormLabel>
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
                        <FormLabel>Notes (optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes about this allocation..."
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
                      Cancel
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
                      Allocate Material
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
                  <span>Allocation Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Material:</span>
                    <span className="text-sm font-medium">{material.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quantity:</span>
                    <span className="text-sm font-medium">{quantity_allocated} {material.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Unit Price:</span>
                    <span className="text-sm font-medium">€{material.default_price_eur.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Cost:</span>
                      <span className="text-sm font-bold">€{totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Stock Impact</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Available:</span>
                      <span>{availableQty.toFixed(2)} {material.unit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">After Allocation:</span>
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
                      <span className="text-sm text-red-800 font-medium">Insufficient Stock</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      The requested quantity exceeds available stock.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium">Material Selection</h4>
                <p className="text-muted-foreground">
                  Only materials with available stock are shown in the dropdown.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Stock Tracking</h4>
                <p className="text-muted-foreground">
                  Allocated materials are automatically reserved and deducted from available stock.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Project Assignment</h4>
                <p className="text-muted-foreground">
                  Materials are allocated to specific projects for better tracking and cost management.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
