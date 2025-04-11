"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import AppHeader from "@/components/app-header"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  ArrowLeft,
  FileText,
  Edit,
  Download,
  Plus,
  CreditCard,
  FileCheck,
  Settings,
  HelpCircle,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function InvoiceDocumentationPage() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const { t } = useLanguage()

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

  // Filter documentation sections based on search query
  const filterContent = (content: any[]) => {
    if (!searchQuery) return content

    return content.filter(
      (section) =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.content.some(
          (item: any) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    )
  }

  // Documentation content structure
  const documentationSections = [
    {
      id: "getting-started",
      title: "Getting Started with Invoices",
      icon: <FileText className="h-5 w-5" />,
      content: [
        {
          id: "invoice-overview",
          title: "What is an Invoice?",
          description:
            "An invoice is a commercial document issued by a seller to a buyer that indicates the products, quantities, and agreed prices for products or services the seller has provided the buyer. It serves as a request for payment and becomes a legal document once both parties agree to the terms.",
        },
        {
          id: "invoice-components",
          title: "Key Components of an Invoice",
          description:
            "Every professional invoice should include: your business details, client information, invoice number, issue and due dates, itemized list of products/services, pricing, payment terms, and total amount due including any applicable taxes or discounts.",
        },
        {
          id: "creating-first-invoice",
          title: "Creating Your First Invoice",
          description:
            "To create your first invoice, navigate to the Invoice Generator page, fill in your business details, add customer information, list the products or services provided with quantities and prices, set the tax rate if applicable, add any notes or payment terms, and generate the PDF.",
        },
      ],
    },
    {
      id: "invoice-management",
      title: "Invoice Management",
      icon: <Edit className="h-5 w-5" />,
      content: [
        {
          id: "creating-invoice",
          title: "Creating an Invoice",
          description:
            "To create a new invoice, click the 'Create Invoice' button on the Invoices page. Fill in all required fields including business details, customer information, invoice items, and payment terms. You can save the invoice as a draft or finalize it immediately.",
        },
        {
          id: "editing-invoice",
          title: "Editing an Invoice",
          description:
            "To edit an existing invoice, locate it in your invoice list and click the 'Edit' button. Make your changes to any field and save the updated invoice. Note that editing a sent invoice may require sending an updated version to your client.",
        },
        {
          id: "deleting-invoice",
          title: "Deleting an Invoice",
          description:
            "To delete an invoice, find it in your invoice list and click the 'Delete' button. You'll be asked to confirm this action. Note that deletion is permanent and cannot be undone, so consider changing the status to 'Cancelled' instead if you want to keep a record.",
        },
        {
          id: "invoice-statuses",
          title: "Invoice Statuses",
          description:
            "Invoices can have different statuses: Draft (not yet sent), Sent (delivered to client), Paid (payment received), Overdue (payment deadline passed), and Cancelled (no longer valid). You can update an invoice's status from the invoice details page.",
        },
      ],
    },
    {
      id: "invoice-customization",
      title: "Invoice Customization",
      icon: <Settings className="h-5 w-5" />,
      content: [
        {
          id: "templates",
          title: "Using Invoice Templates",
          description:
            "Our system offers multiple professional invoice templates. To select a template, go to the Template section when creating or editing an invoice. Each template has a unique design and layout to suit different business needs.",
        },
        {
          id: "custom-fields",
          title: "Adding Custom Fields",
          description:
            "You can add custom fields to your invoices to include additional information specific to your business or client. When creating or editing an invoice, look for the 'Custom Fields' section and add the fields you need.",
        },
        {
          id: "branding",
          title: "Branding Your Invoices",
          description:
            "Customize your invoices with your business branding by uploading your logo, selecting brand colors, and adding your business details. These settings can be configured in the Template Editor or Business Settings section.",
        },
        {
          id: "language-currency",
          title: "Language and Currency Settings",
          description:
            "You can set the language and currency for your invoices. The system supports multiple currencies with automatic conversion rates, and you can change these settings for each invoice individually.",
        },
      ],
    },
    {
      id: "advanced-features",
      title: "Advanced Features",
      icon: <Settings className="h-5 w-5" />,
      content: [
        {
          id: "recurring-invoices",
          title: "Setting Up Recurring Invoices",
          description:
            "Recurring invoices allow you to automatically generate and send invoices on a regular schedule. To set up a recurring invoice, create a normal invoice first, then use the 'Make Recurring' option to define the frequency, start date, and end conditions.",
        },
        {
          id: "payment-reminders",
          title: "Payment Reminders",
          description:
            "You can schedule automatic payment reminders to be sent to customers for outstanding invoices. Configure the timing and content of these reminders in the Reminder Settings section of an invoice or in your global settings.",
        },
        {
          id: "digital-signatures",
          title: "Adding Digital Signatures",
          description:
            "Digital signatures add a professional touch to your invoices and can help with legal compliance. Use the digital signature tool to create and add your signature to invoices before sending them to clients.",
        },
        {
          id: "multi-currency",
          title: "Working with Multiple Currencies",
          description:
            "The invoice generator supports multiple currencies with automatic conversion rates. You can create invoices in any supported currency and even convert between currencies if needed. Exchange rates are updated daily.",
        },
        {
          id: "tax-calculations",
          title: "Tax Calculations",
          description:
            "The system can automatically calculate taxes based on the tax rate you specify. You can set different tax rates for different items or apply a single tax rate to the entire invoice. Tax settings can be configured in the invoice creation process.",
        },
      ],
    },
    {
      id: "exporting-sharing",
      title: "Exporting and Sharing",
      icon: <Download className="h-5 w-5" />,
      content: [
        {
          id: "export-formats",
          title: "Export Formats",
          description:
            "You can export your invoices in multiple formats including PDF, Word (DOCX), and Excel (XLSX). Each format has its advantages: PDF for professional presentation, Word for further editing, and Excel for data manipulation.",
        },
        {
          id: "sending-invoices",
          title: "Sending Invoices to Clients",
          description:
            "After creating an invoice, you can send it directly to your client via email. The system allows you to customize the email message and attach the invoice in your preferred format. You can also generate a shareable link.",
        },
        {
          id: "batch-operations",
          title: "Batch Operations",
          description:
            "For efficiency, you can perform batch operations on multiple invoices at once, such as exporting, sending, or changing status. Select multiple invoices from your invoice list and use the batch actions menu.",
        },
      ],
    },
    {
      id: "integrations",
      title: "Integrations",
      icon: <CreditCard className="h-5 w-5" />,
      content: [
        {
          id: "payment-gateways",
          title: "Payment Gateway Integration",
          description:
            "Connect your preferred payment gateway to enable online payments directly from your invoices. Supported gateways include Stripe, PayPal, and Square. Once connected, customers can pay invoices online with credit cards or other payment methods.",
        },
        {
          id: "accounting-software",
          title: "Accounting Software Integration",
          description:
            "The invoice generator can integrate with popular accounting software to sync invoices, payments, and customer data. This eliminates double entry and ensures your financial records are always up to date.",
        },
        {
          id: "crm-integration",
          title: "CRM Integration",
          description:
            "Connect your Customer Relationship Management (CRM) system to automatically pull client information and push invoice data. This integration streamlines your workflow and ensures consistent data across systems.",
        },
      ],
    },
    {
      id: "analytics-reporting",
      title: "Analytics and Reporting",
      icon: <FileCheck className="h-5 w-5" />,
      content: [
        {
          id: "invoice-analytics",
          title: "Invoice Analytics",
          description:
            "The analytics dashboard provides insights into your invoicing activity, including total revenue, number of invoices, payment rates, and average payment time. Use these insights to track your business performance and identify trends.",
        },
        {
          id: "financial-reports",
          title: "Financial Reports",
          description:
            "Generate detailed financial reports based on your invoice data, including income reports, tax summaries, client statements, and aging reports. These reports can be exported for accounting purposes or business analysis.",
        },
        {
          id: "custom-reports",
          title: "Custom Reports",
          description:
            "Create custom reports to analyze specific aspects of your invoicing data. Filter by date range, customer, payment status, and other parameters to get the exact information you need for your business decisions.",
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: <HelpCircle className="h-5 w-5" />,
      content: [
        {
          id: "common-issues",
          title: "Common Issues",
          description:
            "This section addresses frequently encountered problems such as invoices not saving, PDF generation errors, email delivery issues, and payment processing problems. For each issue, we provide step-by-step troubleshooting guidance.",
        },
        {
          id: "error-messages",
          title: "Understanding Error Messages",
          description:
            "Learn about common error messages you might encounter while using the invoice system and what they mean. We provide explanations and solutions for each error to help you resolve issues quickly.",
        },
        {
          id: "contact-support",
          title: "Contacting Support",
          description:
            "If you can't resolve an issue using the troubleshooting guide, our support team is here to help. Contact us through the support form, email, or live chat, and provide details about the problem you're experiencing for faster resolution.",
        },
      ],
    },
  ]

  const filteredSections = filterContent(documentationSections)

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/documentation")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guide
          </Button>
          <h1 className="text-3xl font-bold">Invoice Documentation</h1>
        </div>

        <div className="mb-8">
          <p className="text-lg text-gray-700 mb-4">
            This comprehensive documentation provides detailed information about all invoice features, parameters, and
            functionality. Use the search or navigation to find specific information.
          </p>
          <div className="flex items-center space-x-2 max-w-md">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="sticky top-4">
              <Card>
                <CardHeader>
                  <CardTitle>Navigation</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    {documentationSections.map((section) => (
                      <Link
                        key={section.id}
                        href={`#${section.id}`}
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                        onClick={(e) => {
                          e.preventDefault()
                          document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
                        }}
                      >
                        <span className="mr-2">{section.icon}</span>
                        {section.title}
                      </Link>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <nav className="space-y-1">
                    <Link
                      href="/edit-invoice?type=invoice"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Invoice
                    </Link>
                    <Link
                      href="/invoices"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View All Invoices
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Invoice Settings
                    </Link>
                  </nav>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="md:col-span-3">
            {filteredSections.length > 0 ? (
              filteredSections.map((section) => (
                <section key={section.id} id={section.id} className="mb-12 scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-6 flex items-center">
                    <span className="mr-3">{section.icon}</span>
                    {section.title}
                  </h2>

                  <Accordion type="single" collapsible className="w-full">
                    {section.content.map((item) => (
                      <AccordionItem key={item.id} value={item.id}>
                        <AccordionTrigger className="text-lg font-medium">{item.title}</AccordionTrigger>
                        <AccordionContent>
                          <div className="prose max-w-none">
                            <p className="text-gray-700">{item.description}</p>

                            {/* Specific content for certain sections */}
                            {item.id === "invoice-statuses" && (
                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Invoice Status Lifecycle:</h4>
                                <ul className="list-disc pl-5 space-y-2">
                                  <li>
                                    <span className="font-medium">Draft</span> - Initial state when creating an invoice,
                                    not yet sent to the client
                                  </li>
                                  <li>
                                    <span className="font-medium">Sent</span> - Invoice has been delivered to the client
                                    and awaiting payment
                                  </li>
                                  <li>
                                    <span className="font-medium">Paid</span> - Client has completed payment for the
                                    invoice
                                  </li>
                                  <li>
                                    <span className="font-medium">Overdue</span> - Payment deadline has passed without
                                    receiving payment
                                  </li>
                                  <li>
                                    <span className="font-medium">Cancelled</span> - Invoice has been cancelled and is
                                    no longer valid
                                  </li>
                                </ul>
                              </div>
                            )}

                            {item.id === "creating-invoice" && (
                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Required Fields:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>
                                    <span className="font-medium">Invoice Number</span> - Unique identifier for the
                                    invoice
                                  </li>
                                  <li>
                                    <span className="font-medium">Issue Date</span> - When the invoice was created
                                  </li>
                                  <li>
                                    <span className="font-medium">Due Date</span> - When payment is expected
                                  </li>
                                  <li>
                                    <span className="font-medium">Business Information</span> - Your business details
                                  </li>
                                  <li>
                                    <span className="font-medium">Customer Information</span> - Client details
                                  </li>
                                  <li>
                                    <span className="font-medium">Line Items</span> - Products or services provided
                                  </li>
                                </ul>

                                <h4 className="font-medium mt-4 mb-2">Optional Fields:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>
                                    <span className="font-medium">Tax Rate</span> - Percentage of tax to apply
                                  </li>
                                  <li>
                                    <span className="font-medium">Notes</span> - Additional information or terms
                                  </li>
                                  <li>
                                    <span className="font-medium">Logo</span> - Your business logo
                                  </li>
                                  <li>
                                    <span className="font-medium">Template</span> - Invoice design template
                                  </li>
                                  <li>
                                    <span className="font-medium">Digital Signature</span> - Your signature
                                  </li>
                                </ul>
                              </div>
                            )}

                            {item.id === "recurring-invoices" && (
                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Recurring Invoice Parameters:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>
                                    <span className="font-medium">Frequency</span> - How often the invoice should be
                                    generated (weekly, monthly, quarterly, yearly)
                                  </li>
                                  <li>
                                    <span className="font-medium">Start Date</span> - When the recurring schedule should
                                    begin
                                  </li>
                                  <li>
                                    <span className="font-medium">End Conditions</span> - When to stop (after X
                                    occurrences, on specific date, or until cancelled)
                                  </li>
                                  <li>
                                    <span className="font-medium">Delivery Method</span> - How the recurring invoices
                                    should be sent to the client
                                  </li>
                                </ul>
                              </div>
                            )}

                            {item.id === "payment-reminders" && (
                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Reminder Schedule Options:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>
                                    <span className="font-medium">Before Due Date</span> - Send reminder X days before
                                    payment is due
                                  </li>
                                  <li>
                                    <span className="font-medium">On Due Date</span> - Send reminder on the day payment
                                    is due
                                  </li>
                                  <li>
                                    <span className="font-medium">After Due Date</span> - Send reminder X days after
                                    payment is due
                                  </li>
                                  <li>
                                    <span className="font-medium">Custom Schedule</span> - Define multiple reminders at
                                    different intervals
                                  </li>
                                </ul>
                              </div>
                            )}

                            {item.id === "export-formats" && (
                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Available Export Formats:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                  <li>
                                    <span className="font-medium">PDF</span> - Standard format for professional invoices
                                  </li>
                                  <li>
                                    <span className="font-medium">DOCX</span> - Microsoft Word format for editing
                                  </li>
                                  <li>
                                    <span className="font-medium">XLSX</span> - Microsoft Excel format for data
                                    manipulation
                                  </li>
                                  <li>
                                    <span className="font-medium">CSV</span> - Simple text format for data import/export
                                  </li>
                                  <li>
                                    <span className="font-medium">HTML</span> - Web format for online viewing
                                  </li>
                                </ul>
                              </div>
                            )}

                            {item.id === "common-issues" && (
                              <div className="mt-4">
                                <h4 className="font-medium mb-2">Common Issues and Solutions:</h4>

                                <div className="mb-3">
                                  <p className="font-medium">Invoice not saving</p>
                                  <ul className="list-disc pl-5">
                                    <li>Check your internet connection</li>
                                    <li>Ensure all required fields are completed</li>
                                    <li>Try refreshing the page and attempting again</li>
                                    <li>Check if you have reached any account limits</li>
                                  </ul>
                                </div>

                                <div className="mb-3">
                                  <p className="font-medium">PDF generation errors</p>
                                  <ul className="list-disc pl-5">
                                    <li>Ensure all invoice data is valid</li>
                                    <li>Check if your logo file is in a supported format</li>
                                    <li>Try using a different template</li>
                                    <li>Reduce the complexity of invoice items or descriptions</li>
                                  </ul>
                                </div>

                                <div className="mb-3">
                                  <p className="font-medium">Email delivery issues</p>
                                  <ul className="list-disc pl-5">
                                    <li>Verify the client email address is correct</li>
                                    <li>Check if the email contains any spam triggers</li>
                                    <li>Ensure the attachment size is not too large</li>
                                    <li>Try sending a test email to yourself first</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))
            ) : (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-gray-500 mb-4">
                  No documentation sections match your search query. Try different keywords or browse all sections.
                </p>
                <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Need More Help?</h2>
          <p className="mb-4">
            If you couldn't find the information you need in this documentation, please check our additional resources:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Watch step-by-step video guides on how to use all invoice features.
                </p>
                <Button variant="outline" className="mt-4 w-full">
                  Watch Tutorials
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Browse frequently asked questions about invoice functionality.</p>
                <Button variant="outline" className="mt-4 w-full">
                  View FAQ
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Get in touch with our support team for personalized assistance.</p>
                <Button variant="outline" className="mt-4 w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
