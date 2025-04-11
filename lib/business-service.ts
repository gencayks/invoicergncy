import { supabase } from "./supabase"

export type BusinessData = {
  name: string
  address?: string
  email?: string
  phone?: string
  taxId?: string
  logoUrl?: string
}

export const createBusiness = async (userId: string, businessData: BusinessData) => {
  try {
    if (!userId) throw new Error("User ID is required")

    const { data, error } = await supabase
      .from("businesses")
      .insert({
        user_id: userId,
        name: businessData.name,
        address: businessData.address || null,
        email: businessData.email || null,
        phone: businessData.phone || null,
        tax_id: businessData.taxId || null,
        logo_url: businessData.logoUrl || null,
      })
      .select()
      .single()

    if (error) throw error

    return { business: data, error: null }
  } catch (error) {
    console.error("Create business error:", error)
    return { business: null, error }
  }
}

export const getUserBusinesses = async (userId: string) => {
  try {
    if (!userId) return { businesses: [], error: null }

    const { data, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { businesses: data || [], error: null }
  } catch (error) {
    console.error("Get user businesses error:", error)
    return { businesses: [], error }
  }
}

export const updateBusiness = async (businessId: string, updates: Partial<BusinessData>, userId: string) => {
  try {
    if (!businessId || !userId) throw new Error("Business ID and User ID are required")

    // First verify the business belongs to the user
    const { data: businessCheck, error: checkError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("user_id", userId)
      .single()

    if (checkError || !businessCheck) throw new Error("Business not found or access denied")

    const { data, error } = await supabase
      .from("businesses")
      .update({
        name: updates.name,
        address: updates.address,
        email: updates.email,
        phone: updates.phone,
        tax_id: updates.taxId,
        logo_url: updates.logoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", businessId)
      .select()
      .single()

    if (error) throw error

    return { business: data, error: null }
  } catch (error) {
    console.error("Update business error:", error)
    return { business: null, error }
  }
}

export const deleteBusiness = async (businessId: string, userId: string) => {
  try {
    if (!businessId || !userId) throw new Error("Business ID and User ID are required")

    // First verify the business belongs to the user
    const { data: businessCheck, error: checkError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("user_id", userId)
      .single()

    if (checkError || !businessCheck) throw new Error("Business not found or access denied")

    const { error } = await supabase.from("businesses").delete().eq("id", businessId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Delete business error:", error)
    return { error }
  }
}

export const uploadBusinessLogo = async (businessId: string, file: File, userId: string) => {
  try {
    if (!businessId || !userId) throw new Error("Business ID and User ID are required")

    // First verify the business belongs to the user
    const { data: businessCheck, error: checkError } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", businessId)
      .eq("user_id", userId)
      .single()

    if (checkError || !businessCheck) throw new Error("Business not found or access denied")

    const fileExt = file.name.split(".").pop()
    const fileName = `${businessId}-logo-${Date.now()}.${fileExt}`
    const filePath = `business-logos/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from("assets").upload(filePath, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage.from("assets").getPublicUrl(filePath)

    // Update business with logo URL
    const { error: updateError } = await supabase
      .from("businesses")
      .update({ logo_url: urlData.publicUrl })
      .eq("id", businessId)

    if (updateError) throw updateError

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    console.error("Upload business logo error:", error)
    return { url: null, error }
  }
}
