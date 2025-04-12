"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDrafts } from "@/hooks/use-drafts"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import AppHeader from "@/components/app-header"
import SalesAnalytics from "@/components/sales/sales-analytics"
import SalesKanban from "@/components/sales/sales-kanban"
import { format } from "date-fns"
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Copy,
  FileText,
  BarChart4,
  List,
  Kanban,
  RefreshCw,
} from "lucide-react"

export default function SalesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { drafts, isLoading, error, refreshDrafts, deleteDraft } = useDrafts()
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "kanban" | "analytics">("list")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Get the active tab from URL or default to "offer"
  const activeTab = (searchParams.get("type") as "invoice" | "offer") || "offer"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  // Retry loading if there was an error
  useEffect(() => {
    if (error && retryCount < 3) {
      const timer = setTimeout(
        () => {
          console.log(`Retrying draft load (attempt ${retryCount + 1})...`)
          refreshDrafts()
          setRetryCount((prev) => prev + 1)
        },
        2000 * (retryCount + 1),
      ) // Exponential backoff

      return () => clearTimeout(timer)
    }
  }, [error, retryCount, refreshDrafts])

  // Filter and sort drafts
  const filteredDrafts = useMemo(() => {
    let result = drafts.filter((draft) => draft.type === activeTab)

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (draft) =>
          (draft.invoiceNumber && draft.invoiceNumber.toLowerCase().includes(query)) ||
          (draft.notes && draft.notes.toLowerCase().includes(query)),
      )
    }

    // Apply status filter (this would be more useful with actual status data)
    if (statusFilter !== "all") {
      // For now, we'll just simulate this with a random condition
      result = result.filter((draft) => {
        const draftId = draft.id || ""
        const lastChar = draftId.charAt(draftId.length - 1)
        const numValue = Number.parseInt(lastChar, 16) || 0

        if (statusFilter === "draft" && numValue < 5) return true
        if (statusFilter === "sent" && numValue >= 5 && numValue < 10) return true
        if (statusFilter === "paid" && numValue >= 10) return true
        return false
      })
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

      result = result.filter((draft) => {
        const draftDate = draft.updatedAt ? new Date(draft.updatedAt) : new Date()

        if (dateFilter === "30days" && draftDate >= thirtyDaysAgo) return true
        if (dateFilter === "90days" && draftDate >= ninetyDaysAgo) return true
        return dateFilter === "all"
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
        case "date-desc":
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
        case "number-asc":
          return (a.invoiceNumber || "").localeCompare(b.invoiceNumber || "")
        case "number-desc":
          return (b.invoiceNumber || "").localeCompare(a.invoiceNumber || "")
        default:
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      }
    })

    return result
  }, [drafts, activeTab, searchQuery, statusFilter, dateFilter, sortBy])

  const handleCreateNew = () => {
    router.push(`/edit-invoice?type=${activeTab}`)
  }

  const handleTabChange = (value: string) => {
    router.push(`/sales?type=${value}`)
  }

  const handleDeleteDraft = async (id: string) => {
    try {
      setIsDeleting(id)
      await deleteDraft(id)
      toast({
        title: t("success"),
        description: activeTab === "offer" ? t("offerDeleted") : t("invoiceDeleted"),
      })
    } catch (error) {
      console.error("Error deleting draft:", error)
      toast({
        title: t("error"),
        description: String(error),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleDuplicateDraft = (id: string) => {
    // This would duplicate the draft in a real implementation
    toast({
      title: t("success"),
      description: activeTab === "offer" ? t("offerDuplicated") : t("invoiceDuplicated"),
    })
  }

  const getStatusBadge = (draft: any) => {
    // Simulate status based on draft ID for demonstration
    const draftId = draft.id || ""
    const lastChar = draftId.charAt(draftId.length - 1)
    const numValue = Number.parseInt(lastChar, 16) || 0

    if (numValue < 5) {
      return (
        <Badge variant="outline" className="bg-gray-100">
          Draft
        </Badge>
      )
    } else if (numValue >= 5 && numValue < 10) {
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">
          Sent
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800">
          Paid
        </Badge>
      )
    }
  }

  const getAmount = (draft: any) => {
    // Calculate total from items or use a random amount for demonstration
    if (draft.items && draft.items.length > 0) {
      const total = draft.items.reduce((sum: number, item: any) => {
        return sum + (item.quantity || 0) * (item.price || 0)
      }, 0)
      return total.toFixed(2)
    }

    // Generate a random amount based on the draft ID
    const draftId = draft.id || ""
    const lastChar = draftId.charAt(draftId.length - 1)
    const numValue = Number.parseInt(lastChar, 16) || 0
    return (numValue * 100 + 500).toFixed(2)
  }

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

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{activeTab === "offer" ? t("sales.offers") : t("sales.invoices")}</h1>
            <p className="text-gray-500 mt-1">
              {activeTab === "offer" ? t("sales.manageOffers") : t("sales.manageInvoices")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleCreateNew} className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === "offer" ? t("sales.createNewOffer") : t("sales.createNewInvoice")}
            </Button>
            <Button
              variant="outline"
              onClick={() => refreshDrafts()}
              disabled={isLoading}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {t("refresh")}
            </Button>
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="offer">{t("sales.offers")}</TabsTrigger>
            <TabsTrigger value="invoice">{t("sales.invoices")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>{t("status")}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatuses")}</SelectItem>
                <SelectItem value="draft">{t("draft")}</SelectItem>
                <SelectItem value="sent">{t("sent")}</SelectItem>
                <SelectItem value="paid">{t("paid")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>{t("date")}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allTime")}</SelectItem>
                <SelectItem value="30days">{t("last30Days")}</SelectItem>
                <SelectItem value="90days">{t("last90Days")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>{t("sortBy")}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">{t("newestFirst")}</SelectItem>
                <SelectItem value="date-asc">{t("oldestFirst")}</SelectItem>
                <SelectItem value="number-asc">{t("numberAsc")}</SelectItem>
                <SelectItem value="number-desc">{t("numberDesc")}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-none rounded-l-md"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode("kanban")}
              >
                <Kanban className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "analytics" ? "default" : "ghost"}
                size="sm"
                className="rounded-none rounded-r-md"
                onClick={() => setViewMode("analytics")}
              >
                <BarChart4 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
            <p className="text-red-700 mb-2">{t("common.errorLoading")}</p>
            <Button
              variant="outline"
              onClick={() => {
                setRetryCount(0)
                refreshDrafts()
              }}
            >
              {t("common.retry")}
            </Button>
          </div>
        ) : (
          <>
            {viewMode === "analytics" && <SalesAnalytics drafts={filteredDrafts} type={activeTab} />}

            {viewMode === "kanban" && (
              <SalesKanban
                drafts={filteredDrafts}
                type={activeTab}
                onEdit={(id) => router.push(`/edit-invoice?draft=${id}`)}
                onDelete={handleDeleteDraft}
                onDuplicate={handleDuplicateDraft}
                isDeleting={isDeleting}
              />
            )}

            {viewMode === "list" && (
              <>
                {filteredDrafts.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                        ? t("noResultsFound")
                        : activeTab === "offer"
                          ? t("sales.noOffersYet")
                          : t("sales.noInvoicesYet")}
                    </p>
                    <Button onClick={handleCreateNew}>
                      {activeTab === "offer" ? t("sales.createFirstOffer") : t("sales.createFirstInvoice")}
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-500">{t("number")}</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">{t("date")}</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500">{t("status")}</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-500">{t("amount")}</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-500">{t("actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDrafts.map((draft) => (
                          <tr key={draft.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium">
                                {draft.invoiceNumber || `#${draft.id?.substring(0, 8)}`}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                {draft.notes?.substring(0, 30) || "No description"}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {draft.updatedAt ? format(new Date(draft.updatedAt), "MMM d, yyyy") : "-"}
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(draft)}</td>
                            <td className="py-3 px-4 text-right font-medium">
                              {draft.currency || "$"}
                              {getAmount(draft)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/edit-invoice?draft=${draft.id}`)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDuplicateDraft(draft.id || "")}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push(`/edit-invoice?draft=${draft.id}`)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      {t("edit")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleDuplicateDraft(draft.id || "")}>
                                      <Copy className="h-4 w-4 mr-2" />
                                      {t("duplicate")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="h-4 w-4 mr-2" />
                                      {t("download")}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDeleteDraft(draft.id || "")}
                                      disabled={isDeleting === draft.id}
                                    >
                                      {isDeleting === draft.id ? (
                                        <LoadingSpinner size="sm" className="mr-2" />
                                      ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                      )}
                                      {t("delete")}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
