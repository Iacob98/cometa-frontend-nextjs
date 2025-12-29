"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Loader2, Calendar, Users, Wrench, Building2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import { useUpdateAssignment } from "@/hooks/use-equipment"

// Validation schema for assignment editing
const editAssignmentSchema = z.object({
  to_ts: z.string().optional(),
  is_permanent: z.boolean().default(false),
  rental_cost_per_day: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
})

type EditAssignmentFormValues = z.infer<typeof editAssignmentSchema>

interface AssignmentDetails {
  id: string
  equipment_id: string
  project_id: string
  cabinet_id?: string
  crew_id?: string
  from_ts: string
  to_ts?: string
  is_permanent: boolean
  rental_cost_per_day: number
  equipment: {
    name: string
    type: string
    inventory_no?: string
  }
  project_name?: string
  crew_name?: string
  is_active: boolean
}

export default function EditAssignmentPage() {
  const router = useRouter()
  const params = useParams()
  const assignmentId = params.id as string

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [assignment, setAssignment] = useState<AssignmentDetails | null>(null)

  const updateAssignmentMutation = useUpdateAssignment()

  // Initialize form
  const form = useForm<EditAssignmentFormValues>({
    resolver: zodResolver(editAssignmentSchema),
    defaultValues: {
      to_ts: "",
      is_permanent: false,
    },
  })

  // Load assignment data
  useEffect(() => {
    const loadAssignment = async () => {
      try {
        setIsLoading(true)

        // Get assignment details from both equipment and vehicle assignments
        let assignmentData = null

        // Try equipment assignments first
        const equipmentResponse = await fetch(`/api/equipment/assignments?assignment_id=${assignmentId}`)
        if (equipmentResponse.ok) {
          const equipmentAssignmentsResponse = await equipmentResponse.json()
          const equipmentAssignments = equipmentAssignmentsResponse.items || equipmentAssignmentsResponse
          assignmentData = equipmentAssignments.find((a: AssignmentDetails) => a.id === assignmentId)
          if (assignmentData) {
            assignmentData.assignment_type = 'equipment'
          }
        }

        // If not found in equipment, try vehicle assignments
        if (!assignmentData) {
          const vehicleResponse = await fetch(`/api/resources/vehicle-assignments`)
          if (vehicleResponse.ok) {
            const vehicleAssignments = await vehicleResponse.json()
            const vehicleAssignmentData = vehicleAssignments.find((a: any) => a.id === assignmentId)
            if (vehicleAssignmentData) {
              // Transform vehicle assignment to match equipment assignment format
              assignmentData = {
                id: vehicleAssignmentData.id,
                assignment_type: 'vehicle',
                equipment_id: vehicleAssignmentData.vehicle_id,
                equipment: vehicleAssignmentData.vehicle ? {
                  name: `${vehicleAssignmentData.vehicle.brand} ${vehicleAssignmentData.vehicle.model}`,
                  type: vehicleAssignmentData.vehicle.type,
                  inventory_no: vehicleAssignmentData.vehicle.plate_number
                } : null,
                crew_id: vehicleAssignmentData.crew_id,
                project_id: vehicleAssignmentData.project_id,
                assigned_at: vehicleAssignmentData.from_ts,
                returned_at: vehicleAssignmentData.to_ts,
                daily_rental_cost: vehicleAssignmentData.rental_cost_per_day,
                notes: vehicleAssignmentData.notes || '',
                crew_name: vehicleAssignmentData.crew?.name,
                project_name: vehicleAssignmentData.project?.name
              }
            }
          }
        }

        if (!assignmentData) {
          throw new Error('Назначение не найдено')
        }

        setAssignment(assignmentData)

        // Set form values
        form.setValue('to_ts', assignmentData.to_ts ? assignmentData.to_ts.slice(0, 16) : '')
        form.setValue('is_permanent', assignmentData.is_permanent)
        form.setValue('rental_cost_per_day', assignmentData.rental_cost_per_day?.toString() || '')

      } catch (error) {
        console.error('Failed to load assignment:', error)
        toast.error('Не удалось загрузить детали назначения')
        router.push('/dashboard/equipment')
      } finally {
        setIsLoading(false)
      }
    }

    if (assignmentId) {
      loadAssignment()
    }
  }, [assignmentId, form, router])

  // Form submission handler
  async function onSubmit(values: EditAssignmentFormValues) {
    if (!assignment) return

    setIsSubmitting(true)

    try {
      // Transform form values to API format
      const updateData = {
        to_ts: values.to_ts || undefined,
        is_permanent: values.is_permanent,
        rental_cost_per_day: values.rental_cost_per_day,
      }

      await updateAssignmentMutation.mutateAsync({
        id: assignmentId,
        data: updateData
      })

      toast.success("Назначение успешно обновлено!")
      router.push('/dashboard/equipment')

    } catch (error) {
      console.error('Assignment update error:', error)
      toast.error(error instanceof Error ? error.message : "Не удалось обновить назначение")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Назначение не найдено</h3>
        <p className="text-muted-foreground">Не удалось загрузить назначение.</p>
        <Button onClick={() => router.push('/dashboard/equipment')} className="mt-4">
          Назад к оборудованию
        </Button>
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
            <h1 className="text-2xl font-bold tracking-tight">Редактировать назначение оборудования</h1>
            <p className="text-muted-foreground">
              Изменить детали назначения для {assignment.equipment?.name || assignment.equipment_name || 'Неизвестный ресурс'}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Assignment Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Информация о назначении
          </CardTitle>
          <CardDescription>
            Текущие детали назначения (только для чтения)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Оборудование</label>
              <div className="flex items-center p-3 bg-muted rounded-md">
                <Wrench className="h-4 w-4 mr-2" />
                <div>
                  <div className="font-medium">{assignment.equipment?.name || assignment.equipment_name || 'Неизвестный ресурс'}</div>
                  {assignment.equipment?.inventory_no && (
                    <div className="text-sm text-muted-foreground">
                      Инвентарный №: {assignment.equipment.inventory_no}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Проект</label>
              <div className="flex items-center p-3 bg-muted rounded-md">
                <Building2 className="h-4 w-4 mr-2" />
                <div className="font-medium">{assignment.project_name || assignment.project_id}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Назначенная бригада</label>
              <div className="flex items-center p-3 bg-muted rounded-md">
                <Users className="h-4 w-4 mr-2" />
                <div className="font-medium">{assignment.crew_name || 'Не назначена'}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Дата начала</label>
              <div className="flex items-center p-3 bg-muted rounded-md">
                <Calendar className="h-4 w-4 mr-2" />
                <div className="font-medium">
                  {new Date(assignment.from_ts).toLocaleString('ru-RU')}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Статус</label>
              <div>
                <Badge className={assignment.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {assignment.is_active ? 'Активно' : 'Неактивно'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <div className="max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Редактирование назначения
                </CardTitle>
                <CardDescription>
                  Изменить дату окончания и стоимость аренды
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* End Date */}
                  <FormField
                    control={form.control}
                    name="to_ts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата и время окончания</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            disabled={form.watch('is_permanent')}
                          />
                        </FormControl>
                        <FormDescription>
                          Когда назначение должно завершиться (оставьте пустым для бессрочного)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Rental Cost */}
                  <FormField
                    control={form.control}
                    name="rental_cost_per_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Стоимость аренды в день (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Дневная стоимость этого назначения
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Permanent Assignment */}
                <FormField
                  control={form.control}
                  name="is_permanent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            if (checked) {
                              form.setValue('to_ts', '')
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Постоянное назначение
                        </FormLabel>
                        <FormDescription>
                          Отметьте, если это постоянное назначение (без даты окончания)
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

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
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Сохранить изменения
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