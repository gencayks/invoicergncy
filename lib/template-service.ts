import { supabase } from "./supabase"
import type { Template } from "@/types/template"

export const getSystemTemplates = async () => {
  try {
    const { data, error } = await supabase.from("templates").select("*").eq("is_system", true)

    if (error) throw error

    return { templates: data as Template[], error: null }
  } catch (error) {
    console.error("Get system templates error:", error)
    return { templates: [], error }
  }
}

export const getUserTemplates = async (userId: string) => {
  try {
    const { data, error } = await supabase.from("templates").select("*").eq("user_id", userId).eq("is_system", false)

    if (error) throw error

    return { templates: data as Template[], error: null }
  } catch (error) {
    console.error("Get user templates error:", error)
    return { templates: [], error }
  }
}

export const getAllTemplates = async (userId: string) => {
  try {
    // Get system templates
    const { templates: systemTemplates, error: systemError } = await getSystemTemplates()

    if (systemError) throw systemError

    // Get user templates
    const { templates: userTemplates, error: userError } = await getUserTemplates(userId)

    if (userError) throw userError

    return { templates: [...systemTemplates, ...userTemplates], error: null }
  } catch (error) {
    console.error("Get all templates error:", error)
    return { templates: [], error }
  }
}

export const getTemplate = async (templateId: string) => {
  try {
    const { data, error } = await supabase.from("templates").select("*").eq("id", templateId).single()

    if (error) throw error

    return { template: data as Template, error: null }
  } catch (error) {
    console.error("Get template error:", error)
    return { template: null, error }
  }
}

export const createTemplate = async (
  userId: string,
  templateData: Omit<Template, "id" | "user_id" | "is_system" | "created_at" | "updated_at">,
) => {
  try {
    const { data, error } = await supabase
      .from("templates")
      .insert({
        user_id: userId,
        name: templateData.name,
        description: templateData.description,
        is_system: false,
        colors: templateData.colors,
        fonts: templateData.fonts,
        layout: templateData.layout,
        defaults: templateData.defaults,
        preview_url: templateData.preview || null,
      })
      .select()
      .single()

    if (error) throw error

    return { template: data as Template, error: null }
  } catch (error) {
    console.error("Create template error:", error)
    return { template: null, error }
  }
}

export const updateTemplate = async (templateId: string, updates: Partial<Template>) => {
  try {
    const { data, error } = await supabase
      .from("templates")
      .update({
        name: updates.name,
        description: updates.description,
        colors: updates.colors,
        fonts: updates.fonts,
        layout: updates.layout,
        defaults: updates.defaults,
        preview_url: updates.preview,
        updated_at: new Date().toISOString(),
      })
      .eq("id", templateId)
      .select()
      .single()

    if (error) throw error

    return { template: data as Template, error: null }
  } catch (error) {
    console.error("Update template error:", error)
    return { template: null, error }
  }
}

export const deleteTemplate = async (templateId: string) => {
  try {
    const { error } = await supabase.from("templates").delete().eq("id", templateId)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error("Delete template error:", error)
    return { error }
  }
}

export const duplicateTemplate = async (userId: string, templateId: string) => {
  try {
    // Get the template to duplicate
    const { template, error: getError } = await getTemplate(templateId)

    if (getError) throw getError

    // Create a new template based on the original
    const { data, error: createError } = await supabase
      .from("templates")
      .insert({
        user_id: userId,
        name: `${template.name} (Copy)`,
        description: template.description,
        is_system: false,
        colors: template.colors,
        fonts: template.fonts,
        layout: template.layout,
        defaults: template.defaults,
        preview_url: template.preview,
      })
      .select()
      .single()

    if (createError) throw createError

    return { template: data as Template, error: null }
  } catch (error) {
    console.error("Duplicate template error:", error)
    return { template: null, error }
  }
}

export const uploadTemplatePreview = async (templateId: string, previewImage: File) => {
  try {
    const fileExt = previewImage.name.split(".").pop()
    const fileName = `template-${templateId}-preview-${Date.now()}.${fileExt}`
    const filePath = `template-previews/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage.from("assets").upload(filePath, previewImage)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabase.storage.from("assets").getPublicUrl(filePath)

    // Update template with preview URL
    const { error: updateError } = await supabase
      .from("templates")
      .update({ preview_url: urlData.publicUrl })
      .eq("id", templateId)

    if (updateError) throw updateError

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    console.error("Upload template preview error:", error)
    return { url: null, error }
  }
}
