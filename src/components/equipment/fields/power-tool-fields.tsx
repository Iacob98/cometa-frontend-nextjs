"use client";

import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

interface PowerToolFieldsProps {
  form: UseFormReturn<any>;
}

export function PowerToolFields({ form }: PowerToolFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          Power Tool Specifications
        </CardTitle>
        <CardDescription>
          Specifications for drills, grinders, saws, compressors, etc.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Power (W) - Required */}
          <FormField
            control={form.control}
            name="type_details.power_watts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Power (W) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1200"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Nominal power consumption in watts</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Voltage (V) */}
          <FormField
            control={form.control}
            name="type_details.voltage_volts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voltage (V)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="230"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Rated voltage</FormDescription>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select battery type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Li-ion">Li-ion</SelectItem>
                    <SelectItem value="NiMH">NiMH</SelectItem>
                    <SelectItem value="NiCd">NiCd</SelectItem>
                    <SelectItem value="Corded">Corded (No Battery)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* RPM */}
          <FormField
            control={form.control}
            name="type_details.rpm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RPM</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="3000"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Revolutions per minute</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* IP Rating */}
          <FormField
            control={form.control}
            name="type_details.ip_rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IP Rating</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select IP rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="IP20">IP20</SelectItem>
                    <SelectItem value="IP54">IP54</SelectItem>
                    <SelectItem value="IP65">IP65</SelectItem>
                    <SelectItem value="IP67">IP67</SelectItem>
                    <SelectItem value="IP68">IP68</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Dust and water protection rating</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Weight (kg) */}
          <FormField
            control={form.control}
            name="type_details.weight_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Physical weight</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tool Type */}
          <FormField
            control={form.control}
            name="type_details.tool_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tool Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tool type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Drill">Drill</SelectItem>
                    <SelectItem value="Angle Grinder">Angle Grinder</SelectItem>
                    <SelectItem value="Circular Saw">Circular Saw</SelectItem>
                    <SelectItem value="Impact Driver">Impact Driver</SelectItem>
                    <SelectItem value="Rotary Hammer">Rotary Hammer</SelectItem>
                    <SelectItem value="Compressor">Compressor</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Inspection Interval (days) */}
          <FormField
            control={form.control}
            name="type_details.inspection_interval_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Inspection Interval (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="365"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>For DGUV compliance checks</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
