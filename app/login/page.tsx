"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, FuelIcon as GasPump } from "lucide-react"

export default function LoginPage() {
  const { signIn, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showOtpField, setShowOtpField] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await signIn("email", { email, password })
    } catch (error: any) {
      setError(error.message || "Failed to sign in")
    }
  }

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await signIn("magic-link", { email })
      setShowOtpField(true)
    } catch (error: any) {
      setError(error.message || "Failed to send magic link")
    }
  }

  const handleSocialLogin = async (provider: string) => {
    setError(null)

    try {
      await signIn(provider)
    } catch (error: any) {
      setError(error.message || `Failed to sign in with ${provider}`)
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
          <p className="text-muted-foreground">Track your vehicle's fuel efficiency</p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="animate-slide-up">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                <CardDescription className="text-center">Enter your email to sign in to your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailLogin}>
                <CardContent className="space-y-4">
                  {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
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
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full h-11" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <div className="text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="magic-link" className="animate-slide-up">
            <Card className="border-none shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center">Magic link</CardTitle>
                <CardDescription className="text-center">Enter your email to receive a sign in link</CardDescription>
              </CardHeader>
              <form onSubmit={handleMagicLinkLogin}>
                <CardContent className="space-y-4">
                  {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
                  {showOtpField && (
                    <div className="bg-green-100 text-green-800 text-sm p-3 rounded-md">
                      Check your email for the magic link!
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">Email</Label>
                    <Input
                      id="magic-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full h-11" disabled={isLoading || showOtpField}>
                    {isLoading ? "Sending..." : showOtpField ? "Check your email" : "Send Magic Link"}
                  </Button>
                  <div className="text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-11" onClick={() => handleSocialLogin("google")} disabled={isLoading}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12 h8"></path>
              <path d="M12 8 v8"></path>
            </svg>
            Google
          </Button>
          <Button variant="outline" className="h-11" onClick={() => handleSocialLogin("github")} disabled={isLoading}>
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>
      </div>
    </div>
  )
}
