"use client"

import type React from "react"

import { useState, useEffect, type FormEvent, useRef } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { z } from "zod"
import { motion } from "framer-motion"
import {
  CalendarIcon,
  Car,
  Droplets,
  ArrowLeft,
  DollarSign,
  MapPin,
  StickyNote,
  Check,
  Gauge,
  Route,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getVehicles } from "@/lib/vehicle-service"
import { addLog } from "@/lib/log-service"
import AppShell from "@/components/navigation/app-shell"
import type { Vehicle } from "@/lib/types"
import { cn } from "@/lib/utils"

// Define the form schema using zod
const formSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  date: z.date(),
  time: z.string().optional(),
  isTrip: z.boolean(),
  odometer: z.number().min(0, "Odometer reading must be positive"),
  tripDistance: z.number().optional(),
  fuelAmount: z.number().min(0.1, "Fuel amount must be positive"),
  fuelType: z.string().min(1, "Please select a fuel type"),
  pricePerUnit: z.number().min(0, "Price must be positive"),
  totalCost: z.number(),
  currency: z.string().min(1, "Please select a currency"),
  gasStation: z.string().optional(),
  notes: z.string().optional(),
  images: z.array(z.string()).optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function AddLogPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expandedSections, setExpandedSections] = useState({
    vehicle: true,
    fuel: true,
    additional: true,
  })

  const saveButtonRef = useRef<HTMLButtonElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formValues, setFormValues] = useState<Partial<FormValues>>({
    vehicleId: "",
    date: new Date(),
    time: format(new Date(), "HH:mm"),
    isTrip: false,
    odometer: 0,
    tripDistance: undefined,
    fuelAmount: 0,
    fuelType: "gasoline",
    pricePerUnit: 0,
    totalCost: 0,
    currency: "USD",
    gasStation: "",
    notes: "",
    images: [],
  })

  // Load vehicles on component mount
  useEffect(() => {
    try {
      const loadedVehicles = getVehicles()
      setVehicles(loadedVehicles)

      if (loadedVehicles.length > 0) {
        setSelectedVehicle(loadedVehicles[0])
        setFormValues((prev) => ({ ...prev, vehicleId: loadedVehicles[0].id }))
      }
    } catch (error) {
      console.error("Error loading vehicles:", error)
    }
  }, [])

  // Update selected vehicle when vehicleId changes
  useEffect(() => {
    if (formValues.vehicleId) {
      const vehicle = vehicles.find((v) => v.id === formValues.vehicleId)
      setSelectedVehicle(vehicle || null)
    }
  }, [formValues.vehicleId, vehicles])

  // Calculate total cost when fuel amount or price changes
  useEffect(() => {
    const fuelAmount = formValues.fuelAmount
    const pricePerUnit = formValues.pricePerUnit

    if (fuelAmount != null && pricePerUnit != null) {
      const total = fuelAmount * pricePerUnit
      setFormValues((prev) => ({
        ...prev,
        totalCost: Number.parseFloat(total.toFixed(2)),
      }))
    }
  }, [formValues.fuelAmount, formValues.pricePerUnit])

  // Scroll to first error on validation failure
  useEffect(() => {
    const errorKeys = Object.keys(errors)
    if (errorKeys.length > 0) {
      const firstErrorElement = document.getElementById(`${errorKeys[0]}-error`)
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [errors])

  // Check if save button is overlapping with summary
  useEffect(() => {
    const checkOverlap = () => {
      if (summaryRef.current && saveButtonRef.current) {
        const summaryRect = summaryRef.current.getBoundingClientRect()
        const buttonRect = saveButtonRef.current.getBoundingClientRect()

        // Check if there's overlap
        const isOverlapping = !(
          summaryRect.right < buttonRect.left ||
          summaryRect.left > buttonRect.right ||
          summaryRect.bottom < buttonRect.top ||
          summaryRect.top > buttonRect.bottom
        )

        // Add padding if overlapping
        const paddingBottom = isOverlapping ? `${buttonRect.height + 20}px` : "0px"
        if (summaryRef.current.style.paddingBottom !== paddingBottom) {
          summaryRef.current.style.paddingBottom = paddingBottom
        }
      }
    }

    // Run once after render
    const timeoutId = setTimeout(checkOverlap, 100)

    // Add resize listener
    window.addEventListener("resize", checkOverlap)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("resize", checkOverlap)
    }
  }, [expandedSections])

  // Form field change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    // Handle different input types
    if (type === "number") {
      setFormValues((prev) => ({
        ...prev,
        [name]: value ? Number.parseFloat(value) : undefined,
      }))
    } else {
      setFormValues((prev) => ({ ...prev, [name]: value }))
    }

    // Clear error for this field when it's changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field when it's changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormValues((prev) => ({ ...prev, date }))

      // Clear error for this field when it's changed
      if (errors.date) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.date
          return newErrors
        })
      }
    }
  }

  const handleTimeChange = (time: string) => {
    setFormValues((prev) => ({ ...prev, time }))
  }

  const toggleDistanceType = () => {
    setFormValues((prev) => ({
      ...prev,
      isTrip: !prev.isTrip,
      // Reset the values when switching
      odometer: prev.isTrip ? 0 : undefined,
      tripDistance: !prev.isTrip ? 0 : undefined,
    }))
  }

  const toggleSection = (section: "vehicle" | "fuel" | "additional") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Combine date and time for submission
  const combineDateAndTime = () => {
    if (!formValues.date) return new Date()

    const dateObj = new Date(formValues.date)

    if (formValues.time) {
      const [hours, minutes] = formValues.time.split(":").map(Number)
      dateObj.setHours(hours || 0)
      dateObj.setMinutes(minutes || 0)
    }

    return dateObj
  }

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Combine date and time
      const combinedDateTime = combineDateAndTime()
      const submissionValues = {
        ...formValues,
        date: combinedDateTime.getTime(),
      }

      // Validate form data
      const validationResult = formSchema.safeParse(submissionValues)

      if (!validationResult.success) {
        // Handle validation errors
        const formattedErrors: Record<string, string> = {}
        validationResult.error.errors.forEach((error) => {
          const path = error.path[0].toString()
          formattedErrors[path] = error.message
        })

        setErrors(formattedErrors)
        setIsSubmitting(false)

        // Expand sections with errors
        if (
          Object.keys(formattedErrors).some((key) => ["vehicleId", "date", "odometer", "tripDistance"].includes(key))
        ) {
          setExpandedSections((prev) => ({ ...prev, vehicle: true }))
        }

        if (
          Object.keys(formattedErrors).some((key) =>
            ["fuelAmount", "fuelType", "pricePerUnit", "currency"].includes(key),
          )
        ) {
          setExpandedSections((prev) => ({ ...prev, fuel: true }))
        }

        return
      }

      // Add the log
      addLog(validationResult.data)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push("/logs")
    } catch (error) {
      console.error("Error adding log:", error)
      setErrors({ form: "Failed to add log. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date and time for display
  const formatDateTime = () => {
    if (!formValues.date) return "Not set"

    const dateStr = format(formValues.date, "PPP")
    const timeStr = formValues.time || "00:00"

    return `${dateStr} at ${timeStr}`
  }

  // If no vehicles are available, show a message
  if (vehicles.length === 0) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <h1 className="text-2xl font-bold">No Vehicles Found</h1>
          <p className="text-muted-foreground text-center max-w-md">
            You need to add a vehicle before you can log fuel efficiency data.
          </p>
          <Button asChild>
            <a href="/vehicles/add">Add Your First Vehicle</a>
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-28 md:pb-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="rounded-full p-2" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Add Fuel Log</h1>
        </div>

        {errors.form && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">{errors.form}</div>}

        <form ref={formRef} id="add-log-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Section */}
          <div className="bg-card rounded-lg border shadow-2xs overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleSection("vehicle")}
            >
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-medium">Vehicle Details</h2>
              </div>
              {expandedSections.vehicle ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {expandedSections.vehicle && (
              <div className="p-4 pt-0 space-y-4 border-t">
                <div className="space-y-2">
                  <Label>Select Vehicle</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {vehicles.map((vehicle) => (
                      <Card
                        key={vehicle.id}
                        className={`cursor-pointer transition-all ${
                          formValues.vehicleId === vehicle.id
                            ? "border-primary ring-1 ring-primary"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => handleSelectChange("vehicleId", vehicle.id)}
                      >
                        <CardContent className="p-3 flex flex-col items-center text-center">
                          {vehicle.image ? (
                            <div className="w-full h-20 rounded-md overflow-hidden mb-2">
                              <img
                                src={vehicle.image || "/placeholder.svg"}
                                alt={vehicle.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-20 rounded-md bg-muted flex items-center justify-center mb-2">
                              <Car className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                          )}
                          <span className="font-medium line-clamp-1 text-sm">{vehicle.name}</span>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {vehicle.fuelUnit}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {vehicle.distanceUnit}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {errors.vehicleId && (
                    <p id="vehicleId-error" className="text-sm text-destructive mt-1">
                      {errors.vehicleId}
                    </p>
                  )}
                </div>

                {/* Date and Time Picker */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date and Time</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal" id="date">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formValues.date ? format(formValues.date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={formValues.date} onSelect={handleDateChange} initialFocus />
                      </PopoverContent>
                    </Popover>

                    <div className="flex items-center gap-2 relative">
                      <Clock className="absolute left-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={formValues.time || ""}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  {errors.date && (
                    <p id="date-error" className="text-sm text-destructive mt-1">
                      {errors.date}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Distance Measurement</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={!formValues.isTrip ? "default" : "outline"}
                      className={cn(
                        "h-16 flex flex-col items-center justify-center gap-1",
                        !formValues.isTrip && "bg-primary/10 hover:bg-primary/20 text-primary border-primary",
                      )}
                      onClick={() => !formValues.isTrip || toggleDistanceType()}
                    >
                      <Gauge className="h-5 w-5" />
                      <span className="text-sm">Odometer</span>
                    </Button>
                    <Button
                      type="button"
                      variant={formValues.isTrip ? "default" : "outline"}
                      className={cn(
                        "h-16 flex flex-col items-center justify-center gap-1",
                        formValues.isTrip && "bg-primary/10 hover:bg-primary/20 text-primary border-primary",
                      )}
                      onClick={() => formValues.isTrip || toggleDistanceType()}
                    >
                      <Route className="h-5 w-5" />
                      <span className="text-sm">Trip Meter</span>
                    </Button>
                  </div>
                </div>

                {!formValues.isTrip ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="odometer">Odometer Reading ({selectedVehicle?.distanceUnit})</Label>
                    </div>
                    <Input
                      id="odometer"
                      name="odometer"
                      type="number"
                      step="0.1"
                      value={formValues.odometer || ""}
                      onChange={handleInputChange}
                      placeholder="Current odometer reading"
                      className="h-11"
                    />
                    {errors.odometer && (
                      <p id="odometer-error" className="text-sm text-destructive mt-1">
                        {errors.odometer}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="tripDistance">Trip Distance ({selectedVehicle?.distanceUnit})</Label>
                    </div>
                    <Input
                      id="tripDistance"
                      name="tripDistance"
                      type="number"
                      step="0.1"
                      value={formValues.tripDistance || ""}
                      onChange={handleInputChange}
                      placeholder="Distance traveled since last fill-up"
                      className="h-11"
                    />
                    {errors.tripDistance && (
                      <p id="tripDistance-error" className="text-sm text-destructive mt-1">
                        {errors.tripDistance}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fuel Section */}
          <div className="bg-card rounded-lg border shadow-2xs overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggleSection("fuel")}>
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-medium">Fuel Information</h2>
              </div>
              {expandedSections.fuel ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {expandedSections.fuel && (
              <div className="p-4 pt-0 space-y-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="fuelAmount">Fuel Amount ({selectedVehicle?.fuelUnit})</Label>
                  </div>
                  <Input
                    id="fuelAmount"
                    name="fuelAmount"
                    type="number"
                    step="0.001"
                    value={formValues.fuelAmount || ""}
                    onChange={handleInputChange}
                    placeholder="Amount of fuel"
                    className="h-11"
                  />
                  {errors.fuelAmount && (
                    <p id="fuelAmount-error" className="text-sm text-destructive mt-1">
                      {errors.fuelAmount}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select value={formValues.fuelType} onValueChange={(value) => handleSelectChange("fuelType", value)}>
                    <SelectTrigger id="fuelType" className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasoline</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.fuelType && (
                    <p id="fuelType-error" className="text-sm text-destructive mt-1">
                      {errors.fuelType}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="pricePerUnit">Price per {selectedVehicle?.fuelUnit}</Label>
                  </div>
                  <Input
                    id="pricePerUnit"
                    name="pricePerUnit"
                    type="number"
                    step="0.001"
                    value={formValues.pricePerUnit || ""}
                    onChange={handleInputChange}
                    placeholder="Price per unit"
                    className="h-11"
                  />
                  {errors.pricePerUnit && (
                    <p id="pricePerUnit-error" className="text-sm text-destructive mt-1">
                      {errors.pricePerUnit}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formValues.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                    <SelectTrigger id="currency" className="h-11">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <p id="currency-error" className="text-sm text-destructive mt-1">
                      {errors.currency}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="totalCost">Total Cost</Label>
                    <span className="text-sm text-muted-foreground">Calculated automatically</span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/50 rounded-md p-3 text-lg font-medium">
                    {formValues.currency === "USD" && "$"}
                    {formValues.currency === "EUR" && "€"}
                    {formValues.currency === "GBP" && "£"}
                    {formValues.totalCost?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Additional Section */}
          <div className="bg-card rounded-lg border shadow-2xs overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleSection("additional")}
            >
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-medium">Additional Details</h2>
              </div>
              {expandedSections.additional ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {expandedSections.additional && (
              <div className="p-4 pt-0 space-y-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="gasStation">Gas Station</Label>
                  </div>
                  <Input
                    id="gasStation"
                    name="gasStation"
                    value={formValues.gasStation || ""}
                    onChange={handleInputChange}
                    placeholder="Name of the gas station"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="notes">Notes</Label>
                  </div>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formValues.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Any additional notes"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary Card */}
          <div ref={summaryRef} className="bg-card rounded-lg border shadow-2xs overflow-hidden">
            <div className="p-4">
              <h2 className="text-lg font-medium mb-3">Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle:</span>
                  <span className="font-medium">
                    {vehicles.find((v) => v.id === formValues.vehicleId)?.name || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date & Time:</span>
                  <span className="font-medium">{formatDateTime()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuel Amount:</span>
                  <span className="font-medium">
                    {formValues.fuelAmount ? `${formValues.fuelAmount} ${selectedVehicle?.fuelUnit}` : "Not set"}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cost:</span>
                  <span className="font-medium">
                    {formValues.totalCost
                      ? new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: formValues.currency || "USD",
                        }).format(formValues.totalCost)
                      : "Not calculated"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Fixed Save Button */}
        <div className="fixed bottom-16 md:bottom-6 left-0 right-0 px-4 z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
            <Button
              ref={saveButtonRef}
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 shadow-lg rounded-full"
              onClick={() => formRef.current?.requestSubmit()}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Save Fuel Log
                </span>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </AppShell>
  )
}

