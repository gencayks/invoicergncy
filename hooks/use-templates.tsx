"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from "@/lib/template-service"
import { useAuth } from "./use-auth"
import type { Template } from "@/types/template"

type TemplateContextType = {
  templates: Template[]
  activeTemplate: Template | null
  isLoading: boolean
  error: Error | null
  setActiveTemplate: (templateId: string) => void
  createNewTemplate: (templateData: Partial<Template>) => Promise<Template | null>
  updateTemplateById: (templateId: string, updates: Partial<Template>) => Promise<Template | null>
  deleteTemplateById: (templateId: string) => Promise<boolean>
  duplicateTemplateById: (templateId: string) => Promise<Template | null>
  refreshTemplates: () => Promise<void>
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined)

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeTemplate, setActiveTemplateState] = useState<Template | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadTemplates = async () => {
    if (!user) {
      setTemplates([])
      setActiveTemplateState(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const { templates, error } = await getAllTemplates(user.id)

      if (error) throw error

      setTemplates(templates)

      // If there's an active template ID in localStorage, load that template
      const activeTemplateId = localStorage.getItem("activeTemplateId")
      if (activeTemplateId) {
        const template = templates.find((t) => t.id === activeTemplateId)
        if (template) {
          setActiveTemplateState(template)
        } else if (templates.length > 0) {
          // If the stored template doesn't exist, use the first available
          setActiveTemplateState(templates[0])
          localStorage.setItem("activeTemplateId", templates[0].id)
        }
      } else if (templates.length > 0) {
        // If no active template is stored, use the first one
        setActiveTemplateState(templates[0])
        localStorage.setItem("activeTemplateId", templates[0].id)
      }

      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
  }, [user])

  const refreshTemplates = async () => {
    await loadTemplates()
  }

  const setActiveTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setActiveTemplateState(template)
      localStorage.setItem("activeTemplateId", templateId)
    }
  }

  const createNewTemplate = async (templateData: Partial<Template>) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { template, error } = await createTemplate(user.id, templateData as any)

      if (error) throw error

      await refreshTemplates()
      return template
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const updateTemplateById = async (templateId: string, updates: Partial<Template>) => {
    try {
      const { template, error } = await updateTemplate(templateId, updates)

      if (error) throw error

      await refreshTemplates()
      return template
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const deleteTemplateById = async (templateId: string) => {
    try {
      const { error } = await deleteTemplate(templateId)

      if (error) throw error

      // If the deleted template was active, set a new active template
      if (activeTemplate?.id === templateId) {
        const remainingTemplates = templates.filter((t) => t.id !== templateId)
        if (remainingTemplates.length > 0) {
          setActiveTemplateState(remainingTemplates[0])
          localStorage.setItem("activeTemplateId", remainingTemplates[0].id)
        } else {
          setActiveTemplateState(null)
          localStorage.removeItem("activeTemplateId")
        }
      }

      await refreshTemplates()
      return true
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const duplicateTemplateById = async (templateId: string) => {
    if (!user) throw new Error("User not authenticated")

    try {
      const { template, error } = await duplicateTemplate(user.id, templateId)

      if (error) throw error

      await refreshTemplates()
      return template
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }

  const value = {
    templates,
    activeTemplate,
    isLoading,
    error,
    setActiveTemplate,
    createNewTemplate,
    updateTemplateById,
    deleteTemplateById,
    duplicateTemplateById,
    refreshTemplates,
  }

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>
}

export const useTemplates = () => {
  const context = useContext(TemplateContext)
  if (context === undefined) {
    throw new Error("useTemplates must be used within a TemplateProvider")
  }
  return context
}
