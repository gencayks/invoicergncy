"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getUserDrafts, saveDraftInvoice, deleteDraftInvoice, getDraftInvoice } from "@/lib/draft-service"
import { useAuth } from "./use-auth"
import type { DraftInvoiceData } from "@/lib/draft-service"
import { useToast } from "@/hooks/use-toast"

type DraftsContextType = {
  drafts: DraftInvoiceData[]
  isLoading: boolean
  error: Error | null
  saveDraft: (draftData: DraftInvoiceData) => Promise<DraftInvoiceData | null>
  deleteDraft: (draftId: string) => Promise<boolean>
  getDraft: (draftId: string) => Promise<DraftInvoiceData | null>
  refreshDrafts: () => Promise<void>
  retryLoadDrafts: () => void
}

const DraftsContext = createContext<DraftsContextType | undefined>(undefined)

export function DraftsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [drafts, setDrafts] = useState<DraftInvoiceData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState(0)

  const loadDrafts = useCallback(
    async (forceRefresh = false) => {
      if (!user) {
        setDrafts([])
        setIsLoading(false)
        return
      }

      // Prevent too frequent refreshes (throttle to once every 5 seconds)
      const now = Date.now()
      if (!forceRefresh && now - lastRefreshAttempt < 5000) {
        console.log("Throttling draft refresh - too frequent")
        return
      }

      setLastRefreshAttempt(now)
      setIsLoading(true)

      try {
        const { drafts: fetchedDrafts, error } = await getUserDrafts(user.id)

        if (error) {
          console.error("Error loading drafts:", error)
          setError(error as Error)
          toast({
            title: "Error loading drafts",
            description: "Could not load your drafts. Please try again later.",
            variant: "destructive",
          })
        } else {
          setDrafts(fetchedDrafts)
          setError(null)

          // Reset retry count on success
          setRetryCount(0)
        }
      } catch (err) {
        console.error("Error in loadDrafts:", err)
        setError(err as Error)

        toast({
          title: "Error loading drafts",
          description: "Could not load your drafts. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [user, lastRefreshAttempt, toast],
  )

  // Load drafts when user changes or on retry
  useEffect(() => {
    if (user) {
      loadDrafts(retryCount > 0) // Force refresh on retry
    } else {
      setDrafts([])
      setIsLoading(false)
    }
  }, [user, retryCount, loadDrafts])

  // Implement retry mechanism
  const retryLoadDrafts = useCallback(() => {
    setRetryCount((prev) => prev + 1)
  }, [])

  const refreshDrafts = useCallback(async () => {
    try {
      await loadDrafts(true) // Force refresh
      return
    } catch (err) {
      console.error("Error refreshing drafts:", err)
      // Don't throw here to make the UI more resilient
    }
  }, [loadDrafts])

  const saveDraft = useCallback(
    async (draftData: DraftInvoiceData) => {
      if (!user) throw new Error("User not authenticated")

      try {
        const { draft, error } = await saveDraftInvoice(user.id, draftData)
        if (error) {
          toast({
            title: "Error saving draft",
            description: "Could not save your draft. Please try again.",
            variant: "destructive",
          })
          throw error
        }

        // Try to refresh drafts, but don't fail if it doesn't work
        try {
          await refreshDrafts()
        } catch (refreshError) {
          console.error("Failed to refresh drafts after save:", refreshError)
        }

        toast({
          title: "Draft saved",
          description: "Your draft has been saved to local storage.",
          variant: "default",
        })

        return draft as DraftInvoiceData
      } catch (err) {
        console.error("Error saving draft:", err)
        setError(err as Error)
        throw err
      }
    },
    [user, refreshDrafts, toast],
  )

  const deleteDraft = useCallback(
    async (draftId: string) => {
      if (!user) throw new Error("User not authenticated")

      try {
        const { error } = await deleteDraftInvoice(draftId, user.id)
        if (error) {
          toast({
            title: "Error deleting draft",
            description: "Could not delete your draft. Please try again.",
            variant: "destructive",
          })
          throw error
        }

        // Try to refresh drafts, but don't fail if it doesn't work
        try {
          await refreshDrafts()
        } catch (refreshError) {
          console.error("Failed to refresh drafts after delete:", refreshError)
        }

        toast({
          title: "Draft deleted",
          description: "Your draft has been deleted successfully.",
          variant: "default",
        })

        return true
      } catch (err) {
        console.error("Error deleting draft:", err)
        setError(err as Error)
        throw err
      }
    },
    [user, refreshDrafts, toast],
  )

  const getDraft = useCallback(
    async (draftId: string) => {
      if (!user) throw new Error("User not authenticated")

      try {
        const { draft, error } = await getDraftInvoice(draftId, user.id)
        if (error) {
          toast({
            title: "Error loading draft",
            description: "Could not load your draft. Please try again.",
            variant: "destructive",
          })
          throw error
        }

        return draft as DraftInvoiceData
      } catch (err) {
        console.error("Error getting draft:", err)
        setError(err as Error)
        throw err
      }
    },
    [user, toast],
  )

  const value = {
    drafts,
    isLoading,
    error,
    saveDraft,
    deleteDraft,
    getDraft,
    refreshDrafts,
    retryLoadDrafts,
  }

  return <DraftsContext.Provider value={value}>{children}</DraftsContext.Provider>
}

export function useDrafts() {
  const context = useContext(DraftsContext)
  if (context === undefined) {
    throw new Error("useDrafts must be used within a DraftsProvider")
  }
  return context
}
