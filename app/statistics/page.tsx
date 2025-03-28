"use client"

import { useEffect, useState } from "react"
import MainLayout from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { getVehicles } from "@/lib/vehicle-service"
import { getLogs, getVehicleStats, getLogsByVehicleId, getAllVehiclesStats } from "@/lib/log-service"
import type { Vehicle, FuelLog } from "@/lib/types"
import { DataCard } from "@/components/ui/data-card"
import { EmptyState } from "@/components/ui/empty-state"
import {
  TrendingUp,
  BarChart4,
  DollarSign,
  Route,
  Droplets,
  LineChartIcon,
  PieChartIcon,
  BarChartIcon,
  Calendar,
  Car,
} from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

export default function StatisticsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [logs, setLogs] = useState<FuelLog[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>("all")
  const [stats, setStats] = useState<any>(null)
  const [fuelPriceData, setFuelPriceData] = useState<any[]>([])
  const [fuelEfficiencyData, setFuelEfficiencyData] = useState<any[]>([])
  const [monthlyExpensesData, setMonthlyExpensesData] = useState<any[]>([])
  const [fuelTypeData, setFuelTypeData] = useState<any[]>([])
  const [vehicleDistributionData, setVehicleDistributionData] = useState<any[]>([])

  useEffect(() => {
    const loadedVehicles = getVehicles()
    setVehicles(loadedVehicles)

    setLogs(getLogs())
  }, [])

  useEffect(() => {
    if (selectedVehicle === "all") {
      // Get combined stats for all vehicles
      const allStats = getAllVehiclesStats()
      setStats(allStats)

      // Set monthly expenses data
      setMonthlyExpensesData(allStats.monthlyExpenses)

      // Prepare fuel type data
      const fuelTypeArray = Object.entries(allStats.fuelTypeCounts || {}).map(([name, value]) => ({
        name,
        value,
      }))
      setFuelTypeData(fuelTypeArray)

      // Prepare vehicle distribution data
      const vehicleData = Object.entries(allStats.vehicleCounts || {}).map(([id, count]) => {
        const vehicle = vehicles.find((v) => v.id === id)
        return {
          name: vehicle?.name || "Unknown",
          value: count,
        }
      })
      setVehicleDistributionData(vehicleData)

      // For all vehicles, we don't show efficiency or price trends
      setFuelEfficiencyData([])
      setFuelPriceData([])
    } else if (selectedVehicle) {
      const vehicleStats = getVehicleStats(selectedVehicle)
      setStats(vehicleStats)

      const vehicleLogs = getLogsByVehicleId(selectedVehicle).sort((a, b) => a.date - b.date)

      // Prepare fuel price data
      const priceData = vehicleLogs.map((log) => ({
        date: new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        price: log.pricePerUnit,
      }))
      setFuelPriceData(priceData)

      // Prepare fuel efficiency data
      const efficiencyData: any[] = []
      vehicleLogs.forEach((log, index) => {
        if (index > 0) {
          const prevLog = vehicleLogs[index - 1]
          if (!log.isTrip && !prevLog.isTrip && prevLog.odometer < log.odometer) {
            const distance = log.odometer - prevLog.odometer
            const efficiency = distance / log.fuelAmount

            const vehicle = vehicles.find((v) => v.id === log.vehicleId)
            let effValue = 0
            let effUnit = ""

            if (vehicle?.distanceUnit === "mi" && vehicle?.fuelUnit === "gallon") {
              effValue = efficiency
              effUnit = "MPG"
            } else if (vehicle?.distanceUnit === "km" && vehicle?.fuelUnit === "liter") {
              effValue = efficiency
              effUnit = "km/L"
            }

            efficiencyData.push({
              date: new Date(log.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              efficiency: effValue,
              unit: effUnit,
            })
          }
        }
      })
      setFuelEfficiencyData(efficiencyData)

      // Prepare monthly expenses data
      setMonthlyExpensesData(vehicleStats.monthlyExpenses)

      // Prepare fuel type data
      const fuelTypes: Record<string, number> = {}
      vehicleLogs.forEach((log) => {
        if (!fuelTypes[log.fuelType]) {
          fuelTypes[log.fuelType] = 0
        }
        fuelTypes[log.fuelType] += log.fuelAmount
      })

      const fuelTypeArray = Object.entries(fuelTypes).map(([name, value]) => ({
        name,
        value,
      }))
      setFuelTypeData(fuelTypeArray)

      // Reset vehicle distribution data when viewing a single vehicle
      setVehicleDistributionData([])
    }
  }, [selectedVehicle, vehicles, logs])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Statistics</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Analyze your vehicle's fuel efficiency and expenses.
            </p>
          </div>
          {vehicles.length > 0 && (
            <div className="mt-4 md:mt-0 w-full md:w-auto">
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-2 p-1">
                  <Button
                    key="all-vehicles"
                    variant={selectedVehicle === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVehicle("all")}
                    className="shrink-0"
                  >
                    All Vehicles
                  </Button>
                  {vehicles.map((vehicle) => (
                    <Button
                      key={vehicle.id}
                      variant={selectedVehicle === vehicle.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedVehicle(vehicle.id)}
                      className="shrink-0"
                    >
                      {vehicle.name}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </div>

        {!selectedVehicle || vehicles.length === 0 ? (
          <EmptyState
            title="No data available"
            description="Add a vehicle and log some fuel data to see statistics."
            icon={<BarChart4 className="h-12 w-12" />}
            className="h-[50vh]"
          />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <DataCard
                title={selectedVehicle === "all" ? "Total Distance" : "Distance"}
                icon={<Route />}
                colorVariant="default"
                isCompact={true}
              >
                <div className="text-xl md:text-2xl font-bold">
                  {stats?.totalDistance.toFixed(1)}{" "}
                  {selectedVehicle !== "all" ? vehicles.find((v) => v.id === selectedVehicle)?.distanceUnit : "units"}
                </div>
              </DataCard>

              <DataCard
                title={selectedVehicle === "all" ? "Total Fuel" : "Fuel"}
                icon={<Droplets />}
                colorVariant="green"
                isCompact={true}
              >
                <div className="text-xl md:text-2xl font-bold">
                  {stats?.totalFuel.toFixed(2)}{" "}
                  {selectedVehicle !== "all" ? vehicles.find((v) => v.id === selectedVehicle)?.fuelUnit : "units"}
                </div>
              </DataCard>

              <DataCard
                title={selectedVehicle === "all" ? "Avg Price" : "Avg Price"}
                icon={<DollarSign />}
                colorVariant="orange"
                isCompact={true}
              >
                <div className="text-xl md:text-2xl font-bold">
                  {stats?.avgFuelPrice ? formatCurrency(stats.avgFuelPrice) : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Per {selectedVehicle !== "all" ? vehicles.find((v) => v.id === selectedVehicle)?.fuelUnit : "unit"}
                </p>
              </DataCard>

              <DataCard
                title={selectedVehicle === "all" ? "Total Cost" : "Total Cost"}
                icon={<DollarSign />}
                colorVariant="purple"
                isCompact={true}
              >
                <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats?.totalCost || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{stats?.totalLogs || 0} logs</p>
              </DataCard>
            </div>

            <Tabs defaultValue={selectedVehicle === "all" ? "expenses" : "efficiency"} className="space-y-6">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 h-auto p-1">
                {selectedVehicle !== "all" && (
                  <TabsTrigger value="efficiency" className="flex items-center gap-2 py-2">
                    <LineChartIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Fuel Efficiency</span>
                    <span className="sm:hidden">Efficiency</span>
                  </TabsTrigger>
                )}
                {selectedVehicle !== "all" && (
                  <TabsTrigger value="prices" className="flex items-center gap-2 py-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline">Fuel Prices</span>
                    <span className="sm:hidden">Prices</span>
                  </TabsTrigger>
                )}
                <TabsTrigger value="expenses" className="flex items-center gap-2 py-2">
                  <BarChartIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Monthly Expenses</span>
                  <span className="sm:hidden">Expenses</span>
                </TabsTrigger>
                <TabsTrigger value="breakdown" className="flex items-center gap-2 py-2">
                  <PieChartIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Fuel Breakdown</span>
                  <span className="sm:hidden">Breakdown</span>
                </TabsTrigger>
                {selectedVehicle === "all" && (
                  <TabsTrigger value="vehicles" className="flex items-center gap-2 py-2">
                    <Car className="h-4 w-4" />
                    <span className="hidden sm:inline">Vehicle Usage</span>
                    <span className="sm:hidden">Vehicles</span>
                  </TabsTrigger>
                )}
              </TabsList>

              {selectedVehicle !== "all" && (
                <TabsContent value="efficiency" className="space-y-4 animate-fade-in">
                  <Card className="chart-container">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg md:text-xl">Fuel Efficiency Over Time</CardTitle>
                      <CardDescription>Track how your fuel efficiency changes over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] md:h-[400px] p-2 md:p-4">
                      {fuelEfficiencyData.length === 0 ? (
                        <EmptyState
                          title="Not enough data"
                          description="Add more fuel logs to see efficiency trends."
                          icon={<LineChartIcon className="h-10 w-10" />}
                          className="h-full"
                        />
                      ) : (
                        <ChartContainer
                          config={{
                            efficiency: {
                              label: "Efficiency",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={fuelEfficiencyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis
                                dataKey="date"
                                tick={{ fill: "hsl(var(--foreground))", fontSize: "0.75rem" }}
                                tickMargin={10}
                              />
                              <YAxis tick={{ fill: "hsl(var(--foreground))", fontSize: "0.75rem" }} width={40} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                              <Line
                                type="monotone"
                                dataKey="efficiency"
                                stroke="var(--color-efficiency)"
                                strokeWidth={2}
                                name={`Efficiency (${fuelEfficiencyData[0]?.unit || ""})`}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {selectedVehicle !== "all" && (
                <TabsContent value="prices" className="space-y-4 animate-fade-in">
                  <Card className="chart-container">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg md:text-xl">Fuel Price Trends</CardTitle>
                      <CardDescription>Track how fuel prices change over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] md:h-[400px] p-2 md:p-4">
                      {fuelPriceData.length === 0 ? (
                        <EmptyState
                          title="Not enough data"
                          description="Add more fuel logs to see price trends."
                          icon={<TrendingUp className="h-10 w-10" />}
                          className="h-full"
                        />
                      ) : (
                        <ChartContainer
                          config={{
                            price: {
                              label: "Price",
                              color: "hsl(var(--chart-2))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={fuelPriceData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis
                                dataKey="date"
                                tick={{ fill: "hsl(var(--foreground))", fontSize: "0.75rem" }}
                                tickMargin={10}
                              />
                              <YAxis tick={{ fill: "hsl(var(--foreground))", fontSize: "0.75rem" }} width={40} />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                              <Line
                                type="monotone"
                                dataKey="price"
                                stroke="var(--color-price)"
                                strokeWidth={2}
                                name={`Price per ${vehicles.find((v) => v.id === selectedVehicle)?.fuelUnit}`}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="expenses" className="space-y-4 animate-fade-in">
                <Card className="chart-container">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg md:text-xl">Monthly Expenses</CardTitle>
                    <CardDescription>Track your fuel expenses by month</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] md:h-[400px] p-2 md:p-4">
                    {monthlyExpensesData.length === 0 ? (
                      <EmptyState
                        title="Not enough data"
                        description="Add more fuel logs to see monthly expenses."
                        icon={<Calendar className="h-10 w-10" />}
                        className="h-full"
                      />
                    ) : (
                      <ChartContainer
                        config={{
                          cost: {
                            label: "Cost",
                            color: "hsl(var(--chart-3))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={monthlyExpensesData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                              dataKey="month"
                              tick={{ fill: "hsl(var(--foreground))", fontSize: "0.75rem" }}
                              tickMargin={10}
                            />
                            <YAxis tick={{ fill: "hsl(var(--foreground))", fontSize: "0.75rem" }} width={40} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                            <Bar dataKey="cost" fill="var(--color-cost)" name="Expenses" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-4 animate-fade-in">
                <Card className="chart-container">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg md:text-xl">Fuel Type Breakdown</CardTitle>
                    <CardDescription>Distribution of fuel types used</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] md:h-[400px] p-2 md:p-4">
                    {fuelTypeData.length === 0 ? (
                      <EmptyState
                        title="Not enough data"
                        description="Add more fuel logs to see fuel type breakdown."
                        icon={<PieChartIcon className="h-10 w-10" />}
                        className="h-full"
                      />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={fuelTypeData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {fuelTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value.toFixed(2)} units`, "Amount"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {selectedVehicle === "all" && (
                <TabsContent value="vehicles" className="space-y-4 animate-fade-in">
                  <Card className="chart-container">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg md:text-xl">Vehicle Usage</CardTitle>
                      <CardDescription>Distribution of logs by vehicle</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] md:h-[400px] p-2 md:p-4">
                      {vehicleDistributionData.length === 0 ? (
                        <EmptyState
                          title="Not enough data"
                          description="Add more fuel logs to see vehicle usage breakdown."
                          icon={<Car className="h-10 w-10" />}
                          className="h-full"
                        />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={vehicleDistributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={2}
                            >
                              {vehicleDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value} logs`, "Count"]} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

