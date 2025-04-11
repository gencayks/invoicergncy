"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { checkInvoiceDraftsTable } from "@/lib/draft-db-service"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"

// Local storage key
const DRAFTS_STORAGE_KEY = "invoice_drafts_local"

export function MigrateDraftsToDb() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isChecking, setIsChecking] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [localDraftsCount, setLocalDraftsCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    migrated: number
    failed: number
  } | null>(null)

  const checkStatus = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to use this feature.",
        variant: "destructive",
      })
      return
    }

    setIsChecking(true)
    setError(null)

    try {
      // Check if table exists
      const exists = await checkInvoiceDraftsTable()
      setTableExists(exists)

      // Check local drafts
      const draftsJson = localStorage.getItem(`${DRAFTS_STORAGE_KEY}_${user.id}`)
      const localDrafts = draftsJson ? JSON.parse(draftsJson) : []
      setLocalDraftsCount(localDrafts.length)

      if (!exists) {
        toast({
          title: "Table missing",
          description: "The invoice_drafts table does not exist in your database.",
          variant: "destructive",
        })
      } else if (localDrafts.length === 0) {
        toast({
          title: "No local drafts",
          description: "There are no local drafts to migrate.",
        })
      } else {
        toast({
          title: "Ready to migrate",
          description: `Found ${localDrafts.length} local drafts that can be migrated to the database.`,
        })
      }
    } catch (err) {
      console.error("Error checking migration status:", err)
      setError("Failed to check migration status. Please try again.")
      toast({
        title: "Error",
        description: "Failed to check migration status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const migrateDrafts = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to use this feature.",
        variant: "destructive",
      })
      return
    }

    setIsMigrating(true)
    setError(null)
    setMigrationResult(null)

    try {
      // Get local drafts
      const draftsJson = localStorage.getItem(`${DRAFTS_STORAGE_KEY}_${user.id}`)
      const localDrafts = draftsJson ? JSON.parse(draftsJson) : []

      if (localDrafts.length === 0) {
        setMigrationResult({ success: true, migrated: 0, failed: 0 })
        toast({
          title: "No drafts to migrate",
          description: "There are no local drafts to migrate.",
        })
        return
      }

      // Migrate each draft
      let migrated = 0
      let failed = 0

      for (const draft of localDrafts) {
        try {
          const { error } = await supabase.from("invoice_drafts").insert({
            id: draft.id,
            user_id: user.id,
            business_id: draft.businessId,
            client_id: draft.clientId,
            invoice_number: draft.invoiceNumber,
            issue_date: draft.issueDate,
            due_date: draft.dueDate,
            currency: draft.currency,
            tax_rate: draft.taxRate,
            notes: draft.notes,
            template_id: draft.templateId,
            signature: draft.signature,
            items: draft.items || [],
            type: draft.type || "invoice",
            created_at: draft.createdAt,
            updated_at: draft.updatedAt,
          })

          if (error) {
            console.error("Error migrating draft:", error)
            failed++
          } else {
            migrated++
          }
        } catch (err) {
          console.error("Error in migration process:", err)
          failed++
        }
      }

      // Set migration result
      setMigrationResult({ success: true, migrated, failed })

      if (failed === 0) {
        toast({
          title: "Migration successful",
          description: `Successfully migrated ${migrated} drafts to the database.`,
        })
      } else {
        toast({
          title: "Migration partially successful",
          description: `Migrated ${migrated} drafts, but ${failed} drafts failed to migrate.`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error during migration:", err)
      setError("Failed to migrate drafts. Please try again.")
      setMigrationResult({ success: false, migrated: 0, failed: 0 })
      toast({
        title: "Migration failed",
        description: "Failed to migrate drafts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Migrate Local Drafts to Database</h2>
      <p className="mb-4 text-gray-600">
        This tool helps you migrate your local drafts to the database once the invoice_drafts table is created.
      </p>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Button onClick={checkStatus} disabled={isChecking} variant="outline">
          {isChecking ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Check Migration Status
        </Button>

        <Button onClick={migrateDrafts} disabled={isMigrating || !tableExists || localDraftsCount === 0}>
          {isMigrating ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Migrate Drafts to Database
        </Button>
      </div>

      {tableExists !== null && (
        <div className="mb-4">
          <div className={`p-3 rounded ${tableExists ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            {tableExists
              ? "✅ The invoice_drafts table exists in your database."
              : "❌ The invoice_drafts table does not exist in your database."}
          </div>
        </div>
      )}

      {localDraftsCount !== null && (
        <div className="mb-4">
          <div
            className={`p-3 rounded ${localDraftsCount > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"}`}
          >
            {localDraftsCount > 0
              ? `📝 Found ${localDraftsCount} local drafts that can be migrated.`
              : "📝 No local drafts found to migrate."}
          </div>
        </div>
      )}

      {migrationResult && (
        <div className="mt-4">
          <div
            className={`p-3 rounded ${migrationResult.failed === 0 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
          >
            <p className="font-medium">Migration Results:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Successfully migrated: {migrationResult.migrated} drafts</li>
              <li>Failed to migrate: {migrationResult.failed} drafts</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
