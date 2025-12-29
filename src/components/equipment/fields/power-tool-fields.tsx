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
          Характеристики электроинструмента
        </CardTitle>
        <CardDescription>
          Спецификации для дрелей, шлифовальных машин, пил, компрессоров и т.д.
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
                <FormLabel>Мощность (Вт) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1200"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Номинальное потребление энергии в ваттах</FormDescription>
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
                <FormLabel>Напряжение (В)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="230"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Номинальное напряжение</FormDescription>
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
                <FormLabel>Тип аккумулятора</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип аккумулятора" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Li-ion">Li-ion</SelectItem>
                    <SelectItem value="NiMH">NiMH</SelectItem>
                    <SelectItem value="NiCd">NiCd</SelectItem>
                    <SelectItem value="Corded">Сетевой (без аккумулятора)</SelectItem>
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
                <FormLabel>Обороты/мин</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="3000"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Обороты в минуту</FormDescription>
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
                <FormLabel>Степень защиты IP</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите степень защиты" />
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
                <FormDescription>Степень защиты от пыли и воды</FormDescription>
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
                <FormLabel>Вес (кг)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Физический вес</FormDescription>
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
                <FormLabel>Тип инструмента</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип инструмента" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Drill">Дрель</SelectItem>
                    <SelectItem value="Angle Grinder">Болгарка</SelectItem>
                    <SelectItem value="Circular Saw">Дисковая пила</SelectItem>
                    <SelectItem value="Impact Driver">Ударный гайковёрт</SelectItem>
                    <SelectItem value="Rotary Hammer">Перфоратор</SelectItem>
                    <SelectItem value="Compressor">Компрессор</SelectItem>
                    <SelectItem value="Other">Другое</SelectItem>
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
                <FormLabel>Интервал проверки (дней)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="365"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>Для проверок соответствия DGUV</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
