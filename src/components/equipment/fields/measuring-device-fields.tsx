"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Ruler } from "lucide-react";

interface MeasuringDeviceFieldsProps {
  form: UseFormReturn<any>;
}

export function MeasuringDeviceFields({ form }: MeasuringDeviceFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Ruler className="h-5 w-5 mr-2" />
          Measuring Device Specifications
        </CardTitle>
        <CardDescription>
          Laser meters, multimeters, thermometers, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calibration Date - Required */}
          <FormField
            control={form.control}
            name="type_details.calibration_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calibration Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Required for measurement accuracy</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Calibration Interval (months) */}
          <FormField
            control={form.control}
            name="type_details.calibration_interval_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calibration Interval (months)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="12"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Auto-calculates next calibration</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Measurement Type */}
          <FormField
            control={form.control}
            name="type_details.measurement_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select measurement type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Length">Length</SelectItem>
                    <SelectItem value="Voltage">Voltage</SelectItem>
                    <SelectItem value="Temperature">Temperature</SelectItem>
                    <SelectItem value="Current">Current</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Range */}
          <FormField
            control={form.control}
            name="type_details.range_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Range</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 0-100m, 0-600V" {...field} />
                </FormControl>
                <FormDescription>Measurement range</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Accuracy */}
          <FormField
            control={form.control}
            name="type_details.accuracy_rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accuracy</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ±2%" {...field} />
                </FormControl>
                <FormDescription>Accuracy rating</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Battery Type */}
          <FormField
            control={form.control}
            name="type_details.battery_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Battery Type</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 9V, AA, Li-ion" {...field} />
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
