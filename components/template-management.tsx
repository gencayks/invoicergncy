"use client"

import { useState, useEffect } from "react"
import type { Template } from "@/types/template"
import { templateStorage } from "@/lib/template-storage"
import TemplateBrowser from "./template-browser"
import TemplateEditor from "./template-editor"
import { useToast } from "@/hooks/use-toast"

interface TemplateManagementProps {
  onSelectTemplate: (templateId: string) => void
  selectedTemplateId: string
}

export default function TemplateManagement({ onSelectTemplate, selectedTemplateId }: TemplateManagementProps) {
  const [view, setView] = useState<"browser" | "editor">("browser")
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const { toast } = useToast()

  // Load templates on mount
  useEffect(() => {
    setTemplates(templateStorage.getAllTemplates())
  }, [])

  const handleEditTemplate = (template: Template) => {
    // If it's a system template, create a copy for editing
    if (template.isSystem) {
      const newTemplate = {
        ...template,
        id: `custom-${Date.now()}`,
        name: `${template.name} (Custom)`,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setEditingTemplate(newTemplate)
    } else {
      setEditingTemplate(template)
    }
    setView("editor")
  }

  const handleCreateTemplate = () => {
    const newTemplate = templateStorage.createNewTemplate()
    setEditingTemplate(newTemplate)
    setView("editor")
  }

  const handleSaveTemplate = (template: Template) => {
    const savedTemplate = templateStorage.saveTemplate(template)
    setView("browser")

    // Refresh templates list
    setTemplates(templateStorage.getAllTemplates())

    toast({
      title: "Template saved",
      description: `Your template "${template.name}" has been saved successfully.`,
    })

    // If this is the currently selected template, update it
    if (template.id === selectedTemplateId) {
      onSelectTemplate(template.id)
    }
  }

  return (
    <div>
      {view === "browser" ? (
        <TemplateBrowser
          onSelectTemplate={onSelectTemplate}
          selectedTemplateId={selectedTemplateId}
          onEditTemplate={handleEditTemplate}
          onCreateTemplate={handleCreateTemplate}
          templates={templates}
        />
      ) : (
        <TemplateEditor template={editingTemplate!} onSave={handleSaveTemplate} onCancel={() => setView("browser")} />
      )}
    </div>
  )
}
