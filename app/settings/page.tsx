"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useBusiness } from "@/hooks/use-business"
import AppHeader from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { currentBusiness, updateCurrentBusiness, isLoading: businessLoading } = useBusiness()
  const [businessName, setBusinessName] = useState("")
  const [businessEmail, setBusinessEmail] = useState("")
  const [businessPhone, setBusinessPhone] = useState("")
  const [businessAddress, setBusinessAddress] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (currentBusiness) {
      setBusinessName(currentBusiness.name || "")
      setBusinessEmail(currentBusiness.email || "")
      setBusinessPhone(currentBusiness.phone || "")
      setBusinessAddress(currentBusiness.address || "")
    }
  }, [currentBusiness])

  const handleSaveBusinessSettings = async () => {
    try {
      setIsSaving(true)
      await updateCurrentBusiness({
        name: businessName,
        email: businessEmail,
        phone: businessPhone,
        address: businessAddress,
      })
      toast({
        title: "Settings saved",
        description: "Your business settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving business settings:", error)
      toast({
        title: "Error",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (authLoading || businessLoading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader />
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
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="business" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Update your business details. This information will appear on your invoices.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Business Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="contact@yourbusiness.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Phone</Label>
                  <Input
                    id="businessPhone"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Address</Label>
                  <Input
                    id="businessAddress"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="123 Business St, City, State, ZIP"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveBusinessSettings} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your account settings and preferences.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your application experience.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Preference settings coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
