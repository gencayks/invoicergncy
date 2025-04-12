"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/app-header"
import { supabase, ensureValidSession } from "@/lib/supabase"

export default function Home() {
  const { user, isLoading, refreshSession } = useAuth()
  const router = useRouter()
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if we have a valid session
        const isValid = await ensureValidSession()

        if (!isValid) {
          console.log("No valid session found, redirecting to login")
          router.push("/login")
          return
        }

        setIsCheckingSession(false)
      } catch (error) {
        console.error("Error checking session:", error)
        setSessionError("There was a problem with your authentication. Please try logging in again.")
        setIsCheckingSession(false)
      }
    }

    if (!isLoading) {
      checkSession()
    }
  }, [isLoading, router])

  // Handle session recovery
  const handleRecoverSession = async () => {
    setIsCheckingSession(true)
    setSessionError(null)

    try {
      // Clear any existing auth data
      await supabase.auth.signOut()

      // Refresh the page to reset the auth state
      window.location.href = "/login"
    } catch (error) {
      console.error("Error recovering session:", error)
      setSessionError("Unable to recover session. Please try again.")
      setIsCheckingSession(false)
    }
  }

  if (isLoading || isCheckingSession) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  if (sessionError) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg border border-red-200">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Authentication Error</h2>
            <p className="mb-4 text-red-600">{sessionError}</p>
            <Button onClick={handleRecoverSession}>Return to Login</Button>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    // This should not happen due to the redirect in useEffect, but just in case
    router.push("/login")
    return null
  }

  // User is authenticated, render the home page
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to gncy Invoice Generator</h1>
        {/* Rest of your home page content */}
      </main>
    </div>
  )
}
