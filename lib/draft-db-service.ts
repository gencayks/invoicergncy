import { supabase } from "./supabase"
import type { DraftInvoiceData } from "./draft-service"

// This file contains database operations for draft invoices
// It will be used when the invoice_drafts table is available

// Check if the invoice_drafts table exists
export const checkInvoiceDraftsTable = async (): Promise<boolean> => {
  try {
    // Try to query the table with a limit of 0 to just check if it exists
    const { error } = await supabase.from("invoice_drafts").select("id").limit(0)

    // If there's no error, the table exists
    return !error
  } catch (error) {
    console.error("Error checking invoice_drafts table:", error)
    return false
  }
}

// Save a draft invoice to the database
export const saveDraftInvoiceToDb = async (userId: string, draftData: DraftInvoiceData) => {
  try {
    if (!userId) throw new Error("User ID is required")

    const now = new Date().toISOString()

    // Check if the table exists first
    const tableExists = await checkInvoiceDraftsTable()
    if (!tableExists) {
      throw new Error("invoice_drafts table does not exist")
    }

    if (draftData.id) {
      // Update existing draft
      const { data, error } = await supabase
        .from("invoice_drafts")
        .update({
          business_id: draftData.businessId,
          client_id: draftData.clientId,
          invoice_number: draftData.invoiceNumber,
          issue_date: draftData.issueDate,
          due_date: draftData.dueDate,
          currency: draftData.currency,
          tax_rate: draftData.taxRate,
          notes: draftData.notes,
          template_id: draftData.templateId,
          signature: draftData.signature,
          items: draftData.items || [],
          type: draftData.type || "invoice",
          updated_at: now,
        })
        .eq("id", draftData.id)
        .eq("user_id", userId)
        .select()
        .single()

      if (error) throw error

      // Convert from snake_case to camelCase
      const draft = data
        ? {
            id: data.id,
            businessId: data.business_id,
            clientId: data.client_id,
            invoiceNumber: data.invoice_number,
            issueDate: data.issue_date,
            dueDate: data.due_date,
            currency: data.currency,
            taxRate: data.tax_rate,
            notes: data.notes,
            templateId: data.template_id,
            signature: data.signature,
            items: data.items,
            type: data.type,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }
        : null

      return { draft, error: null }
    } else {
      // Create new draft
      const { data, error } = await supabase
        .from("invoice_drafts")
        .insert({
          user_id: userId,
          business_id: draftData.businessId,
          client_id: draftData.clientId,
          invoice_number: draftData.invoiceNumber,
          issue_date: draftData.issueDate,
          due_date: draftData.dueDate,
          currency: draftData.currency,
          tax_rate: draftData.taxRate,
          notes: draftData.notes,
          template_id: draftData.templateId,
          signature: draftData.signature,
          items: draftData.items || [],
          type: draftData.type || "invoice",
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) throw error

      // Convert from snake_case to camelCase
      const draft = data
        ? {
            id: data.id,
            businessId: data.business_id,
            clientId: data.client_id,
            invoiceNumber: data.invoice_number,
            issueDate: data.issue_date,
            dueDate: data.due_date,
            currency: data.currency,
            taxRate: data.tax_rate,
            notes: data.notes,
            templateId: data.template_id,
            signature: data.signature,
            items: data.items,
            type: data.type,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }
        : null

      return { draft, error: null }
    }
  } catch (error) {
    console.error("Save draft invoice to DB error:", error)
    return { draft: null, error }
  }
}

// Get user drafts from the database
export const getUserDraftsFromDb = async (userId: string, type?: "invoice" | "offer") => {
  try {
    if (!userId) return { drafts: [], error: null }

    // Check if the table exists first
    const tableExists = await checkInvoiceDraftsTable()
    if (!tableExists) {
      throw new Error("invoice_drafts table does not exist")
    }

    // Build the query
    let query = supabase
      .from("invoice_drafts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    // Add type filter if provided
    if (type) {
      query = query.eq("type", type)
    }

    // Execute the query
    const { data, error } = await query

    if (error) throw error

    // Convert from snake_case to camelCase
    const drafts = data
      ? data.map((item) => ({
          id: item.id,
          businessId: item.business_id,
          clientId: item.client_id,
          invoiceNumber: item.invoice_number,
          issueDate: item.issue_date,
          dueDate: item.due_date,
          currency: item.currency,
          taxRate: item.tax_rate,
          notes: item.notes,
          templateId: item.template_id,
          signature: item.signature,
          items: item.items,
          type: item.type,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }))
      : []

    return { drafts, error: null }
  } catch (error) {
    console.error("Get user drafts from DB error:", error)
    return { drafts: [], error }
  }
}

// Get a draft invoice from the database
export const getDraftInvoiceFromDb = async (draftId: string, userId: string) => {
  try {
    if (!draftId || !userId) throw new Error("Draft ID and User ID are required")

    // Check if the table exists first
    const tableExists = await checkInvoiceDraftsTable()
    if (!tableExists) {
      throw new Error("invoice_drafts table does not exist")
    }

    const { data, error } = await supabase
      .from("invoice_drafts")
      .select("*")
      .eq("id", draftId)
      .eq("user_id", userId)
      .single()

    if (error) throw error

    if (!data) {
      throw new Error("Draft not found")
    }

    // Convert from snake_case to camelCase
    const draft = {
      id: data.id,
      businessId: data.business_id,
      clientId: data.client_id,
      invoiceNumber: data.invoice_number,
      issueDate: data.issue_date,
      dueDate: data.due_date,
      currency: data.currency,
      taxRate: data.tax_rate,
      notes: data.notes,
      templateId: data.template_id,
      signature: data.signature,
      items: data.items,
      type: data.type,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return { draft, error: null }
  } catch (error) {
    console.error("Get draft invoice from DB error:", error)
    return { draft: null, error }
  }
}

// Delete a draft invoice from the database
export const deleteDraftInvoiceFromDb = async (draftId: string, userId: string) => {
  try {
    if (!draftId || !userId) throw new Error("Draft ID and User ID are required")

    // Check if the table exists first
    const tableExists = await checkInvoiceDraftsTable()
    if (!tableExists) {
      throw new Error("invoice_drafts table does not exist")
    }

    const { error } = await supabase.from("invoice_drafts").delete().eq("id", draftId).eq("user_id", userId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Delete draft invoice from DB error:", error)
    return { error }
  }
}
