export type Vehicle = {
  id: string
  name: string
  description?: string
  type: string
  image?: string
  distanceUnit: "km" | "mi"
  fuelUnit: "liter" | "gallon"
  fuelCapacity?: number
  fuelType?: string
  hasTwoTanks?: boolean
  isHybrid?: boolean
  make?: string
  model?: string
  year?: number
  licensePlate?: string
  vin?: string
  insurancePolicy?: string
  createdAt: number
}

export type FuelLog = {
  id: string
  vehicleId: string
  date: number
  odometer: number
  isTrip: boolean
  tripDistance?: number
  fuelAmount: number
  fuelType: string
  pricePerUnit: number
  totalCost: number
  currency: string
  gasStation?: string
  notes?: string
  images?: string[]
  createdAt: number
}

export type FuelEfficiency = {
  mpg?: number
  kmPerLiter?: number
  litersPer100km?: number
}

