"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, Loader2, DollarSign, Car } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

// Vehicle form validation schema
const vehicleFormSchema = z.object({
  brand: z.string().min(1, {
    message: "Brand is required.",
  }).max(100, {
    message: "Brand must not exceed 100 characters.",
  }),
  model: z.string().min(1, {
    message: "Model is required.",
  }).max(100, {
    message: "Model must not exceed 100 characters.",
  }),
  plate_number: z.string().min(1, {
    message: "Plate number is required.",
  }).max(20, {
    message: "Plate number must not exceed 20 characters.",
  }),
  type: z.enum(["pkw", "lkw", "transporter", "pritsche", "anhänger", "excavator", "other"], {
    required_error: "Vehicle type is required",
  }),
  status: z.enum(['available', 'in_use', 'maintenance', 'broken']).default('available'),
  rental_cost_per_day: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  fuel_type: z.enum(['diesel', 'petrol', 'electric', 'hybrid']).default('diesel'),
  year_manufactured: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
  description: z.string().optional(),
  tipper_type: z.enum(["Kipper", "kein Kipper"], {
    required_error: "Tipper type is required",
  }).default("kein Kipper"),
  max_weight_kg: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
  comment: z.string().max(500).optional(),
  // NEW FIELDS - Safety and Capacity
  number_of_seats: z.string().optional().transform((val) => val ? parseInt(val) : undefined),
  has_first_aid_kit: z.boolean().default(false),
  first_aid_kit_expiry_date: z.string().optional(),
})

type VehicleFormValues = z.infer<typeof vehicleFormSchema>

// Vehicle type options
const vehicleTypeOptions = [
  { value: 'pkw', label: 'PKW (Passenger car)', icon: <Car className="h-4 w-4" /> },
  { value: 'lkw', label: 'LKW (Truck)', icon: <Car className="h-4 w-4" /> },
  { value: 'transporter', label: 'Transporter (Van)', icon: <Car className="h-4 w-4" /> },
  { value: 'pritsche', label: 'Pritsche (Flatbed)', icon: <Car className="h-4 w-4" /> },
  { value: 'anhänger', label: 'Anhänger (Trailer)', icon: <Car className="h-4 w-4" /> },
  { value: 'excavator', label: 'Excavator', icon: <Car className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <Car className="h-4 w-4" /> },
]

const vehicleStatusOptions = [
  { value: 'available', label: 'Available' },
  { value: 'in_use', label: 'In Use' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'broken', label: 'Broken/Out of Service' },
]

const fuelTypeOptions = [
  { value: 'diesel', label: 'Diesel' },
  { value: 'petrol', label: 'Petrol/Gasoline' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
]

export default function EditVehiclePage() {
  const router = useRouter()
  const params = useParams()
  const vehicleId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehicle, setVehicle] = useState<any>(null)

  // Initialize form with react-hook-form and zod resolver
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      brand: "",
      model: "",
      plate_number: "",
      type: "transporter",
      status: "available",
      fuel_type: "diesel",
      description: "",
      tipper_type: "kein Kipper",
      max_weight_kg: "",
      comment: "",
      number_of_seats: "",
      has_first_aid_kit: false,
      first_aid_kit_expiry_date: "",
    },
  })

  // Load vehicle data on component mount
  useEffect(() => {
    async function loadVehicle() {
      if (!vehicleId) {
        console.error('No vehicleId provided to edit page')
        toast.error("No vehicle ID provided")
        router.push('/dashboard/equipment')
        return
      }

      console.log('🚗 Loading vehicle with ID:', vehicleId)
      setIsLoading(true)
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`)

        console.log('🚗 API response status:', response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('🚗 API error response:', errorText)

          if (response.status === 404) {
            throw new Error('Vehicle not found')
          } else if (response.status === 500) {
            throw new Error('Server error while loading vehicle')
          } else {
            throw new Error(`Failed to load vehicle (${response.status})`)
          }
        }

        const vehicleData = await response.json()
        console.log('🚗 Loaded vehicle data:', vehicleData)
        setVehicle(vehicleData)

        // Populate form with existing data
        form.reset({
          brand: vehicleData.brand || "",
          model: vehicleData.model || "",
          plate_number: vehicleData.plate_number || "",
          type: vehicleData.type || "transporter",
          status: vehicleData.status || "available",
          rental_cost_per_day: vehicleData.rental_cost_per_day?.toString() || "",
          fuel_type: vehicleData.fuel_type || "diesel",
          year_manufactured: vehicleData.year_manufactured?.toString() || "",
          description: vehicleData.description || "",
          tipper_type: vehicleData.tipper_type || "kein Kipper",
          max_weight_kg: vehicleData.max_weight_kg?.toString() || "",
          comment: vehicleData.comment || "",
          number_of_seats: vehicleData.number_of_seats?.toString() || "",
          has_first_aid_kit: vehicleData.has_first_aid_kit || false,
          first_aid_kit_expiry_date: vehicleData.first_aid_kit_expiry_date || "",
        })

        console.log('🚗 Form populated successfully')

      } catch (error) {
        console.error('🚗 Failed to load vehicle:', error)
        const errorMessage = error instanceof Error ? error.message : "Failed to load vehicle data"
        toast.error(errorMessage)
        router.push('/dashboard/equipment')
      } finally {
        setIsLoading(false)
      }
    }

    loadVehicle()
  }, [vehicleId, form, router])

  // Form submission handler
  async function onSubmit(values: VehicleFormValues) {
    console.log('🚗 Submitting vehicle update:', values)
    setIsSubmitting(true)

    try {
      // Transform form values to API format
      const vehicleData = {
        brand: values.brand,
        model: values.model,
        status: values.status,
        rental_cost_per_day: values.rental_cost_per_day,
        fuel_type: values.fuel_type,
        year_manufactured: values.year_manufactured,
        description: values.description || undefined,
        tipper_type: values.tipper_type,
        max_weight_kg: values.max_weight_kg,
        comment: values.comment || undefined,
        number_of_seats: values.number_of_seats,
        has_first_aid_kit: values.has_first_aid_kit,
        first_aid_kit_expiry_date: values.first_aid_kit_expiry_date || undefined,
      }

      console.log('🚗 Sending vehicle data to API:', vehicleData)

      // Submit to API
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleData),
      })

      console.log('🚗 Update response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('🚗 Update API error response:', errorText)

        let errorMessage = 'Failed to update vehicle'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          errorMessage = `Server error (${response.status}): ${errorText}`
        }

        throw new Error(errorMessage)
      }

      const result = await response.json()
      console.log('🚗 Vehicle updated successfully:', result)

      toast.success("Vehicle updated successfully!")

      // Navigate back to equipment list
      router.push('/dashboard/equipment')

    } catch (error) {
      console.error('🚗 Vehicle update error:', error)
      toast.error(error instanceof Error ? error.message : "Failed to update vehicle")
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
              Back
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
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Vehicle</h1>
            <p className="text-muted-foreground">
              Update information for {vehicle?.brand || ''} {vehicle?.model || ''} ({vehicle?.plate_number || 'this vehicle'})
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
                      <Car className="h-5 w-5 mr-2" />
                      Vehicle Details
                    </CardTitle>
                    <CardDescription>
                      Update the basic information about the vehicle
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Brand */}
                      <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Mercedes, Ford, Volvo" {...field} />
                            </FormControl>
                            <FormDescription>
                              Vehicle manufacturer brand
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Model */}
                      <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Sprinter, Transit, FH16" {...field} />
                            </FormControl>
                            <FormDescription>
                              Vehicle model name
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Plate Number */}
                      <FormField
                        control={form.control}
                        name="plate_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plate Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. ABC-123, DE-FR-789" {...field} />
                            </FormControl>
                            <FormDescription>
                              License plate number
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Vehicle Type */}
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select vehicle type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vehicleTypeOptions.map((option) => (
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
                              Select the type of vehicle
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vehicleStatusOptions.map((option) => (
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

                      {/* Fuel Type */}
                      <FormField
                        control={form.control}
                        name="fuel_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuel Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select fuel type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {fuelTypeOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Type of fuel or power source
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Year Manufactured */}
                      <FormField
                        control={form.control}
                        name="year_manufactured"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year Manufactured</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1990"
                                max={new Date().getFullYear() + 1}
                                placeholder="e.g. 2020"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Year the vehicle was manufactured
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Tipper Type */}
                      <FormField
                        control={form.control}
                        name="tipper_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipper Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select tipper type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Kipper">Kipper</SelectItem>
                                <SelectItem value="kein Kipper">kein Kipper</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Select if vehicle has tipper functionality
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Max Weight */}
                      <FormField
                        control={form.control}
                        name="max_weight_kg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Weight (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100000"
                                placeholder="e.g. 3500"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum weight capacity in kilograms
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Comment */}
                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comment</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Additional notes or comments"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional comments about the vehicle (max 500 characters)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Safety and Capacity Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Number of Seats */}
                      <FormField
                        control={form.control}
                        name="number_of_seats"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Seats</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="e.g., 5"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Passenger capacity of the vehicle
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Has First Aid Kit */}
                      <FormField
                        control={form.control}
                        name="has_first_aid_kit"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-8">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Has First Aid Kit
                              </FormLabel>
                              <FormDescription>
                                Check if this vehicle has a first aid kit
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* First Aid Kit Expiry Date - Only show if has_first_aid_kit is true */}
                    {form.watch("has_first_aid_kit") && (
                      <FormField
                        control={form.control}
                        name="first_aid_kit_expiry_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Aid Kit Expiry Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Expiration date of the first aid kit
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <Separator />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Additional details about the vehicle..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional additional information about the vehicle
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
                      Update rental rates for the vehicle
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Daily Rental Rate */}
                      <FormField
                        control={form.control}
                        name="rental_cost_per_day"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Rental Rate (€)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Rate charged per day when renting to projects
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
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Vehicle
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