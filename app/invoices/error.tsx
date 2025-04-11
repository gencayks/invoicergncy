"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { Home, RefreshCw } from "lucide-react"
import AppHeader from "@/components/app-header"

export default function InvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Invoices page error:", error)

    // Attempt automatic recovery after 5 seconds
    const recoveryTimer = setTimeout(() => {
      console.log("Attempting automatic recovery...")
      reset()
    }, 5000)

    return () => clearTimeout(recoveryTimer)
  }, [error, reset])

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-4">{t("somethingWentWrong")}</h2>
          <p className="text-red-600 mb-6">{error.message || t("errorOccurred")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => reset()} className="flex items-center justify-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("tryAgain")}
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="flex items-center justify-center">
              <Home className="h-4 w-4 mr-2" />
              {t("goHome")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
