"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, AlertCircle } from "lucide-react"

interface PaymentGateway {
  id: string
  name: string
  logo: string
  description: string
  connected: boolean
}

const availableGateways: PaymentGateway[] = [
  {
    id: "stripe",
    name: "Stripe",
    logo: "/placeholder.svg?height=40&width=80",
    description: "Accept credit cards, Apple Pay, Google Pay, and more",
    connected: false,
  },
  {
    id: "paypal",
    name: "PayPal",
    logo: "/placeholder.svg?height=40&width=80",
    description: "Let customers pay with PayPal or credit cards",
    connected: false,
  },
  {
    id: "square",
    name: "Square",
    logo: "/placeholder.svg?height=40&width=80",
    description: "Process payments online or in person",
    connected: false,
  },
]

export default function PaymentGatewaySetup() {
  const [gateways, setGateways] = useState<PaymentGateway[]>(availableGateways)
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [connecting, setConnecting] = useState(false)

  const handleConnect = () => {
    if (!selectedGateway || !apiKey) return

    setConnecting(true)

    // Simulate API connection
    setTimeout(() => {
      setGateways(
        gateways.map((gateway) => (gateway.id === selectedGateway ? { ...gateway, connected: true } : gateway)),
      )
      setConnecting(false)
      setApiKey("")
      setSelectedGateway(null)
    }, 1500)
  }

  const handleDisconnect = (gatewayId: string) => {
    setGateways(gateways.map((gateway) => (gateway.id === gatewayId ? { ...gateway, connected: false } : gateway)))
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl">Payment Gateways</h2>

      <div className="space-y-4">
        {gateways.map((gateway) => (
          <Card key={gateway.id} className={gateway.connected ? "border-green-200 bg-green-50" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <img src={gateway.logo || "/placeholder.svg"} alt={gateway.name} className="h-8" />
                  <CardTitle className="text-lg">{gateway.name}</CardTitle>
                </div>
                {gateway.connected && (
                  <div className="flex items-center text-green-600 text-sm font-medium">
                    <Check className="h-4 w-4 mr-1" />
                    Connected
                  </div>
                )}
              </div>
              <CardDescription>{gateway.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {gateway.connected ? (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">Your account is connected and ready to accept payments</div>
                  <Button variant="outline" size="sm" onClick={() => handleDisconnect(gateway.id)}>
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setSelectedGateway(gateway.id)}>
                  Connect
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedGateway && (
        <Card>
          <CardHeader>
            <CardTitle>Connect {gateways.find((g) => g.id === selectedGateway)?.name}</CardTitle>
            <CardDescription>Enter your API credentials to connect your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                type="password"
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleConnect} disabled={!apiKey || connecting}>
                {connecting ? "Connecting..." : "Connect Account"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedGateway(null)
                  setApiKey("")
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
        <div>
          <h3 className="font-medium text-blue-800">Accept payments directly on your invoices</h3>
          <p className="text-sm text-blue-600 mt-1">
            Connect a payment gateway to allow your customers to pay invoices online with credit cards or other payment
            methods.
          </p>
        </div>
      </div>
    </div>
  )
}
