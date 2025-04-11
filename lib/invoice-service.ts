import { supabase } from "./supabase"

export type InvoiceData = {
  businessId: string
  clientId: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  currency: string
  taxRate: number
  notes?: string
  templateId?: string
  signature?: string
  items: InvoiceItemData[]
}

export type InvoiceItemData = {
  description: string
  quantity: number
  price: number
}

// Add timeout to prevent hanging requests
const TIMEOUT_MS = 15000 // 15 seconds instead of 10

// Helper function to add timeout to promises - fixed generic syntax
const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)),
  ])
}

// Export all functions as named exports
export async function createInvoice(invoiceData: InvoiceData) {
  try {
    // Start a transaction using Supabase's RPC
    const { data: invoice, error: invoiceError } = await withTimeout(
      supabase
        .from("invoices")
        .insert({
          business_id: invoiceData.businessId,
          client_id: invoiceData.clientId,
          invoice_number: invoiceData.invoiceNumber,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          status: "draft",
          currency: invoiceData.currency,
          tax_rate: invoiceData.taxRate,
          notes: invoiceData.notes || null,
          template_id: invoiceData.templateId || null,
          signature: invoiceData.signature || null,
        })
        .select()
        .single(),
      TIMEOUT_MS,
    )

    if (invoiceError) throw invoiceError

    // Insert invoice items
    const invoiceItems = invoiceData.items.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await withTimeout(supabase.from("invoice_items").insert(invoiceItems), TIMEOUT_MS)

    if (itemsError) throw itemsError

    return { invoice, error: null }
  } catch (error) {
    console.error("Create invoice error:", error)
    return { invoice: null, error }
  }
}

export async function getBusinessInvoices(businessId: string) {
  try {
    if (!businessId) {
      throw new Error("Business ID is required")
    }

    // Limit to 50 most recent invoices for performance
    const { data: invoicesData, error } = await withTimeout(
      supabase
        .from("invoices")
        .select(`
          *,
          clients (
            id,
            name,
            email
          )
        `)
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(50),
      TIMEOUT_MS,
    )

    if (error) throw error

    return { invoices: invoicesData || [], error: null }
  } catch (error) {
    console.error("Get business invoices error:", error)
    return { invoices: [], error }
  }
}

export async function getInvoice(invoiceId: string) {
  try {
    if (!invoiceId) {
      throw new Error("Invoice ID is required")
    }

    // Get invoice with client info
    const { data: invoice, error: invoiceError } = await withTimeout(
      supabase
        .from("invoices")
        .select(`
          *,
          clients (
            id,
            name,
            address,
            email,
            phone,
            payment_terms
          ),
          businesses (
            id,
            name,
            address,
            email,
            phone,
            logo_url
          )
        `)
        .eq("id", invoiceId)
        .single(),
      TIMEOUT_MS,
    )

    if (invoiceError) throw invoiceError

    // Get invoice items
    const { data: items, error: itemsError } = await withTimeout(
      supabase.from("invoice_items").select("*").eq("invoice_id", invoiceId).order("created_at", { ascending: true }),
      TIMEOUT_MS,
    )

    if (itemsError) throw itemsError

    return {
      invoice: {
        ...invoice,
        items: items || [],
      },
      error: null,
    }
  } catch (error) {
    console.error("Get invoice error:", error)
    return { invoice: null, error }
  }
}

export async function updateInvoice(invoiceId: string, updates: Partial<InvoiceData>) {
  try {
    if (!invoiceId) {
      throw new Error("Invoice ID is required")
    }

    // Update invoice
    const { data: invoice, error: invoiceError } = await withTimeout(
      supabase
        .from("invoices")
        .update({
          client_id: updates.clientId,
          invoice_number: updates.invoiceNumber,
          issue_date: updates.issueDate,
          due_date: updates.dueDate,
          currency: updates.currency,
          tax_rate: updates.taxRate,
          notes: updates.notes,
          template_id: updates.templateId,
          signature: updates.signature,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId)
        .select()
        .single(),
      TIMEOUT_MS,
    )

    if (invoiceError) throw invoiceError

    // If items are provided, update them
    if (updates.items) {
      // Delete existing items
      const { error: deleteError } = await withTimeout(
        supabase.from("invoice_items").delete().eq("invoice_id", invoiceId),
        TIMEOUT_MS,
      )

      if (deleteError) throw deleteError

      // Insert new items
      const invoiceItems = updates.items.map((item) => ({
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: insertError } = await withTimeout(supabase.from("invoice_items").insert(invoiceItems), TIMEOUT_MS)

      if (insertError) throw insertError
    }

    return { invoice, error: null }
  } catch (error) {
    console.error("Update invoice error:", error)
    return { invoice: null, error }
  }
}

export async function updateInvoiceStatus(
  invoiceId: string,
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled",
) {
  try {
    if (!invoiceId) {
      throw new Error("Invoice ID is required")
    }

    const { data: invoice, error } = await withTimeout(
      supabase
        .from("invoices")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invoiceId)
        .select()
        .single(),
      TIMEOUT_MS,
    )

    if (error) throw error

    return { invoice: invoice, error: null }
  } catch (error) {
    console.error("Update invoice status error:", error)
    return { invoice: null, error }
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    if (!invoiceId) {
      throw new Error("Invoice ID is required")
    }

    // Delete invoice items first (cascade doesn't work with Supabase JS client)
    const { error: itemsError } = await withTimeout(
      supabase.from("invoice_items").delete().eq("invoice_id", invoiceId),
      TIMEOUT_MS,
    )

    if (itemsError) throw itemsError

    // Delete invoice
    const { error: invoiceError } = await withTimeout(
      supabase.from("invoices").delete().eq("id", invoiceId),
      TIMEOUT_MS,
    )

    if (invoiceError) throw invoiceError

    return { error: null }
  } catch (error) {
    console.error("Delete invoice error:", error)
    return { error }
  }
}

export async function generateInvoicePdf(invoiceId: string) {
  try {
    if (!invoiceId) {
      throw new Error("Invoice ID is required")
    }

    // Get invoice data
    const { invoice, error: getError } = await getInvoice(invoiceId)

    if (getError) throw getError

    // Generate PDF (this would typically call a server function or API)
    // For now, we'll just simulate this
    const pdfBlob = new Blob(["PDF content"], { type: "application/pdf" })

    // Upload to Supabase Storage
    const fileName = `invoice-${invoice.invoice_number}-${Date.now()}.pdf`
    const filePath = `invoices/${fileName}`

    const { error: uploadError } = await withTimeout(
      supabase.storage.from("assets").upload(filePath, pdfBlob),
      TIMEOUT_MS,
    )

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage.from("assets").getPublicUrl(filePath)

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    console.error("Generate invoice PDF error:", error)
    return { url: null, error }
  }
}
