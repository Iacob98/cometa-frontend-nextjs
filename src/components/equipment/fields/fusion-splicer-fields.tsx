"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cable } from "lucide-react";

interface FusionSplicerFieldsProps {
  form: UseFormReturn<any>;
}

export function FusionSplicerFields({ form }: FusionSplicerFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Cable className="h-5 w-5 mr-2" />
            <CardTitle>Fusion Splicer Specifications</CardTitle>
          </div>
          <Badge variant="secondary">Calibration Required</Badge>
        </div>
        <CardDescription>
          Fiber optic welding and splicing equipment specifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Last Calibration Date - Required */}
          <FormField
            control={form.control}
            name="type_details.last_calibration_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Calibration Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>Required for compliance</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Maintenance Interval (days) */}
          <FormField
            control={form.control}
            name="type_details.maintenance_interval_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maintenance Interval (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="365"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Auto-calculates next calibration due date</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Splice Count */}
          <FormField
            control={form.control}
            name="type_details.splice_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Splice Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Current splice counter (auto-updated later)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Firmware Version */}
          <FormField
            control={form.control}
            name="type_details.firmware_version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Firmware Version</FormLabel>
                <FormControl>
                  <Input placeholder="v3.1.2" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Battery Health (%) */}
          <FormField
            control={form.control}
            name="type_details.battery_health_percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Battery Health (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="100"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>0-100%</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="type_details.arc_calibration_done"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Arc Calibration Done</FormLabel>
                  <FormDescription>Mark when arc calibration is completed</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type_details.core_alignment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Core Alignment Capable</FormLabel>
                  <FormDescription>Device supports core alignment</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
