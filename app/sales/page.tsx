"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import AppHeader from "@/components/app-header"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { SalesAnalytics } from "@/components/sales/sales-analytics"
import { SalesKanban } from "@/components/sales/sales-kanban"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SalesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("analytics")

  // Set mounted state to handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user && mounted) {
      router.push("/login")
    }
  }, [authLoading, user, router, mounted])

  // Show loading state
  if (!mounted || authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your sales performance and manage your sales pipeline</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="pipeline">Sales Pipeline</TabsTrigger>
          </TabsList>
          <TabsContent value="analytics" className="space-y-6">
            <SalesAnalytics />
          </TabsContent>
          <TabsContent value="pipeline" className="space-y-6">
            <SalesKanban />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
