"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { searchParams } = new URL(window.location.href)
      const code = searchParams.get("code")

      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
        router.push("/dashboard")
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing authentication...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}
