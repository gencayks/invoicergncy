"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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
import { ArrowUpRight, ArrowDownRight, DollarSign, Clock, CheckCircle, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useAnalytics, type AnalyticsPeriod } from "@/hooks/use-analytics"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("year")
  const { analytics, isLoading, error } = useAnalytics(period)

  const handlePeriodChange = (value: string) => {
    setPeriod(value as AnalyticsPeriod)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Determine if a change is positive or negative for display
  const getChangeClass = (value: number) => {
    return value >= 0 ? "text-green-500" : "text-red-500"
  }

  const getChangeIcon = (value: number) => {
    return value >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-serif font-bold">Invoice Analytics</h1>
        <Card className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading analytics data</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif font-bold">Invoice Analytics</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Period:</span>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 3 months</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mb-2" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(analytics?.totalAmount || 0)}</div>
                <div className={`flex items-center pt-1 text-xs ${getChangeClass(analytics?.revenueChange || 0)}`}>
                  {getChangeIcon(analytics?.revenueChange || 0)}
                  <span>{Math.abs(analytics?.revenueChange || 0).toFixed(1)}% from previous period</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Invoices Created</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-gray-500"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <>
                <div className="text-2xl font-bold">{analytics?.totalInvoices || 0}</div>
                <div className={`flex items-center pt-1 text-xs ${getChangeClass(analytics?.invoiceChange || 0)}`}>
                  {getChangeIcon(analytics?.invoiceChange || 0)}
                  <span>{Math.abs(analytics?.invoiceChange || 0).toFixed(1)}% from previous period</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mb-2" />
            ) : (
              <>
                <div className="text-2xl font-bold">{Math.round(analytics?.paymentRate || 0)}%</div>
                <div className={`flex items-center pt-1 text-xs ${getChangeClass(analytics?.paymentRateChange || 0)}`}>
                  {getChangeIcon(analytics?.paymentRateChange || 0)}
                  <span>{Math.abs(analytics?.paymentRateChange || 0).toFixed(1)}% from previous period</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Time to Pay</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mb-2" />
            ) : (
              <>
                <div className="text-2xl font-bold">{Math.round(analytics?.averageTimeToPayment || 0)} days</div>
                <div
                  className={`flex items-center pt-1 text-xs ${getChangeClass(-1 * (analytics?.timeToPaymentChange || 0))}`}
                >
                  {getChangeIcon(-1 * (analytics?.timeToPaymentChange || 0))}
                  <span>{Math.abs(analytics?.timeToPaymentChange || 0).toFixed(1)}% from previous period</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="status">Payment Status</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>Your invoice revenue over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <LoadingSpinner size="lg" className="h-full" />
              ) : (
                <ChartContainer
                  config={{
                    amount: {
                      label: "Revenue",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.monthlyData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Trends</CardTitle>
              <CardDescription>Number of invoices created vs. paid</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <LoadingSpinner size="lg" className="h-full" />
              ) : (
                <ChartContainer
                  config={{
                    invoices: {
                      label: "Created",
                      color: "hsl(var(--chart-1))",
                    },
                    paid: {
                      label: "Paid",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.monthlyData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="invoices" stroke="var(--color-invoices)" strokeWidth={2} />
                      <Line type="monotone" dataKey="paid" stroke="var(--color-paid)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Status</CardTitle>
              <CardDescription>Distribution of invoice payment statuses</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex justify-center">
              {isLoading ? (
                <LoadingSpinner size="lg" className="h-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.statusCounts || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics?.statusCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
