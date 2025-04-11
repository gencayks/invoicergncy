"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { generatePDF } from "@/lib/pdf-generator"
import type { Reminder } from "./reminder-scheduler"
import type { RecurringSchedule } from "./recurring-invoice-setup"
import { fetchExchangeRates, convertAmount } from "@/lib/currency-converter"
import { templateStorage } from "@/lib/template-storage"
import { Download, Save } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { useDrafts } from "@/hooks/use-drafts"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useBusiness } from "@/hooks/use-business"
import { getDraft } from "@/lib/draft-storage"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
}

interface BusinessInfo {
  name: string
  address: string
  email: string
  phone: string
  logo: string | null
}

interface CustomerInfo {
  name: string
  address: string
  email: string
  phone: string
}

interface InvoiceDetails {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  taxRate: number
  currency: string
  notes: string
}

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "AUD", label: "AUD ($)" },
  { value: "JPY", label: "JPY (¥)" },
]

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "$",
  AUD: "$",
  JPY: "¥",
}

interface AdvancedInvoiceGeneratorProps {
  draftId?: string
  type?: "invoice" | "offer"
}

export default function AdvancedInvoiceGenerator({ draftId, type = "invoice" }: AdvancedInvoiceGeneratorProps) {
  const { t } = useLanguage()
  const { user } = useAuth()
  const { currentBusiness } = useBusiness()
  const { saveDraft } = useDrafts() // Using the useDrafts hook
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Basic invoice state
  const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", description: "", quantity: 1, price: 0 }])
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [issueDate, setIssueDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [dueDate, setDueDate] = useState(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"))
  const [notes, setNotes] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [documentType, setDocumentType] = useState<"invoice" | "offer">("invoice")
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>()

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    address: "",
    email: "",
    phone: "",
    logo: null,
  })

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    address: "",
    email: "",
    phone: "",
  })

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    invoiceNumber: "",
    issueDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    taxRate: 0,
    currency: "USD",
    notes: "",
  })

  // Advanced features state
  const [selectedTemplate, setSelectedTemplate] = useState<string>(templateStorage.getActiveTemplate())
  const [digitalSignature, setDigitalSignature] = useState<string | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [recurringSchedule, setRecurringSchedule] = useState<RecurringSchedule | null>(null)
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(false)

  // UI state
  const [activeTab, setActiveTab] = useState<string>("edit")
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>("templates")
  const fileInputRef = useRef<HTMLInputElement>(null)

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

            // Set invoice items
            if (draft.items && Array.isArray(draft.items)) {
              setItems(draft.items)
            }

            // Set invoice details
            setInvoiceDetails({
              invoiceNumber: draft.invoiceNumber || "",
              issueDate: draft.issueDate || format(new Date(), "yyyy-MM-dd"),
              dueDate: draft.dueDate || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
              taxRate: draft.taxRate || 0,
              currency: draft.currency || "USD",
              notes: draft.notes || "",
            })

            // Set template
            if (draft.templateId) {
              setSelectedTemplate(draft.templateId)
            }

            // Set signature
            if (draft.signature) {
              setDigitalSignature(draft.signature)
            }
          }
        } catch (error) {
          console.error("Error loading draft:", error)
          toast({
            title: t("error"),
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
  }, [user, getDraft, searchParams, toast, t])

  // Fetch exchange rates on component mount
  useEffect(() => {
    fetchExchangeRates().then((rates) => {
      setExchangeRates(rates)
    })
  }, []) // Empty dependency array means this runs once on mount

  // Update business info when currentBusiness changes
  useEffect(() => {
    if (currentBusiness) {
      setBusinessInfo({
        name: currentBusiness.name || "",
        address: currentBusiness.address || "",
        email: currentBusiness.email || "",
        phone: currentBusiness.phone || "",
        logo: currentBusiness.logo_url || null,
      })
    }
  }, [currentBusiness])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setBusinessInfo({
            ...businessInfo,
            logo: event.target.result as string,
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceDetails.taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleGeneratePDF = () => {
    generatePDF({
      businessInfo,
      customerInfo,
      invoiceDetails,
      items,
      calculations: {
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
      },
      template: selectedTemplate,
      signature: digitalSignature,
    })
  }

  const clearForm = () => {
    setItems([{ id: "1", description: "", quantity: 1, price: 0 }])
    setBusinessInfo({
      name: currentBusiness?.name || "",
      address: currentBusiness?.address || "",
      email: currentBusiness?.email || "",
      phone: currentBusiness?.phone || "",
      logo: currentBusiness?.logo_url || null,
    })
    setCustomerInfo({
      name: "",
      address: "",
      email: "",
      phone: "",
    })
    setInvoiceDetails({
      invoiceNumber: "",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      taxRate: 0,
      currency: "USD",
      notes: "",
    })
    setDigitalSignature(null)
    setReminders([])
    setRecurringSchedule(null)
    setCurrentDraftId(undefined)
  }

  const getCurrencySymbol = () => {
    return currencySymbols[invoiceDetails.currency] || "$"
  }

  const handleCurrencyChange = (currency: string) => {
    // If we have exchange rates, convert all prices to the new currency
    if (Object.keys(exchangeRates).length > 0 && currency !== invoiceDetails.currency) {
      const updatedItems = items.map((item) => ({
        ...item,
        price: convertAmount(item.price, invoiceDetails.currency, currency, exchangeRates),
      }))

      setItems(updatedItems)
    }

    setInvoiceDetails({
      ...invoiceDetails,
      currency,
    })
  }

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    templateStorage.setActiveTemplate(templateId)

    // Get template defaults
    const template = templateStorage.getTemplateById(templateId)
    if (template && template.defaults) {
      // Apply template defaults if fields are empty
      if (!invoiceDetails.notes) {
        setInvoiceDetails((prev) => ({
          ...prev,
          notes: template.defaults.paymentTerms,
        }))
      }
    }
  }

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, price: 0 }])
  }

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }
        return item
      }),
    )
  }

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const handleSaveAsDraft2 = async () => {
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
        items,
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

  const calculateTotal2 = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{documentType === "invoice" ? t("invoices") : t("offers")}</h2>
        <div className="flex space-x-2">
          <Select value={documentType} onValueChange={(value: "invoice" | "offer") => setDocumentType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Document Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="invoice">{t("invoices")}</SelectItem>
              <SelectItem value="offer">{t("offers")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
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
        <h3 className="text-lg font-medium mb-2">Items</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleUpdateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.price}
                  onChange={(e) => handleUpdateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="col-span-1 text-right font-medium">{(item.quantity * item.price).toFixed(2)}</div>
              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={items.length === 1}
                  className="h-8 w-8 p-0"
                >
                  &times;
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={handleAddItem} className="mt-2">
          Add Item
        </Button>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={3} />
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-xl font-bold">
          Total: {currency === "USD" ? "$" : currency === "EUR" ? "€" : "£"}
          {calculateTotal2().toFixed(2)}
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSaveAsDraft2} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            {t("saveAsDraft")}
          </Button>
          <Button variant="outline" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            {t("generatePdf")}
          </Button>
        </div>
      </div>
    </div>
  )
}
