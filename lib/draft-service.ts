import { v4 as uuidv4 } from "uuid"

export type DraftInvoiceData = {
  id?: string
  businessId: string
  clientId?: string
  invoiceNumber?: string
  issueDate?: string
  dueDate?: string
  currency?: string
  taxRate?: number
  notes?: string
  templateId?: string
  signature?: string | null
  items?: any[]
  type?: "invoice" | "offer"
  createdAt?: string
  updatedAt?: string
}

// Local storage keys
const DRAFTS_STORAGE_KEY = "invoice_drafts_local"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Local storage helpers
const getLocalDrafts = (userId: string): DraftInvoiceData[] => {
  if (!isBrowser) return []

  try {
    const draftsJson = localStorage.getItem(`${DRAFTS_STORAGE_KEY}_${userId}`)
    return draftsJson ? JSON.parse(draftsJson) : []
  } catch (error) {
    console.error("Error reading local drafts:", error)
    return []
  }
}

const saveLocalDrafts = (userId: string, drafts: DraftInvoiceData[]) => {
  if (!isBrowser) return

  try {
    localStorage.setItem(`${DRAFTS_STORAGE_KEY}_${userId}`, JSON.stringify(drafts))
  } catch (error) {
    console.error("Error saving local drafts:", error)
  }
}

export const saveDraftInvoice = async (userId: string, draftData: DraftInvoiceData) => {
  try {
    if (!userId) throw new Error("User ID is required")

    const now = new Date().toISOString()
    const localDrafts = getLocalDrafts(userId)

    if (draftData.id) {
      // Update existing draft
      const updatedDrafts = localDrafts.map((draft) =>
        draft.id === draftData.id
          ? {
              ...draftData,
              updatedAt: now,
            }
          : draft,
      )
      saveLocalDrafts(userId, updatedDrafts)

      const updatedDraft = updatedDrafts.find((d) => d.id === draftData.id)
      return { draft: updatedDraft, error: null }
    } else {
      // Create new draft
      const newDraft = {
        ...draftData,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      }
      saveLocalDrafts(userId, [newDraft, ...localDrafts])
      return { draft: newDraft, error: null }
    }
  } catch (error) {
    console.error("Save draft invoice error:", error)
    return { draft: null, error }
  }
}

export const getUserDrafts = async (userId: string, type?: "invoice" | "offer") => {
  try {
    if (!userId) return { drafts: [], error: null }

    // Only use local storage, don't try to query the database
    let localDrafts = getLocalDrafts(userId)

    // Filter by type if provided
    if (type) {
      localDrafts = localDrafts.filter((draft) => draft.type === type)
    }

    // Sort by updatedAt
    localDrafts.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
      return dateB - dateA // Descending order
    })

    return { drafts: localDrafts, error: null }
  } catch (error) {
    console.error("Get user drafts error:", error)
    return { drafts: [], error }
  }
}

export const getDraftInvoice = async (draftId: string, userId: string) => {
  try {
    if (!draftId || !userId) throw new Error("Draft ID and User ID are required")

    const localDrafts = getLocalDrafts(userId)
    const draft = localDrafts.find((d) => d.id === draftId)

    if (!draft) {
      throw new Error("Draft not found")
    }

    return { draft, error: null }
  } catch (error) {
    console.error("Get draft invoice error:", error)
    return { draft: null, error }
  }
}

export const deleteDraftInvoice = async (draftId: string, userId: string) => {
  try {
    if (!draftId || !userId) throw new Error("Draft ID and User ID are required")

    const localDrafts = getLocalDrafts(userId)
    const updatedDrafts = localDrafts.filter((d) => d.id !== draftId)
    saveLocalDrafts(userId, updatedDrafts)
    return { error: null }
  } catch (error) {
    console.error("Delete draft invoice error:", error)
    return { error }
  }
}

// Helper function to get a draft by ID (synchronous version for local use)
export const getDraft = (draftId: string, userId: string): DraftInvoiceData | null => {
  if (!isBrowser || !draftId || !userId) return null

  try {
    const localDrafts = getLocalDrafts(userId)
    return localDrafts.find((d) => d.id === draftId) || null
  } catch (error) {
    console.error("Error getting draft:", error)
    return null
  }
}
