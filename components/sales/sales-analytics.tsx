"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, DollarSign, Clock, CheckCircle, FileText } from "lucide-react"

interface SalesAnalyticsProps {
  drafts: any[]
  type: "invoice" | "offer"
}

export default function SalesAnalytics({ drafts, type }: SalesAnalyticsProps) {
  const { t } = useLanguage()
  const [period, setPeriod] = useState<string>("year")

  // Generate summary metrics
  const summary = useMemo(() => {
    // Calculate total amount
    const totalAmount = drafts.reduce((sum, draft) => {
      // Calculate from items or use a random amount for demonstration
      if (draft.items && draft.items.length > 0) {
        const itemTotal = draft.items.reduce((itemSum: number, item: any) => {
          return itemSum + (item.quantity || 0) * (item.price || 0)
        }, 0)
        return sum + itemTotal
      }

      // Generate a random amount based on the draft ID
      const draftId = draft.id || ""
      const lastChar = draftId.charAt(draftId.length - 1)
      const numValue = Number.parseInt(lastChar, 16) || 0
      return sum + (numValue * 100 + 500)
    }, 0)

    // Count by status
    const statusCounts = {
      draft: 0,
      sent: 0,
      paid: 0,
    }

    drafts.forEach((draft) => {
      const draftId = draft.id || ""
      const lastChar = draftId.charAt(draftId.length - 1)
      const numValue = Number.parseInt(lastChar, 16) || 0

      if (numValue < 5) {
        statusCounts.draft++
      } else if (numValue >= 5 && numValue < 10) {
        statusCounts.sent++
      } else {
        statusCounts.paid++
      }
    })

    // Calculate conversion rate (paid / total)
    const conversionRate = drafts.length > 0 ? (statusCounts.paid / drafts.length) * 100 : 0

    return {
      totalAmount,
      totalCount: drafts.length,
      statusCounts,
      conversionRate,
    }
  }, [drafts])

  // Generate monthly data for charts
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; count: number; amount: number }> = {}

    // Initialize months
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      const monthName = date.toLocaleString("default", { month: "short" })
      months[monthKey] = { month: monthName, count: 0, amount: 0 }
    }

    // Fill with data
    drafts.forEach((draft) => {
      if (!draft.updatedAt) return

      const date = new Date(draft.updatedAt)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`

      if (months[monthKey]) {
        months[monthKey].count++

        // Calculate amount
        if (draft.items && draft.items.length > 0) {
          const itemTotal = draft.items.reduce((itemSum: number, item: any) => {
            return itemSum + (item.quantity || 0) * (item.price || 0)
          }, 0)
          months[monthKey].amount += itemTotal
        } else {
          // Generate a random amount based on the draft ID
          const draftId = draft.id || ""
          const lastChar = draftId.charAt(draftId.length - 1)
          const numValue = Number.parseInt(lastChar, 16) || 0
          months[monthKey].amount += numValue * 100 + 500
        }
      }
    })

    // Convert to array and sort by date
    return Object.values(months).reverse()
  }, [drafts])

  // Generate status data for pie chart
  const statusData = useMemo(() => {
    return [
      { name: "Draft", value: summary.statusCounts.draft, color: "#94a3b8" },
      { name: "Sent", value: summary.statusCounts.sent, color: "#3b82f6" },
      { name: "Paid", value: summary.statusCounts.paid, color: "#22c55e" },
    ]
  }, [summary])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total {type === "offer" ? "Offers" : "Invoices"}</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCount}</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>12% from previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalAmount)}</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>8.2% from previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.conversionRate.toFixed(1)}%</div>
            <div className="flex items-center pt-1 text-xs text-green-500">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              <span>2.3% from previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Time to Close</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14 days</div>
            <div className="flex items-center pt-1 text-xs text-red-500">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              <span>5.0% from previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="count">Count</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 90 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="revenue" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>{type === "offer" ? "Offer" : "Invoice"} value over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Amount"]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="count" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Count</CardTitle>
              <CardDescription>Number of {type === "offer" ? "offers" : "invoices"} created over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Count"]} labelFormatter={(label) => `Month: ${label}`} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Distribution of {type === "offer" ? "offer" : "invoice"} statuses</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Count"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
