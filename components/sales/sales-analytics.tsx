"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Chart } from "@/components/ui/chart"

export function SalesAnalytics() {
  const [timeRange, setTimeRange] = useState("30d")

  // Sample data - in a real app, this would come from your API
  const salesData = {
    "7d": {
      revenue: 12580,
      invoices: 24,
      growth: 12.5,
      chartData: [1200, 1800, 1500, 2000, 1700, 1900, 2500],
    },
    "30d": {
      revenue: 42750,
      invoices: 87,
      growth: 8.2,
      chartData: [3500, 4200, 3800, 5000, 4500, 4800, 5200, 4900, 5500, 6000, 5800, 6200],
    },
    "90d": {
      revenue: 128400,
      invoices: 245,
      growth: 15.8,
      chartData: [10000, 12000, 11500, 13000, 12500, 14000, 15000, 14500, 16000, 17000, 16500, 18000],
    },
  }

  const currentData = salesData[timeRange as keyof typeof salesData]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sales Performance</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentData.revenue.toLocaleString()}</div>
            <Badge variant={currentData.growth > 0 ? "default" : "destructive"} className="mt-2">
              {currentData.growth > 0 ? "+" : ""}
              {currentData.growth}% from previous period
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Invoices Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.invoices}</div>
            <p className="text-sm text-gray-500 mt-2">
              Average value: ${(currentData.revenue / currentData.invoices).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-sm text-gray-500 mt-2">From quotes to invoices</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <Chart
              type="line"
              data={{
                labels: Array.from({ length: currentData.chartData.length }, (_, i) => `Day ${i + 1}`),
                datasets: [
                  {
                    label: "Revenue",
                    data: currentData.chartData,
                    borderColor: "rgb(99, 102, 241)",
                    backgroundColor: "rgba(99, 102, 241, 0.1)",
                    tension: 0.3,
                    fill: true,
                  },
                ],
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
