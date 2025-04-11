"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AppHeader from "@/components/app-header"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { FileText, BookOpen, Video, HelpCircle } from "lucide-react"

export default function DocumentationPage() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Invoice Guide</h1>
          <Link href="/documentation/invoice-documentation">
            <Button variant="outline" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Comprehensive Documentation
            </Button>
          </Link>
        </div>

        <div className="prose max-w-none">
          <h2>What is an Invoice?</h2>
          <p>
            An invoice is a commercial document issued by a seller to a buyer that indicates the products, quantities,
            and agreed prices for products or services the seller has provided the buyer. An invoice indicates the sale
            transaction between the seller and the buyer.
          </p>

          <h2>Key Components of an Invoice</h2>
          <ul>
            <li>
              <strong>Header:</strong> Your business name, logo, and contact information
            </li>
            <li>
              <strong>Client Information:</strong> Your client's name, address, and contact details
            </li>
            <li>
              <strong>Invoice Number:</strong> A unique identifier for the invoice
            </li>
            <li>
              <strong>Issue Date:</strong> When the invoice was created
            </li>
            <li>
              <strong>Due Date:</strong> When payment is expected
            </li>
            <li>
              <strong>Line Items:</strong> Description of products/services, quantities, and prices
            </li>
            <li>
              <strong>Subtotal:</strong> Sum of all line items before tax
            </li>
            <li>
              <strong>Tax:</strong> Applicable taxes
            </li>
            <li>
              <strong>Total:</strong> Final amount due
            </li>
            <li>
              <strong>Payment Terms:</strong> How and when payment should be made
            </li>
          </ul>

          <h2>How to Create an Invoice with Our Tool</h2>
          <ol>
            <li>Log in to your account</li>
            <li>Click on "Create New Invoice"</li>
            <li>Select a client or add a new one</li>
            <li>Choose an invoice template</li>
            <li>Add line items for products or services</li>
            <li>Set the tax rate if applicable</li>
            <li>Add any notes or payment terms</li>
            <li>Preview your invoice</li>
            <li>Generate a PDF and send it to your client</li>
          </ol>

          <h2>Best Practices for Invoicing</h2>
          <ul>
            <li>Send invoices promptly after delivering goods or services</li>
            <li>Use clear, professional language</li>
            <li>Include detailed descriptions of products or services</li>
            <li>Set reasonable payment terms</li>
            <li>Follow up on overdue invoices</li>
            <li>Keep records of all invoices for accounting purposes</li>
          </ul>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-700">Need more detailed information?</h3>
            <p className="mb-4">
              For comprehensive documentation on all invoice features, parameters, and troubleshooting, visit our
              detailed documentation page.
            </p>
            <Link
              href="/documentation/invoice-documentation"
              className="text-blue-600 font-medium hover:underline flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              View Comprehensive Documentation →
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <FileText className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invoice Templates</h3>
            <p className="text-gray-600 mb-4">
              Browse our collection of professional invoice templates designed for various business needs.
            </p>
            <Link href="/templates">
              <Button variant="outline" className="w-full">
                View Templates
              </Button>
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <Video className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
            <p className="text-gray-600 mb-4">
              Watch step-by-step video guides on how to create and manage invoices effectively.
            </p>
            <Button variant="outline" className="w-full">
              Watch Tutorials
            </Button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <HelpCircle className="h-8 w-8 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">FAQ</h3>
            <p className="text-gray-600 mb-4">
              Find answers to frequently asked questions about invoicing and our platform.
            </p>
            <Button variant="outline" className="w-full">
              View FAQ
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
