"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Theme = "light" | "dark" | "system"

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
})

export function ThemeProvider({
  attribute,
  defaultTheme,
  children,
  enableSystem = true,
  disableTransitionOnChange = false,
}: {
  attribute: string
  defaultTheme?: Theme
  children: React.ReactNode
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("fueltrack_theme") as Theme | null
      if (storedTheme) {
        return storedTheme
      } else {
        return defaultTheme || "system"
      }
    }
    return defaultTheme || "system"
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    localStorage.setItem("fueltrack_theme", theme)

    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      document.documentElement.setAttribute(attribute, isDark ? "dark" : "light")
    } else if (theme) {
      document.documentElement.setAttribute(attribute, theme)
    }
  }, [theme, attribute])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

