"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./use-auth"
import * as BusinessService from "@/lib/business-service"

type BusinessContextType = {
  businesses: any[]
  currentBusiness: any | null
  isLoading: boolean
  error: Error | null
  setCurrentBusiness: (business: any) => void
  refreshBusinesses: () => Promise<void>
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [currentBusiness, setCurrentBusiness] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [loadAttempted, setLoadAttempted] = useState(false)

  const loadBusinesses = useCallback(async () => {
    if (!user) {
      setBusinesses([])
      setCurrentBusiness(null)
      setIsLoading(false)
      setLoadAttempted(true)
      return
    }

    try {
      console.log("Loading businesses for user:", user.id)
      setIsLoading(true)
      setError(null)

      const { businesses: fetchedBusinesses, error: fetchError } = await BusinessService.getUserBusinesses(user.id)

      if (fetchError) throw fetchError

      setBusinesses(fetchedBusinesses || [])

      // Set current business if not already set
      if (fetchedBusinesses && fetchedBusinesses.length > 0 && !currentBusiness) {
        setCurrentBusiness(fetchedBusinesses[0])
      }
    } catch (err) {
      console.error("Failed to load businesses:", err)
      setError(err as Error)
      setBusinesses([])
    } finally {
      setIsLoading(false)
      setLoadAttempted(true)
      console.log("Finished loading businesses")
    }
  }, [user, currentBusiness])

  // Load businesses when user changes
  useEffect(() => {
    // Add a safety timeout to prevent infinite loading
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Business loading timed out")
        setIsLoading(false)
        setLoadAttempted(true)
      }
    }, 5000) // 5 second timeout

    loadBusinesses()

    return () => clearTimeout(safetyTimeout)
  }, [user, loadBusinesses])

  const refreshBusinesses = useCallback(async () => {
    await loadBusinesses()
  }, [loadBusinesses])

  const value = {
    businesses,
    currentBusiness,
    isLoading,
    error,
    setCurrentBusiness,
    refreshBusinesses,
  }

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export const useBusiness = () => {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider")
  }
  return context
}
