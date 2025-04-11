"use client"

import { format, parse } from "date-fns"
import { useEffect, useState } from "react"
import type { Template } from "@/types/template"
import { templateStorage } from "@/lib/template-storage"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  price: number
}

interface BusinessInfo {
  name: string
  address: string
  email: string
  phone: string
  logo: string | null
}

interface CustomerInfo {
  name: string
  address: string
  email: string
  phone: string
}

interface InvoiceDetails {
  invoiceNumber: string
  issueDate: string
  dueDate: string
  taxRate: number
  currency: string
  notes: string
}

interface Calculations {
  subtotal: number
  tax: number
  total: number
}

interface InvoicePreviewProps {
  businessInfo: BusinessInfo
  customerInfo: CustomerInfo
  invoiceDetails: InvoiceDetails
  items: InvoiceItem[]
  calculations: Calculations
  template?: string
  signature?: string | null
}

export default function InvoicePreview({
  businessInfo,
  customerInfo,
  invoiceDetails,
  items,
  calculations,
  template = "classic",
  signature = null,
}: InvoicePreviewProps) {
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null)
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null)

  useEffect(() => {
    // Load the template
    const templateData = templateStorage.getTemplateById(template)
    if (templateData) {
      setActiveTemplate(templateData)
    }
  }, [template])

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return ""
      const date = parse(dateString, "yyyy-MM-dd", new Date())
      return format(date, "MMM dd, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // Animation effect for highlighting sections
  useEffect(() => {
    const timer = setTimeout(() => {
      setHighlightedSection(null)
    }, 1500)

    return () => clearTimeout(timer)
  }, [highlightedSection])

  // Helper function to determine if a section should be highlighted
  const getSectionClass = (section: string) => {
    return highlightedSection === section
      ? "transition-all duration-300 bg-yellow-50 rounded-md"
      : "transition-all duration-300"
  }

  if (!activeTemplate) {
    return <div className="p-8 min-h-[800px] bg-white">Loading template...</div>
  }

  // Apply template styles
  const styles = {
    container: {
      fontFamily: activeTemplate.fonts.body,
      color: activeTemplate.colors.text,
      backgroundColor: activeTemplate.colors.background,
    },
    header: {
      display: activeTemplate.layout.headerPosition === "split" ? "flex" : "block",
      justifyContent: "space-between",
    },
    heading: {
      fontFamily: activeTemplate.fonts.heading,
      color: activeTemplate.colors.primary,
    },
    subheading: {
      color: activeTemplate.colors.secondary,
      fontWeight: 600,
    },
    table: {
      borderCollapse: activeTemplate.layout.showBorders ? "collapse" : "separate",
    },
    tableHeader: {
      backgroundColor: activeTemplate.colors.primary,
      color: "#fff",
    },
    tableCell: {
      border: activeTemplate.layout.showBorders ? `1px solid ${activeTemplate.colors.accent}` : "none",
      padding: "0.75rem",
    },
    alternateRow: {
      backgroundColor: activeTemplate.layout.showAlternateRows ? activeTemplate.colors.accent : "transparent",
    },
    footer: {
      borderTop: `1px solid ${activeTemplate.colors.accent}`,
      color: activeTemplate.colors.secondary,
    },
    logo: {
      textAlign:
        activeTemplate.layout.logoPosition === "left"
          ? "left"
          : activeTemplate.layout.logoPosition === "right"
            ? "right"
            : "center",
    },
  }

  return (
    <div className="p-8 min-h-[800px]" style={styles.container}>
      <div className={`mb-8 ${getSectionClass("business")}`} style={styles.header}>
        <div className={`max-w-[50%]`} style={{ textAlign: styles.logo.textAlign as any }}>
          {businessInfo.logo ? (
            <img
              src={businessInfo.logo || "/placeholder.svg"}
              alt="Business logo"
              className="max-h-20 mb-4 object-contain"
              style={{
                display: "inline-block",
                marginLeft: styles.logo.textAlign === "right" ? "auto" : 0,
                marginRight: styles.logo.textAlign === "left" ? "auto" : 0,
              }}
            />
          ) : (
            <div
              className="flex items-center mb-4"
              style={{
                justifyContent:
                  styles.logo.textAlign === "left"
                    ? "flex-start"
                    : styles.logo.textAlign === "right"
                      ? "flex-end"
                      : "center",
              }}
            >
              <span className="font-serif text-xl">gncy</span>
            </div>
          )}
          <h1 className="text-2xl font-bold mb-1" style={styles.heading}>
            {businessInfo.name || "Your Business Name"}
          </h1>
          <div className="text-gray-600 whitespace-pre-line">{businessInfo.address || "Your Address"}</div>
          {businessInfo.email && <div className="text-gray-600">{businessInfo.email}</div>}
          {businessInfo.phone && <div className="text-gray-600">{businessInfo.phone}</div>}
        </div>
        <div className={`text-right ${getSectionClass("invoice-details")}`}>
          <h2 className="text-3xl font-bold mb-2" style={styles.heading}>
            INVOICE
          </h2>
          <div className="mb-1">
            <span style={styles.subheading}>Invoice Number: </span>
            {invoiceDetails.invoiceNumber || "INV-0001"}
          </div>
          <div className="mb-1">
            <span style={styles.subheading}>Issue Date: </span>
            {formatDate(invoiceDetails.issueDate)}
          </div>
          <div>
            <span style={styles.subheading}>Due Date: </span>
            {formatDate(invoiceDetails.dueDate)}
          </div>
        </div>
      </div>

      <div className={`mb-8 ${getSectionClass("customer")}`}>
        <h3 className="text-gray-500 font-semibold mb-2 text-sm uppercase" style={styles.subheading}>
          Bill To:
        </h3>
        <div className="font-bold text-lg mb-1">{customerInfo.name || "Customer Name"}</div>
        <div className="text-gray-600 whitespace-pre-line">{customerInfo.address || "Customer Address"}</div>
        {customerInfo.email && <div className="text-gray-600">{customerInfo.email}</div>}
        {customerInfo.phone && <div className="text-gray-600">{customerInfo.phone}</div>}
      </div>

      <div className={getSectionClass("items")}>
        <table className="w-full mb-8" style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th className="py-2 px-2 text-left" style={styles.tableCell}>
                Description
              </th>
              <th className="py-2 px-2 text-right" style={styles.tableCell}>
                Quantity
              </th>
              <th className="py-2 px-2 text-right" style={styles.tableCell}>
                Price
              </th>
              <th className="py-2 px-2 text-right" style={styles.tableCell}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                style={index % 2 === 1 && activeTemplate.layout.showAlternateRows ? styles.alternateRow : {}}
              >
                <td className="py-3 px-2" style={styles.tableCell}>
                  {item.description || "Item description"}
                </td>
                <td className="py-3 px-2 text-right" style={styles.tableCell}>
                  {item.quantity}
                </td>
                <td className="py-3 px-2 text-right" style={styles.tableCell}>
                  {invoiceDetails.currency}
                  {item.price.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right" style={styles.tableCell}>
                  {invoiceDetails.currency}
                  {(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`flex justify-end mb-8 ${getSectionClass("totals")}`}>
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="font-medium">Subtotal:</span>
            <span>
              {invoiceDetails.currency}
              {calculations.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="font-medium">Tax ({invoiceDetails.taxRate}%):</span>
            <span>
              {invoiceDetails.currency}
              {calculations.tax.toFixed(2)}
            </span>
          </div>
          <div
            className="flex justify-between py-2 font-bold text-lg"
            style={{ fontFamily: activeTemplate.fonts.accent }}
          >
            <span>Total:</span>
            <span>
              {invoiceDetails.currency}
              {calculations.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {signature && (
        <div className={`mt-6 ${getSectionClass("signature")}`}>
          <div className="font-semibold mb-2" style={styles.subheading}>
            Signature:
          </div>
          <img src={signature || "/placeholder.svg"} alt="Digital signature" className="max-h-16" />
        </div>
      )}

      {invoiceDetails.notes && (
        <div className={`mt-8 border-t border-gray-200 pt-4 ${getSectionClass("notes")}`}>
          <h3 className="font-semibold mb-2" style={styles.subheading}>
            Notes:
          </h3>
          <p className="text-gray-600 whitespace-pre-line">
            {invoiceDetails.notes.replace("{{currency}}", invoiceDetails.currency)}
          </p>
        </div>
      )}

      <div className="mt-10 text-center text-gray-400 text-xs" style={styles.footer}>
        {activeTemplate.defaults.footer || "Invoice generated by gncy Invoice Generator"}
      </div>
    </div>
  )
}
