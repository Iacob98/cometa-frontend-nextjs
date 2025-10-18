"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Loader2, Calendar, DollarSign, Wrench, Truck } from "lucide-react"
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

// Validation schema using Zod with Context7 best practices
// Updated to match existing API schema
const equipmentFormSchema = z.object({
  name: z.string().min(2, {
    message: "Equipment name must be at least 2 characters.",
  }).max(100, {
    message: "Equipment name must not exceed 100 characters.",
  }),
  type: z.enum(['machine', 'tool', 'measuring_device']),
  inventory_no: z.string().optional(),
  owned: z.boolean().default(true),
  status: z.enum(['available', 'in_use', 'maintenance', 'broken']).default('available'),
  current_location: z.string().max(200, "Location must be less than 200 characters").optional(),
  rental_cost_per_day: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
})

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>

// Equipment type options for select (matching existing API)
const equipmentTypeOptions = [
  { value: 'machine', label: 'Machine', icon: <Wrench className="h-4 w-4" /> },
  { value: 'tool', label: 'Tool', icon: <Wrench className="h-4 w-4" /> },
  { value: 'measuring_device', label: 'Measuring Device', icon: <Wrench className="h-4 w-4" /> },
]

const equipmentStatusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'in_use', label: 'In Use' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'broken', label: 'Broken/Out of Service' },
]


export default function NewEquipmentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Form submission handler
  async function onSubmit(values: EquipmentFormValues) {
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

      // Submit to API
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(equipmentData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create equipment')
      }

      const result = await response.json()

      toast.success("Equipment created successfully!")

      // Navigate back to equipment list
      router.push('/dashboard/equipment')

    } catch (error) {
      console.error('Equipment creation error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to create equipment")
    } finally {
      setIsSubmitting(false)
    }
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
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Equipment</h1>
            <p className="text-muted-foreground">
              Create a new equipment or vehicle entry for your fleet management
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
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="financial">Financial Details</TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Wrench className="h-5 w-5 mr-2" />
                      Equipment Details
                    </CardTitle>
                    <CardDescription>
                      Enter the basic information about the equipment
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
                            <FormLabel>Equipment Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Hydraulic Excavator CAT 320" {...field} />
                            </FormControl>
                            <FormDescription>
                              A descriptive name for the equipment
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
                            <FormLabel>Equipment Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select equipment type" />
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
                              Select the type of equipment
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
                            <FormLabel>Inventory Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. EQ-001, TOOL-123" {...field} />
                            </FormControl>
                            <FormDescription>
                              Unique identifier for tracking
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
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
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
                              Current operational status
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
                            <FormLabel>Current Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Main Depot, Project Site A" {...field} />
                            </FormControl>
                            <FormDescription>
                              Where the equipment is currently located
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
                                Company Owned Equipment
                              </FormLabel>
                              <FormDescription>
                                Check if this equipment is owned by the company (vs. rented)
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Equipment specifications, technical details, capabilities..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Technical specifications and static details about the equipment
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
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Operational notes, maintenance reminders, usage notes..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Operational notes, maintenance schedules, or usage reminders
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
                      Financial Information
                    </CardTitle>
                    <CardDescription>
                      Set daily rental rate for the equipment
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
                            <FormLabel>Daily Rental Cost (€)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Cost per day when equipment is rented out
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
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Equipment
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