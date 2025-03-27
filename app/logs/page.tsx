"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import MainLayout from "@/components/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  PlusCircle,
  Edit,
  Trash2,
  Filter,
  Search,
  FuelIcon as GasPump,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  MoreHorizontal,
  X,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getVehicles } from "@/lib/vehicle-service"
import { getLogs, deleteLog, calculateFuelEfficiency } from "@/lib/log-service"
import type { Vehicle, FuelLog } from "@/lib/types"
import { EmptyState } from "@/components/ui/empty-state"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function LogsPage() {
  // Core state
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [logs, setLogs] = useState<FuelLog[]>([])

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filter state
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Simulate network delay for loading state demonstration
        await new Promise((resolve) => setTimeout(resolve, 500))

        const loadedVehicles = getVehicles()
        const loadedLogs = getLogs()

        setVehicles(loadedVehicles)
        setLogs(loadedLogs)
      } catch (err) {
        console.error("Failed to load data:", err)
        setError("Failed to load logs. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    if (logs.length === 0) return []

    try {
      let filtered = [...logs]

      // Filter by vehicle
      if (selectedVehicle !== "all") {
        filtered = filtered.filter((log) => log.vehicleId === selectedVehicle)
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        filtered = filtered.filter((log) => {
          const vehicle = vehicles.find((v) => v.id === log.vehicleId)
          const date = new Date(log.date).toLocaleDateString()

          return (
            vehicle?.name.toLowerCase().includes(query) ||
            date.includes(query) ||
            log.fuelType.toLowerCase().includes(query) ||
            (log.gasStation?.toLowerCase() || "").includes(query) ||
            (log.notes?.toLowerCase() || "").includes(query)
          )
        })
      }

      // Sort by date
      return filtered.sort((a, b) => (sortOrder === "desc" ? b.date - a.date : a.date - b.date))
    } catch (err) {
      console.error("Error filtering logs:", err)
      return []
    }
  }, [logs, selectedVehicle, searchQuery, sortOrder, vehicles])

  // Action handlers
  const handleDeleteLog = useCallback(async (id: string) => {
    try {
      deleteLog(id)
      setLogs((prev) => prev.filter((log) => log.id !== id))
    } catch (err) {
      console.error("Failed to delete log:", err)
      alert("Failed to delete log. Please try again.")
    }
  }, [])

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery("")
    setSelectedVehicle("all")
  }, [])

  // Utility functions
  const formatCurrency = (value: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getVehicleName = (id: string) => {
    return vehicles.find((v) => v.id === id)?.name || "Unknown Vehicle"
  }

  const getEfficiencyText = (log: FuelLog, prevLog?: FuelLog): string => {
    if (!prevLog || log.isTrip || prevLog.isTrip) return "N/A"

    const vehicle = vehicles.find((v) => v.id === log.vehicleId)
    if (!vehicle) return "N/A"

    const efficiency = calculateFuelEfficiency(log, prevLog)

    if (efficiency.mpg) {
      return `${efficiency.mpg.toFixed(2)} MPG`
    } else if (efficiency.kmPerLiter) {
      return `${efficiency.kmPerLiter.toFixed(2)} km/L (${efficiency.litersPer100km?.toFixed(2)} L/100km)`
    }

    return "N/A"
  }

  // Find previous log for efficiency calculation
  const getPreviousLog = (log: FuelLog): FuelLog | undefined => {
    return logs
      .filter((l) => l.vehicleId === log.vehicleId && !l.isTrip && l.date < log.date)
      .sort((a, b) => b.date - a.date)[0]
  }

  // Error state
  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="page-header">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Fuel Logs</h1>
            <p className="text-muted-foreground">View and manage your fuel logs.</p>
          </div>

          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center text-center p-6">
                <div className="rounded-full bg-destructive/10 p-3 mb-4">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Error Loading Logs</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="page-header">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Fuel Logs</h1>
            <p className="text-muted-foreground">View and manage your fuel logs.</p>
          </div>

          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <GasPump className="h-12 w-12 text-muted-foreground mb-4" />
                <div className="absolute inset-0 animate-pulse bg-primary/10 rounded-full"></div>
              </div>
              <p className="text-muted-foreground">Loading your fuel logs...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Mobile log card component
  const LogCard = ({ log }: { log: FuelLog }) => {
    const prevLog = getPreviousLog(log)
    const vehicle = vehicles.find((v) => v.id === log.vehicleId)

    return (
      <Card className="mb-3 vehicle-card">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">{formatDate(log.date)}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href={`/logs/edit/${log.id}`} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this fuel log from your records.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteLog(log.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>{getVehicleName(log.vehicleId)}</CardDescription>
        </CardHeader>
        <CardContent className="pb-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Fuel Amount</p>
              <p className="font-medium">
                {log.fuelAmount} {vehicle?.fuelUnit}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fuel Type</p>
              <Badge variant="outline" className="mt-1">
                {log.fuelType}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cost</p>
              <p className="font-medium">{formatCurrency(log.totalCost, log.currency)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="font-medium">
                {formatCurrency(log.pricePerUnit, log.currency)}/{vehicle?.fuelUnit}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Efficiency</p>
            <Badge variant="secondary" className="font-medium mt-1">
              {getEfficiencyText(log, prevLog)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Fuel Logs</h1>
            <p className="text-muted-foreground text-sm md:text-base">View and manage your fuel logs.</p>
          </div>
          <div className="flex items-center justify-center w-full md:w-auto mt-4 md:mt-0">
            <Button asChild className="w-full md:w-auto">
              <Link href="/logs/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Log
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-lg md:text-xl">Log History</CardTitle>
                <CardDescription>Your fuel log history sorted by date.</CardDescription>
              </div>

              {/* Mobile filter collapsible */}
              <div className="w-full md:hidden">
                <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="w-full">
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full flex justify-between">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        Filters {searchQuery || selectedVehicle !== "all" ? "(Active)" : ""}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-3">
                    <div className="relative w-full">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search logs..."
                        className="pl-9 h-10 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full">
                      <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Filter by vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vehicles</SelectItem>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center"
                        onClick={toggleSortOrder}
                      >
                        <ArrowUpDown
                          className={`mr-2 h-4 w-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
                        />
                        Sort by Date: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                      </Button>

                      {(searchQuery || selectedVehicle !== "all") && (
                        <Button
                          variant="ghost"
                          className="w-full flex items-center justify-center"
                          onClick={clearFilters}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Desktop filters */}
              <div className="hidden md:flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-9 h-10 w-full sm:w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger className="h-10 w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vehicles</SelectItem>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" size="sm" className="h-10" onClick={toggleSortOrder}>
                  <ArrowUpDown
                    className={`mr-2 h-4 w-4 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
                  />
                  {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                </Button>

                {(searchQuery || selectedVehicle !== "all") && (
                  <Button variant="ghost" size="sm" className="h-10" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredLogs.length === 0 ? (
              <EmptyState
                title="No logs found"
                description={
                  searchQuery || selectedVehicle !== "all"
                    ? "Try changing your search or filter criteria."
                    : "Add your first fuel log to start tracking efficiency."
                }
                icon={<GasPump className="h-12 w-12" />}
                actionLabel={searchQuery || selectedVehicle !== "all" ? "Clear filters" : "Add Your First Log"}
                actionOnClick={searchQuery || selectedVehicle !== "all" ? clearFilters : undefined}
                actionLink={searchQuery || selectedVehicle !== "all" ? undefined : "/logs/add"}
                className="py-12"
              />
            ) : (
              <>
                {/* Mobile view - cards */}
                <div className="md:hidden space-y-4">
                  {filteredLogs.map((log) => (
                    <LogCard key={log.id} log={log} />
                  ))}
                </div>

                {/* Desktop view - table */}
                <div className="hidden md:block rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[120px]">
                          <Button
                            variant="ghost"
                            className="p-0 h-8 font-medium flex items-center"
                            onClick={toggleSortOrder}
                          >
                            Date
                            <ArrowUpDown
                              className={`ml-2 h-3.5 w-3.5 transition-transform ${sortOrder === "asc" ? "rotate-180" : ""}`}
                            />
                          </Button>
                        </TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Fuel</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Efficiency</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => {
                        const prevLog = getPreviousLog(log)
                        const vehicle = vehicles.find((v) => v.id === log.vehicleId)

                        return (
                          <TableRow key={log.id} className="log-row">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(log.date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                                {getVehicleName(log.vehicleId)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>
                                  {log.fuelAmount} {vehicle?.fuelUnit}
                                </span>
                                <Badge variant="outline" className="mt-1 w-fit">
                                  {log.fuelType}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{formatCurrency(log.totalCost, log.currency)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatCurrency(log.pricePerUnit, log.currency)}/{vehicle?.fuelUnit}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="font-medium">
                                {getEfficiencyText(log, prevLog)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/logs/edit/${log.id}`} className="cursor-pointer">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        onSelect={(e) => e.preventDefault()}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently delete this fuel log from
                                          your records.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteLog(log.id)}>
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

