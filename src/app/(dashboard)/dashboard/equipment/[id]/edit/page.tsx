"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Loader2, DollarSign, Wrench } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

// Using the same validation schema as the new equipment page
const equipmentFormSchema = z.object({
  name: z.string().min(2, {
    message: "Название оборудования должно содержать минимум 2 символа.",
  }).max(100, {
    message: "Название оборудования не должно превышать 100 символов.",
  }),
  type: z.enum(['machine', 'tool', 'measuring_device']),
  inventory_no: z.string().optional(),
  owned: z.boolean().default(true),
  status: z.enum(['available', 'in_use', 'maintenance', 'broken']).default('available'),
  current_location: z.string().max(200, "Местоположение не должно превышать 200 символов").optional(),
  rental_cost_per_day: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  description: z.string().max(1000, "Описание не должно превышать 1000 символов").optional(),
  notes: z.string().max(1000, "Примечания не должны превышать 1000 символов").optional(),
})

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>

// Equipment type options (matching existing API)
const equipmentTypeOptions = [
  { value: 'machine', label: 'Машина', icon: <Wrench className="h-4 w-4" /> },
  { value: 'tool', label: 'Инструмент', icon: <Wrench className="h-4 w-4" /> },
  { value: 'measuring_device', label: 'Измерительный прибор', icon: <Wrench className="h-4 w-4" /> },
]

const equipmentStatusOptions = [
  { value: 'available', label: 'Доступно' },
  { value: 'in_use', label: 'В использовании' },
  { value: 'maintenance', label: 'На обслуживании' },
  { value: 'broken', label: 'Сломано/Не работает' },
]

export default function EditEquipmentPage() {
  const router = useRouter()
  const params = useParams()
  const equipmentId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [equipment, setEquipment] = useState<any>(null)

  // Initialize form with react-hook-form and zod resolver
  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: "",
      type: "tool",
      inventory_no: "",
      owned: true,
      status: "available",
      current_location: "",
      description: "",
      notes: "",
    },
  })

  // Load equipment data on component mount
  useEffect(() => {
    async function loadEquipment() {
      if (!equipmentId) {
        console.error('No equipmentId provided to edit page')
        toast.error("ID оборудования не указан")
        router.push('/dashboard/equipment')
        return
      }

      console.log('🔧 Loading equipment with ID:', equipmentId)
      setIsLoading(true)
      try {
        const response = await fetch(`/api/equipment/${equipmentId}`)

        console.log('🔧 API response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('🔧 API error response:', errorText)

          if (response.status === 404) {
            throw new Error('Оборудование не найдено')
          } else if (response.status === 500) {
            throw new Error('Ошибка сервера при загрузке оборудования')
          } else {
            throw new Error(`Не удалось загрузить оборудование (${response.status})`)
          }
        }

        const equipmentData = await response.json()
        console.log('🔧 Loaded equipment data:', equipmentData)
        setEquipment(equipmentData)

        // Populate form with existing data
        form.reset({
          name: equipmentData.name || "",
          type: equipmentData.type || "tool",
          inventory_no: equipmentData.inventory_no || "",
          owned: equipmentData.owned ?? true,
          status: equipmentData.status || "available",
          current_location: equipmentData.current_location || "",
          rental_cost_per_day: equipmentData.rental_cost_per_day?.toString() || "",
          description: equipmentData.description || "",
          notes: equipmentData.notes || "",
        })

        console.log('🔧 Form populated successfully')

      } catch (error) {
        console.error('🔧 Failed to load equipment:', error)
        const errorMessage = error instanceof Error ? error.message : "Не удалось загрузить данные оборудования"
        toast.error(errorMessage)
        router.push('/dashboard/equipment')
      } finally {
        setIsLoading(false)
      }
    }

    loadEquipment()
  }, [equipmentId, form, router])

  // Form submission handler
  async function onSubmit(values: EquipmentFormValues) {
    console.log('🔧 Submitting equipment update:', values)
    setIsSubmitting(true)

    try {
      // Transform form values to API format (matching existing API)
      const equipmentData = {
        name: values.name,
        type: values.type,
        inventory_no: values.inventory_no || undefined,
        owned: values.owned,
        status: values.status,
        current_location: values.current_location || undefined,
        rental_cost_per_day: values.rental_cost_per_day,
        description: values.description || undefined,
        notes: values.notes || undefined,
      }

      console.log('🔧 Sending equipment data to API:', equipmentData)

      // Submit to API
      const response = await fetch(`/api/equipment/${equipmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      })

      console.log('🔧 Update response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🔧 Update API error response:', errorText)

        let errorMessage = 'Не удалось обновить оборудование'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          errorMessage = `Ошибка сервера (${response.status}): ${errorText}`
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('🔧 Equipment updated successfully:', result)

      toast.success("Оборудование успешно обновлено!")

      // Navigate back to equipment list
      router.push('/dashboard/equipment')

    } catch (error) {
      console.error('🔧 Equipment update error:', error)
      toast.error(error instanceof Error ? error.message : "Не удалось обновить оборудование")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>

        <Separator />

        {/* Loading Skeleton */}
        <div className="max-w-4xl space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Редактировать оборудование</h1>
            <p className="text-muted-foreground">
              Обновить информацию для {equipment?.name || 'этого оборудования'}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <div className="max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Основная информация</TabsTrigger>
                <TabsTrigger value="financial">Финансовая информация</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wrench className="h-5 w-5 mr-2" />
                      Детали оборудования
                    </CardTitle>
                    <CardDescription>
                      Обновите основную информацию об оборудовании
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Equipment Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Название оборудования *</FormLabel>
                            <FormControl>
                              <Input placeholder="напр. Гидравлический экскаватор CAT 320" {...field} />
                            </FormControl>
                            <FormDescription>
                              Описательное название оборудования
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Equipment Type */}
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Тип оборудования *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите тип оборудования" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {equipmentTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center">
                                      {option.icon}
                                      <span className="ml-2">{option.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Выберите тип оборудования
                            </FormDescription>
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
                            <FormLabel>Инвентарный номер</FormLabel>
                            <FormControl>
                              <Input placeholder="напр. EQ-001, TOOL-123" {...field} />
                            </FormControl>
                            <FormDescription>
                              Уникальный идентификатор для отслеживания
                            </FormDescription>
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
                            <FormLabel>Статус</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите статус" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {equipmentStatusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Текущий рабочий статус
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Current Location */}
                      <FormField
                        control={form.control}
                        name="current_location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Текущее местоположение</FormLabel>
                            <FormControl>
                              <Input placeholder="напр. Главный склад, Объект А" {...field} />
                            </FormControl>
                            <FormDescription>
                              Где сейчас находится оборудование
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Owned */}
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
                                Собственное оборудование компании
                              </FormLabel>
                              <FormDescription>
                                Отметьте, если оборудование принадлежит компании (не арендованное)
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Описание</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Спецификации оборудования, технические детали, возможности..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Технические характеристики и постоянные данные об оборудовании
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Notes */}
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Примечания</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Операционные заметки, напоминания об обслуживании, заметки об использовании..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Операционные заметки, графики обслуживания или напоминания
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </CardContent>
                </Card>
              </TabsContent>

              {/* Financial Details Tab */}
              <TabsContent value="financial" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Финансовая информация
                    </CardTitle>
                    <CardDescription>
                      Обновите дневную ставку аренды оборудования
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Daily Rental Cost */}
                      <FormField
                        control={form.control}
                        name="rental_cost_per_day"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Дневная стоимость аренды (€)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Стоимость в день при сдаче оборудования в аренду
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Обновление...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Обновить оборудование
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}