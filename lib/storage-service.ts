import { supabase } from "./supabase"

export const uploadFile = async (bucket: string, folder: string, file: File, metadata?: Record<string, string>) => {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = folder ? `${folder}/${fileName}` : fileName

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
      ...(metadata ? { metadata } : {}),
    })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return { url: urlData.publicUrl, path: filePath, error: null }
  } catch (error) {
    console.error("Upload file error:", error)
    return { url: null, path: null, error }
  }
}

export const deleteFile = async (bucket: string, filePath: string) => {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Delete file error:", error)
    return { error }
  }
}

export const getSignedUrl = async (bucket: string, filePath: string, expiresIn = 60) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, expiresIn)

    if (error) throw error

    return { signedUrl: data.signedUrl, error: null }
  } catch (error) {
    console.error("Get signed URL error:", error)
    return { signedUrl: null, error }
  }
}

export const listFiles = async (bucket: string, folder?: string) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder || "")

    if (error) throw error

    return { files: data, error: null }
  } catch (error) {
    console.error("List files error:", error)
    return { files: [], error }
  }
}
