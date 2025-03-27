"use client"

import type { FuelLog, FuelEfficiency } from "./types"
import { getVehicles } from "./vehicle-service"

// Get all logs
export const getLogs = (): FuelLog[] => {
  if (typeof window === "undefined") return []

  const logs = localStorage.getItem("fueltrack_logs")
  return logs ? JSON.parse(logs) : []
}

// Get logs by vehicle ID
export const getLogsByVehicleId = (vehicleId: string): FuelLog[] => {
  const logs = getLogs()
  return logs.filter((log) => log.vehicleId === vehicleId)
}

// Get a log by ID
export const getLogById = (id: string): FuelLog | undefined => {
  const logs = getLogs()
  return logs.find((log) => log.id === id)
}

// Add a new log
export const addLog = (log: Omit<FuelLog, "id" | "createdAt">): FuelLog => {
  const logs = getLogs()

  const newLog: FuelLog = {
    ...log,
    id: `log_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: Date.now(),
  }

  const updatedLogs = [...logs, newLog]
  localStorage.setItem("fueltrack_logs", JSON.stringify(updatedLogs))

  return newLog
}

// Update a log
export const updateLog = (id: string, updates: Partial<FuelLog>): FuelLog | undefined => {
  const logs = getLogs()
  const index = logs.findIndex((log) => log.id === id)

  if (index === -1) return undefined

  const updatedLog = { ...logs[index], ...updates }
  logs[index] = updatedLog

  localStorage.setItem("fueltrack_logs", JSON.stringify(logs))

  return updatedLog
}

// Delete a log
export const deleteLog = (id: string): boolean => {
  const logs = getLogs()
  const filteredLogs = logs.filter((log) => log.id !== id)

  if (filteredLogs.length === logs.length) return false

  localStorage.setItem("fueltrack_logs", JSON.stringify(filteredLogs))

  return true
}

// Calculate fuel efficiency
export const calculateFuelEfficiency = (currentLog: FuelLog, previousLog?: FuelLog): FuelEfficiency => {
  if (!previousLog || previousLog.isTrip || currentLog.isTrip) {
    return {}
  }

  const distance = currentLog.odometer - previousLog.odometer
  if (distance <= 0) {
    return {}
  }

  const fuelAmount = currentLog.fuelAmount

  // Calculate MPG (miles per gallon)
  if (distance > 0 && fuelAmount > 0) {
    const efficiency = distance / fuelAmount

    // Return different metrics based on the units
    if (distance > 0 && fuelAmount > 0) {
      // For miles and gallons (MPG)
      const mpg = efficiency

      // For kilometers and liters (km/L and L/100km)
      const kmPerLiter = efficiency
      const litersPer100km = 100 / efficiency

      return {
        mpg,
        kmPerLiter,
        litersPer100km,
      }
    }
  }

  return {}
}

// Get vehicle statistics
export const getVehicleStats = (vehicleId: string) => {
  const logs = getLogsByVehicleId(vehicleId).sort((a, b) => a.date - b.date)

  if (logs.length === 0) {
    return {
      totalLogs: 0,
      totalFuel: 0,
      totalCost: 0,
      totalDistance: 0,
      avgEfficiency: null,
      lastEfficiency: null,
      lastFuelPrice: null,
      avgFuelPrice: null,
      monthlyExpenses: [],
    }
  }

  let totalFuel = 0
  let totalCost = 0
  let totalDistance = 0
  const efficiencies: { date: number; efficiency: number }[] = []

  // Calculate total fuel, cost, and efficiencies
  logs.forEach((log, index) => {
    totalFuel += log.fuelAmount
    totalCost += log.totalCost

    if (index > 0) {
      const prevLog = logs[index - 1]
      if (!log.isTrip && !prevLog.isTrip && prevLog.odometer < log.odometer) {
        const distance = log.odometer - prevLog.odometer
        totalDistance += distance

        const efficiency = distance / log.fuelAmount
        efficiencies.push({
          date: log.date,
          efficiency,
        })
      }
    }
  })

  // Calculate monthly expenses
  const monthlyData: Record<string, { month: string; cost: number }> = {}

  logs.forEach((log) => {
    const date = new Date(log.date)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const monthName = date.toLocaleString("default", { month: "short", year: "numeric" })

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { month: monthName, cost: 0 }
    }

    monthlyData[monthYear].cost += log.totalCost
  })

  const monthlyExpenses = Object.values(monthlyData).sort((a, b) => {
    const [aMonth, aYear] = a.month.split(" ")
    const [bMonth, bYear] = b.month.split(" ")

    if (aYear !== bYear) return Number.parseInt(aYear) - Number.parseInt(bYear)

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.indexOf(aMonth) - months.indexOf(bMonth)
  })

  // Calculate average efficiency
  const avgEfficiency =
    efficiencies.length > 0 ? efficiencies.reduce((sum, item) => sum + item.efficiency, 0) / efficiencies.length : null

  // Get last efficiency
  const lastEfficiency = efficiencies.length > 0 ? efficiencies[efficiencies.length - 1].efficiency : null

  // Calculate average fuel price
  const avgFuelPrice = totalFuel > 0 ? totalCost / totalFuel : null

  // Get last log data
  const lastLog = logs[logs.length - 1]
  const lastFuelPrice = lastLog.pricePerUnit

  return {
    totalLogs: logs.length,
    totalFuel,
    totalCost,
    totalDistance,
    avgEfficiency,
    lastEfficiency,
    lastFuelPrice,
    avgFuelPrice,
    monthlyExpenses,
  }
}

// Get statistics for all vehicles combined
export const getAllVehiclesStats = () => {
  const logs = getLogs().sort((a, b) => a.date - b.date)
  const vehicles = getVehicles()

  if (logs.length === 0) {
    return {
      totalLogs: 0,
      totalFuel: 0,
      totalCost: 0,
      totalDistance: 0,
      avgEfficiency: null,
      lastEfficiency: null,
      lastFuelPrice: null,
      avgFuelPrice: null,
      monthlyExpenses: [],
      vehicleCounts: {},
      fuelTypeCounts: {},
    }
  }

  let totalFuel = 0
  let totalCost = 0
  let totalDistance = 0
  const vehicleCounts: Record<string, number> = {}
  const fuelTypeCounts: Record<string, number> = {}

  // Calculate total fuel, cost, and efficiencies
  vehicles.forEach((vehicle) => {
    const vehicleLogs = logs.filter((log) => log.vehicleId === vehicle.id)
    const vehicleStats = getVehicleStats(vehicle.id)

    totalFuel += vehicleStats.totalFuel
    totalCost += vehicleStats.totalCost
    totalDistance += vehicleStats.totalDistance

    vehicleCounts[vehicle.id] = vehicleLogs.length

    // Count fuel types
    vehicleLogs.forEach((log) => {
      if (!fuelTypeCounts[log.fuelType]) {
        fuelTypeCounts[log.fuelType] = 0
      }
      fuelTypeCounts[log.fuelType] += log.fuelAmount
    })
  })

  // Calculate monthly expenses
  const monthlyData: Record<string, { month: string; cost: number }> = {}

  logs.forEach((log) => {
    const date = new Date(log.date)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    const monthName = date.toLocaleString("default", { month: "short", year: "numeric" })

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { month: monthName, cost: 0 }
    }

    monthlyData[monthYear].cost += log.totalCost
  })

  const monthlyExpenses = Object.values(monthlyData).sort((a, b) => {
    const [aMonth, aYear] = a.month.split(" ")
    const [bMonth, bYear] = b.month.split(" ")

    if (aYear !== bYear) return Number.parseInt(aYear) - Number.parseInt(bYear)

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return months.indexOf(aMonth) - months.indexOf(bMonth)
  })

  // Calculate average fuel price
  const avgFuelPrice = totalFuel > 0 ? totalCost / totalFuel : 0

  // Get last log data
  const lastLog = logs.sort((a, b) => b.date - a.date)[0]
  const lastFuelPrice = lastLog ? lastLog.pricePerUnit : 0

  return {
    totalLogs: logs.length,
    totalFuel,
    totalCost,
    totalDistance,
    avgFuelPrice,
    lastFuelPrice,
    monthlyExpenses,
    vehicleCounts,
    fuelTypeCounts,
  }
}

