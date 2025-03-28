"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import MainLayout from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, FuelIcon as GasPump, DollarSign, Calendar, Droplets, ArrowRight, Route } from "lucide-react"
import { getVehicles } from "@/lib/vehicle-service"
import { getLogs, getVehicleStats, getAllVehiclesStats } from "@/lib/log-service"
import type { Vehicle, FuelLog } from "@/lib/types"
import { DataCard } from "@/components/ui/data-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [logs, setLogs] = useState<FuelLog[]>([])
  const [activeVehicle, setActiveVehicle] = useState<string | null>("all")
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const loadedVehicles = getVehicles()
    setVehicles(loadedVehicles)

    setLogs(getLogs())
  }, [])

  useEffect(() => {
    if (activeVehicle === "all") {
      setStats(getAllVehiclesStats())
    } else if (activeVehicle) {
      setStats(getVehicleStats(activeVehicle))
    }
  }, [activeVehicle, logs])

  const formatCurrency = (value: number) => {
    if (isNaN(value) || value === undefined) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatEfficiency = (value: number | undefined, type: string) => {
    if (value === undefined) return "N/A"
    return `${value.toFixed(2)} ${type}`
  }

  if (vehicles.length === 0) {
    return (
      <MainLayout>
        <EmptyState
          title="Welcome to FuelTrack!"
          description="Start tracking your vehicle's fuel efficiency by adding your first vehicle."
          icon={<Car className="h-12 w-12" />}
          actionLabel="Add Your First Vehicle"
          actionLink="/vehicles/add"
          className="h-[80vh]"
        />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground max-w-3xl text-sm md:text-base">
            Track and analyze your vehicle's fuel efficiency and expenses.
          </p>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {vehicles.length > 1 && (
              <ScrollArea className="w-full whitespace-nowrap md:max-w-[70%]">
                <div className="flex w-max space-x-2 p-1">
                  <Button
                    key="all-vehicles"
                    variant={activeVehicle === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveVehicle("all")}
                    className="shrink-0"
                  >
                    All Vehicles
                  </Button>
                  {vehicles.map((vehicle) => (
                    <Button
                      key={vehicle.id}
                      variant={activeVehicle === vehicle.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveVehicle(vehicle.id)}
                      className="shrink-0"
                    >
                      {vehicle.name}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            )}

            <Button asChild className="w-full md:w-auto">
              <Link href="/logs/add" className="flex items-center justify-center gap-2">
                <GasPump className="h-4 w-4" />
                Add Fuel Log
              </Link>
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <DataCard
              title={activeVehicle === "all" ? "Total Distance" : "Distance"}
              icon={<Route />}
              colorVariant="default"
              isCompact={true}
            >
              <div className="text-xl md:text-3xl font-bold">
                {stats.totalDistance.toFixed(1)}{" "}
                {activeVehicle !== "all" ? vehicles.find((v) => v.id === activeVehicle)?.distanceUnit : "units"}
              </div>
            </DataCard>

            <DataCard
              title={activeVehicle === "all" ? "Total Fuel" : "Fuel"}
              icon={<Droplets />}
              colorVariant="green"
              isCompact={true}
            >
              <div className="text-xl md:text-3xl font-bold">
                {stats.totalFuel.toFixed(2)}{" "}
                {activeVehicle !== "all" ? vehicles.find((v) => v.id === activeVehicle)?.fuelUnit : "units"}
              </div>
            </DataCard>

            <DataCard
              title={activeVehicle === "all" ? "Avg Price" : "Fuel Price"}
              icon={<DollarSign />}
              colorVariant="orange"
              isCompact={true}
            >
              <div className="text-xl md:text-3xl font-bold">
                {stats?.avgFuelPrice && !isNaN(stats.avgFuelPrice) ? formatCurrency(stats.avgFuelPrice) : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                Per {activeVehicle !== "all" ? vehicles.find((v) => v.id === activeVehicle)?.fuelUnit : "unit"}
              </p>
            </DataCard>

            <DataCard
              title={activeVehicle === "all" ? "Total Cost" : "Total Cost"}
              icon={<DollarSign />}
              colorVariant="purple"
              isCompact={true}
            >
              <div className="text-xl md:text-3xl font-bold">{formatCurrency(stats.totalCost)}</div>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="text-xs">
                  {stats.totalLogs} logs
                </Badge>
              </div>
            </DataCard>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-1 lg:col-span-2 vehicle-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg md:text-xl">Recent Logs</CardTitle>
                <CardDescription>Your most recent fuel logs</CardDescription>
              </div>
              <Link href="/logs" className="text-sm text-primary hover:underline flex items-center">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <EmptyState
                  title="No logs yet"
                  description="Add your first fuel log to start tracking efficiency."
                  icon={<Droplets className="h-10 w-10" />}
                  actionLabel="Add Fuel Log"
                  actionLink="/logs/add"
                  className="py-8"
                />
              ) : (
                <div className="space-y-4">
                  {logs
                    .filter((log) => (activeVehicle === "all" ? true : log.vehicleId === activeVehicle))
                    .sort((a, b) => b.date - a.date)
                    .slice(0, 5)
                    .map((log) => {
                      const vehicle = vehicles.find((v) => v.id === log.vehicleId)
                      return (
                        <div key={log.id} className="flex justify-between items-center border-b pb-3 log-row">
                          <div className="flex items-start gap-2 md:gap-3">
                            <div className="rounded-full bg-primary/10 p-1.5 md:p-2 mt-1">
                              <GasPump className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm md:text-base">
                                {new Date(log.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs md:text-sm text-muted-foreground">
                                {vehicle?.name} - {log.fuelAmount} {vehicle?.fuelUnit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm md:text-base">{formatCurrency(log.totalCost)}</p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {formatCurrency(log.pricePerUnit)}/{vehicle?.fuelUnit}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  {logs.length > 0 && (
                    <Button asChild variant="outline" className="w-full mt-4">
                      <Link href="/logs">View All Logs</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1 vehicle-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg md:text-xl">Monthly Expenses</CardTitle>
                <CardDescription>Your fuel expenses by month</CardDescription>
              </div>
              <Link href="/statistics" className="text-sm text-primary hover:underline flex items-center">
                Details <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {!stats || !stats.monthlyExpenses || stats.monthlyExpenses.length === 0 ? (
                <EmptyState
                  title="No data yet"
                  description="Add fuel logs to see your monthly expenses."
                  icon={<Calendar className="h-10 w-10" />}
                  className="py-8"
                />
              ) : (
                <div className="space-y-4">
                  {stats.monthlyExpenses.slice(-5).map((item: any, index: number) => {
                    const maxValue = Math.max(...stats.monthlyExpenses.map((e: any) => e.cost))
                    const percentage = (item.cost / maxValue) * 100

                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm md:text-base">{item.month}</p>
                          <p className="font-medium text-sm md:text-base">{formatCurrency(item.cost)}</p>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                  <Button asChild variant="outline" className="w-full mt-4">
                    <Link href="/statistics">View All Statistics</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

