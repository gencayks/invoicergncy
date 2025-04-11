"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Template } from "@/types/template"
import { templateStorage } from "@/lib/template-storage"
import { Check, Copy, Edit, Plus, Trash2 } from "lucide-react"

interface TemplateBrowserProps {
  onSelectTemplate: (templateId: string) => void
  selectedTemplateId: string
  onEditTemplate: (template: Template) => void
  onCreateTemplate: () => void
  templates: Template[]
}

export default function TemplateBrowser({
  onSelectTemplate,
  selectedTemplateId,
  onEditTemplate,
  onCreateTemplate,
  templates,
}: TemplateBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDuplicateTemplate = (templateId: string) => {
    const duplicated = templateStorage.duplicateTemplate(templateId)
    if (duplicated) {
      // This would refresh templates in a real implementation
      // For now, we'll just handle it in the parent component
      onCreateTemplate()
    }
  }

  const handleDeleteTemplate = (templateId: string) => {
    templateStorage.deleteTemplate(templateId)
    // This would refresh templates in a real implementation
    // For now, we'll just handle it in the parent component
    setDeleteConfirmation(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">Invoice Templates</h2>
        <Button onClick={onCreateTemplate} className="flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="relative">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={`overflow-hidden transition-all ${
              selectedTemplateId === template.id ? "ring-2 ring-black" : "hover:shadow-md"
            }`}
          >
            <div
              className="h-20"
              style={{
                backgroundColor: template.colors.primary,
              }}
            />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                {selectedTemplateId === template.id && (
                  <div className="bg-black text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex space-x-2 mb-2">
                {["primary", "secondary", "accent"].map((colorKey) => (
                  <div
                    key={colorKey}
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: template.colors[colorKey as keyof typeof template.colors] }}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500">{template.isSystem ? "System Template" : "Custom Template"}</div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button variant="outline" size="sm" onClick={() => onSelectTemplate(template.id)}>
                {selectedTemplateId === template.id ? "Selected" : "Select"}
              </Button>

              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDuplicateTemplate(template.id)}
                  title="Duplicate Template"
                >
                  <Copy className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="icon" onClick={() => onEditTemplate(template)} title="Edit Template">
                  <Edit className="h-4 w-4" />
                </Button>

                {!template.isSystem && (
                  <Dialog
                    open={deleteConfirmation === template.id}
                    onOpenChange={(open) => {
                      if (!open) setDeleteConfirmation(null)
                      else setDeleteConfirmation(template.id)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete Template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Template</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete "{template.name}"? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDeleteTemplate(template.id)}>
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <p className="text-gray-500 mb-4">No templates found</p>
          <Button onClick={onCreateTemplate}>Create New Template</Button>
        </div>
      )}
    </div>
  )
}
