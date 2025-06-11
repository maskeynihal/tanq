"use client"

import type { Vehicle } from "./types"
import { getSupabaseBrowserClient } from "./supabase"

// Get all vehicles
export const getVehicles = (): Vehicle[] => {
  if (typeof window === "undefined") return []

  const vehicles = localStorage.getItem("fueltrack_vehicles")
  return vehicles ? JSON.parse(vehicles) : []
}

// Get a vehicle by ID
export const getVehicleById = (id: string): Vehicle | undefined => {
  const vehicles = getVehicles()
  return vehicles.find((vehicle) => vehicle.id === id)
}

// Add a new vehicle
export const addVehicle = (vehicle: Omit<Vehicle, "id" | "createdAt">): Vehicle => {
  const vehicles = getVehicles()

  const newVehicle: Vehicle = {
    ...vehicle,
    id: `vehicle_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: Date.now(),
  }

  const updatedVehicles = [...vehicles, newVehicle]
  localStorage.setItem("fueltrack_vehicles", JSON.stringify(updatedVehicles))

  return newVehicle
}

// Update a vehicle
export const updateVehicle = (id: string, updates: Partial<Vehicle>): Vehicle | undefined => {
  const vehicles = getVehicles()
  const index = vehicles.findIndex((vehicle) => vehicle.id === id)

  if (index === -1) return undefined

  const updatedVehicle = { ...vehicles[index], ...updates }
  vehicles[index] = updatedVehicle

  localStorage.setItem("fueltrack_vehicles", JSON.stringify(vehicles))

  return updatedVehicle
}

// Delete a vehicle
export const deleteVehicle = (id: string): boolean => {
  const vehicles = getVehicles()
  const filteredVehicles = vehicles.filter((vehicle) => vehicle.id !== id)

  if (filteredVehicles.length === vehicles.length) return false

  localStorage.setItem("fueltrack_vehicles", JSON.stringify(filteredVehicles))

  return true
}

// Supabase functions
export const fetchVehiclesFromSupabase = async (userId: string): Promise<Vehicle[]> => {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching vehicles from Supabase:", error)
    throw new Error(`Failed to fetch vehicles: ${error.message}`)
  }

  // Transform Supabase data to match our Vehicle type
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description || undefined,
    type: item.type,
    image: item.image || undefined,
    distanceUnit: item.distance_unit,
    fuelUnit: item.fuel_unit,
    fuelCapacity: item.fuel_capacity || undefined,
    fuelType: item.fuel_type || undefined,
    hasTwoTanks: item.has_two_tanks || false,
    isHybrid: item.is_hybrid || false,
    make: item.make || undefined,
    model: item.model || undefined,
    year: item.year || undefined,
    licensePlate: item.license_plate || undefined,
    vin: item.vin || undefined,
    insurancePolicy: item.insurance_policy || undefined,
    createdAt: new Date(item.created_at).getTime(),
  }))
}

// Add a vehicle to Supabase
export const addVehicleToSupabase = async (
  userId: string,
  vehicle: Omit<Vehicle, "id" | "createdAt">,
): Promise<Vehicle> => {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      user_id: userId,
      name: vehicle.name,
      description: vehicle.description || null,
      type: vehicle.type,
      image: vehicle.image || null,
      distance_unit: vehicle.distanceUnit,
      fuel_unit: vehicle.fuelUnit,
      fuel_capacity: vehicle.fuelCapacity || null,
      fuel_type: vehicle.fuelType || null,
      has_two_tanks: vehicle.hasTwoTanks,
      is_hybrid: vehicle.isHybrid,
      make: vehicle.make || null,
      model: vehicle.model || null,
      year: vehicle.year || null,
      license_plate: vehicle.licensePlate || null,
      vin: vehicle.vin || null,
      insurance_policy: vehicle.insurancePolicy || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding vehicle to Supabase:", error)
    throw new Error(`Failed to add vehicle: ${error.message}`)
  }

  // Transform Supabase response to match our Vehicle type
  return {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    type: data.type,
    image: data.image || undefined,
    distanceUnit: data.distance_unit,
    fuelUnit: data.fuel_unit,
    fuelCapacity: data.fuel_capacity || undefined,
    fuelType: data.fuel_type || undefined,
    hasTwoTanks: data.has_two_tanks || false,
    isHybrid: data.is_hybrid || false,
    make: data.make || undefined,
    model: data.model || undefined,
    year: data.year || undefined,
    licensePlate: data.license_plate || undefined,
    vin: data.vin || undefined,
    insurancePolicy: data.insurance_policy || undefined,
    createdAt: new Date(data.created_at).getTime(),
  }
}

// Update a vehicle in Supabase
export const updateVehicleInSupabase = async (id: string, updates: Partial<Vehicle>): Promise<Vehicle> => {
  const supabase = getSupabaseBrowserClient()

  // Transform our Vehicle type to match Supabase schema
  const supabaseUpdates: Record<string, any> = {}

  if (updates.name !== undefined) supabaseUpdates.name = updates.name
  if (updates.description !== undefined) supabaseUpdates.description = updates.description || null
  if (updates.type !== undefined) supabaseUpdates.type = updates.type
  if (updates.image !== undefined) supabaseUpdates.image = updates.image || null
  if (updates.distanceUnit !== undefined) supabaseUpdates.distance_unit = updates.distanceUnit
  if (updates.fuelUnit !== undefined) supabaseUpdates.fuel_unit = updates.fuelUnit
  if (updates.fuelCapacity !== undefined) supabaseUpdates.fuel_capacity = updates.fuelCapacity || null
  if (updates.fuelType !== undefined) supabaseUpdates.fuel_type = updates.fuelType || null
  if (updates.hasTwoTanks !== undefined) supabaseUpdates.has_two_tanks = updates.hasTwoTanks
  if (updates.isHybrid !== undefined) supabaseUpdates.is_hybrid = updates.isHybrid
  if (updates.make !== undefined) supabaseUpdates.make = updates.make || null
  if (updates.model !== undefined) supabaseUpdates.model = updates.model || null
  if (updates.year !== undefined) supabaseUpdates.year = updates.year || null
  if (updates.licensePlate !== undefined) supabaseUpdates.license_plate = updates.licensePlate || null
  if (updates.vin !== undefined) supabaseUpdates.vin = updates.vin || null
  if (updates.insurancePolicy !== undefined) supabaseUpdates.insurance_policy = updates.insurancePolicy || null

  supabaseUpdates.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from("vehicles").update(supabaseUpdates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating vehicle in Supabase:", error)
    throw new Error(`Failed to update vehicle: ${error.message}`)
  }

  // Transform Supabase response to match our Vehicle type
  return {
    id: data.id,
    name: data.name,
    description: data.description || undefined,
    type: data.type,
    image: data.image || undefined,
    distanceUnit: data.distance_unit,
    fuelUnit: data.fuel_unit,
    fuelCapacity: data.fuel_capacity || undefined,
    fuelType: data.fuel_type || undefined,
    hasTwoTanks: data.has_two_tanks || false,
    isHybrid: data.is_hybrid || false,
    make: data.make || undefined,
    model: data.model || undefined,
    year: data.year || undefined,
    licensePlate: data.license_plate || undefined,
    vin: data.vin || undefined,
    insurancePolicy: data.insurance_policy || undefined,
    createdAt: new Date(data.created_at).getTime(),
  }
}

// Delete a vehicle from Supabase
export const deleteVehicleFromSupabase = async (id: string): Promise<boolean> => {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("vehicles").delete().eq("id", id)

  if (error) {
    console.error("Error deleting vehicle from Supabase:", error)
    throw new Error(`Failed to delete vehicle: ${error.message}`)
  }

  return true
}
