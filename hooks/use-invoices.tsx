"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useBusiness } from "./use-business"
import { useAuth } from "./use-auth"
import type { InvoiceData } from "@/lib/invoice-service"
import * as InvoiceService from "@/lib/invoice-service"

type InvoiceContextType = {
  invoices: any[]
  currentInvoice: any | null
  isLoading: boolean
  error: Error | null
  setCurrentInvoice: (invoice: any) => void
  createNewInvoice: (invoiceData: InvoiceData) => Promise<any>
  updateCurrentInvoice: (updates: Partial<InvoiceData>) => Promise<any>
  deleteCurrentInvoice: () => Promise<boolean>
  updateCurrentInvoiceStatus: (status: "draft" | "sent" | "paid" | "overdue" | "cancelled") => Promise<any>
  refreshInvoices: () => Promise<void>
  loadInvoice: (invoiceId: string) => Promise<any>
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined)

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { currentBusiness } = useBusiness()
  const [invoices, setInvoices] = useState<any[]>([])
  const [currentInvoice, setCurrentInvoice] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const loadInvoices = useCallback(async () => {
    if (!currentBusiness?.id) {
      setInvoices([])
      setCurrentInvoice(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      console.log("Loading invoices for business:", currentBusiness?.id)

      const { invoices: fetchedInvoices, error: fetchError } = await InvoiceService.getBusinessInvoices(
        currentBusiness.id,
      )

      if (fetchError) {
        console.error("Error fetching invoices:", fetchError)
        throw fetchError
      }

      console.log(`Successfully loaded ${fetchedInvoices?.length || 0} invoices`)

      setInvoices(fetchedInvoices || [])
    } catch (err) {
      console.error("Failed to load invoices:", err)
      setError(err as Error)
      setInvoices([])
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [currentBusiness?.id])

  // Only load invoices when the business changes and we haven't initialized yet
  useEffect(() => {
    if (user && currentBusiness?.id) {
      loadInvoices()
    } else if (!user || !currentBusiness?.id) {
      // Reset state when dependencies are not available
      setInvoices([])
      setCurrentInvoice(null)
      setIsLoading(false)
      setError(null)
    }
  }, [user, currentBusiness?.id, loadInvoices])

  const refreshInvoices = useCallback(async () => {
    await loadInvoices()
  }, [loadInvoices])

  const loadInvoice = useCallback(async (invoiceId: string) => {
    if (!invoiceId) {
      console.error("No invoice ID provided")
      return null
    }

    try {
      setIsLoading(true)
      setError(null)

      const { invoice, error: invoiceError } = await InvoiceService.getInvoice(invoiceId)

      if (invoiceError) throw invoiceError

      setCurrentInvoice(invoice)
      return invoice
    } catch (err) {
      console.error("Failed to load invoice:", err)
      setError(err as Error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createNewInvoice = useCallback(
    async (invoiceData: InvoiceData) => {
      if (!currentBusiness?.id) {
        const error = new Error("No business selected")
        setError(error)
        throw error
      }

      try {
        setIsLoading(true)
        setError(null)

        const { invoice, error: createError } = await InvoiceService.createInvoice({
          ...invoiceData,
          businessId: currentBusiness.id,
        })

        if (createError) throw createError

        await refreshInvoices()
        return invoice
      } catch (err) {
        console.error("Failed to create invoice:", err)
        setError(err as Error)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [currentBusiness?.id, refreshInvoices],
  )

  const updateCurrentInvoice = useCallback(
    async (updates: Partial<InvoiceData>) => {
      if (!currentInvoice?.id) {
        const error = new Error("No invoice selected")
        setError(error)
        throw error
      }

      try {
        setIsLoading(true)
        setError(null)

        const { invoice, error: updateError } = await InvoiceService.updateInvoice(currentInvoice.id, updates)

        if (updateError) throw updateError

        setCurrentInvoice(invoice)
        await refreshInvoices()
        return invoice
      } catch (err) {
        console.error("Failed to update invoice:", err)
        setError(err as Error)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [currentInvoice?.id, refreshInvoices],
  )

  const deleteCurrentInvoice = useCallback(async () => {
    if (!currentInvoice?.id) {
      const error = new Error("No invoice selected")
      setError(error)
      throw error
    }

    try {
      setIsLoading(true)
      setError(null)

      const { error: deleteError } = await InvoiceService.deleteInvoice(currentInvoice.id)

      if (deleteError) throw deleteError

      setCurrentInvoice(null)
      await refreshInvoices()
      return true
    } catch (err) {
      console.error("Failed to delete invoice:", err)
      setError(err as Error)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [currentInvoice?.id, refreshInvoices])

  const updateCurrentInvoiceStatus = useCallback(
    async (status: "draft" | "sent" | "paid" | "overdue" | "cancelled") => {
      if (!currentInvoice?.id) {
        const error = new Error("No invoice selected")
        setError(error)
        throw error
      }

      try {
        setIsLoading(true)
        setError(null)

        const { invoice, error: statusError } = await InvoiceService.updateInvoiceStatus(currentInvoice.id, status)

        if (statusError) throw statusError

        setCurrentInvoice({
          ...currentInvoice,
          status,
        })

        await refreshInvoices()
        return invoice
      } catch (err) {
        console.error("Failed to update invoice status:", err)
        setError(err as Error)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [currentInvoice, refreshInvoices],
  )

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      invoices,
      currentInvoice,
      isLoading,
      error,
      setCurrentInvoice,
      createNewInvoice,
      updateCurrentInvoice,
      deleteCurrentInvoice,
      updateCurrentInvoiceStatus,
      refreshInvoices,
      loadInvoice,
    }),
    [
      invoices,
      currentInvoice,
      isLoading,
      error,
      createNewInvoice,
      updateCurrentInvoice,
      deleteCurrentInvoice,
      updateCurrentInvoiceStatus,
      refreshInvoices,
      loadInvoice,
    ],
  )

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
}

export const useInvoices = () => {
  const context = useContext(InvoiceContext)
  if (context === undefined) {
    throw new Error("useInvoices must be used within an InvoiceProvider")
  }
  return context
}
