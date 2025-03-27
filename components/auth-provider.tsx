"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { generateSampleData } from "@/lib/sample-data"

type User = {
  id: string
  name: string
  email: string
  avatar?: string
  provider: "google" | "facebook" | "email" | "phone"
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (provider: string, credentials: any) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("fueltrack_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Redirect logic
    if (!isLoading) {
      const isAuthPage = pathname === "/login" || pathname === "/register"

      if (!user && !isAuthPage) {
        router.push("/login")
      } else if (user && isAuthPage) {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, pathname, router])

  const login = async (provider: string, credentials: any) => {
    setIsLoading(true)

    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create a fake user based on the provider
    const newUser: User = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      name: credentials.name || "Demo User",
      email: credentials.email || "user@example.com",
      provider: provider as any,
      avatar:
        credentials.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.name || "Demo User")}&background=random`,
    }

    // Save to localStorage
    localStorage.setItem("fueltrack_user", JSON.stringify(newUser))
    setUser(newUser)

    // Generate sample data
    generateSampleData()

    setIsLoading(false)

    router.push("/dashboard")
  }

  const logout = () => {
    localStorage.removeItem("fueltrack_user")
    localStorage.removeItem("fueltrack_vehicles")
    localStorage.removeItem("fueltrack_logs")
    setUser(null)
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

