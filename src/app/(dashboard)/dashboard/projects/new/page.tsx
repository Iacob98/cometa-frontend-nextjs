"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, ArrowLeft, Save, Building2, Plus, X, Users, Layers } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useCreateProject } from "@/hooks/use-projects";
import { useProjectManagers } from "@/hooks/use-users";
import { requireAuth } from "@/lib/auth";
import type { CreateProjectRequest, Language } from "@/types";

// Soil type options
const SOIL_TYPES = [
  { value: "sand", label: "Песок" },
  { value: "clay", label: "Глина" },
  { value: "gravel", label: "Гравий" },
  { value: "soil", label: "Земля" },
  { value: "rock", label: "Камень" },
  { value: "asphalt", label: "Асфальт" },
  { value: "concrete", label: "Бетон" },
  { value: "paving_stone", label: "Брусчатка" },
  { value: "mixed", label: "Смешанный" },
  { value: "other", label: "Другое" },
] as const;

// Validation schema
const soilTypeSchema = z.object({
  soil_type_name: z.string().min(1, "Тип грунта обязателен"),
  price_per_meter: z.coerce.number().min(0.01, "Цена должна быть больше 0"),
  quantity_meters: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const contactSchema = z.object({
  first_name: z.string().min(1, "Имя обязательно"),
  last_name: z.string().min(1, "Фамилия обязательна"),
  department: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Неверный формат email").optional().or(z.literal("")),
  position: z.string().optional(),
  notes: z.string().optional(),
});

const createProjectSchema = z.object({
  name: z.string().min(1, "Название проекта обязательно").max(255, "Название слишком длинное"),
  customer: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  contact_24h: z.string().optional(),
  start_date: z.string().optional(),
  end_date_plan: z.string().optional(),
  language_default: z.enum(["ru", "en", "de", "uz", "tr"]),
  pm_user_id: z.string().optional(),
  soil_types: z.array(soilTypeSchema).default([]),
  contacts: z.array(contactSchema).default([]),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export default function NewProjectPage() {
  // Require authentication
  requireAuth();

  const router = useRouter();
  const createProject = useCreateProject();
  const { data: projectManagers, isLoading: isLoadingPMs } = useProjectManagers();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      customer: "",
      city: "",
      address: "",
      contact_24h: "",
      start_date: "",
      end_date_plan: "",
      language_default: "de", // Default to German
      pm_user_id: "none",
      soil_types: [],
      contacts: [],
    },
  });

  // Field arrays for dynamic soil types and contacts
  const {
    fields: soilTypeFields,
    append: appendSoilType,
    remove: removeSoilType,
  } = useFieldArray({
    control: form.control,
    name: "soil_types",
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      const projectData: CreateProjectRequest = {
        ...data,
        start_date: data.start_date || undefined,
        end_date_plan: data.end_date_plan || undefined,
        pm_user_id: data.pm_user_id === "none" || !data.pm_user_id ? undefined : data.pm_user_id,
      };

      const newProject = await createProject.mutateAsync(projectData);

      // Create soil types if any
      if (data.soil_types && data.soil_types.length > 0) {
        await Promise.all(
          data.soil_types.map((soilType) =>
            fetch(`/api/projects/${newProject.id}/soil-types`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(soilType),
            })
          )
        );
      }

      // Create contacts if any
      if (data.contacts && data.contacts.length > 0) {
        await Promise.all(
          data.contacts.map((contact) =>
            fetch(`/api/projects/${newProject.id}/contacts`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(contact),
            })
          )
        );
      }

      router.push(`/dashboard/projects/${newProject.id}`);
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to create project:", error);
    }
  };

  const languages: { value: Language; label: string }[] = [
    { value: "de", label: "Немецкий (Deutsch)" },
    { value: "en", label: "Английский (English)" },
    { value: "ru", label: "Русский" },
    { value: "uz", label: "Узбекский (Oʻzbek)" },
    { value: "tr", label: "Турецкий (Türkçe)" },
  ];

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
            <h1 className="text-3xl font-bold tracking-tight">Создать проект</h1>
            <p className="text-muted-foreground">
              Настройка нового проекта по прокладке оптоволокна
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Основная информация</span>
                </CardTitle>
                <CardDescription>
                  Введите основные данные о проекте
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название проекта *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="напр., Прокладка оптоволокна Берлин Район 1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Понятное, описательное название проекта
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Заказчик</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="напр., Deutsche Telekom"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Город</FormLabel>
                        <FormControl>
                          <Input placeholder="напр., Берлин" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Адрес проекта</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="напр., Hauptstraße 123, 10115 Berlin"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Основной адрес или район выполнения работ
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_24h"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Экстренный контакт 24ч</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="напр., +49 30 12345678"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Контактный номер для экстренных ситуаций
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language_default"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Язык по умолчанию</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите язык проекта" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Основной язык документации и интерфейса проекта
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pm_user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Менеджер проекта</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите менеджера (необязательно)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Менеджер не назначен</SelectItem>
                          {isLoadingPMs ? (
                            <SelectItem value="loading" disabled>
                              Загрузка менеджеров...
                            </SelectItem>
                          ) : (
                            projectManagers?.items?.map((pm) => (
                              <SelectItem key={pm.id} value={pm.id}>
                                {pm.first_name} {pm.last_name} ({pm.email})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Выберите менеджера для управления проектом
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Soil Types Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="h-5 w-5" />
                  <span>Типы грунта (необязательно)</span>
                </CardTitle>
                <CardDescription>
                  Укажите типы грунта с ценой за метр для проекта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {soilTypeFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Тип грунта #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSoilType(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`soil_types.${index}.soil_type_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Тип грунта *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите тип грунта" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SOIL_TYPES.map((soilType) => (
                                  <SelectItem key={soilType.value} value={soilType.label}>
                                    {soilType.label}
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
                        name={`soil_types.${index}.price_per_meter`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Цена за метр (€) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="напр., 12.50"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`soil_types.${index}.quantity_meters`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Количество (метры)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="напр., 500"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`soil_types.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Заметки</FormLabel>
                            <FormControl>
                              <Input placeholder="Дополнительные заметки" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendSoilType({
                      soil_type_name: "",
                      price_per_meter: "" as any,
                      quantity_meters: "" as any,
                      notes: "",
                    })
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить тип грунта
                </Button>
              </CardContent>
            </Card>

            {/* Contacts Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Контакты проекта (необязательно)</span>
                </CardTitle>
                <CardDescription>
                  Добавьте ключевые контакты для проекта
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Контакт #{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.first_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Имя *</FormLabel>
                            <FormControl>
                              <Input placeholder="напр., Иван" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`contacts.${index}.last_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Фамилия *</FormLabel>
                            <FormControl>
                              <Input placeholder="напр., Петров" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.department`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Отдел</FormLabel>
                            <FormControl>
                              <Input placeholder="напр., Инженерный" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`contacts.${index}.phone`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Телефон</FormLabel>
                            <FormControl>
                              <Input placeholder="напр., +49 30 12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`contacts.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="напр., ivan.petrov@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`contacts.${index}.position`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Должность</FormLabel>
                            <FormControl>
                              <Input placeholder="напр., Координатор проекта" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendContact({
                      first_name: "",
                      last_name: "",
                      department: "",
                      phone: "",
                      email: "",
                      position: "",
                      notes: "",
                    })
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить контакт
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Сроки проекта</span>
                </CardTitle>
                <CardDescription>
                  Укажите планируемые даты начала и окончания (необязательно)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Планируемая дата начала</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date_plan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Планируемая дата окончания</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={createProject.isPending}
                className="flex items-center space-x-2"
              >
                {createProject.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Создать проект</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}