"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { checkInvoiceDraftsTable } from "@/lib/draft-db-service"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function CreateInvoiceDraftsTable() {
  const { toast } = useToast()
  const [isChecking, setIsChecking] = useState(false)
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkTable = async () => {
    setIsChecking(true)
    setError(null)

    try {
      const exists = await checkInvoiceDraftsTable()
      setTableExists(exists)

      if (exists) {
        toast({
          title: "Table exists",
          description: "The invoice_drafts table already exists in your database.",
        })
      } else {
        toast({
          title: "Table missing",
          description: "The invoice_drafts table does not exist in your database.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error checking table:", err)
      setError("Failed to check if the table exists. Please try again.")
      toast({
        title: "Error",
        description: "Failed to check if the table exists. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const createTable = async () => {
    setIsCreating(true)
    setError(null)

    try {
      // SQL to create the invoice_drafts table
      const { error } = await supabase.rpc("create_invoice_drafts_table")

      if (error) {
        throw error
      }

      setTableExists(true)
      toast({
        title: "Success",
        description: "The invoice_drafts table has been created successfully.",
      })
    } catch (err: any) {
      console.error("Error creating table:", err)
      setError(err.message || "Failed to create the table. Please try again.")
      toast({
        title: "Error",
        description: err.message || "Failed to create the table. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Invoice Drafts Table</h2>
      <p className="mb-4 text-gray-600">
        This tool helps you check if the invoice_drafts table exists in your database and create it if needed.
      </p>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Button onClick={checkTable} disabled={isChecking} variant="outline">
          {isChecking ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Check Table Status
        </Button>

        <Button onClick={createTable} disabled={isCreating || tableExists === true}>
          {isCreating ? <LoadingSpinner size="sm" className="mr-2" /> : null}
          Create Table
        </Button>
      </div>

      {tableExists !== null && (
        <div className={`p-3 rounded ${tableExists ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
          {tableExists
            ? "✅ The invoice_drafts table exists in your database."
            : "❌ The invoice_drafts table does not exist in your database."}
        </div>
      )}
    </div>
  )
}
