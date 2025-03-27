"use client"

import type React from "react"
import AppShell from "./navigation/app-shell"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}

