"use client"

import type { Vehicle } from "./types"

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

