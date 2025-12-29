"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Car, Save, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import { useCreateVehicle } from "@/hooks/use-vehicles";

const vehicleFormSchema = z.object({
  brand: z.string().min(1, "Марка обязательна").max(100, "Марка должна быть менее 100 символов"),
  model: z.string().min(1, "Модель обязательна").max(100, "Модель должна быть менее 100 символов"),
  plate_number: z.string()
    .min(1, "Гос. номер обязателен")
    .max(20, "Гос. номер должен быть менее 20 символов"),
  type: z.enum(["pkw", "lkw", "transporter", "pritsche", "anhänger", "excavator", "other"], {
    required_error: "Тип транспорта обязателен",
  }),
  status: z.enum(["available", "in_use", "maintenance", "broken"], {
    required_error: "Статус обязателен",
  }),
  owned: z.boolean().default(true),
  rental_price_per_day_eur: z.number().min(0, "Стоимость аренды в день должна быть 0 или больше").default(0),
  rental_price_per_hour_eur: z.number().min(0, "Стоимость аренды в час должна быть 0 или больше").default(0),
  fuel_consumption_per_100km: z.number().min(0, "Расход топлива должен быть 0 или больше").optional().nullable(),
  current_location: z.string().max(200, "Местоположение должно быть менее 200 символов").default("Главное депо"),
  purchase_price_eur: z.number().min(0, "Цена покупки должна быть 0 или больше").default(0),
  tipper_type: z.enum(["Kipper", "kein Kipper"], {
    required_error: "Тип самосвала обязателен",
  }).default("kein Kipper"),
  max_weight_kg: z.number().min(0, "Макс. вес должен быть 0 или больше").max(100000, "Макс. вес должен быть менее 100 000 кг").optional().nullable(),
  comment: z.string().max(500, "Комментарий должен быть менее 500 символов").optional().nullable(),
  number_of_seats: z.number().int("Количество мест должно быть целым числом").min(0, "Количество мест должно быть 0 или больше").max(100, "Количество мест должно быть менее 100").optional().nullable(),
  has_first_aid_kit: z.boolean().default(false),
  first_aid_kit_expiry_date: z.string().optional().nullable(),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

const vehicleTypes = [
  { value: "pkw", label: "Легковой автомобиль" },
  { value: "lkw", label: "Грузовик" },
  { value: "transporter", label: "Фургон" },
  { value: "pritsche", label: "Бортовой" },
  { value: "anhänger", label: "Прицеп" },
  { value: "excavator", label: "Экскаватор" },
  { value: "other", label: "Другое" },
];

const vehicleStatuses = [
  { value: "available", label: "Доступен" },
  { value: "in_use", label: "В использовании" },
  { value: "maintenance", label: "На обслуживании" },
  { value: "broken", label: "Неисправен" },
];

export default function NewVehiclePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createVehicleMutation = useCreateVehicle();

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      brand: "",
      model: "",
      plate_number: "",
      type: "transporter",
      status: "available",
      owned: true,
      rental_price_per_day_eur: 0,
      rental_price_per_hour_eur: 0,
      fuel_consumption_per_100km: null,
      current_location: "Главное депо",
      purchase_price_eur: 0,
      tipper_type: "kein Kipper",
      max_weight_kg: null,
      comment: null,
      year_of_manufacture: undefined,
      mileage_km: undefined,
      // NEW FIELDS
      number_of_seats: null,
      has_first_aid_kit: false,
      first_aid_kit_expiry_date: null,
    },
  });

  const onSubmit = async (values: VehicleFormValues) => {
    try {
      setIsSubmitting(true);

      // Transform the data to match API expectations
      const vehicleData = {
        ...values,
        plate_number: values.plate_number.toUpperCase().trim(),
      };

      await createVehicleMutation.mutateAsync(vehicleData);

      // Navigate back to vehicles page on success
      router.push("/dashboard/vehicles");
    } catch (error) {
      console.error("Failed to create vehicle:", error);
      // Error handling is done in the mutation hook via toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const owned = form.watch("owned");

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
            <h1 className="text-3xl font-bold tracking-tight">Добавить транспорт</h1>
            <p className="text-muted-foreground">
              Добавьте новый транспорт в автопарк со всеми необходимыми данными
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="h-5 w-5" />
                <span>Основная информация</span>
              </CardTitle>
              <CardDescription>
                Введите основные данные о транспорте
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Марка *</FormLabel>
                      <FormControl>
                        <Input placeholder="напр., Mercedes, Ford, Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Модель *</FormLabel>
                      <FormControl>
                        <Input placeholder="напр., Sprinter, Transit, Hilux" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plate_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Гос. номер *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="напр., ABC-123, XYZ 456"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        Регистрационный номер (будет преобразован в верхний регистр)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип транспорта *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип транспорта" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Статус *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicleStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
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
                  name="current_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Текущее местоположение</FormLabel>
                      <FormControl>
                        <Input placeholder="напр., Главное депо, Объект А" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year_of_manufacture"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Год выпуска</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="напр., 2020"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mileage_km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пробег (км)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="напр., 50000"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="fuel_consumption_per_100km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Расход топлива (л/100км)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="напр., 8.5 (необязательно)"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormDescription>
                      Расход топлива в литрах на 100 километров (необязательно)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipper_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип кузова *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип кузова" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kipper">Самосвал</SelectItem>
                          <SelectItem value="kein Kipper">Не самосвал</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_weight_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Макс. вес (кг)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="напр., 3500"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Максимальная грузоподъёмность в килограммах
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Комментарий</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Дополнительные заметки или комментарии"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="number_of_seats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Количество мест</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="напр., 5"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Пассажировместимость транспорта (необязательно)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="has_first_aid_kit"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Есть аптечка
                        </FormLabel>
                        <FormDescription>
                          Отметьте, если в транспорте есть аптечка
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("has_first_aid_kit") && (
                <FormField
                  control={form.control}
                  name="first_aid_kit_expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Срок годности аптечки</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value || null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Дата окончания срока годности аптечки
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Финансовая информация</CardTitle>
              <CardDescription>
                Информация о владении и стоимости транспорта
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="owned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Собственный транспорт
                      </FormLabel>
                      <FormDescription>
                        Отметьте, если транспорт принадлежит компании (снимите для арендованного)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purchase_price_eur"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цена покупки (EUR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        {owned ? "Цена покупки собственного транспорта" : "Не применимо для арендованного транспорта"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rental_price_per_day_eur"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Стоимость аренды в день (EUR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        {owned ? "Внутренняя стоимость в день для проектов" : "Внешняя стоимость аренды в день"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="rental_price_per_hour_eur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Стоимость аренды в час (EUR)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      {owned ? "Внутренняя почасовая стоимость для проектов" : "Внешняя почасовая стоимость аренды"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Создать транспорт
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}