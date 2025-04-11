"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DocSection {
  id: string
  title: string
  content: string
}

interface DocCategory {
  id: string
  title: string
  sections: DocSection[]
}

const documentation: DocCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    sections: [
      {
        id: "introduction",
        title: "Introduction",
        content:
          "The gncy Invoice Generator is a powerful tool designed to help businesses create professional invoices quickly and easily. This guide will help you get started with the basic features and functionality.",
      },
      {
        id: "creating-first-invoice",
        title: "Creating Your First Invoice",
        content:
          "To create your first invoice, start by filling in your business details, customer information, and invoice items. You can add as many items as needed, and the system will automatically calculate totals. Once complete, you can preview and download your invoice as a PDF.",
      },
      {
        id: "templates",
        title: "Using Templates",
        content:
          "The invoice generator offers multiple templates to choose from. Each template has a unique design and layout to suit different business needs. You can select a template from the template selector and customize it to match your brand.",
      },
    ],
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    sections: [
      {
        id: "recurring-invoices",
        title: "Setting Up Recurring Invoices",
        content:
          "Recurring invoices allow you to automatically generate and send invoices on a regular schedule. To set up a recurring invoice, create a normal invoice first, then use the recurring invoice setup to define the frequency, start date, and other parameters.",
      },
      {
        id: "payment-reminders",
        title: "Payment Reminders",
        content:
          "You can schedule automatic payment reminders to be sent to customers for outstanding invoices. Configure the timing and content of these reminders to ensure timely payments without manual follow-up.",
      },
      {
        id: "digital-signatures",
        title: "Adding Digital Signatures",
        content:
          "Digital signatures add a professional touch to your invoices and can help with legal compliance. Use the digital signature tool to create and add your signature to invoices before sending them to clients.",
      },
      {
        id: "multi-currency",
        title: "Working with Multiple Currencies",
        content:
          "The invoice generator supports multiple currencies with automatic conversion rates. You can create invoices in any supported currency and even convert between currencies if needed.",
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    sections: [
      {
        id: "payment-gateways",
        title: "Payment Gateway Integration",
        content:
          "Connect your preferred payment gateway to enable online payments directly from your invoices. Supported gateways include Stripe, PayPal, and Square. Once connected, customers can pay invoices online with credit cards or other payment methods.",
      },
      {
        id: "accounting-software",
        title: "Accounting Software Integration",
        content:
          "The invoice generator can integrate with popular accounting software to sync invoices, payments, and customer data. This eliminates double entry and ensures your financial records are always up to date.",
      },
    ],
  },
  {
    id: "user-management",
    title: "User Management",
    sections: [
      {
        id: "roles-permissions",
        title: "Roles and Permissions",
        content:
          "The system supports different user roles with varying levels of access and permissions. Understand the different roles (Owner, Admin, Member, Viewer) and their capabilities to properly manage your team's access to the invoice generator.",
      },
      {
        id: "adding-users",
        title: "Adding Team Members",
        content:
          "You can invite team members to collaborate on invoices by adding them as users with appropriate roles. This allows for delegation of invoice creation and management tasks while maintaining control over sensitive information.",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics and Reporting",
    sections: [
      {
        id: "dashboard-overview",
        title: "Dashboard Overview",
        content:
          "The analytics dashboard provides a visual overview of your invoicing activity, including total revenue, number of invoices, payment rates, and more. Use these insights to track your business performance and identify trends.",
      },
      {
        id: "custom-reports",
        title: "Creating Custom Reports",
        content:
          "Beyond the standard dashboard, you can create custom reports to analyze specific aspects of your invoicing data. Filter by date range, customer, payment status, and other parameters to get the exact information you need.",
      },
    ],
  },
]

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDocs = searchQuery
    ? documentation
        .map((category) => ({
          ...category,
          sections: category.sections.filter(
            (section) =>
              section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              section.content.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((category) => category.sections.length > 0)
    : documentation

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      <Tabs defaultValue="getting-started">
        <TabsList className="grid grid-cols-5 w-full">
          {documentation.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {filteredDocs.map((category) => (
          <TabsContent key={category.id} value={category.id} className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>Learn how to use {category.title.toLowerCase()} features effectively</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.sections.map((section) => (
                    <AccordionItem key={section.id} value={section.id}>
                      <AccordionTrigger>{section.title}</AccordionTrigger>
                      <AccordionContent>
                        <div className="prose max-w-none">
                          <p>{section.content}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
