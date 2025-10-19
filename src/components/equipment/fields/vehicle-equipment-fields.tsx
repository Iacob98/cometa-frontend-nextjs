"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

interface VehicleEquipmentFieldsProps {
  form: UseFormReturn<any>;
}

export function VehicleEquipmentFields({ form }: VehicleEquipmentFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="h-5 w-5 mr-2" />
          Vehicle / Transport Equipment
        </CardTitle>
        <CardDescription>
          Company vans, trailers, lifts, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* License Plate - Required */}
          <FormField
            control={form.control}
            name="type_details.license_plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate *</FormLabel>
                <FormControl>
                  <Input placeholder="ABC-1234" {...field} />
                </FormControl>
                <FormDescription>Required for vehicles</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* VIN */}
          <FormField
            control={form.control}
            name="type_details.vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>VIN</FormLabel>
                <FormControl>
                  <Input placeholder="Vehicle Identification Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mileage (km) */}
          <FormField
            control={form.control}
            name="type_details.mileage_km"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mileage (km)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="50000"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Latest odometer reading</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fuel Type */}
          <FormField
            control={form.control}
            name="type_details.fuel_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Gasoline">Gasoline</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Emission Class */}
          <FormField
            control={form.control}
            name="type_details.emission_class"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emission Class</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Euro 6" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Service Interval (km) */}
          <FormField
            control={form.control}
            name="type_details.service_interval_km"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Interval (km)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10000"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>e.g., every 10,000 km</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Insurance Expiry */}
          <FormField
            control={form.control}
            name="type_details.insurance_expiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Expiry</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>For alerts</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Inspection Date (TÜV) */}
          <FormField
            control={form.control}
            name="type_details.inspection_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inspection Date (TÜV)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>For compliance</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* GPS Tracker ID */}
          <FormField
            control={form.control}
            name="type_details.gps_tracker_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GPS Tracker ID</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
