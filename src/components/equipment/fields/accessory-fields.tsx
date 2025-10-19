"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface AccessoryFieldsProps {
  form: UseFormReturn<any>;
}

export function AccessoryFields({ form }: AccessoryFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Accessory / Component Specifications
        </CardTitle>
        <CardDescription>
          Cases, batteries, cables, replacement parts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Part Number */}
          <FormField
            control={form.control}
            name="type_details.part_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Part Number</FormLabel>
                <FormControl>
                  <Input placeholder="Manufacturer's part number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity in Set */}
          <FormField
            control={form.control}
            name="type_details.quantity_in_set"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity in Set</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Number of items in the set</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Replacement Cycle (months) */}
          <FormField
            control={form.control}
            name="type_details.replacement_cycle_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Replacement Cycle (months)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="12"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Recommended replacement interval</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Compatible Models Note */}
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Compatible equipment models can be configured after creation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
