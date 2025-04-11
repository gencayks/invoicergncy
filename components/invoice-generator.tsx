"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { generatePDF } from "@/lib/pdf-generator"
import InvoicePreview from "./invoice-preview"

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

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "AUD", label: "AUD ($)" },
  { value: "JPY", label: "JPY (¥)" },
]

const currencySymbols: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  CAD: "$",
  AUD: "$",
  JPY: "¥",
}

export default function InvoiceGenerator() {
  const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", description: "", quantity: 1, price: 0 }])

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    address: "",
    email: "",
    phone: "",
    logo: null,
  })

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    address: "",
    email: "",
    phone: "",
  })

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    invoiceNumber: "",
    issueDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    taxRate: 0,
    currency: "USD",
    notes: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setBusinessInfo({
            ...businessInfo,
            logo: event.target.result as string,
          })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        price: 0,
      },
    ])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }
        return item
      }),
    )
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceDetails.taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleGeneratePDF = () => {
    generatePDF({
      businessInfo,
      customerInfo,
      invoiceDetails,
      items,
      calculations: {
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
      },
    })
  }

  const clearForm = () => {
    setItems([{ id: "1", description: "", quantity: 1, price: 0 }])
    setBusinessInfo({
      name: "",
      address: "",
      email: "",
      phone: "",
      logo: null,
    })
    setCustomerInfo({
      name: "",
      address: "",
      email: "",
      phone: "",
    })
    setInvoiceDetails({
      invoiceNumber: "",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      taxRate: 0,
      currency: "USD",
      notes: "",
    })
  }

  const getCurrencySymbol = () => {
    return currencySymbols[invoiceDetails.currency] || "$"
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <Label htmlFor="exportFormat" className="block text-sm font-normal mb-2">
              Export Format
            </Label>
            <Select defaultValue="pdf">
              <SelectTrigger className="w-full border rounded h-10">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Format</SelectItem>
                <SelectItem value="docx">Word Format</SelectItem>
                <SelectItem value="xlsx">Excel Format</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="invoiceNumber" className="block text-sm font-normal mb-2">
              Invoice Number
            </Label>
            <Input
              id="invoiceNumber"
              value={invoiceDetails.invoiceNumber}
              onChange={(e) =>
                setInvoiceDetails({
                  ...invoiceDetails,
                  invoiceNumber: e.target.value,
                })
              }
              className="w-full border rounded h-10"
            />
          </div>

          <div className="mb-4">
            <Label htmlFor="businessLogo" className="block text-sm font-normal mb-2">
              Business Logo (Optional)
            </Label>
            <div className="border rounded p-2">
              <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
              <div className="flex items-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border rounded px-3 py-1 text-sm"
                >
                  Choose File
                </button>
                <span className="ml-2 text-gray-500 text-sm">
                  {businessInfo.logo ? "File selected" : "No file chosen"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={clearForm} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded h-10">
            Clear Form
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="issueDate" className="block text-sm font-normal mb-2">
            Issue Date
          </Label>
          <Input
            id="issueDate"
            type="date"
            value={invoiceDetails.issueDate}
            onChange={(e) =>
              setInvoiceDetails({
                ...invoiceDetails,
                issueDate: e.target.value,
              })
            }
            className="w-full border rounded h-10"
          />
        </div>
        <div>
          <Label htmlFor="dueDate" className="block text-sm font-normal mb-2">
            Due Date
          </Label>
          <Input
            id="dueDate"
            type="date"
            value={invoiceDetails.dueDate}
            onChange={(e) =>
              setInvoiceDetails({
                ...invoiceDetails,
                dueDate: e.target.value,
              })
            }
            className="w-full border rounded h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="font-serif text-xl mb-4">Business Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="businessName" className="block text-sm font-normal mb-2">
                Business Name
              </Label>
              <Input
                id="businessName"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                className="w-full border rounded h-10"
              />
            </div>
            <div>
              <Label htmlFor="businessAddress" className="block text-sm font-normal mb-2">
                Business Address
              </Label>
              <Textarea
                id="businessAddress"
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                className="w-full border rounded min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="businessEmail" className="block text-sm font-normal mb-2">
                Business Email
              </Label>
              <Input
                id="businessEmail"
                type="email"
                value={businessInfo.email}
                onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                className="w-full border rounded h-10"
              />
            </div>
            <div>
              <Label htmlFor="businessPhone" className="block text-sm font-normal mb-2">
                Business Phone
              </Label>
              <Input
                id="businessPhone"
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                className="w-full border rounded h-10"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-xl mb-4">Customer Details</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerName" className="block text-sm font-normal mb-2">
                Customer Name
              </Label>
              <Input
                id="customerName"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                className="w-full border rounded h-10"
              />
            </div>
            <div>
              <Label htmlFor="customerAddress" className="block text-sm font-normal mb-2">
                Customer Address
              </Label>
              <Textarea
                id="customerAddress"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                className="w-full border rounded min-h-[80px]"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail" className="block text-sm font-normal mb-2">
                Customer Email
              </Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                className="w-full border rounded h-10"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone" className="block text-sm font-normal mb-2">
                Customer Phone
              </Label>
              <Input
                id="customerPhone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                className="w-full border rounded h-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl mb-4">Invoice Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-1 w-full font-normal text-sm">Description</th>
                <th className="text-right py-2 px-1 whitespace-nowrap font-normal text-sm">Quantity</th>
                <th className="text-right py-2 px-1 whitespace-nowrap font-normal text-sm">Price</th>
                <th className="text-right py-2 px-1 whitespace-nowrap font-normal text-sm">Amount</th>
                <th className="py-2 px-1 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 px-1">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                      placeholder="Item description"
                      className="w-full border rounded h-10"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                      className="w-20 text-right border rounded h-10"
                    />
                  </td>
                  <td className="py-2 px-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", Number.parseFloat(e.target.value) || 0)}
                      className="w-24 text-right border rounded h-10"
                    />
                  </td>
                  <td className="py-2 px-1 text-right whitespace-nowrap">
                    {getCurrencySymbol()}
                    {(item.quantity * item.price).toFixed(2)}
                  </td>
                  <td className="py-2 px-1">
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={addItem} className="mt-4 text-gray-700 hover:text-gray-900 flex items-center text-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <h2 className="font-serif text-xl mb-4">Invoice Total</h2>
          <div className="mb-4">
            <Label htmlFor="currency" className="block text-sm font-normal mb-2">
              Currency
            </Label>
            <Select
              value={invoiceDetails.currency}
              onValueChange={(value) =>
                setInvoiceDetails({
                  ...invoiceDetails,
                  currency: value,
                })
              }
            >
              <SelectTrigger className="w-full border rounded h-10">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 p-6 rounded">
            <h3 className="font-serif text-lg mb-4">Total Amount</h3>
            <div className="text-3xl font-mono">
              {getCurrencySymbol()}
              {calculateTotal().toFixed(2)}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="taxRate" className="block text-sm font-normal mb-2">
              Tax Rate (%)
            </Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              step="0.1"
              value={invoiceDetails.taxRate}
              onChange={(e) =>
                setInvoiceDetails({
                  ...invoiceDetails,
                  taxRate: Number.parseFloat(e.target.value) || 0,
                })
              }
              className="w-full border rounded h-10"
            />
          </div>
          <div>
            <Label htmlFor="notes" className="block text-sm font-normal mb-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Payment terms, bank details, etc."
              value={invoiceDetails.notes}
              onChange={(e) =>
                setInvoiceDetails({
                  ...invoiceDetails,
                  notes: e.target.value,
                })
              }
              className="w-full border rounded min-h-[100px]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleGeneratePDF}
          className="bg-black hover:bg-gray-800 text-white py-3 px-4 rounded text-center"
        >
          Generate PDF Invoice
        </button>
        <button
          onClick={clearForm}
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded text-center"
        >
          Clear
        </button>
      </div>

      <div>
        <h2 className="font-serif text-xl mb-4">Available Templates</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Free invoice template Word format - professional business template</li>
          <li>Invoice example Word document with customizable fields</li>
          <li>Invoice template in Excel with automatic calculations</li>
          <li>Invoice Excel example with formulas and formatting</li>
          <li>Blank invoice template for custom business needs</li>
          <li>Excel invoice template with tax calculations</li>
        </ul>
      </div>

      <div>
        <h2 className="font-serif text-xl mb-4">Free Invoice Templates</h2>
        <p className="text-gray-600 mb-6">
          Our free invoice templates work with Google Docs, Word, and Google Sheets. Each template includes automatic
          calculations for easy invoice pricing.
        </p>

        <h2 className="font-serif text-xl mb-4">Types of Invoices You Can Create</h2>
        <p className="text-gray-600">
          Make any type of invoice including commercial invoices, sales invoices, and service invoices. Our invoice
          generator works for any business type.
        </p>
      </div>

      <div className="hidden">
        <InvoicePreview
          businessInfo={businessInfo}
          customerInfo={customerInfo}
          invoiceDetails={{
            ...invoiceDetails,
            currency: getCurrencySymbol(),
          }}
          items={items}
          calculations={{
            subtotal: calculateSubtotal(),
            tax: calculateTax(),
            total: calculateTotal(),
          }}
        />
      </div>
    </div>
  )
}
