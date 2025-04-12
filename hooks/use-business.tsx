"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { getUserBusinesses, createBusiness, updateBusiness, deleteBusiness } from "@/lib/business-service"
import { useAuth } from "./use-auth"

type BusinessContextType = {
  businesses: any[]
  currentBusiness: any | null
  isLoading: boolean
  error: Error | null
  setCurrentBusiness: (business: any) => void
  createNewBusiness: (name: string, data?: any) => Promise<any>
  updateCurrentBusiness: (data: any) => Promise<any>
  deleteCurrentBusiness: () => Promise<any>
  refreshBusinesses: () => Promise<void>
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [currentBusiness, setCurrentBusiness] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [loadAttempts, setLoadAttempts] = useState(0)

  const loadBusinesses = async () => {
    if (!user) {
      setBusinesses([])
      setCurrentBusiness(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { businesses, error } = await getUserBusinesses(user.id)

      if (error) throw error

      setBusinesses(businesses)

      // Set current business to the first one if not already set
      if (businesses.length > 0 && !currentBusiness) {
        setCurrentBusiness(businesses[0])
      } else if (businesses.length === 0) {
        setCurrentBusiness(null)
      }
    } catch (err) {
      console.error("Error loading businesses:", err)
      setError(err as Error)

      // If we've tried less than 3 times, try again after a delay
      if (loadAttempts < 3) {
        setTimeout(() => {
          setLoadAttempts((prev) => prev + 1)
        }, 2000) // Retry after 2 seconds
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Load businesses when user changes or when loadAttempts changes (for retries)
  useEffect(() => {
    loadBusinesses()
  }, [user, loadAttempts])

  const refreshBusinesses = async () => {
    await loadBusinesses()
  }

  const createNewBusiness = async (name: string, data?: any) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { business, error } = await createBusiness(user.id, {
        name,
        ...data,
      })

      if (error) throw error

      await refreshBusinesses()
      return business
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const updateCurrentBusiness = async (data: any) => {
    if (!currentBusiness || !user) throw new Error("No business selected or user not authenticated")

    try {
      const { business, error } = await updateBusiness(currentBusiness.id, data, user.id)

      if (error) throw error

      await refreshBusinesses()
      return business
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const deleteCurrentBusiness = async () => {
    if (!currentBusiness || !user) throw new Error("No business selected or user not authenticated")

    try {
      const { error } = await deleteBusiness(currentBusiness.id, user.id)

      if (error) throw error

      setCurrentBusiness(null)
      await refreshBusinesses()
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const value = {
    businesses,
    currentBusiness,
    isLoading,
    error,
    setCurrentBusiness,
    createNewBusiness,
    updateCurrentBusiness,
    deleteCurrentBusiness,
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
