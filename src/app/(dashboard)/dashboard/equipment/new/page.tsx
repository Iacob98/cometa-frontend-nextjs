"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createEquipmentSchema, categoryConfig } from "@/lib/validations/equipment-categories";
import type { CreateEquipmentInput } from "@/lib/validations/equipment-categories";
import type { EquipmentCategory } from "@/types";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CategorySpecificFields } from "@/components/equipment/category-specific-fields";

export default function NewEquipmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | undefined>(undefined);

  const form = useForm<any>({
    resolver: zodResolver(createEquipmentSchema),
    defaultValues: {
      name: "",
      category: undefined,
      inventory_no: "",
      serial_number: "",
      manufacturer: "",
      model: "",
      purchase_date: "",
      purchase_price: undefined,
      ownership: "owned",
      location: "",
      status: "available",
      notes: "",
      type_details: {},
    },
  });

  // Watch category changes
  const watchedCategory = form.watch("category");

  useEffect(() => {
    if (watchedCategory !== selectedCategory) {
      // Category changed - warn user if they have filled type_details
      const typeDetails = form.getValues("type_details");
      const hasTypeDetails = typeDetails && Object.keys(typeDetails).length > 0;

      if (hasTypeDetails && selectedCategory) {
        if (confirm("Das Ändern der Kategorie löscht kategoriespezifische Felder. Fortfahren?")) {
          form.setValue("type_details", {});
          setSelectedCategory(watchedCategory);
        } else {
          form.setValue("category", selectedCategory);
        }
      } else {
        setSelectedCategory(watchedCategory);
      }
    }
  }, [watchedCategory, selectedCategory, form]);

  async function onSubmit(values: any) {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create equipment");
      }

      const result = await response.json();
      toast.success("Ausrüstung erfolgreich erstellt!");
      router.push("/dashboard/equipment");
    } catch (error) {
      console.error("Equipment creation error:", error);
      toast.error(error instanceof Error ? error.message : "Fehler beim Erstellen der Ausrüstung");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Neue Ausrüstung hinzufügen</h1>
            <p className="text-muted-foreground">
              Erstellen Sie einen neuen Ausrüstungseintrag mit kategoriespezifischen Spezifikationen
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <div className="max-w-5xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Category Selection - FIRST */}
            <Card>
              <CardHeader>
                <CardTitle>Ausrüstungskategorie auswählen</CardTitle>
                <CardDescription>
                  Wählen Sie die Kategorie, die diese Ausrüstung am besten beschreibt. Dies bestimmt, welche spezifischen Felder Sie ausfüllen müssen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategorie *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Ausrüstungskategorie auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoryConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex flex-col">
                                <span className="font-medium">{config.label}</span>
                                <span className="text-xs text-muted-foreground">{config.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Wählen Sie den Typ der Ausrüstung, die Sie hinzufügen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCategory && categoryConfig[selectedCategory]?.badge && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{categoryConfig[selectedCategory].badge}</strong> - Dieser Ausrüstungstyp erfordert zusätzliche Compliance-Daten.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Base Equipment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Grundinformationen</CardTitle>
                <CardDescription>Gemeinsame Felder für alle Ausrüstungstypen</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ausrüstungsname *</FormLabel>
                        <FormControl>
                          <Input placeholder="z.B. Hilti TE 60, Fujikura 70S" {...field} />
                        </FormControl>
                        <FormDescription>Lesbarer Name</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Inventory Number */}
                  <FormField
                    control={form.control}
                    name="inventory_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inventarnummer</FormLabel>
                        <FormControl>
                          <Input placeholder="EQ-001" {...field} />
                        </FormControl>
                        <FormDescription>Interne Tracking-Nummer (muss eindeutig sein)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Manufacturer */}
                  <FormField
                    control={form.control}
                    name="manufacturer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hersteller</FormLabel>
                        <FormControl>
                          <Input placeholder="Marke oder Firma" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Model */}
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modell</FormLabel>
                        <FormControl>
                          <Input placeholder="Modellname oder -code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Serial Number */}
                  <FormField
                    control={form.control}
                    name="serial_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seriennummer</FormLabel>
                        <FormControl>
                          <Input placeholder="Seriennummer des Herstellers" {...field} />
                        </FormControl>
                        <FormDescription>Optional für nicht-serielle Artikel</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Purchase Date */}
                  <FormField
                    control={form.control}
                    name="purchase_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kaufdatum</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>Optional, für Kostenverfolgung</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Purchase Price */}
                  <FormField
                    control={form.control}
                    name="purchase_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kaufpreis (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>Optional, gespeichert in EUR</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Ownership */}
                  <FormField
                    control={form.control}
                    name="ownership"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eigentum</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Eigentum auswählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="owned">Eigentum</SelectItem>
                            <SelectItem value="rented">Gemietet</SelectItem>
                            <SelectItem value="leased">Geleast</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Standort</FormLabel>
                        <FormControl>
                          <Input placeholder="Lager, Baustelle oder Fahrzeug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Status auswählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">Verfügbar</SelectItem>
                            <SelectItem value="in_use">In Benutzung</SelectItem>
                            <SelectItem value="maintenance">Wartung</SelectItem>
                            <SelectItem value="out_of_service">Außer Betrieb</SelectItem>
                            <SelectItem value="retired">Ausgemustert</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Standard: verfügbar</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notizen</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Zusätzliche Notizen oder Kommentare" className="min-h-[100px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Category-Specific Fields */}
            <CategorySpecificFields category={selectedCategory} form={form} />

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedCategory}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Ausrüstung erstellen
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
