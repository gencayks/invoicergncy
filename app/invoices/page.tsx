"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useInvoices } from "@/hooks/use-invoices"
import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { format } from "date-fns"
import { Edit, Trash2, Plus, FileText, Download, RefreshCw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function InvoicesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const {
    invoices,
    isLoading: invoicesLoading,
    deleteCurrentInvoice,
    setCurrentInvoice,
    refreshInvoices,
    error: invoicesError,
  } = useInvoices()
  const { t } = useLanguage()
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Set mounted state on client
  useEffect(() => {
    setMounted(true)

    // Add a safety timeout to prevent infinite loading
    const safetyTimer = setTimeout(() => {
      if (invoicesLoading) {
        console.warn("Loading state persisted for too long, forcing refresh")
        refreshInvoices().catch((err) => console.error("Force refresh failed:", err))
      }
    }, 10000) // 10 seconds safety timeout

    return () => clearTimeout(safetyTimer)
  }, [invoicesLoading, refreshInvoices])

  // Redirect if not authenticated
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router, mounted])

  // Handle manual refresh
  const handleRefresh = async () => {
    if (isRefreshing) return

    try {
      setIsRefreshing(true)
      await refreshInvoices()
      toast({
        title: t("refreshed"),
        description: t("invoicesRefreshed"),
      })
    } catch (error) {
      toast({
        title: t("error"),
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      setCurrentInvoice(invoices.find((inv) => inv.id === invoiceId) || null)
      await deleteCurrentInvoice()
      toast({
        title: t("deleted"),
        description: t("invoiceDeleted"),
      })
      setDeleteConfirmation(null)
    } catch (error) {
      toast({
        title: t("error"),
        description: String(error),
        variant: "destructive",
      })
    }
  }

  const handleEditInvoice = (invoiceId: string) => {
    router.push(`/edit-invoice?invoice=${invoiceId}`)
  }

  const handleCreateNew = () => {
    router.push(`/edit-invoice?type=invoice`)
  }

  // Show loading state
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  // Show error state
  if (invoicesError) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{t("invoices")}</h1>
            <Button onClick={handleRefresh} className="flex items-center" disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {t("refresh")}
            </Button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">{t("errorLoadingInvoices")}</h2>
            <p className="text-red-600 mb-4">{String(invoicesError)}</p>
            <Button onClick={handleRefresh} variant="outline" className="mx-auto" disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {t("tryAgain")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t("invoices")}</h1>
          <div className="flex space-x-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center"
              disabled={isRefreshing || invoicesLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing || invoicesLoading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </Button>
            <Button onClick={handleCreateNew} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              {t("createInvoice")}
            </Button>
          </div>
        </div>

        {invoicesLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <Card key={invoice.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle>{invoice.invoice_number || "#" + invoice.id.substring(0, 8)}</CardTitle>
                    <CardDescription>
                      {invoice.created_at && format(new Date(invoice.created_at), "PPP")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-sm text-gray-500 mb-2">
                      {t("status")}: <span className="font-medium">{invoice.status}</span>
                    </div>
                    <div className="font-medium">
                      {invoice.currency} {invoice.total_amount?.toFixed(2) || "0.00"}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-0">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditInvoice(invoice.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t("edit")}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        {t("download")}
                      </Button>
                    </div>
                    <Dialog
                      open={deleteConfirmation === invoice.id}
                      onOpenChange={(open) => {
                        if (!open) setDeleteConfirmation(null)
                        else setDeleteConfirmation(invoice.id)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("delete")}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("confirmDelete")}</DialogTitle>
                          <DialogDescription>{t("confirmDeleteInvoiceMessage")}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                            {t("cancel")}
                          </Button>
                          <Button variant="destructive" onClick={() => handleDeleteInvoice(invoice.id)}>
                            {t("delete")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">{t("noInvoices")}</h3>
                <p className="text-gray-500 mb-4 text-center">{t("noInvoicesMessage")}</p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("createInvoice")}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
