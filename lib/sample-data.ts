import type { Vehicle, FuelLog } from "./types"
import { addVehicle } from "./vehicle-service"
import { addLog } from "./log-service"

// Function to generate sample data
export function generateSampleData() {
  // Check if data already exists
  const existingVehicles = localStorage.getItem("fueltrack_vehicles")
  const existingLogs = localStorage.getItem("fueltrack_logs")

  if (existingVehicles && existingLogs) {
    const vehicles = JSON.parse(existingVehicles)
    const logs = JSON.parse(existingLogs)

    // If we already have data, don't regenerate
    if (vehicles.length > 0 && logs.length > 0) {
      return { vehicles, logs }
    }
  }

  // Clear any existing data
  localStorage.removeItem("fueltrack_vehicles")
  localStorage.removeItem("fueltrack_logs")

  // Sample vehicles
  const sampleVehicles = [
    {
      name: "Toyota Corolla",
      description: "My daily commuter car",
      type: "car",
      distanceUnit: "km",
      fuelUnit: "liter",
      fuelCapacity: 50,
      fuelType: "gasoline",
      hasTwoTanks: false,
      isHybrid: false,
      make: "Toyota",
      model: "Corolla",
      year: 2019,
      licensePlate: "ABC-1234",
      image: "https://images.unsplash.com/photo-1623869675781-80aa31012a5a?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Honda Civic",
      description: "Family car for weekend trips",
      type: "car",
      distanceUnit: "mi",
      fuelUnit: "gallon",
      fuelCapacity: 12.4,
      fuelType: "gasoline",
      hasTwoTanks: false,
      isHybrid: false,
      make: "Honda",
      model: "Civic",
      year: 2020,
      licensePlate: "XYZ-5678",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Ford F-150",
      description: "Work truck for hauling",
      type: "truck",
      distanceUnit: "mi",
      fuelUnit: "gallon",
      fuelCapacity: 26,
      fuelType: "diesel",
      hasTwoTanks: true,
      isHybrid: false,
      make: "Ford",
      model: "F-150",
      year: 2018,
      licensePlate: "TRK-9012",
      image: "https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Toyota Prius",
      description: "Eco-friendly hybrid",
      type: "car",
      distanceUnit: "km",
      fuelUnit: "liter",
      fuelCapacity: 43,
      fuelType: "gasoline",
      hasTwoTanks: false,
      isHybrid: true,
      make: "Toyota",
      model: "Prius",
      year: 2021,
      licensePlate: "ECO-4567",
      image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2071&auto=format&fit=crop",
    },
  ]

  // Add vehicles and store their IDs
  const vehicleIds: string[] = []
  sampleVehicles.forEach((vehicle) => {
    const newVehicle = addVehicle(vehicle as any)
    vehicleIds.push(newVehicle.id)
  })

  // Generate sample logs for each vehicle
  const now = new Date()
  const sampleLogs: any[] = []

  // Toyota Corolla - km and liters
  let corollaOdometer = 15000
  for (let i = 12; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(now.getMonth() - i)

    // Add 1-3 logs per month
    const logsThisMonth = Math.floor(Math.random() * 3) + 1

    for (let j = 0; j < logsThisMonth; j++) {
      const dayOffset = Math.floor(Math.random() * 30)
      const logDate = new Date(date)
      logDate.setDate(Math.min(28, logDate.getDate() + dayOffset))

      // Random distance driven
      const distance = Math.floor(Math.random() * 400) + 200
      corollaOdometer += distance

      // Random fuel amount (based on ~7-8 L/100km efficiency)
      const efficiency = 7 + (Math.random() * 2 - 1) // 6-9 L/100km
      const fuelAmount = +((distance * efficiency) / 100).toFixed(2)

      // Random price fluctuation
      const basePrice = 1.5 // Base price per liter
      const priceVariation = Math.random() * 0.4 - 0.2 // -0.2 to +0.2
      const pricePerUnit = +(basePrice + priceVariation).toFixed(3)

      const fuelTypes = ["Regular", "Premium", "Super"]
      const fuelTypeIndex = Math.floor(Math.random() * 3)

      const log = {
        vehicleId: vehicleIds[0],
        date: logDate.getTime(),
        odometer: corollaOdometer,
        isTrip: false,
        fuelAmount,
        fuelType: fuelTypes[fuelTypeIndex],
        pricePerUnit,
        currency: "USD",
        gasStation: ["Shell", "BP", "Esso", "Texaco"][Math.floor(Math.random() * 4)],
        notes: j === 0 ? "Regular fill-up" : undefined,
      }

      sampleLogs.push(log)
    }
  }

  // Honda Civic - miles and gallons
  let civicOdometer = 10000
  for (let i = 12; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(now.getMonth() - i)

    // Add 1-2 logs per month
    const logsThisMonth = Math.floor(Math.random() * 2) + 1

    for (let j = 0; j < logsThisMonth; j++) {
      const dayOffset = Math.floor(Math.random() * 30)
      const logDate = new Date(date)
      logDate.setDate(Math.min(28, logDate.getDate() + dayOffset))

      // Random distance driven
      const distance = Math.floor(Math.random() * 250) + 150
      civicOdometer += distance

      // Random fuel amount (based on ~30 MPG efficiency)
      const efficiency = 30 + (Math.random() * 6 - 3) // 27-33 MPG
      const fuelAmount = +(distance / efficiency).toFixed(2)

      // Random price fluctuation
      const basePrice = 3.5 // Base price per gallon
      const priceVariation = Math.random() * 0.8 - 0.4 // -0.4 to +0.4
      const pricePerUnit = +(basePrice + priceVariation).toFixed(3)

      const log = {
        vehicleId: vehicleIds[1],
        date: logDate.getTime(),
        odometer: civicOdometer,
        isTrip: false,
        fuelAmount,
        fuelType: "Regular",
        pricePerUnit,
        currency: "USD",
        gasStation: ["Chevron", "Mobil", "7-Eleven", "Costco"][Math.floor(Math.random() * 4)],
        notes: j === 0 ? "Monthly fill-up" : undefined,
      }

      sampleLogs.push(log)
    }
  }

  // Ford F-150 - miles and gallons
  let fordOdometer = 25000
  for (let i = 12; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(now.getMonth() - i)

    // Add 1-3 logs per month
    const logsThisMonth = Math.floor(Math.random() * 3) + 1

    for (let j = 0; j < logsThisMonth; j++) {
      const dayOffset = Math.floor(Math.random() * 30)
      const logDate = new Date(date)
      logDate.setDate(Math.min(28, logDate.getDate() + dayOffset))

      // Random distance driven
      const distance = Math.floor(Math.random() * 300) + 100
      fordOdometer += distance

      // Random fuel amount (based on ~18 MPG efficiency)
      const efficiency = 18 + (Math.random() * 4 - 2) // 16-20 MPG
      const fuelAmount = +(distance / efficiency).toFixed(2)

      // Random price fluctuation
      const basePrice = 3.8 // Base price per gallon for diesel
      const priceVariation = Math.random() * 0.8 - 0.4 // -0.4 to +0.4
      const pricePerUnit = +(basePrice + priceVariation).toFixed(3)

      const log = {
        vehicleId: vehicleIds[2],
        date: logDate.getTime(),
        odometer: fordOdometer,
        isTrip: false,
        fuelAmount,
        fuelType: "Diesel",
        pricePerUnit,
        currency: "USD",
        gasStation: ["Chevron", "Shell", "Pilot", "Flying J"][Math.floor(Math.random() * 4)],
        notes: j === 0 ? "Work trip fill-up" : undefined,
      }

      sampleLogs.push(log)
    }
  }

  // Toyota Prius - km and liters
  let priusOdometer = 5000
  for (let i = 12; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(now.getMonth() - i)

    // Add 1-2 logs per month
    const logsThisMonth = Math.floor(Math.random() * 2) + 1

    for (let j = 0; j < logsThisMonth; j++) {
      const dayOffset = Math.floor(Math.random() * 30)
      const logDate = new Date(date)
      logDate.setDate(Math.min(28, logDate.getDate() + dayOffset))

      // Random distance driven
      const distance = Math.floor(Math.random() * 500) + 300
      priusOdometer += distance

      // Random fuel amount (based on ~4.5 L/100km efficiency)
      const efficiency = 4.5 + (Math.random() * 1 - 0.5) // 4-5 L/100km
      const fuelAmount = +((distance * efficiency) / 100).toFixed(2)

      // Random price fluctuation
      const basePrice = 1.5 // Base price per liter
      const priceVariation = Math.random() * 0.4 - 0.2 // -0.2 to +0.2
      const pricePerUnit = +(basePrice + priceVariation).toFixed(3)

      const fuelTypes = ["Regular", "Premium"]
      const fuelTypeIndex = Math.floor(Math.random() * 2)

      const log = {
        vehicleId: vehicleIds[3],
        date: logDate.getTime(),
        odometer: priusOdometer,
        isTrip: false,
        fuelAmount,
        fuelType: fuelTypes[fuelTypeIndex],
        pricePerUnit,
        currency: "USD",
        gasStation: ["Shell", "BP", "Esso", "Texaco"][Math.floor(Math.random() * 4)],
        notes: j === 0 ? "Eco mode fill-up" : undefined,
      }

      sampleLogs.push(log)
    }
  }

  // Add all logs
  const logs: FuelLog[] = []
  sampleLogs.forEach((logData) => {
    const newLog = addLog(logData)
    logs.push(newLog)
  })

  // Return the generated data
  return {
    vehicles: vehicleIds.map((id) => {
      const vehicles = JSON.parse(localStorage.getItem("fueltrack_vehicles") || "[]")
      return vehicles.find((v: Vehicle) => v.id === id)
    }),
    logs,
  }
}

