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
  brand: z.string().min(1, "Brand is required").max(100, "Brand must be less than 100 characters"),
  model: z.string().min(1, "Model is required").max(100, "Model must be less than 100 characters"),
  plate_number: z.string()
    .min(1, "Plate number is required")
    .max(20, "Plate number must be less than 20 characters"),
  type: z.enum(["pkw", "lkw", "transporter", "pritsche", "anhänger", "excavator", "other"], {
    required_error: "Vehicle type is required",
  }),
  status: z.enum(["available", "in_use", "maintenance", "broken"], {
    required_error: "Status is required",
  }),
  owned: z.boolean().default(true),
  rental_price_per_day_eur: z.number().min(0, "Rental price per day must be 0 or greater").default(0),
  rental_price_per_hour_eur: z.number().min(0, "Rental price per hour must be 0 or greater").default(0),
  fuel_consumption_l_100km: z.number().min(0, "Fuel consumption must be 0 or greater").default(0),
  current_location: z.string().max(200, "Location must be less than 200 characters").default("Main Depot"),
  purchase_price_eur: z.number().min(0, "Purchase price must be 0 or greater").default(0),
  tipper_type: z.enum(["Kipper", "kein Kipper"], {
    required_error: "Tipper type is required",
  }).default("kein Kipper"),
  max_weight_kg: z.number().min(0, "Max weight must be 0 or greater").max(100000, "Max weight must be less than 100,000 kg").optional().nullable(),
  comment: z.string().max(500, "Comment must be less than 500 characters").optional().nullable(),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

const vehicleTypes = [
  { value: "pkw", label: "PKW (Passenger car)" },
  { value: "lkw", label: "LKW (Truck)" },
  { value: "transporter", label: "Transporter (Van)" },
  { value: "pritsche", label: "Pritsche (Flatbed)" },
  { value: "anhänger", label: "Anhänger (Trailer)" },
  { value: "excavator", label: "Excavator" },
  { value: "other", label: "Other" },
];

const vehicleStatuses = [
  { value: "available", label: "Available" },
  { value: "in_use", label: "In Use" },
  { value: "maintenance", label: "Maintenance" },
  { value: "broken", label: "Broken" },
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
      fuel_consumption_l_100km: 0,
      current_location: "Main Depot",
      purchase_price_eur: 0,
      tipper_type: "kein Kipper",
      max_weight_kg: null,
      comment: null,
      year_of_manufacture: undefined,
      mileage_km: undefined,
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

      // Navigate back to equipment page on success
      router.push("/dashboard/equipment");
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
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add New Vehicle</h1>
            <p className="text-muted-foreground">
              Add a new vehicle to your fleet with all necessary details
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
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Enter the basic details about the vehicle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mercedes, Ford, Toyota" {...field} />
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
                      <FormLabel>Model *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Sprinter, Transit, Hilux" {...field} />
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
                      <FormLabel>Plate Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., ABC-123, XYZ 456"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        License plate number (will be converted to uppercase)
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
                      <FormLabel>Vehicle Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
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
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
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
                      <FormLabel>Current Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Main Depot, Project Site A" {...field} />
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
                      <FormLabel>Year of Manufacture</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 2020"
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
                      <FormLabel>Mileage (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 50000"
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
                name="fuel_consumption_l_100km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Consumption (L/100km)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 8.5"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Fuel consumption in liters per 100 kilometers
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
                      <FormLabel>Tipper Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tipper type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Kipper">Kipper</SelectItem>
                          <SelectItem value="kein Kipper">kein Kipper</SelectItem>
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
                      <FormLabel>Max Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 3500"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum weight capacity in kilograms
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
                    <FormLabel>Comment</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Additional notes or comments"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>
                Ownership and pricing details for the vehicle
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
                        Company Owned Vehicle
                      </FormLabel>
                      <FormDescription>
                        Check if this vehicle is owned by the company (uncheck for rental vehicles)
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
                      <FormLabel>Purchase Price (EUR)</FormLabel>
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
                        {owned ? "Purchase price for owned vehicle" : "Not applicable for rental vehicles"}
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
                      <FormLabel>Rental Price per Day (EUR)</FormLabel>
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
                        {owned ? "Internal cost per day for project allocation" : "External rental cost per day"}
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
                    <FormLabel>Rental Price per Hour (EUR)</FormLabel>
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
                      {owned ? "Internal hourly cost for project allocation" : "External rental cost per hour"}
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
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Vehicle...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Vehicle
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}