"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import MainLayout from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Edit, Trash2, Car, Calendar, Info, MapPin, Gauge } from "lucide-react"
import { getVehicles, deleteVehicle } from "@/lib/vehicle-service"
import type { Vehicle } from "@/lib/types"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  useEffect(() => {
    setVehicles(getVehicles())
  }, [])

  const handleDelete = (id: string) => {
    deleteVehicle(id)
    setVehicles(getVehicles())
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Vehicles</h1>
            <p className="text-muted-foreground text-sm md:text-base">Manage your vehicles and their details.</p>
          </div>
          <Button asChild className="mt-4 md:mt-0">
            <Link href="/vehicles/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Vehicle
            </Link>
          </Button>
        </div>

        {vehicles.length === 0 ? (
          <EmptyState
            title="No vehicles found"
            description="You haven't added any vehicles yet. Add your first vehicle to start tracking fuel efficiency."
            icon={<Car className="h-12 w-12" />}
            actionLabel="Add Your First Vehicle"
            actionLink="/vehicles/add"
            className="h-[50vh]"
          />
        ) : (
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="vehicle-card overflow-hidden">
                {vehicle.image ? (
                  <div className="relative h-40 md:h-48 w-full overflow-hidden">
                    <img
                      src={vehicle.image || "/placeholder.svg"}
                      alt={vehicle.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-primary/90 hover:bg-primary">{vehicle.type}</Badge>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-40 md:h-48 w-full bg-muted flex items-center justify-center">
                    <Car className="h-16 w-16 text-muted-foreground/40" />
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-primary/90 hover:bg-primary">{vehicle.type}</Badge>
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg md:text-xl flex items-center justify-between">
                    {vehicle.name}
                    {vehicle.isHybrid && (
                      <Badge variant="outline" className="ml-2">
                        Hybrid
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center text-sm">
                    {vehicle.make} {vehicle.model} {vehicle.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs md:text-sm">{vehicle.distanceUnit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs md:text-sm">{vehicle.fuelUnit}</span>
                    </div>
                    {vehicle.licensePlate && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs md:text-sm">{vehicle.licensePlate}</span>
                      </div>
                    )}
                    {vehicle.year && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs md:text-sm">{vehicle.year}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-4">
                  <Button asChild variant="outline" size="sm" className="h-9">
                    <Link href={`/vehicles/edit/${vehicle.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="h-9">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your vehicle and all associated
                          fuel logs.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(vehicle.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

