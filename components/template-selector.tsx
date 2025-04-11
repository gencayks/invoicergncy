"use client"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Check } from "lucide-react"

export interface TemplateOption {
  id: string
  name: string
  description: string
  preview: string
  primaryColor: string
  fontFamily: string
  layout: "classic" | "modern" | "minimal" | "professional" | "creative"
}

const defaultTemplates: TemplateOption[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional invoice layout with a clean, professional design",
    preview: "/placeholder.svg?height=120&width=200",
    primaryColor: "#000000",
    fontFamily: "Georgia, serif",
    layout: "classic",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with a sleek, minimalist aesthetic",
    preview: "/placeholder.svg?height=120&width=200",
    primaryColor: "#3B82F6",
    fontFamily: "Inter, sans-serif",
    layout: "modern",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simplified layout focusing on essential information",
    preview: "/placeholder.svg?height=120&width=200",
    primaryColor: "#6B7280",
    fontFamily: "Inter, sans-serif",
    layout: "minimal",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Formal design suitable for corporate and business use",
    preview: "/placeholder.svg?height=120&width=200",
    primaryColor: "#1E3A8A",
    fontFamily: "Georgia, serif",
    layout: "professional",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Distinctive design for creative professionals and agencies",
    preview: "/placeholder.svg?height=120&width=200",
    primaryColor: "#9333EA",
    fontFamily: "Poppins, sans-serif",
    layout: "creative",
  },
]

interface TemplateSelectorProps {
  selectedTemplate: string
  onSelectTemplate: (templateId: string) => void
  customTemplates?: TemplateOption[]
}

export default function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
  customTemplates = [],
}: TemplateSelectorProps) {
  const allTemplates = [...defaultTemplates, ...customTemplates]

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-xl mb-4">Invoice Template</h2>
      <RadioGroup
        value={selectedTemplate}
        onValueChange={onSelectTemplate}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {allTemplates.map((template) => (
          <div key={template.id} className="relative">
            <RadioGroupItem value={template.id} id={`template-${template.id}`} className="sr-only" />
            <Label htmlFor={`template-${template.id}`} className="cursor-pointer">
              <Card
                className={`overflow-hidden transition-all ${selectedTemplate === template.id ? "ring-2 ring-black" : "hover:shadow-md"}`}
              >
                <div className="h-16" style={{ backgroundColor: template.primaryColor }} />
                <CardContent className="p-4">
                  <div className="font-medium">{template.name}</div>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                </CardContent>
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2 bg-black text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </Card>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
