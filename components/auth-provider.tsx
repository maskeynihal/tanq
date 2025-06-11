"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabase"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (provider: string, credentials?: { email: string; password?: string }) => Promise<void>
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseBrowserClient()

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        // Get session from Supabase
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession()

        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Redirect logic
  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === "/login" || pathname === "/register"

      if (!user && !isAuthPage) {
        router.push("/login")
      } else if (user && isAuthPage) {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, pathname, router])

  // Sign in with email and password or provider
  const signIn = async (provider: string, credentials?: { email: string; password?: string }) => {
    setIsLoading(true)

    try {
      if (provider === "email" && credentials?.email && credentials?.password) {
        // Sign in with email and password
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })

        if (error) throw error
      } else if (provider === "magic-link" && credentials?.email) {
        // Sign in with magic link
        const { error } = await supabase.auth.signInWithOtp({
          email: credentials.email,
        })

        if (error) throw error

        // Show message to check email
        alert("Check your email for the login link!")
      } else if (["google", "facebook", "github"].includes(provider)) {
        // Sign in with OAuth provider
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider as any,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error
      } else {
        throw new Error("Invalid sign in method")
      }
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: { name?: string }) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Show message to check email for confirmation
      alert("Check your email for the confirmation link!")
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      alert("Check your email for the password reset link!")
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
