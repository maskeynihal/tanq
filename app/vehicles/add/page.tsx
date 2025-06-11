"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { createForm } from "@tanstack/react-form"
import { zodValidator } from "@tanstack/zod-form-adapter"
import MainLayout from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { addVehicle } from "@/lib/vehicle-service"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Car, Fuel, FileText, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getSupabaseBrowserClient } from "@/lib/supabase"

// Define the form schema using zod
const vehicleSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Vehicle type is required"),
  distanceUnit: z.enum(["km", "mi"], {
    required_error: "Distance unit is required",
  }),
  fuelUnit: z.enum(["liter", "gallon"], {
    required_error: "Fuel unit is required",
  }),
  fuelCapacity: z.number().optional(),
  fuelType: z.string().optional(),
  hasTwoTanks: z.boolean().default(false),
  isHybrid: z.boolean().default(false),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().positive().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  insurancePolicy: z.string().optional(),
  image: z.string().optional(),
})

type VehicleFormValues = z.infer<typeof vehicleSchema>

export default function AddVehiclePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  // Create the form
  const form = createForm({
    defaultValues: {
      name: "",
      description: "",
      type: "car",
      distanceUnit: "km" as const,
      fuelUnit: "liter" as const,
      fuelCapacity: undefined,
      fuelType: "gasoline",
      hasTwoTanks: false,
      isHybrid: false,
      make: "",
      model: "",
      year: undefined,
      licensePlate: "",
      vin: "",
      insurancePolicy: "",
      image: "",
    },
    onSubmit: async ({ value }) => {
      await handleSubmit(value)
    },
    validatorAdapter: zodValidator,
  })

  const handleSubmit = async (values: VehicleFormValues) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (!user) {
        throw new Error("User not authenticated")
      }

      // First, add to local storage for immediate feedback
      const localVehicle = addVehicle(values)

      // Then, add to Supabase
      const { data, error } = await supabase
        .from("vehicles")
        .insert({
          user_id: user.id,
          name: values.name,
          description: values.description || null,
          type: values.type,
          image: values.image || null,
          distance_unit: values.distanceUnit,
          fuel_unit: values.fuelUnit,
          fuel_capacity: values.fuelCapacity || null,
          fuel_type: values.fuelType || null,
          has_two_tanks: values.hasTwoTanks,
          is_hybrid: values.isHybrid,
          make: values.make || null,
          model: values.model || null,
          year: values.year || null,
          license_plate: values.licensePlate || null,
          vin: values.vin || null,
          insurance_policy: values.insurancePolicy || null,
        })
        .select()

      if (error) {
        console.error("Error adding vehicle to Supabase:", error)
        throw new Error(`Failed to save vehicle: ${error.message}`)
      }

      // Simulate API delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push("/vehicles")
    } catch (error) {
      console.error("Error adding vehicle:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to add vehicle")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <Button variant="ghost" className="mb-2 -ml-3 text-muted-foreground" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to vehicles
            </Button>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Add Vehicle</h1>
            <p className="text-muted-foreground">Add a new vehicle to track its fuel efficiency.</p>
          </div>
        </div>

        {submitError && <div className="bg-destructive/10 text-destructive p-4 rounded-md">{submitError}</div>}

        <form.Provider>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span className="hidden sm:inline">Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="fuel" className="flex items-center gap-2">
                  <Fuel className="h-4 w-4" />
                  <span className="hidden sm:inline">Fuel Details</span>
                </TabsTrigger>
                <TabsTrigger value="additional" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Additional</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Enter the basic details of your vehicle.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <form.Field
                        name="name"
                        validators={{
                          onChange: vehicleSchema.shape.name,
                        }}
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>
                              Vehicle Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value}
                              onChange={(e) => field.handleChange(e.target.value)}
                              onBlur={field.handleBlur}
                              placeholder="My Car"
                              className="h-11"
                            />
                            {field.state.meta.touchedErrors ? (
                              <p className="text-sm text-destructive">{field.state.meta.touchedErrors}</p>
                            ) : null}
                          </div>
                        )}
                      />

                      <form.Field
                        name="type"
                        validators={{
                          onChange: vehicleSchema.shape.type,
                        }}
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>
                              Vehicle Type <span className="text-destructive">*</span>
                            </Label>
                            <Select value={field.state.value} onValueChange={field.handleChange} name={field.name}>
                              <SelectTrigger id={field.name} className="h-11">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="car">Car</SelectItem>
                                <SelectItem value="motorcycle">Motorcycle</SelectItem>
                                <SelectItem value="truck">Truck</SelectItem>
                                <SelectItem value="suv">SUV</SelectItem>
                                <SelectItem value="van">Van</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {field.state.meta.touchedErrors ? (
                              <p className="text-sm text-destructive">{field.state.meta.touchedErrors}</p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>

                    <form.Field
                      name="description"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Description</Label>
                          <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="A brief description of your vehicle"
                            rows={3}
                          />
                        </div>
                      )}
                    />

                    <div className="grid gap-6 md:grid-cols-3">
                      <form.Field
                        name="make"
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>Make</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="Toyota"
                              className="h-11"
                            />
                          </div>
                        )}
                      />

                      <form.Field
                        name="model"
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>Model</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="Corolla"
                              className="h-11"
                            />
                          </div>
                        )}
                      />

                      <form.Field
                        name="year"
                        validators={{
                          onChange: (value) => {
                            if (!value) return
                            const yearNum = Number(value)
                            if (isNaN(yearNum)) return "Year must be a number"
                            if (yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
                              return "Year must be between 1900 and " + (new Date().getFullYear() + 1)
                            }
                          },
                        }}
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>Year</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="number"
                              value={field.state.value || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                field.handleChange(value ? Number(value) : undefined)
                              }}
                              placeholder="2023"
                              className="h-11"
                            />
                            {field.state.meta.touchedErrors ? (
                              <p className="text-sm text-destructive">{field.state.meta.touchedErrors}</p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>

                    <form.Field
                      name="image"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Image URL</Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="h-11"
                          />
                        </div>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="button" onClick={() => document.querySelector('[data-value="fuel"]')?.click()}>
                      Continue to Fuel Details
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="fuel" className="animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle>Fuel Information</CardTitle>
                    <CardDescription>Enter details about the fuel system of your vehicle.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <form.Field
                        name="distanceUnit"
                        validators={{
                          onChange: vehicleSchema.shape.distanceUnit,
                        }}
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>
                              Distance Unit <span className="text-destructive">*</span>
                            </Label>
                            <Select value={field.state.value} onValueChange={field.handleChange} name={field.name}>
                              <SelectTrigger id={field.name} className="h-11">
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="km">Kilometers (km)</SelectItem>
                                <SelectItem value="mi">Miles (mi)</SelectItem>
                              </SelectContent>
                            </Select>
                            {field.state.meta.touchedErrors ? (
                              <p className="text-sm text-destructive">{field.state.meta.touchedErrors}</p>
                            ) : null}
                          </div>
                        )}
                      />

                      <form.Field
                        name="fuelUnit"
                        validators={{
                          onChange: vehicleSchema.shape.fuelUnit,
                        }}
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>
                              Fuel Unit <span className="text-destructive">*</span>
                            </Label>
                            <Select value={field.state.value} onValueChange={field.handleChange} name={field.name}>
                              <SelectTrigger id={field.name} className="h-11">
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="liter">Liters (L)</SelectItem>
                                <SelectItem value="gallon">Gallons (gal)</SelectItem>
                              </SelectContent>
                            </Select>
                            {field.state.meta.touchedErrors ? (
                              <p className="text-sm text-destructive">{field.state.meta.touchedErrors}</p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <form.Field
                        name="fuelType"
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>Fuel Type</Label>
                            <Select
                              value={field.state.value || ""}
                              onValueChange={field.handleChange}
                              name={field.name}
                            >
                              <SelectTrigger id={field.name} className="h-11">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gasoline">Gasoline</SelectItem>
                                <SelectItem value="diesel">Diesel</SelectItem>
                                <SelectItem value="electric">Electric</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      />

                      <form.Field
                        name="fuelCapacity"
                        validators={{
                          onChange: (value) => {
                            if (!value) return
                            const capacityNum = Number(value)
                            if (isNaN(capacityNum)) return "Capacity must be a number"
                            if (capacityNum <= 0) return "Capacity must be positive"
                          },
                        }}
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>Fuel Tank Capacity</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              type="number"
                              step="0.1"
                              value={field.state.value || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                field.handleChange(value ? Number(value) : undefined)
                              }}
                              placeholder="50"
                              className="h-11"
                            />
                            {field.state.meta.touchedErrors ? (
                              <p className="text-sm text-destructive">{field.state.meta.touchedErrors}</p>
                            ) : null}
                          </div>
                        )}
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <form.Field
                        name="hasTwoTanks"
                        children={(field) => (
                          <div className="flex items-center space-x-2 bg-muted/40 p-3 rounded-lg">
                            <Switch id={field.name} checked={field.state.value} onCheckedChange={field.handleChange} />
                            <Label htmlFor={field.name} className="flex-1">
                              Has Two Fuel Tanks
                            </Label>
                          </div>
                        )}
                      />

                      <form.Field
                        name="isHybrid"
                        children={(field) => (
                          <div className="flex items-center space-x-2 bg-muted/40 p-3 rounded-lg">
                            <Switch id={field.name} checked={field.state.value} onCheckedChange={field.handleChange} />
                            <Label htmlFor={field.name} className="flex-1">
                              Is Hybrid Vehicle
                            </Label>
                          </div>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.querySelector('[data-value="basic"]')?.click()}
                    >
                      Back
                    </Button>
                    <Button type="button" onClick={() => document.querySelector('[data-value="additional"]')?.click()}>
                      Continue
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="additional" className="animate-fade-in">
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>Enter additional details about your vehicle (optional).</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <form.Field
                        name="licensePlate"
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>License Plate</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="ABC123"
                              className="h-11"
                            />
                          </div>
                        )}
                      />

                      <form.Field
                        name="vin"
                        children={(field) => (
                          <div className="space-y-2">
                            <Label htmlFor={field.name}>VIN</Label>
                            <Input
                              id={field.name}
                              name={field.name}
                              value={field.state.value || ""}
                              onChange={(e) => field.handleChange(e.target.value)}
                              placeholder="Vehicle Identification Number"
                              className="h-11"
                            />
                          </div>
                        )}
                      />
                    </div>

                    <form.Field
                      name="insurancePolicy"
                      children={(field) => (
                        <div className="space-y-2">
                          <Label htmlFor={field.name}>Insurance Policy</Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value || ""}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Insurance policy number"
                            className="h-11"
                          />
                        </div>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.querySelector('[data-value="fuel"]')?.click()}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Save Vehicle"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </form.Provider>
      </div>
    </MainLayout>
  )
}
