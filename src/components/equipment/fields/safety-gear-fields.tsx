"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface SafetyGearFieldsProps {
  form: UseFormReturn<any>;
}

export function SafetyGearFields({ form }: SafetyGearFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Safety Gear Specifications
        </CardTitle>
        <CardDescription>
          Helmets, harnesses, gloves, reflective vests, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Next Inspection Date - Required */}
          <FormField
            control={form.control}
            name="type_details.next_inspection_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Inspection Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Required for safety compliance</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Inspection Interval (months) */}
          <FormField
            control={form.control}
            name="type_details.inspection_interval_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inspection Interval (months)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="6"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>e.g., 6 months for harnesses</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Size */}
          <FormField
            control={form.control}
            name="type_details.size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <Input placeholder="M, L, XL, etc." {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Certification */}
          <FormField
            control={form.control}
            name="type_details.certification"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Certification</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., EN 361:2002" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>Safety standard certification</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expiration Date */}
          <FormField
            control={form.control}
            name="type_details.expiration_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expiration Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>If shelf life limited</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color */}
          <FormField
            control={form.control}
            name="type_details.color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <Input placeholder="Yellow, Orange, etc." {...field} value={field.value ?? ''} />
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
