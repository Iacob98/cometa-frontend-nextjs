"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Radio } from "lucide-react";

interface OTDRFieldsProps {
  form: UseFormReturn<any>;
}

export function OTDRFields({ form }: OTDRFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Radio className="h-5 w-5 mr-2" />
          OTDR Specifications
        </CardTitle>
        <CardDescription>
          Optical Time Domain Reflectometer specifications
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
                <FormDescription>Default: 12 months</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dynamic Range (dB) */}
          <FormField
            control={form.control}
            name="type_details.dynamic_range_db"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dynamic Range (dB)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="35.0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Measurement capacity</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fiber Type */}
          <FormField
            control={form.control}
            name="type_details.fiber_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fiber Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fiber type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Singlemode">Singlemode</SelectItem>
                    <SelectItem value="Multimode">Multimode</SelectItem>
                    <SelectItem value="OM3">OM3</SelectItem>
                    <SelectItem value="OM4">OM4</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Connector Type */}
          <FormField
            control={form.control}
            name="type_details.connector_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connector Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select connector" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="LC">LC</SelectItem>
                    <SelectItem value="FC">FC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Input placeholder="v2.5.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* GPS Enabled */}
        <FormField
          control={form.control}
          name="type_details.gps_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>GPS Enabled</FormLabel>
                <FormDescription>Device has GPS capability</FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Wavelengths Note */}
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Wavelengths (1310nm, 1550nm, 1625nm) can be configured after equipment creation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
