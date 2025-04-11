import { supabase } from "./supabase"

export type ClientData = {
  name: string
  address?: string
  email?: string
  phone?: string
  paymentTerms?: string
}

export const createClient = async (businessId: string, clientData: ClientData) => {
  try {
    if (!businessId) throw new Error("Business ID is required")

    const { data, error } = await supabase
      .from("clients")
      .insert({
        business_id: businessId,
        name: clientData.name,
        address: clientData.address || null,
        email: clientData.email || null,
        phone: clientData.phone || null,
        payment_terms: clientData.paymentTerms || null,
      })
      .select()
      .single()

    if (error) throw error

    return { client: data, error: null }
  } catch (error) {
    console.error("Create client error:", error)
    return { client: null, error }
  }
}

export const getBusinessClients = async (businessId: string) => {
  try {
    if (!businessId) return { clients: [], error: null }

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("business_id", businessId)
      .order("name", { ascending: true })

    if (error) throw error

    return { clients: data || [], error: null }
  } catch (error) {
    console.error("Get business clients error:", error)
    return { clients: [], error }
  }
}

export const getClient = async (clientId: string, businessId: string) => {
  try {
    if (!clientId || !businessId) throw new Error("Client ID and Business ID are required")

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .eq("business_id", businessId)
      .single()

    if (error) throw error

    return { client: data, error: null }
  } catch (error) {
    console.error("Get client error:", error)
    return { client: null, error }
  }
}

export const updateClient = async (clientId: string, updates: Partial<ClientData>, businessId: string) => {
  try {
    if (!clientId || !businessId) throw new Error("Client ID and Business ID are required")

    // First verify the client belongs to the business
    const { data: clientCheck, error: checkError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("business_id", businessId)
      .single()

    if (checkError || !clientCheck) throw new Error("Client not found or access denied")

    const { data, error } = await supabase
      .from("clients")
      .update({
        name: updates.name,
        address: updates.address,
        email: updates.email,
        phone: updates.phone,
        payment_terms: updates.paymentTerms,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientId)
      .select()
      .single()

    if (error) throw error

    return { client: data, error: null }
  } catch (error) {
    console.error("Update client error:", error)
    return { client: null, error }
  }
}

export const deleteClient = async (clientId: string, businessId: string) => {
  try {
    if (!clientId || !businessId) throw new Error("Client ID and Business ID are required")

    // First verify the client belongs to the business
    const { data: clientCheck, error: checkError } = await supabase
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .eq("business_id", businessId)
      .single()

    if (checkError || !clientCheck) throw new Error("Client not found or access denied")

    const { error } = await supabase.from("clients").delete().eq("id", clientId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Delete client error:", error)
    return { error }
  }
}
