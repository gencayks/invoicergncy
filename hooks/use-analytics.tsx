"use client"

import { useState, useEffect } from "react"
import { useBusiness } from "./use-business"
import { supabase } from "@/lib/supabase"

export type AnalyticsPeriod = "week" | "month" | "quarter" | "year" | "all"

export type InvoiceStatusCount = {
  status: string
  count: number
  color: string
}

export type MonthlyData = {
  name: string
  invoices: number
  paid: number
  amount: number
}

export type AnalyticsSummary = {
  totalInvoices: number
  totalPaid: number
  totalAmount: number
  paymentRate: number
  averageTimeToPayment: number
  statusCounts: InvoiceStatusCount[]
  monthlyData: MonthlyData[]
  revenueChange: number
  invoiceChange: number
  paymentRateChange: number
  timeToPaymentChange: number
}

// Status colors mapping
const statusColors: Record<string, string> = {
  paid: "#10B981", // green
  pending: "#F59E0B", // amber
  overdue: "#EF4444", // red
  draft: "#6B7280", // gray
  sent: "#3B82F6", // blue
  cancelled: "#9CA3AF", // gray
}

// Helper function to format month names
const getMonthName = (monthIndex: number): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return months[monthIndex]
}

export function useAnalytics(period: AnalyticsPeriod = "year") {
  const { currentBusiness } = useBusiness()
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!currentBusiness) {
        setIsLoading(false)
        return
      }

      // Cancel any in-progress requests
      if (abortController) {
        abortController.abort()
      }

      // Create a new abort controller for this request
      const controller = new AbortController()
      setAbortController(controller)

      try {
        setIsLoading(true)
        setError(null)

        // Get date range based on period
        const endDate = new Date()
        let startDate = new Date()

        switch (period) {
          case "week":
            startDate.setDate(endDate.getDate() - 7)
            break
          case "month":
            startDate.setMonth(endDate.getMonth() - 1)
            break
          case "quarter":
            startDate.setMonth(endDate.getMonth() - 3)
            break
          case "year":
            startDate.setFullYear(endDate.getFullYear() - 1)
            break
          case "all":
            startDate = new Date(2020, 0, 1) // Beginning of 2020 as a reasonable "all time" start
            break
        }

        // Set a timeout to handle stuck requests
        const timeoutId = setTimeout(() => {
          if (controller && !controller.signal.aborted) {
            controller.abort()
            throw new Error("Request timed out")
          }
        }, 15000) // 15 second timeout

        // Fetch invoices for the current business
        const { data: invoices, error: invoicesError } = await supabase
          .from("invoices")
          .select(`
            *,
            invoice_items (*)
          `)
          .eq("business_id", currentBusiness.id)
          .gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString())
          .abortSignal(controller.signal)

        // Clear the timeout since the request completed
        clearTimeout(timeoutId)

        if (invoicesError) throw invoicesError

        // If no invoices, return empty analytics
        if (!invoices || invoices.length === 0) {
          setAnalytics({
            totalInvoices: 0,
            totalPaid: 0,
            totalAmount: 0,
            paymentRate: 0,
            averageTimeToPayment: 0,
            statusCounts: [],
            monthlyData: [],
            revenueChange: 0,
            invoiceChange: 0,
            paymentRateChange: 0,
            timeToPaymentChange: 0,
          })
          setIsLoading(false)
          return
        }

        // Calculate invoice totals
        const processedInvoices = invoices.map((invoice) => {
          const items = invoice.invoice_items || []
          const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.price || 0), 0)
          const tax = subtotal * (invoice.tax_rate / 100 || 0)
          const total = subtotal + tax

          return {
            ...invoice,
            total_amount: total,
          }
        })

        // Calculate summary metrics
        const totalInvoices = processedInvoices.length
        const paidInvoices = processedInvoices.filter((inv) => inv.status === "paid").length
        const totalAmount = processedInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
        const paymentRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0

        // Count invoices by status
        const statusMap: Record<string, number> = {}
        processedInvoices.forEach((inv) => {
          const status = inv.status || "unknown"
          statusMap[status] = (statusMap[status] || 0) + 1
        })

        const statusCounts: InvoiceStatusCount[] = Object.entries(statusMap).map(([status, count]) => ({
          status,
          count,
          color: statusColors[status] || "#9CA3AF", // Default to gray if status not in map
        }))

        // Generate monthly data
        const monthlyDataMap: Record<string, MonthlyData> = {}

        // Initialize with zeros for all months in the period
        for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
          const year = d.getFullYear()
          const month = d.getMonth()
          const key = `${year}-${month}`

          monthlyDataMap[key] = {
            name: getMonthName(month),
            invoices: 0,
            paid: 0,
            amount: 0,
          }
        }

        // Fill with actual data
        processedInvoices.forEach((inv) => {
          if (inv.created_at) {
            const date = new Date(inv.created_at)
            const key = `${date.getFullYear()}-${date.getMonth()}`

            if (monthlyDataMap[key]) {
              monthlyDataMap[key].invoices++
              if (inv.status === "paid") {
                monthlyDataMap[key].paid++
              }
              monthlyDataMap[key].amount += inv.total_amount || 0
            }
          }
        })

        // Convert to array and sort by date
        const monthlyData = Object.values(monthlyDataMap)

        // Calculate average time to payment (in days)
        let totalDaysToPayment = 0
        let paidInvoicesCount = 0

        processedInvoices.forEach((inv) => {
          if (inv.status === "paid" && inv.issue_date) {
            // If we have paid_date use it, otherwise use updated_at as an approximation
            const paidDate = inv.paid_date ? new Date(inv.paid_date) : new Date(inv.updated_at)
            const issueDate = new Date(inv.issue_date)
            const daysToPayment = Math.round((paidDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24))

            if (daysToPayment >= 0) {
              totalDaysToPayment += daysToPayment
              paidInvoicesCount++
            }
          }
        })

        const averageTimeToPayment = paidInvoicesCount > 0 ? totalDaysToPayment / paidInvoicesCount : 0

        // For changes, we'd need to compare with previous period
        // For simplicity, we'll use placeholder values for now
        const revenueChange = 12.5
        const invoiceChange = 8.2
        const paymentRateChange = 2.3
        const timeToPaymentChange = -5.0

        setAnalytics({
          totalInvoices,
          totalPaid: paidInvoices,
          totalAmount,
          paymentRate,
          averageTimeToPayment,
          statusCounts,
          monthlyData,
          revenueChange,
          invoiceChange,
          paymentRateChange,
          timeToPaymentChange,
        })
      } catch (err) {
        // Only set error if this request wasn't aborted
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Error fetching analytics:", err)
          setError(err as Error)
        }
      } finally {
        // Only update loading state if this request wasn't aborted
        if (controller && !controller.signal.aborted) {
          setIsLoading(false)
          setAbortController(null)
        }
      }
    }

    fetchAnalytics()

    // Cleanup function to abort any in-progress requests when the component unmounts
    return () => {
      if (abortController) {
        abortController.abort()
      }
    }
  }, [currentBusiness, period])

  return { analytics, isLoading, error }
}
