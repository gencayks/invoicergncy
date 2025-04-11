"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Template } from "@/types/template"
import { AlertCircle, ArrowLeft, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface TemplateEditorProps {
  template: Template
  onSave: (template: Template) => void
  onCancel: () => void
}

export default function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<Template>(template)
  const [activeTab, setActiveTab] = useState("general")
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [hasChanges, setHasChanges] = useState(false)

  // Update the template when a field changes
  const updateTemplate = <K extends keyof Template>(field: K, value: Template[K]) => {
    setEditedTemplate((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }))
    setHasChanges(true)
  }

  // Update nested fields
  const updateNestedField = <K extends keyof Template, N extends keyof Template[K]>(
    parent: K,
    field: N,
    value: Template[K][N],
  ) => {
    setEditedTemplate((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    }))
    setHasChanges(true)
  }

  // Generate preview HTML
  useEffect(() => {
    const currency = "USD" // Default currency for preview
    // This would be a more complex function in a real implementation
    // that generates HTML based on the template settings
    const html = `
      <div style="
        font-family: ${editedTemplate.fonts.body};
        color: ${editedTemplate.colors.text};
        background-color: ${editedTemplate.colors.background};
        padding: 20px;
        border: 1px solid ${editedTemplate.colors.accent};
      ">
        <div style="
          display: flex;
          justify-content: ${
            editedTemplate.layout.logoPosition === "left"
              ? "flex-start"
              : editedTemplate.layout.logoPosition === "right"
                ? "flex-end"
                : "center"
          };
          margin-bottom: 20px;
        ">
          <div style="
            width: 80px;
            height: 40px;
            background-color: ${editedTemplate.colors.primary};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
          ">LOGO</div>
        </div>
        
        <h1 style="
          font-family: ${editedTemplate.fonts.heading};
          color: ${editedTemplate.colors.primary};
          margin-bottom: 10px;
        ">Invoice</h1>
        
        <div style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        ">
          <div>
            <div style="font-weight: bold; color: ${editedTemplate.colors.secondary};">From:</div>
            <div>Your Business Name</div>
            <div>123 Business St</div>
            <div>Business City, 12345</div>
          </div>
          <div>
            <div style="font-weight: bold; color: ${editedTemplate.colors.secondary};">To:</div>
            <div>Client Name</div>
            <div>456 Client Ave</div>
            <div>Client City, 67890</div>
          </div>
        </div>
        
        <table style="
          width: 100%;
          border-collapse: ${editedTemplate.layout.showBorders ? "collapse" : "separate"};
          margin-bottom: 20px;
        ">
          <thead>
            <tr style="
              background-color: ${editedTemplate.colors.primary};
              color: white;
            ">
              <th style="padding: 10px; text-align: left; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">Description</th>
              <th style="padding: 10px; text-align: right; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">Quantity</th>
              <th style="padding: 10px; text-align: right; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">Price</th>
              <th style="padding: 10px; text-align: right; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="${editedTemplate.layout.showAlternateRows ? "background-color: " + editedTemplate.colors.accent + ";" : ""}">
              <td style="padding: 10px; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">Item 1</td>
              <td style="padding: 10px; text-align: right; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">1</td>
              <td style="padding: 10px; text-align: right; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">$100.00</td>
              <td style="padding: 10px; text-align: right; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">$100.00</td>
            </tr>
            <tr>
              <td style="padding: 10px; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">Item 2</td>
              <td style="padding: 10px; text-align: right; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">2</td>
              <td style="padding: 10px; text-align: right; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">$50.00</td>
              <td style="padding: 10px; text-align: right; ${editedTemplate.layout.showBorders ? "border: 1px solid " + editedTemplate.colors.accent : ""}">$100.00</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="font-weight: bold;">
              <td style="padding: 10px;" colSpan="3">Total</td>
              <td style="padding: 10px; text-align: right;">$200.00</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="
          margin-top: 20px;
          padding: 10px;
          background-color: ${editedTemplate.colors.accent};
          border-radius: 4px;
        ">
          <div style="font-weight: bold; color: ${editedTemplate.colors.secondary};">Payment Terms:</div>
          <div>${editedTemplate.defaults.paymentTerms}</div>
        </div>
        
        ${
          editedTemplate.defaults.notes
            ? `
          <div style="margin-top: 20px;">
            <div style="font-weight: bold; color: ${editedTemplate.colors.secondary};">Notes:</div>
            <div>${editedTemplate.defaults.notes.replace(/\{\{\s*currency\s*\}\}/g, currency)}</div>
          </div>
        `
            : ""
        }
        
        <div style="
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid ${editedTemplate.colors.accent};
          text-align: center;
          font-size: 12px;
          color: ${editedTemplate.colors.secondary};
        ">
          ${editedTemplate.defaults.footer}
        </div>
      </div>
    `
    setPreviewHtml(html)
  }, [editedTemplate])

  const handleSave = () => {
    onSave(editedTemplate)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onCancel} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Templates
        </Button>

        <div className="flex items-center space-x-2">
          {hasChanges && <span className="text-sm text-amber-600">Unsaved changes</span>}
          <Button onClick={handleSave} className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {template.isSystem && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>System Template</AlertTitle>
          <AlertDescription>
            You are editing a copy of a system template. Your changes will be saved as a new custom template.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="colors">Colors & Fonts</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="defaults">Default Content</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={editedTemplate.name}
                  onChange={(e) => updateTemplate("name", e.target.value)}
                  placeholder="Enter template name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={editedTemplate.description}
                  onChange={(e) => updateTemplate("description", e.target.value)}
                  placeholder="Enter template description"
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-6 pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Colors</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex space-x-2">
                      <div
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: editedTemplate.colors.primary }}
                      />
                      <Input
                        id="primary-color"
                        type="text"
                        value={editedTemplate.colors.primary}
                        onChange={(e) => updateNestedField("colors", "primary", e.target.value)}
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex space-x-2">
                      <div
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: editedTemplate.colors.secondary }}
                      />
                      <Input
                        id="secondary-color"
                        type="text"
                        value={editedTemplate.colors.secondary}
                        onChange={(e) => updateNestedField("colors", "secondary", e.target.value)}
                        placeholder="#4B5563"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex space-x-2">
                      <div
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: editedTemplate.colors.accent }}
                      />
                      <Input
                        id="accent-color"
                        type="text"
                        value={editedTemplate.colors.accent}
                        onChange={(e) => updateNestedField("colors", "accent", e.target.value)}
                        placeholder="#E5E7EB"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex space-x-2">
                      <div
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: editedTemplate.colors.text }}
                      />
                      <Input
                        id="text-color"
                        type="text"
                        value={editedTemplate.colors.text}
                        onChange={(e) => updateNestedField("colors", "text", e.target.value)}
                        placeholder="#111827"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex space-x-2">
                      <div
                        className="h-10 w-10 rounded border"
                        style={{ backgroundColor: editedTemplate.colors.background }}
                      />
                      <Input
                        id="background-color"
                        type="text"
                        value={editedTemplate.colors.background}
                        onChange={(e) => updateNestedField("colors", "background", e.target.value)}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Fonts</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heading-font">Heading Font</Label>
                    <Select
                      value={editedTemplate.fonts.heading}
                      onValueChange={(value) => updateNestedField("fonts", "heading", value)}
                    >
                      <SelectTrigger id="heading-font">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="'Helvetica Neue', sans-serif">Helvetica</SelectItem>
                        <SelectItem value="system-ui, sans-serif">System UI</SelectItem>
                        <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                        <SelectItem value="Tahoma, sans-serif">Tahoma</SelectItem>
                        <SelectItem value="'Trebuchet MS', sans-serif">Trebuchet MS</SelectItem>
                        <SelectItem value="'Segoe UI', sans-serif">Segoe UI</SelectItem>
                        <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                        <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                        <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                        <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="body-font">Body Font</Label>
                    <Select
                      value={editedTemplate.fonts.body}
                      onValueChange={(value) => updateNestedField("fonts", "body", value)}
                    >
                      <SelectTrigger id="body-font">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="'Helvetica Neue', sans-serif">Helvetica</SelectItem>
                        <SelectItem value="system-ui, sans-serif">System UI</SelectItem>
                        <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                        <SelectItem value="Tahoma, sans-serif">Tahoma</SelectItem>
                        <SelectItem value="'Trebuchet MS', sans-serif">Trebuchet MS</SelectItem>
                        <SelectItem value="'Segoe UI', sans-serif">Segoe UI</SelectItem>
                        <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                        <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                        <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                        <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent-font">Accent Font (for numbers, totals)</Label>
                    <Select
                      value={editedTemplate.fonts.accent}
                      onValueChange={(value) => updateNestedField("fonts", "accent", value)}
                    >
                      <SelectTrigger id="accent-font">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="'Helvetica Neue', sans-serif">Helvetica</SelectItem>
                        <SelectItem value="system-ui, sans-serif">System UI</SelectItem>
                        <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                        <SelectItem value="Tahoma, sans-serif">Tahoma</SelectItem>
                        <SelectItem value="'Trebuchet MS', sans-serif">Trebuchet MS</SelectItem>
                        <SelectItem value="'Segoe UI', sans-serif">Segoe UI</SelectItem>
                        <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                        <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                        <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                        <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                        <SelectItem value="monospace">Monospace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6 pt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Header Layout</h3>

                <div className="space-y-2">
                  <Label>Header Position</Label>
                  <RadioGroup
                    value={editedTemplate.layout.headerPosition}
                    onValueChange={(value: "top" | "split") => updateNestedField("layout", "headerPosition", value)}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="top" id="header-top" />
                      <Label htmlFor="header-top">Top (Business info above invoice details)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="split" id="header-split" />
                      <Label htmlFor="header-split">Split (Business info left, invoice details right)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Logo Position</Label>
                  <RadioGroup
                    value={editedTemplate.layout.logoPosition}
                    onValueChange={(value: "left" | "right" | "center") =>
                      updateNestedField("layout", "logoPosition", value)
                    }
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="left" id="logo-left" />
                      <Label htmlFor="logo-left">Left</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="center" id="logo-center" />
                      <Label htmlFor="logo-center">Center</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="right" id="logo-right" />
                      <Label htmlFor="logo-right">Right</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Item Table Style</h3>

                <div className="space-y-2">
                  <Label>Item Style</Label>
                  <RadioGroup
                    value={editedTemplate.layout.itemStyle}
                    onValueChange={(value: "simple" | "detailed" | "compact") =>
                      updateNestedField("layout", "itemStyle", value)
                    }
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="simple" id="item-simple" />
                      <Label htmlFor="item-simple">Simple (Basic item rows)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="detailed" id="item-detailed" />
                      <Label htmlFor="item-detailed">Detailed (With item descriptions)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compact" id="item-compact" />
                      <Label htmlFor="item-compact">Compact (Condensed spacing)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-borders"
                    checked={editedTemplate.layout.showBorders}
                    onCheckedChange={(checked) => updateNestedField("layout", "showBorders", checked)}
                  />
                  <Label htmlFor="show-borders">Show table borders</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="alternate-rows"
                    checked={editedTemplate.layout.showAlternateRows}
                    onCheckedChange={(checked) => updateNestedField("layout", "showAlternateRows", checked)}
                  />
                  <Label htmlFor="alternate-rows">Use alternating row colors</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Footer Style</Label>
                <RadioGroup
                  value={editedTemplate.layout.footerStyle}
                  onValueChange={(value: "simple" | "detailed") => updateNestedField("layout", "footerStyle", value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="simple" id="footer-simple" />
                    <Label htmlFor="footer-simple">Simple (Basic footer)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detailed" id="footer-detailed" />
                    <Label htmlFor="footer-detailed">Detailed (With additional information)</Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>

            <TabsContent value="defaults" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="payment-terms">Default Payment Terms</Label>
                <Textarea
                  id="payment-terms"
                  value={editedTemplate.defaults.paymentTerms}
                  onChange={(e) => updateNestedField("defaults", "paymentTerms", e.target.value)}
                  placeholder="Enter default payment terms"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Default Notes</Label>
                <Textarea
                  id="notes"
                  value={editedTemplate.defaults.notes}
                  onChange={(e) => updateNestedField("defaults", "notes", e.target.value)}
                  placeholder="Enter default notes"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  You can use {{ currency }} as a placeholder for the invoice currency.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer">Footer Text</Label>
                <Input
                  id="footer"
                  value={editedTemplate.defaults.footer}
                  onChange={(e) => updateNestedField("defaults", "footer", e.target.value)}
                  placeholder="Enter footer text"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h3 className="text-lg font-medium mb-4">Template Preview</h3>
            <div className="border rounded-md overflow-hidden">
              <div
                className="w-full h-[500px] overflow-auto bg-white"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This is a simplified preview. The actual invoice will include your business and customer information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
