"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppHeader from "@/components/app-header"
import { useAuth } from "@/hooks/use-auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ApiReferencePage() {
  const { user, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/documentation/invoice-documentation")} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documentation
          </Button>
          <h1 className="text-3xl font-bold">Invoice API Reference</h1>
        </div>

        <p className="text-lg text-gray-700 mb-8">
          This API reference provides detailed information about the invoice service endpoints, parameters, and response
          formats for developers integrating with our invoice system.
        </p>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="models">Data Models</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Overview</CardTitle>
                <CardDescription>
                  The Invoice API allows you to programmatically create, read, update, and delete invoices in your
                  account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Base URL</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>https://api.example.com/v1</code>
                  </pre>

                  <h3>Authentication</h3>
                  <p>
                    All API requests require authentication using an API key. You can generate an API key in your
                    account settings. Include the API key in the Authorization header of your requests:
                  </p>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>Authorization: Bearer YOUR_API_KEY</code>
                  </pre>

                  <h3>Rate Limits</h3>
                  <p>
                    The API has a rate limit of 100 requests per minute per API key. If you exceed this limit, you will
                    receive a 429 Too Many Requests response.
                  </p>

                  <h3>Response Format</h3>
                  <p>
                    All API responses are returned in JSON format. Successful responses have a 2xx status code, while
                    error responses have a 4xx or 5xx status code and include an error message.
                  </p>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>{`// Success response
{
  "data": { ... },
  "meta": { ... }
}

// Error response
{
  "error": {
    "code": "invalid_request",
    "message": "The request was invalid"
  }
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>Available endpoints for interacting with invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>List Invoices</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>GET /invoices</code>
                  </pre>
                  <p>Retrieves a list of invoices for the authenticated user.</p>

                  <h4>Query Parameters</h4>
                  <ul>
                    <li>
                      <code>page</code> (optional) - Page number for pagination (default: 1)
                    </li>
                    <li>
                      <code>limit</code> (optional) - Number of invoices per page (default: 20, max: 100)
                    </li>
                    <li>
                      <code>status</code> (optional) - Filter by invoice status (draft, sent, paid, overdue, cancelled)
                    </li>
                    <li>
                      <code>client_id</code> (optional) - Filter by client ID
                    </li>
                    <li>
                      <code>from_date</code> (optional) - Filter by issue date (format: YYYY-MM-DD)
                    </li>
                    <li>
                      <code>to_date</code> (optional) - Filter by issue date (format: YYYY-MM-DD)
                    </li>
                  </ul>

                  <h4>Response</h4>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>{`{
  "data": [
    {
      "id": "inv_123456",
      "invoice_number": "INV-001",
      "client_id": "client_123",
      "issue_date": "2023-01-15",
      "due_date": "2023-02-15",
      "status": "sent",
      "currency": "USD",
      "total_amount": 150.00,
      "created_at": "2023-01-15T10:30:00Z",
      "updated_at": "2023-01-15T10:30:00Z"
    },
    // More invoices...
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}`}</code>
                  </pre>

                  <h3>Get Invoice</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>GET /invoices/:id</code>
                  </pre>
                  <p>Retrieves a specific invoice by ID.</p>

                  <h4>Path Parameters</h4>
                  <ul>
                    <li>
                      <code>id</code> (required) - The ID of the invoice to retrieve
                    </li>
                  </ul>

                  <h4>Response</h4>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>{`{
  "data": {
    "id": "inv_123456",
    "invoice_number": "INV-001",
    "client_id": "client_123",
    "client": {
      "id": "client_123",
      "name": "Acme Inc.",
      "email": "billing@acme.com",
      "address": "123 Main St, City, Country"
    },
    "issue_date": "2023-01-15",
    "due_date": "2023-02-15",
    "status": "sent",
    "currency": "USD",
    "tax_rate": 10,
    "items": [
      {
        "id": "item_123",
        "description": "Web Development Services",
        "quantity": 10,
        "price": 15.00
      }
    ],
    "subtotal": 150.00,
    "tax": 15.00,
    "total_amount": 165.00,
    "notes": "Payment due within 30 days",
    "created_at": "2023-01-15T10:30:00Z",
    "updated_at": "2023-01-15T10:30:00Z"
  }
}`}</code>
                  </pre>

                  <h3>Create Invoice</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>POST /invoices</code>
                  </pre>
                  <p>Creates a new invoice.</p>

                  <h4>Request Body</h4>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>{`{
  "client_id": "client_123",
  "invoice_number": "INV-001",
  "issue_date": "2023-01-15",
  "due_date": "2023-02-15",
  "currency": "USD",
  "tax_rate": 10,
  "notes": "Payment due within 30 days",
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 10,
      "price": 15.00
    }
  ]
}`}</code>
                  </pre>

                  <h4>Response</h4>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>{`{
  "data": {
    "id": "inv_123456",
    "invoice_number": "INV-001",
    "client_id": "client_123",
    "issue_date": "2023-01-15",
    "due_date": "2023-02-15",
    "status": "draft",
    "currency": "USD",
    "tax_rate": 10,
    "items": [
      {
        "id": "item_123",
        "description": "Web Development Services",
        "quantity": 10,
        "price": 15.00
      }
    ],
    "subtotal": 150.00,
    "tax": 15.00,
    "total_amount": 165.00,
    "notes": "Payment due within 30 days",
    "created_at": "2023-01-15T10:30:00Z",
    "updated_at": "2023-01-15T10:30:00Z"
  }
}`}</code>
                  </pre>

                  <h3>Update Invoice</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>PUT /invoices/:id</code>
                  </pre>
                  <p>Updates an existing invoice.</p>

                  <h4>Path Parameters</h4>
                  <ul>
                    <li>
                      <code>id</code> (required) - The ID of the invoice to update
                    </li>
                  </ul>

                  <h4>Request Body</h4>
                  <p>Include only the fields you want to update.</p>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>{`{
  "due_date": "2023-03-15",
  "notes": "Updated payment terms",
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 12,
      "price": 15.00
    }
  ]
}`}</code>
                  </pre>

                  <h3>Delete Invoice</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>DELETE /invoices/:id</code>
                  </pre>
                  <p>Deletes an invoice.</p>

                  <h4>Path Parameters</h4>
                  <ul>
                    <li>
                      <code>id</code> (required) - The ID of the invoice to delete
                    </li>
                  </ul>

                  <h4>Response</h4>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>{`{
  "data": {
    "deleted": true,
    "id": "inv_123456"
  }
}`}</code>
                  </pre>

                  <h3>Send Invoice</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>POST /invoices/:id/send</code>
                  </pre>
                  <p>Sends an invoice to the client via email.</p>

                  <h4>Path Parameters</h4>
                  <ul>
                    <li>
                      <code>id</code> (required) - The ID of the invoice to send
                    </li>
                  </ul>

                  <h4>Request Body</h4>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>{`{
  "email": "client@example.com",
  "subject": "Invoice INV-001 from Your Business",
  "message": "Please find attached your invoice. Payment is due by February 15, 2023."
}`}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Models</CardTitle>
                <CardDescription>Detailed information about the data structures used in the API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>Invoice Object</h3>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Field</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>id</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">Unique identifier for the invoice</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>invoice_number</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">Human-readable invoice number</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>client_id</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">ID of the client this invoice is for</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>issue_date</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string (YYYY-MM-DD)</td>
                        <td className="border border-gray-300 px-4 py-2">Date the invoice was issued</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>due_date</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string (YYYY-MM-DD)</td>
                        <td className="border border-gray-300 px-4 py-2">Date the payment is due</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>status</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">
                          Status of the invoice (draft, sent, paid, overdue, cancelled)
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>currency</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">
                          Three-letter currency code (e.g., USD, EUR)
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>tax_rate</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">number</td>
                        <td className="border border-gray-300 px-4 py-2">Tax rate percentage (e.g., 10 for 10%)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>items</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">array</td>
                        <td className="border border-gray-300 px-4 py-2">Array of invoice items</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>subtotal</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">number</td>
                        <td className="border border-gray-300 px-4 py-2">Sum of all items before tax</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>tax</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">number</td>
                        <td className="border border-gray-300 px-4 py-2">Tax amount</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>total_amount</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">number</td>
                        <td className="border border-gray-300 px-4 py-2">Total amount including tax</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>notes</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">Additional notes or payment terms</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>created_at</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string (ISO 8601)</td>
                        <td className="border border-gray-300 px-4 py-2">Timestamp when the invoice was created</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>updated_at</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string (ISO 8601)</td>
                        <td className="border border-gray-300 px-4 py-2">
                          Timestamp when the invoice was last updated
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <h3>Invoice Item Object</h3>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Field</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>id</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">Unique identifier for the item</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>description</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">Description of the product or service</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>quantity</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">number</td>
                        <td className="border border-gray-300 px-4 py-2">Quantity of the item</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>price</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">number</td>
                        <td className="border border-gray-300 px-4 py-2">Unit price of the item</td>
                      </tr>
                    </tbody>
                  </table>

                  <h3>Error Object</h3>
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 px-4 py-2 text-left">Field</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>error.code</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">Error code</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-4 py-2">
                          <code>error.message</code>
                        </td>
                        <td className="border border-gray-300 px-4 py-2">string</td>
                        <td className="border border-gray-300 px-4 py-2">Human-readable error message</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="authentication" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>How to authenticate with the Invoice API</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h3>API Keys</h3>
                  <p>
                    The Invoice API uses API keys for authentication. Each API key is associated with a specific user
                    account and has permissions based on the user's role.
                  </p>

                  <h4>Generating an API Key</h4>
                  <ol>
                    <li>Log in to your account</li>
                    <li>Navigate to Settings &gt; API Keys</li>
                    <li>Click "Generate New API Key"</li>
                    <li>Give your API key a name (e.g., "Development", "Production")</li>
                    <li>Select the permissions you want to grant to this API key</li>
                    <li>Click "Generate"</li>
                  </ol>
                  <p>
                    <strong>Important:</strong> Your API key will only be displayed once. Make sure to copy it and store
                    it securely.
                  </p>

                  <h4>Using Your API Key</h4>
                  <p>Include your API key in the Authorization header of your HTTP requests:</p>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                    <code>Authorization: Bearer YOUR_API_KEY</code>
                  </pre>

                  <h4>API Key Security</h4>
                  <ul>
                    <li>Keep your API key secure and never share it publicly</li>
                    <li>Do not include your API key in client-side code</li>
                    <li>Rotate your API keys periodically</li>
                    <li>
                      If you suspect your API key has been compromised, revoke it immediately and generate a new one
                    </li>
                  </ul>

                  <h3>OAuth 2.0 (Coming Soon)</h3>
                  <p>
                    We are working on implementing OAuth 2.0 authentication for the Invoice API. This will allow you to:
                  </p>
                  <ul>
                    <li>Authenticate users without storing their credentials</li>
                    <li>Request specific permissions from users</li>
                    <li>Integrate with third-party applications securely</li>
                  </ul>
                  <p>Stay tuned for updates on OAuth 2.0 support.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Need Help with Integration?</h2>
          <p className="mb-4">
            If you need assistance with API integration or have technical questions, our developer support team is here
            to help.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Developer Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Contact our developer support team for technical assistance with API integration.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Developer Support
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sample Code</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Download sample code and SDKs for various programming languages.
                </p>
                <Button variant="outline" className="w-full">
                  View Code Samples
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
