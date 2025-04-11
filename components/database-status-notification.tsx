"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function DatabaseStatusNotification() {
  const { user, profile } = useAuth()
  const [showNotification, setShowNotification] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Only check for admin users
    if (!user || !profile || profile.role !== "owner") {
      return
    }

    // Check if notification was dismissed in this session
    if (dismissed) {
      return
    }

    // Check if the invoice_drafts table exists
    const checkTableExists = async () => {
      try {
        // Make a simple query to check if the table exists
        const response = await fetch("/api/check-invoice-drafts-table")
        const data = await response.json()

        if (!data.exists) {
          setShowNotification(true)
        }
      } catch (error) {
        console.error("Error checking table existence:", error)
        // If there's an error, we'll assume the table might not exist
        setShowNotification(true)
      }
    }

    checkTableExists()
  }, [user, profile, dismissed])

  if (!showNotification) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">Database Table Missing</AlertTitle>
        <AlertDescription className="text-amber-700">
          <p className="mb-2">
            The invoice_drafts table is missing from your database. Your drafts are currently stored in local storage
            only.
          </p>
          <div className="flex gap-2 mt-3">
            <Button asChild size="sm" variant="outline" className="bg-white">
              <Link href="/admin/database">Setup Database</Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
              onClick={() => setDismissed(true)}
            >
              Dismiss
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
