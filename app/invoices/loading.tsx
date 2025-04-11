"use client"

import { useEffect, useState } from "react"
import AppHeader from "@/components/app-header"
import { Skeleton } from "@/components/ui/skeleton"
import { useLanguage } from "@/contexts/language-context"

export default function InvoicesLoading() {
  const { t } = useLanguage()
  const [loadingTime, setLoadingTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Show additional message if loading takes too long
  const showHelp = loadingTime > 5

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>

        {showHelp && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              {t("loadingTakingLonger")} ({loadingTime}s)
            </p>
            <p className="text-sm text-yellow-600 mt-2">{t("tryRefreshingPage")}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="p-6 pb-2">
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="px-6 pb-2">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="px-6 pb-6 pt-2 flex justify-between">
                <div className="flex space-x-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
