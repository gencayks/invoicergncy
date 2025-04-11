"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Save, Download } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useDrafts } from "@/hooks/use-drafts"
import { useToast } from "@/hooks/use-toast"
import { useBusiness } from "@/hooks/use-business"

export default function EditInvoicePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { currentBusiness } = useBusiness()
  const { t } = useLanguage()
  const { saveDraft, getDraft } = useDrafts()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Basic invoice state
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [issueDate, setIssueDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"))
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState(0)
  const [currency, setCurrency] = useState("EUR")
  const [notes, setNotes] = useState("")
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>()
  const [documentType, setDocumentType] = useState<"invoice" | "offer">("invoice")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  // Load draft if draftId is provided
  useEffect(() => {
    const loadDraft = async () => {
      if (!user) return

      const draftParam = searchParams.get("draft")
      const typeParam = searchParams.get("type") as "invoice" | "offer" | null

      if (draftParam) {
        setIsLoading(true)
        try {
          const draft = await getDraft(draftParam)
          if (draft) {
            // Set current draft ID
            setCurrentDraftId(draft.id)

            // Set document type
            setDocumentType(draft.type || "invoice")

            // Set invoice details
            setInvoiceNumber(draft.invoiceNumber || "")
            setIssueDate(draft.issueDate || format(new Date(), "yyyy-MM-dd"))
            setDueDate(draft.dueDate || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"))
            setDescription(draft.items?.[0]?.description || "")
            setAmount(draft.items?.[0]?.price || 0)
            setCurrency(draft.currency || "EUR")
            setNotes(draft.notes || "")
          }
        } catch (error) {
          console.error("Error loading draft:", error)
          toast({
            title: "Error",
            description: String(error),
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      } else if (typeParam) {
        setDocumentType(typeParam)
      }
    }

    loadDraft()
  }, [user, getDraft, searchParams, toast])

  const handleSaveAsDraft = async () => {
    if (!user || !currentBusiness) {
      toast({
        title: "Error",
        description: "You must be logged in to save drafts",
        variant: "destructive",
      })
      return
    }

    try {
      const draftData = {
        id: currentDraftId,
        businessId: currentBusiness.id,
        invoiceNumber,
        issueDate,
        dueDate,
        currency,
        notes,
        items: [
          {
            id: "1",
            description,
            quantity: 1,
            price: amount,
          },
        ],
        type: documentType,
      }

      const savedDraft = await saveDraft(draftData)

      if (savedDraft) {
        setCurrentDraftId(savedDraft.id)
        toast({
          title: "Success",
          description: "Draft saved successfully",
        })
      }
    } catch (error) {
      console.error("Error saving draft:", error)
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      })
    }
  }

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{documentType === "invoice" ? t("invoices") : t("offers")}</h1>
          <div className="flex space-x-2">
            <Button onClick={handleSaveAsDraft} className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              {t("saveAsDraft")}
            </Button>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              {t("generatePdf")}
            </Button>
          </div>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="invoiceNumber">{documentType === "invoice" ? "Invoice Number" : "Offer Number"}</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency" className="mt-1">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={3} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={handleSaveAsDraft} className="flex items-center">
              <Save className="h-4 w-4 mr-2" />
              {t("saveAsDraft")}
            </Button>
            <Button variant="outline" onClick={() => router.push("/sales")}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
