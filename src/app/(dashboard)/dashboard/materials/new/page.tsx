"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, X, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useCreateMaterial } from "@/hooks/use-materials";
import type { MaterialUnit } from "@/types";

const createMaterialSchema = z.object({
  name: z.string().min(1, "Название материала обязательно"),
  description: z.string().optional(),
  unit: z.string().min(1, "Единица измерения обязательна"),
  sku: z.string().optional(),
  default_price_eur: z.coerce.number().min(0, "Цена должна быть неотрицательной").optional(),
  purchase_price_eur: z.coerce.number().min(0, "Закупочная цена должна быть неотрицательной").optional(),
  initial_stock: z.coerce.number().min(0, "Начальный запас должен быть неотрицательным").optional(),
  min_stock_level: z.coerce.number().min(0, "Минимальный уровень должен быть неотрицательным").optional(),
});

type CreateMaterialFormData = z.infer<typeof createMaterialSchema>;

const materialUnits: { value: MaterialUnit; label: string }[] = [
  { value: "pcs", label: "Штуки (шт.)" },
  { value: "m", label: "Метры (м)" },
  { value: "m2", label: "Квадратные метры (м²)" },
  { value: "kg", label: "Килограммы (кг)" },
  { value: "t", label: "Тонны (т)" },
  { value: "l", label: "Литры (л)" },
  { value: "m3", label: "Кубические метры (м³)" },
  { value: "roll", label: "Рулоны" },
  { value: "other", label: "Другое" },
];

export default function NewMaterialPage() {
  const router = useRouter();
  const createMaterial = useCreateMaterial();

  const form = useForm<CreateMaterialFormData>({
    resolver: zodResolver(createMaterialSchema),
    defaultValues: {
      name: "",
      description: "",
      unit: "",
      sku: "",
      default_price_eur: 0,
      purchase_price_eur: 0,
      initial_stock: 0,
      min_stock_level: 0,
    },
  });

  const handleCreateMaterial = async (data: CreateMaterialFormData) => {
    try {
      await createMaterial.mutateAsync(data);
      router.push("/dashboard/materials");
    } catch (error) {
      console.error("Failed to create material:", error);
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
            <h1 className="text-3xl font-bold tracking-tight">Создать новый материал</h1>
            <p className="text-muted-foreground">
              Добавить новый материал в систему учёта
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
                <span>Информация о материале</span>
              </CardTitle>
              <CardDescription>
                Введите основную информацию о новом материале
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateMaterial)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Название материала *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="напр., Одномодовый оптоволоконный кабель 12-жильный"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Артикул</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="напр., FOC-SM-12"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Складской учётный номер (необязательно)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Единица измерения *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите единицу" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {materialUnits.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
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
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Описание</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Подробное описание материала, характеристики и т.д."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-4">Ценообразование</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="purchase_price_eur"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Закупочная цена (EUR)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Себестоимость от поставщика
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="default_price_eur"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Цена продажи (EUR)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Цена продажи по умолчанию
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-lg font-medium mb-4">Склад</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="initial_stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Начальный запас</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Начальное количество на складе
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="min_stock_level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Минимальный уровень запаса</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  placeholder="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Предупреждение при падении запаса ниже этого уровня
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

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
                      disabled={createMaterial.isPending}
                    >
                      {createMaterial.isPending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Создать материал
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Полезные советы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium">Название материала</h4>
                <p className="text-muted-foreground">
                  Используйте описательные названия с ключевыми характеристиками, напр. «Одномодовый оптоволоконный кабель 12-жильный»
                </p>
              </div>
              <div>
                <h4 className="font-medium">Артикул</h4>
                <p className="text-muted-foreground">
                  Создайте уникальные идентификаторы для удобного отслеживания и заказа
                </p>
              </div>
              <div>
                <h4 className="font-medium">Единицы измерения</h4>
                <p className="text-muted-foreground">
                  Выберите наиболее подходящую единицу для закупок и учёта расхода
                </p>
              </div>
              <div>
                <h4 className="font-medium">Цены</h4>
                <p className="text-muted-foreground">
                  Закупочная цена помогает отслеживать затраты, цена продажи используется для смет проектов
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Категории</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground">
                Материалы автоматически категоризируются по названиям:
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>• Кабели — оптоволокно, медь</li>
                <li>• Коннекторы — SC, LC, муфты</li>
                <li>• Инструменты — монтажное оборудование</li>
                <li>• Каналы — трубы, лотки</li>
                <li>• Оборудование — аппаратные устройства</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}