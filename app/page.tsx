"use client"

import { useEffect, useState } from "react"
import AdvancedInvoiceGenerator from "@/components/advanced-invoice-generator"
import GncyLogo from "@/components/gncy-logo"
import AppHeader from "@/components/app-header"
import AuthForm from "@/components/auth-form"
import { useAuth } from "@/hooks/use-auth"
import { ClientProvider } from "@/hooks/use-clients"
import { InvoiceProvider } from "@/hooks/use-invoices"
import { DraftsProvider } from "@/hooks/use-drafts"
import { useBusiness } from "@/hooks/use-business"
import { createBusiness } from "@/lib/business-service"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

export default function Home() {
  const { user, isLoading: authLoading } = useAuth()
  const { businesses, isLoading: businessLoading, refreshBusinesses } = useBusiness()
  const [mounted, setMounted] = useState(false)
  const [initializing, setInitializing] = useState(false)
  const [initializationError, setInitializationError] = useState<Error | null>(null)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // Set mounted state to handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Add a timeout to detect stuck loading states
  useEffect(() => {
    if ((authLoading || businessLoading || initializing) && mounted) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true)
      }, 10000) // 10 seconds timeout

      return () => clearTimeout(timer)
    }

    setLoadingTimeout(false)
  }, [authLoading, businessLoading, initializing, mounted])

  // Initialize user data if needed
  useEffect(() => {
    const initializeUserData = async () => {
      if (user && !businessLoading && businesses.length === 0 && !initializing) {
        try {
          setInitializing(true)
          setInitializationError(null)

          // Create default business for new user
          await createBusiness(user.id, {
            name: "My Business",
            email: user.email || "",
          })
          await refreshBusinesses()
        } catch (error) {
          console.error("Error initializing user data:", error)
          setInitializationError(error as Error)
        } finally {
          setInitializing(false)
        }
      }
    }

    initializeUserData()
  }, [user, businesses, businessLoading, initializing, refreshBusinesses])

  // Handle manual refresh when loading gets stuck
  const handleManualRefresh = () => {
    window.location.reload()
  }

  // Show loading state
  if (!mounted || authLoading || businessLoading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <GncyLogo />
          <p className="mt-4 text-gray-500">Loading...</p>

          {/* Show refresh button if loading takes too long */}
          {loadingTimeout && (
            <div className="mt-6">
              <p className="text-amber-600 mb-2">Loading is taking longer than expected.</p>
              <Button onClick={handleManualRefresh} className="flex items-center">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show error state if initialization failed
  if (initializationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md p-6">
          <GncyLogo />
          <p className="mt-4 text-red-600">Error initializing application data.</p>
          <p className="mt-2 text-gray-600 text-sm">{initializationError.message}</p>
          <Button onClick={handleManualRefresh} className="mt-4 flex items-center mx-auto">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Show auth form if not authenticated
  if (!user) {
    return <AuthForm />
  }

  // Show invoice generator if authenticated
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-serif mt-6 mb-4">Advanced Invoice Generator | Create Professional Invoices</h1>
            <p className="text-gray-600 mb-4">
              Create and send invoices easily with our powerful invoice maker. Use customizable templates, automated
              reminders, and payment integrations to streamline your invoicing process. Not sure what an invoice is?
              Read our{" "}
              <a href="/documentation" className="text-blue-600 hover:underline">
                invoice guide
              </a>
              .
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700">
              <p>
                <strong>Note:</strong> Your drafts are currently stored in your browser's local storage. They will be
                available on this device only.
              </p>
            </div>
          </div>
          <ClientProvider>
            <InvoiceProvider>
              <DraftsProvider>
                <AdvancedInvoiceGenerator />
              </DraftsProvider>
            </InvoiceProvider>
          </ClientProvider>
        </div>
      </main>
    </div>
  )
}
