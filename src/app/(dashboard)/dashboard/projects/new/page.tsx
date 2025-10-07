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
  { value: "sand", label: "Sand (Песок)" },
  { value: "clay", label: "Clay (Глина)" },
  { value: "gravel", label: "Gravel (Гравий)" },
  { value: "soil", label: "Soil (Земля)" },
  { value: "rock", label: "Rock (Камень)" },
  { value: "asphalt", label: "Asphalt (Асфальт)" },
  { value: "concrete", label: "Concrete (Бетон)" },
  { value: "paving_stone", label: "Paving Stone (Брусчатка)" },
  { value: "mixed", label: "Mixed (Смешанный)" },
  { value: "other", label: "Other (Другое)" },
] as const;

// Validation schema
const soilTypeSchema = z.object({
  soil_type_name: z.string().min(1, "Soil type name is required"),
  price_per_meter: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity_meters: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  department: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  position: z.string().optional(),
  notes: z.string().optional(),
});

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255, "Project name too long"),
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
    { value: "de", label: "German (Deutsch)" },
    { value: "en", label: "English" },
    { value: "ru", label: "Russian (Русский)" },
    { value: "uz", label: "Uzbek (Oʻzbek)" },
    { value: "tr", label: "Turkish (Türkçe)" },
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
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
            <p className="text-muted-foreground">
              Set up a new fiber optic construction project
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
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Enter the fundamental details about the project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Fiber Installation Berlin District 1"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A clear, descriptive name for the project
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
                        <FormLabel>Customer</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Deutsche Telekom"
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
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Berlin" {...field} />
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
                      <FormLabel>Project Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Hauptstraße 123, 10115 Berlin"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Primary address or area where the work will be performed
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
                      <FormLabel>24h Emergency Contact</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., +49 30 12345678"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Contact number for emergencies during the project
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
                      <FormLabel>Default Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project language" />
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
                        Primary language used for project documentation and interface
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
                      <FormLabel>Project Manager</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project manager (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No project manager assigned</SelectItem>
                          {isLoadingPMs ? (
                            <SelectItem value="loading" disabled>
                              Loading project managers...
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
                        Choose a project manager to oversee this project
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
                  <span>Soil Types (Optional)</span>
                </CardTitle>
                <CardDescription>
                  Define soil types with pricing per meter for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {soilTypeFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Soil Type #{index + 1}</span>
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
                            <FormLabel>Soil Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select soil type" />
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
                            <FormLabel>Price per Meter (€) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="e.g., 12.50"
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
                            <FormLabel>Quantity (meters)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="e.g., 500"
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
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input placeholder="Additional notes" {...field} value={field.value || ""} />
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
                  Add Soil Type
                </Button>
              </CardContent>
            </Card>

            {/* Contacts Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Project Contacts (Optional)</span>
                </CardTitle>
                <CardDescription>
                  Add key contacts for this project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">Contact #{index + 1}</span>
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
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., John" {...field} />
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
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Smith" {...field} />
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
                            <FormLabel>Department</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Engineering" {...field} />
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
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., +49 30 12345678" {...field} />
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
                              <Input placeholder="e.g., john.smith@example.com" {...field} />
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
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Project Coordinator" {...field} />
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
                  Add Contact
                </Button>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5" />
                  <span>Project Timeline</span>
                </CardTitle>
                <CardDescription>
                  Set the planned start and end dates (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Planned Start Date</FormLabel>
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
                        <FormLabel>Planned End Date</FormLabel>
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
                Cancel
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
                <span>Create Project</span>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}