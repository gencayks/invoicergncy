"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CreateInvoiceDraftsTable } from "@/components/admin/create-invoice-drafts-table"
import { MigrateDraftsToDb } from "@/components/admin/migrate-drafts-to-db"
import { getUserProfile } from "@/lib/supabase"

export default function DatabaseAdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingRole, setIsCheckingRole] = useState(true)

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsCheckingRole(false)
        return
      }

      try {
        const profile = await getUserProfile(user.id)
        setIsAdmin(profile?.role === "admin")
      } catch (error) {
        console.error("Error checking admin role:", error)
      } finally {
        setIsCheckingRole(false)
      }
    }

    if (!authLoading) {
      checkAdminRole()
    }
  }, [user, authLoading])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  // Show loading state
  if (authLoading || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You do not have permission to access this page.</p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Database Administration</h1>

      <div className="grid gap-6">
        <CreateInvoiceDraftsTable />
        <MigrateDraftsToDb />
      </div>
    </div>
  )
}
