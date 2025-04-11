"use client"

import { useDrafts } from "@/hooks/use-drafts"
import { Button } from "@/components/ui/button"
import { Database, HardDrive, RefreshCw } from "lucide-react"

export function DraftsStorageStatus() {
  const { isLocalStorage, checkForTableUpdates, isLoading } = useDrafts()

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      {isLocalStorage ? (
        <>
          <HardDrive className="h-4 w-4" />
          <span>Using browser storage for drafts</span>
        </>
      ) : (
        <>
          <Database className="h-4 w-4" />
          <span>Using database for drafts</span>
        </>
      )}

      {isLocalStorage && (
        <Button
          variant="outline"
          size="sm"
          className="ml-2 h-7 px-2"
          onClick={checkForTableUpdates}
          disabled={isLoading}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Check for database
        </Button>
      )}
    </div>
  )
}
