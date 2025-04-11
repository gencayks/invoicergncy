export interface TemplateColors {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface TemplateFonts {
  heading: string
  body: string
  accent: string
}

export interface TemplateLayout {
  headerPosition: "top" | "split"
  logoPosition: "left" | "right" | "center"
  itemStyle: "simple" | "detailed" | "compact"
  showBorders: boolean
  showAlternateRows: boolean
  footerStyle: "simple" | "detailed"
}

export interface TemplateDefaults {
  paymentTerms: string
  notes: string
  footer: string
}

export interface Template {
  id: string
  name: string
  description: string
  isSystem: boolean
  colors: TemplateColors
  fonts: TemplateFonts
  layout: TemplateLayout
  defaults: TemplateDefaults
  preview?: string
  createdAt: string
  updatedAt: string
}
