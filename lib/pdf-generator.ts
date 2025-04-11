import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
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

interface GeneratePDFProps {
  businessInfo: BusinessInfo
  customerInfo: CustomerInfo
  invoiceDetails: InvoiceDetails
  items: InvoiceItem[]
  calculations: Calculations
  template?: string
  signature?: string | null
}

export const generatePDF = async (props: GeneratePDFProps) => {
  // Create a temporary div to render the invoice
  const tempDiv = document.createElement("div")
  tempDiv.style.position = "absolute"
  tempDiv.style.left = "-9999px"
  tempDiv.style.top = "-9999px"
  tempDiv.style.width = "800px" // Fixed width for better rendering
  tempDiv.style.backgroundColor = "white"
  tempDiv.style.padding = "40px"
  document.body.appendChild(tempDiv)

  // Get the template
  const templateId = props.template || "classic"
  const templateData = templateStorage.getTemplateById(templateId) || templateStorage.getTemplateById("classic")

  // Create the invoice HTML
  tempDiv.innerHTML = createInvoiceHTML(props, templateData!)

  try {
    // Convert the HTML to canvas
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow loading of images from other domains
      logging: false,
      backgroundColor: "#ffffff",
    })

    // Create PDF
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

    // Download the PDF with gncy branding
    const fileName = props.invoiceDetails.invoiceNumber
      ? `gncy-Invoice-${props.invoiceDetails.invoiceNumber}.pdf`
      : "gncy-Invoice.pdf"
    pdf.save(fileName)
  } catch (error) {
    console.error("Error generating PDF:", error)
  } finally {
    // Clean up
    document.body.removeChild(tempDiv)
  }
}

function createInvoiceHTML(props: GeneratePDFProps, template: Template): string {
  const { businessInfo, customerInfo, invoiceDetails, items, calculations, signature } = props

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return ""
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return dateString
    }
  }

  // Create item rows
  const itemRows = items
    .map(
      (item, index) => `
      <tr style="
        ${template.layout.showAlternateRows && index % 2 === 1 ? `background-color: ${template.colors.accent};` : ""}
        ${template.layout.showBorders ? `border-bottom: 1px solid ${template.colors.accent};` : ""}
      ">
        <td style="padding: 12px 8px; ${template.layout.showBorders ? `border: 1px solid ${template.colors.accent};` : ""}">${item.description || "Item description"}</td>
        <td style="padding: 12px 8px; text-align: right; ${template.layout.showBorders ? `border: 1px solid ${template.colors.accent};` : ""}">${item.quantity}</td>
        <td style="padding: 12px 8px; text-align: right; ${template.layout.showBorders ? `border: 1px solid ${template.colors.accent};` : ""}">${
          invoiceDetails.currency
        }${item.price.toFixed(2)}</td>
        <td style="padding: 12px 8px; text-align: right; ${template.layout.showBorders ? `border: 1px solid ${template.colors.accent};` : ""}">${
          invoiceDetails.currency
        }${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `,
    )
    .join("")

  // Create the HTML with template styling
  return `
    <div style="
      font-family: ${template.fonts.body}; 
      color: ${template.colors.text};
      background-color: ${template.colors.background};
    ">
      <div style="
        display: ${template.layout.headerPosition === "split" ? "flex" : "block"};
        justify-content: space-between;
        margin-bottom: 30px;
      ">
        <div style="
          max-width: ${template.layout.headerPosition === "split" ? "50%" : "100%"};
          text-align: ${
            template.layout.logoPosition === "left"
              ? "left"
              : template.layout.logoPosition === "right"
                ? "right"
                : "center"
          };
        ">
          ${
            businessInfo.logo
              ? `<img src="${businessInfo.logo}" alt="Business logo" style="
                  max-height: 80px; 
                  margin-bottom: 15px;
                  display: inline-block;
                  ${template.layout.logoPosition === "right" ? "margin-left: auto;" : ""}
                  ${template.layout.logoPosition === "center" ? "margin: 0 auto;" : ""}
                " />`
              : `<div style="
                  display: flex;
                  align-items: center;
                  margin-bottom: 15px;
                  justify-content: ${
                    template.layout.logoPosition === "left"
                      ? "flex-start"
                      : template.layout.logoPosition === "right"
                        ? "flex-end"
                        : "center"
                  };
                ">
                  <div style="
                    font-family: ${template.fonts.heading};
                    font-size: 20px;
                    color: ${template.colors.primary};
                  ">gncy</div>
                </div>`
          }
          <h1 style="
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 5px 0;
            font-family: ${template.fonts.heading};
            color: ${template.colors.primary};
          ">
            ${businessInfo.name || "Your Business Name"}
          </h1>
          <div style="color: ${template.colors.text}; white-space: pre-line;">
            ${businessInfo.address || "Your Address"}
          </div>
          ${businessInfo.email ? `<div style="color: ${template.colors.text};">${businessInfo.email}</div>` : ""}
          ${businessInfo.phone ? `<div style="color: ${template.colors.text};">${businessInfo.phone}</div>` : ""}
        </div>
        <div style="text-align: right;">
          <h2 style="
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 10px 0;
            font-family: ${template.fonts.heading};
            color: ${template.colors.primary};
          ">INVOICE</h2>
          <div style="color: ${template.colors.text}; margin-bottom: 5px;">
            <span style="font-weight: 600; color: ${template.colors.secondary};">Invoice Number: </span>
            ${invoiceDetails.invoiceNumber || "INV-0001"}
          </div>
          <div style="color: ${template.colors.text}; margin-bottom: 5px;">
            <span style="font-weight: 600; color: ${template.colors.secondary};">Issue Date: </span>
            ${formatDate(invoiceDetails.issueDate)}
          </div>
          <div style="color: ${template.colors.text};">
            <span style="font-weight: 600; color: ${template.colors.secondary};">Due Date: </span>
            ${formatDate(invoiceDetails.dueDate)}
          </div>
        </div>
      </div>

      <div style="margin-bottom: 30px;">
        <h3 style="
          color: ${template.colors.secondary};
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          font-size: 14px;
        ">Bill To:</h3>
        <div style="
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 5px;
          color: ${template.colors.text};
        ">
          ${customerInfo.name || "Customer Name"}
        </div>
        <div style="color: ${template.colors.text}; white-space: pre-line;">
          ${customerInfo.address || "Customer Address"}
        </div>
        ${customerInfo.email ? `<div style="color: ${template.colors.text};">${customerInfo.email}</div>` : ""}
        ${customerInfo.phone ? `<div style="color: ${template.colors.text};">${customerInfo.phone}</div>` : ""}
      </div>

      <table style="
        width: 100%;
        border-collapse: ${template.layout.showBorders ? "collapse" : "separate"};
        margin-bottom: 30px;
      ">
        <thead>
          <tr style="
            background-color: ${template.colors.primary};
            color: white;
            text-align: left;
          ">
            <th style="
              padding: 10px 8px;
              ${template.layout.showBorders ? `border: 1px solid ${template.colors.accent};` : ""}
            ">Description</th>
            <th style="
              padding: 10px 8px;
              text-align: right;
              ${template.layout.showBorders ? `border: 1px solid ${template.colors.accent};` : ""}
            ">Quantity</th>
            <th style="
              padding: 10px 8px;
              text-align: right;
              ${template.layout.showBorders ? `border: 1px solid ${template.colors.accent};` : ""}
            ">Price</th>
            <th style="
              padding: 10px 8px;
              text-align: right;
              ${template.layout.showBorders ? `border: 1px solid ${template.colors.accent};` : ""}
            ">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
        <div style="width: 250px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 0;">
            <span style="font-weight: 500; color: ${template.colors.secondary};">Subtotal:</span>
            <span>${invoiceDetails.currency}${calculations.subtotal.toFixed(2)}</span>
          </div>
          <div style="
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid ${template.colors.accent};
          ">
            <span style="font-weight: 500; color: ${template.colors.secondary};">Tax (${invoiceDetails.taxRate}%):</span>
            <span>${invoiceDetails.currency}${calculations.tax.toFixed(2)}</span>
          </div>
          <div style="
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-weight: bold;
            font-size: 18px;
            font-family: ${template.fonts.accent};
          ">
            <span>Total:</span>
            <span>${invoiceDetails.currency}${calculations.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      ${
        signature
          ? `
        <div style="margin-top: 20px; margin-bottom: 20px;">
          <div style="font-weight: 600; color: ${template.colors.secondary}; margin-bottom: 5px;">Signature:</div>
          <img src="${signature}" alt="Digital signature" style="max-height: 60px;" />
        </div>
      `
          : ""
      }

      ${
        invoiceDetails.notes
          ? `
        <div style="
          margin-top: 30px;
          border-top: 1px solid ${template.colors.accent};
          padding-top: 15px;
        ">
          <h3 style="font-weight: 600; margin-bottom: 8px; color: ${template.colors.secondary};">Notes:</h3>
          <p style="color: ${template.colors.text}; white-space: pre-line;">
            ${invoiceDetails.notes.replace("{{currency}}", invoiceDetails.currency)}
          </p>
        </div>
      `
          : ""
      }
      
      <div style="
        margin-top: 40px;
        text-align: center;
        color: ${template.colors.secondary};
        font-size: 12px;
        border-top: 1px solid ${template.colors.accent};
        padding-top: 15px;
      ">
        ${template.defaults.footer || "Invoice generated by gncy Invoice Generator"}
      </div>
    </div>
  `
}
