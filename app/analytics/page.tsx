"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import AppHeader from "@/components/app-header"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}
