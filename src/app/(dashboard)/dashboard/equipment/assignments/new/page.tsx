"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Calendar, Users, Wrench, Building2, Truck } from "lucide-react"
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

// Validation schema for crew-based equipment/vehicle assignment
const assignmentFormSchema = z.object({
  equipment_id: z.string().optional(),
  vehicle_id: z.string().optional(),
  crew_id: z.string().min(1, "Выбор бригады обязателен"), // Now required - crew-based logic
  project_id: z.string().optional(), // Optional - will be auto-assigned when crew joins project
  assignment_type: z.enum(['equipment', 'vehicle']),
  from_ts: z.string().min(1, "Дата начала обязательна"),
  to_ts: z.string().optional(),
  is_permanent: z.boolean().default(false),
  rental_cost_per_day: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
}).refine((data) => {
  // Either equipment_id or vehicle_id must be provided based on assignment_type
  if (data.assignment_type === 'equipment' && !data.equipment_id) {
    return false;
  }
  if (data.assignment_type === 'vehicle' && !data.vehicle_id) {
    return false;
  }
  return true;
}, {
  message: "Выбор ресурса обязателен",
  path: ['equipment_id']
})

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

interface Equipment {
  id: string
  name: string
  type: string
  inventory_no?: string
  status: string
}

interface Vehicle {
  id: string
  brand: string
  model: string
  plate_number: string
  type: string
  status: string
}

interface Project {
  id: string
  name: string
  customer: string
  status: string
}

interface Crew {
  id: string
  name: string
  project_id?: string
  project_name?: string
}

export default function NewEquipmentAssignmentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [crews, setCrews] = useState<Crew[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize form
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      equipment_id: "",
      vehicle_id: "",
      crew_id: "",
      project_id: "",
      assignment_type: "equipment" as const,
      from_ts: "",
      to_ts: "",
      is_permanent: false,
    },
  })

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Load equipment (only available)
        const equipmentResponse = await fetch('/api/equipment')
        const equipmentData = await equipmentResponse.json()
        const equipmentItems = Array.isArray(equipmentData.items) ? equipmentData.items :
                              Array.isArray(equipmentData) ? equipmentData : []
        const availableEquipment = equipmentItems.filter((eq: Equipment) =>
          eq.status === 'available'
        )
        setEquipment(availableEquipment)

        // Load vehicles (only available)
        const vehiclesResponse = await fetch('/api/vehicles')
        const vehiclesData = await vehiclesResponse.json()
        const vehicleItems = Array.isArray(vehiclesData.vehicles) ? vehiclesData.vehicles :
                           Array.isArray(vehiclesData.items) ? vehiclesData.items :
                           Array.isArray(vehiclesData) ? vehiclesData : []
        const availableVehicles = vehicleItems.filter((veh: Vehicle) =>
          veh.status === 'available'
        )
        setVehicles(availableVehicles)

        // Load projects (only active)
        const projectsResponse = await fetch('/api/projects?status=active')
        const projectsData = await projectsResponse.json()
        const projectItems = Array.isArray(projectsData.items) ? projectsData.items :
                           Array.isArray(projectsData) ? projectsData : []
        setProjects(projectItems)

        // Load crews (only active)
        const crewsResponse = await fetch('/api/crews')
        const crewsData = await crewsResponse.json()
        const crewItems = Array.isArray(crewsData.crews) ? crewsData.crews :
                         Array.isArray(crewsData.items) ? crewsData.items :
                         Array.isArray(crewsData) ? crewsData : []
        const activeCrews = crewItems.filter((crew: any) =>
          crew.status === 'active'
        )
        setCrews(activeCrews)

      } catch (error) {
        console.error('Failed to load data:', error)
        toast.error('Не удалось загрузить данные формы')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Form submission handler
  async function onSubmit(values: AssignmentFormValues) {
    setIsSubmitting(true)

    try {
      // Determine the API endpoint based on assignment type
      const isVehicleAssignment = values.assignment_type === 'vehicle'
      const endpoint = isVehicleAssignment ? '/api/resources/vehicle-assignments' : '/api/equipment/assignments'

      // Transform form values to API format
      const assignmentData = isVehicleAssignment ? {
        // Vehicle assignment format for /api/resources/vehicle-assignments
        vehicle_id: values.vehicle_id,
        crew_id: values.crew_id,
        project_id: values.project_id || undefined,
        from_ts: values.from_ts,
        to_ts: values.to_ts || undefined,
        is_permanent: values.is_permanent || false,
        rental_cost_per_day: values.rental_cost_per_day,
      } : {
        // Equipment assignment format for /api/equipment/assignments
        resource_type: 'equipment',
        equipment_id: values.equipment_id,
        crew_id: values.crew_id,
        project_id: values.project_id || undefined,
        assigned_at: values.from_ts,
        returned_at: values.to_ts || undefined,
        daily_rental_cost: values.rental_cost_per_day,
        notes: `Assignment created via form. Permanent: ${values.is_permanent ? 'Yes' : 'No'}`,
      }

      // Submit to appropriate API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `Не удалось создать назначение ${values.assignment_type === 'vehicle' ? 'транспорта' : 'оборудования'}`)
      }

      const result = await response.json()

      toast.success(`Назначение ${values.assignment_type === 'vehicle' ? 'транспорта' : 'оборудования'} успешно создано!`)

      // Navigate back to equipment page with assignments tab
      router.push('/dashboard/equipment?tab=assignments')

    } catch (error) {
      console.error('Assignment creation error:', error)
      toast.error(error instanceof Error ? error.message : "Не удалось создать назначение")
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
            <h1 className="text-2xl font-bold tracking-tight">Создать назначение ресурса</h1>
            <p className="text-muted-foreground">
              Назначьте оборудование или транспорт бригадам для работы на проекте
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <div className="max-w-4xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Детали назначения
                </CardTitle>
                <CardDescription>
                  Назначайте оборудование или транспорт бригадам. Проекты будут автоматически назначены при присоединении бригады.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assignment Type Selection */}
                  <FormField
                    control={form.control}
                    name="assignment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Тип ресурса *</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value)
                          // Clear resource selection when type changes
                          form.setValue('equipment_id', '')
                          form.setValue('vehicle_id', '')
                        }} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите тип ресурса" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="equipment">
                              <div className="flex items-center">
                                <Wrench className="h-4 w-4 mr-2" />
                                <span>Оборудование</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="vehicle">
                              <div className="flex items-center">
                                <Truck className="h-4 w-4 mr-2" />
                                <span>Транспорт</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Выберите, назначить оборудование или транспорт
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Equipment Selection (conditionally shown) */}
                  {form.watch('assignment_type') === 'equipment' && (
                    <FormField
                      control={form.control}
                      name="equipment_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Оборудование *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите оборудование" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {equipment.map((eq) => (
                                <SelectItem key={eq.id} value={eq.id}>
                                  <div className="flex items-center">
                                    <Wrench className="h-4 w-4 mr-2" />
                                    <span>{eq.name}</span>
                                    {eq.inventory_no && (
                                      <span className="text-muted-foreground ml-2">
                                        ({eq.inventory_no})
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Показано только доступное оборудование
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Vehicle Selection (conditionally shown) */}
                  {form.watch('assignment_type') === 'vehicle' && (
                    <FormField
                      control={form.control}
                      name="vehicle_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Транспорт *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите транспорт" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {vehicles.map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                  <div className="flex items-center">
                                    <Truck className="h-4 w-4 mr-2" />
                                    <span>{vehicle.brand} {vehicle.model}</span>
                                    <span className="text-muted-foreground ml-2">
                                      ({vehicle.plate_number})
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Показан только доступный транспорт
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Crew Selection (Required) */}
                  <FormField
                    control={form.control}
                    name="crew_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Бригада *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите бригаду" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {crews.map((crew) => (
                              <SelectItem key={crew.id} value={crew.id}>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-2" />
                                  <span>{crew.name}</span>
                                  {crew.project_name && (
                                    <span className="text-muted-foreground ml-2">
                                      (Проект: {crew.project_name})
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Ресурсы сначала назначаются бригадам, затем автоматически проектам при присоединении бригад
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Project Selection (Optional) */}
                  <FormField
                    control={form.control}
                    name="project_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Проект (необязательно)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите проект (необязательно)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                <div className="flex items-center">
                                  <Building2 className="h-4 w-4 mr-2" />
                                  <span>{project.name}</span>
                                  <span className="text-muted-foreground ml-2">
                                    ({project.customer})
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Прямое назначение на проект (будет автоматически назначено при присоединении бригады к проекту)
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
                          Дневная стоимость для этого назначения (необязательно)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Start Date */}
                  <FormField
                    control={form.control}
                    name="from_ts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Дата и время начала *</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Когда начинается назначение
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                          Когда заканчивается назначение (оставьте пустым для бессрочного)
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
                    Создание назначения...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Создать назначение {form.watch('assignment_type') === 'vehicle' ? 'транспорта' : 'оборудования'}
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