"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FuelIcon as GasPump } from "lucide-react"

export default function ForgotPasswordPage() {
  const { resetPassword, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await resetPassword(email)
      setIsSuccess(true)
    } catch (error: any) {
      setError(error.message || "Failed to send reset link")
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-8 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center items-center">
          <div className="rounded-full bg-primary/20 p-3 mb-2">
            <GasPump className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">FuelTrack</h1>
          <p className="text-muted-foreground">Reset your password</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Forgot password</CardTitle>
            <CardDescription className="text-center">Enter your email and we'll send you a reset link</CardDescription>
          </CardHeader>
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
              {isSuccess && (
                <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md">
                  Reset link sent! Check your email.
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  disabled={isLoading || isSuccess}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full h-11" disabled={isLoading || isSuccess}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center text-sm">
                Remember your password?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
