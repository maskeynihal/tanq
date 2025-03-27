"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Car, Fuel, FileText, ArrowLeft } from "lucide-react"

export default function AddVehiclePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "car",
    distanceUnit: "km",
    fuelUnit: "liter",
    fuelCapacity: "",
    fuelType: "gasoline",
    hasTwoTanks: false,
    isHybrid: false,
    make: "",
    model: "",
    year: "",
    licensePlate: "",
    vin: "",
    insurancePolicy: "",
    image: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Convert numeric fields
      const vehicleData = {
        ...formData,
        fuelCapacity: formData.fuelCapacity ? Number.parseFloat(formData.fuelCapacity) : undefined,
        year: formData.year ? Number.parseInt(formData.year) : undefined,
      }

      addVehicle(vehicleData)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      router.push("/vehicles")
    } catch (error) {
      console.error("Error adding vehicle:", error)
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

        <form onSubmit={handleSubmit}>
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
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Vehicle Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="My Car"
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">
                        Vehicle Type <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => handleSelectChange("type", value)}
                        required
                      >
                        <SelectTrigger id="type" className="h-11">
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
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="A brief description of your vehicle"
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Input
                        id="make"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        placeholder="Toyota"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="Corolla"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        name="year"
                        type="number"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="2023"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="h-11"
                    />
                  </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="distanceUnit">
                        Distance Unit <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.distanceUnit}
                        onValueChange={(value) => handleSelectChange("distanceUnit", value)}
                        required
                      >
                        <SelectTrigger id="distanceUnit" className="h-11">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="km">Kilometers (km)</SelectItem>
                          <SelectItem value="mi">Miles (mi)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuelUnit">
                        Fuel Unit <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.fuelUnit}
                        onValueChange={(value) => handleSelectChange("fuelUnit", value)}
                        required
                      >
                        <SelectTrigger id="fuelUnit" className="h-11">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="liter">Liters (L)</SelectItem>
                          <SelectItem value="gallon">Gallons (gal)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fuelType">Fuel Type</Label>
                      <Select
                        value={formData.fuelType}
                        onValueChange={(value) => handleSelectChange("fuelType", value)}
                      >
                        <SelectTrigger id="fuelType" className="h-11">
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
                    <div className="space-y-2">
                      <Label htmlFor="fuelCapacity">Fuel Tank Capacity</Label>
                      <Input
                        id="fuelCapacity"
                        name="fuelCapacity"
                        type="number"
                        step="0.1"
                        value={formData.fuelCapacity}
                        onChange={handleChange}
                        placeholder="50"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex items-center space-x-2 bg-muted/40 p-3 rounded-lg">
                      <Switch
                        id="hasTwoTanks"
                        checked={formData.hasTwoTanks}
                        onCheckedChange={(checked) => handleSwitchChange("hasTwoTanks", checked)}
                      />
                      <Label htmlFor="hasTwoTanks" className="flex-1">
                        Has Two Fuel Tanks
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 bg-muted/40 p-3 rounded-lg">
                      <Switch
                        id="isHybrid"
                        checked={formData.isHybrid}
                        onCheckedChange={(checked) => handleSwitchChange("isHybrid", checked)}
                      />
                      <Label htmlFor="isHybrid" className="flex-1">
                        Is Hybrid Vehicle
                      </Label>
                    </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate">License Plate</Label>
                      <Input
                        id="licensePlate"
                        name="licensePlate"
                        value={formData.licensePlate}
                        onChange={handleChange}
                        placeholder="ABC123"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vin">VIN</Label>
                      <Input
                        id="vin"
                        name="vin"
                        value={formData.vin}
                        onChange={handleChange}
                        placeholder="Vehicle Identification Number"
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insurancePolicy">Insurance Policy</Label>
                    <Input
                      id="insurancePolicy"
                      name="insurancePolicy"
                      value={formData.insurancePolicy}
                      onChange={handleChange}
                      placeholder="Insurance policy number"
                      className="h-11"
                    />
                  </div>
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
                    {isSubmitting ? "Saving..." : "Save Vehicle"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </MainLayout>
  )
}

